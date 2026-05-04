import { Request, Response } from "express";
import { prisma } from "../db";
import { Prisma } from "@prisma/client";
import { AuthRequest } from "../middlewares/requireAuth";

const CLOSED = ['DONE', 'CANCELLED', 'REJECTED'] as const;
const SORTABLE_FIELDS = new Set(['ticketName', 'priority', 'status', 'createdAt']);

//? get:/tickets
export async function getTickets(req: Request, res: Response) {
    try {
        const page = Number(req.query.page ?? 1)
        const take = Number(req.query.amount ?? 20)
        const skip = (page - 1) * take;

        const tickets = await prisma.ticket.findMany({
            skip,
            take
        });
        res.status(200).json(tickets);
    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

//? get:/tickets/:id
export async function getTicketById(req: AuthRequest, res: Response) {
    try {
        const ticketId = BigInt(req.params.id as string);
        const role = req.user!.role.toUpperCase();

        const ticket = await prisma.ticket.findUnique({
            where: { id: ticketId }
        });

        if (!ticket) return res.status(404).json({ message: "Ticket not found" });

        if (role === 'CUSTOMER' && ticket.reporterId?.toString() !== req.user!.userId) {
            return res.status(403).json({ message: "Forbidden" });
        }

        res.status(200).json(ticket);
    } catch (error) {
        console.error(error)
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return res.status(404).json({ message: "Ticket not found" });
            }
        }
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

//? post:/tickets
export async function createTicket(req: AuthRequest, res: Response) {
    try {
        const {
            ticketCode,
            ticketName,
            ticketDescription,
            startDate,
            endDate,
            status,
            projectId,
        } = req.body;
        const ticket = await prisma.ticket.create({
            data: {
                ticketCode,
                ticketName,
                ticketDescription,
                startDate,
                endDate,
                status,
                projectId,
                reporterId: BigInt(req.user!.userId)
            }
        });

        res.status(201).json(ticket);
    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

//? patch:/tickets/:id
export async function updateTicket(req: AuthRequest, res: Response) {
    try {
        const role = req.user!.role.toUpperCase();
        const ticketId = BigInt(req.params.id as string)

        if (role === 'CUSTOMER') {
            const ticket = await prisma.ticket.findUnique({ where: { id: ticketId }, select: { reporterId: true } });
            if (!ticket || ticket.reporterId?.toString() !== req.user!.userId) {
                return res.status(403).json({ message: "Forbidden" });
            }
        }

        const {
            ticketCode,
            ticketName,
            ticketDescription,
            startDate,
            endDate,
            status,
            projectId
        } = req.body;

        const data: any = {};
        if (ticketCode !== undefined) data.ticketCode = ticketCode;
        if (ticketName !== undefined) data.ticketName = ticketName;
        if (ticketDescription !== undefined) data.ticketDescription = ticketDescription;
        if (startDate !== undefined) data.startDate = startDate;
        if (endDate !== undefined) data.endDate = endDate;
        if (status !== undefined) {
            data.status = status;
            if (status === "DONE") data.resolvedAt = new Date();
            if (status !== "DONE") data.resolvedAt = null;
        }
        if (projectId !== undefined) data.projectId = projectId;

        const ticket = await prisma.ticket.update({
            where: {
                id: ticketId
            },
            data
        });

        res.status(200).json(ticket);
    } catch (error) {
        console.error(error)
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return res.status(404).json({ message: "Ticket not found" });
            }
        }
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

//? delete:/tickets/:id
export async function deleteTicket(req: Request, res: Response) {
    try {
        const ticketId = BigInt(req.params.id as string)
        await prisma.ticket.delete({
            where: {
                id: ticketId
            }
        });

        res.status(204).send();
    } catch (error) {
        console.error(error)
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return res.status(404).json({ message: "Ticket not found" });
            }
        }
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

// export async function getMyQueue(req: AuthRequest, res: Response) {
//     try {
//         const userId = BigInt(req.user!.userId);
//         const page = Number(req.query.page ?? 1);
//         const take = Number(req.query.amount ?? 20);
//         const skip = (page - 1) * take;
//         const sortBy = SORTABLE_FIELDS.has(req.query.sortBy as string)
//             ? req.query.sortBy as string
//             : 'createdAt';
//         const sortDir = req.query.sortDir === 'desc' ? 'desc' : 'asc';

//         const [data, total] = await Promise.all([
//             prisma.ticket.findMany({
//                 where: {
//                     assigneeId: userId,
//                     status: { notIn: [...CLOSED] },
//                 },
//                 include: {
//                     project: { select: { id: true, projectName: true } },
//                 },
//                 orderBy: { [sortBy]: sortDir },
//                 skip,
//                 take,
//             }),
//             prisma.ticket.count({
//                 where: {
//                     assigneeId: userId,
//                     status: { notIn: [...CLOSED] },
//                 },
//             }),
//         ]);

//         res.status(200).json({ data, total, page });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Internal Server Error" });
//     }
// }
export async function getMyQueue(req: AuthRequest, res: Response) {
    try {
        const userId = BigInt(req.user!.userId);
        const page = Number(req.query.page ?? 1);
        const take = Number(req.query.amount ?? 20);
        const skip = (page - 1) * take;
        const sortBy = SORTABLE_FIELDS.has(req.query.sortBy as string)
            ? req.query.sortBy as string
            : 'createdAt';
        const sortDir = req.query.sortDir === 'desc' ? 'desc' : 'asc';

        const where = {
            assigneeId: userId,
            status: { notIn: [...CLOSED] },
        };

        const total = await prisma.ticket.count({ where });

        let data: any[];

        if (sortBy === 'priority') {
            const dir = sortDir === 'desc' ? Prisma.sql`DESC` : Prisma.sql`ASC`;

            const rows = await prisma.$queryRaw<any[]>`
                SELECT
                    t.id, t.ticketCode, t.ticketName, t.ticketDescription,
                    t.status, t.category, t.priority,
                    t.startDate, t.endDate, t.resolvedAt,
                    t.createdAt, t.updatedAt,
                    t.projectId, t.assigneeId, t.reporterId,
                    p.id        AS projectRelId,
                    p.projectName AS projectName
                FROM   Ticket t
                LEFT   JOIN Project p ON t.projectId = p.id
                WHERE  t.assigneeId = ${userId}
                  AND  t.status NOT IN ('DONE', 'CANCELLED', 'REJECTED')
                ORDER BY CASE t.priority
                    WHEN 'LOW'    THEN 1
                    WHEN 'MEDIUM' THEN 2
                    WHEN 'HIGH'   THEN 3
                    WHEN 'URGENT' THEN 4
                END ${dir}
                LIMIT  ${take}
                OFFSET ${skip}
            `;

            data = rows.map(r => ({
                id: r.id.toString(),
                ticketCode: r.ticketCode,
                ticketName: r.ticketName,
                ticketDescription: r.ticketDescription,
                status: r.status,
                category: r.category,
                priority: r.priority,
                startDate: r.startDate,
                endDate: r.endDate,
                resolvedAt: r.resolvedAt,
                createdAt: r.createdAt,
                updatedAt: r.updatedAt,
                projectId: r.projectId?.toString() ?? null,
                assigneeId: r.assigneeId?.toString() ?? null,
                reporterId: r.reporterId?.toString() ?? null,
                project: r.projectRelId
                    ? { id: r.projectRelId.toString(), projectName: r.projectName }
                    : null,
            }));
        } else {
            const rows = await prisma.ticket.findMany({
                where,
                include: {
                    project: { select: { id: true, projectName: true } },
                },
                orderBy: { [sortBy]: sortDir },
                skip,
                take,
            });

            data = rows.map(r => ({
                ...r,
                id: r.id.toString(),
                projectId: r.projectId?.toString() ?? null,
                assigneeId: r.assigneeId?.toString() ?? null,
                reporterId: r.reporterId?.toString() ?? null,
                project: r.project
                    ? { id: r.project.id.toString(), projectName: r.project.projectName }
                    : null,
            }));
        }

        res.status(200).json({ data, total, page });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}


export async function getMyTickets(req: AuthRequest, res: Response) {
    try {
        const userId = BigInt(req.user!.userId);
        const page = Number(req.query.page ?? 1);
        const take = Number(req.query.amount ?? 20);
        const skip = (page - 1) * take;

        const [data, total] = await Promise.all([
            prisma.ticket.findMany({
                where: { reporterId: userId },
                include: {
                    project: { select: { id: true, projectName: true } },
                    assignee: { select: { id: true, name: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take,
            }),
            prisma.ticket.count({ where: { reporterId: userId } }),
        ]);

        res.status(200).json({ data, total, page });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
