import { Request, Response } from "express";
import { prisma } from "../db";
import { AuthRequest } from "../middlewares/requireAuth";

const CLOSED = ['DONE', 'CANCELLED', 'REJECTED'] as const;

export async function getAdminOverview(req: Request, res: Response) {
    try {
        const [
            openCount,
            resolvedCount,
            resolvedTasks,
            traffic,
            agentWorkloadRaw,
            byCategory,
            byProject,
            byCompany,
        ] = await Promise.all([
            prisma.task.count({ where: { status: { notIn: [...CLOSED] } } }),

            prisma.task.count({ where: { status: 'DONE' } }),

            prisma.task.findMany({
                where: { status: 'DONE', resolvedAt: { not: null } },
                select: { createdAt: true, resolvedAt: true },
            }),

            prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
                SELECT DATE(createdAt) as date, COUNT(*) as count
                FROM Task
                WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 15 DAY)
                GROUP BY DATE(createdAt)
                ORDER BY date ASC
            `,

            prisma.task.groupBy({
                by: ['assigneeId'],
                where: {
                    assigneeId: { not: null },
                    status: { notIn: [...CLOSED] },
                },
                _count: { id: true },
            }),

            prisma.task.groupBy({
                by: ['category'],
                _count: { id: true },
            }),

            prisma.task.groupBy({
                by: ['projectId'],
                where: { projectId: { not: null } },
                _count: { id: true },
            }),

            prisma.$queryRaw<Array<{ companyName: string; count: bigint }>>`
                SELECT c.companyName, COUNT(t.id) as count
                FROM Task t
                JOIN Project p ON t.projectId = p.id
                JOIN Company c ON p.companyId = c.id
                GROUP BY c.id, c.companyName
            `,
        ]);

        const avgResolutionHours = resolvedTasks.length > 0
            ? resolvedTasks.reduce((acc, t) =>
                acc + (t.resolvedAt!.getTime() - t.createdAt.getTime()), 0
            ) / resolvedTasks.length / 1000 / 60 / 60
            : 0;

        const agentIds = agentWorkloadRaw
            .map(r => r.assigneeId)
            .filter((id): id is bigint => id !== null);

        const agents = await prisma.user.findMany({
            where: { id: { in: agentIds } },
            select: { id: true, name: true },
        });

        const agentMap = Object.fromEntries(agents.map(a => [a.id.toString(), a.name]));
        const agentWorkload = agentWorkloadRaw.map(r => ({
            agentId: r.assigneeId?.toString(),
            agentName: agentMap[r.assigneeId!.toString()] ?? 'Unknown',
            open: r._count.id,
        }));

        const projectIds = byProject
            .map(r => r.projectId)
            .filter((id): id is bigint => id !== null);

        const projects = await prisma.project.findMany({
            where: { id: { in: projectIds } },
            select: { id: true, projectName: true },
        });

        const projectMap = Object.fromEntries(projects.map(p => [p.id.toString(), p.projectName]));

        res.status(200).json({
            tickets: {
                open: openCount,
                resolved: resolvedCount,
                avgResolutionHours: Math.round(avgResolutionHours * 10) / 10,
            },
            traffic: traffic.map(t => ({ date: t.date, count: Number(t.count) })),
            agentWorkload,
            byCategory: byCategory.map(r => ({
                category: r.category,
                count: r._count.id,
            })),
            byProject: byProject.map(r => ({
                projectId: r.projectId?.toString(),
                projectName: projectMap[r.projectId!.toString()] ?? 'Unknown',
                count: r._count.id,
            })),
            byCompany: byCompany.map(r => ({
                companyName: r.companyName,
                count: Number(r.count),
            })),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
