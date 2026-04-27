import { Request, Response } from "express";
import { prisma } from "../db";
import { Prisma } from "@prisma/client";
import { AuthRequest } from "../middlewares/requireAuth";

const CLOSED = ['DONE', 'CANCELLED', 'REJECTED'] as const;

//? get:/tasks
export async function getTasks(req: Request, res: Response) {
    try {
        const page = Number(req.query.page ?? 1)
        const take = Number(req.query.amount ?? 20)
        const skip = (page - 1) * take;

        const tasks = await prisma.task.findMany({
            skip,
            take
        });
        res.status(200).json(tasks);
    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

//? get:/tasks/:id
export async function getTaskById(req: Request, res: Response) {
    try {
        const taskId = BigInt(req.params.id as string);
        const task = await prisma.task.findUnique({
            where: { id: taskId }
        });

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.status(200).json(task);
    } catch (error) {
        console.error(error)
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return res.status(404).json({ message: "Task not found" });
            }
        }
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

//? post:/tasks
export async function createTask(req: Request, res: Response) {
    try {
        const {
            taskCode,
            taskName,
            taskDescription,
            startDate,
            endDate,
            status,
            projectId
        } = req.body;
        const task = await prisma.task.create({
            data: {
                taskCode,
                taskName,
                taskDescription,
                startDate,
                endDate,
                status,
                projectId
            }
        });

        res.status(201).json(task);
    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

//? patch:/tasks/:id
export async function updateTask(req: Request, res: Response) {
    try {
        const taskId = BigInt(req.params.id as string)
        const {
            taskCode,
            taskName,
            taskDescription,
            startDate,
            endDate,
            status,
            projectId
        } = req.body;

        const data: any = {};
        if (taskCode !== undefined) data.taskCode = taskCode;
        if (taskName !== undefined) data.taskName = taskName;
        if (taskDescription !== undefined) data.taskDescription = taskDescription;
        if (startDate !== undefined) data.startDate = startDate;
        if (endDate !== undefined) data.endDate = endDate;
        if (status !== undefined) {
            data.status = status;
            if (status === "DONE") data.resolvedAt = new Date();
            if (status !== "DONE") data.resolvedAt = null;
        }
        if (projectId !== undefined) data.projectId = projectId;

        const task = await prisma.task.update({
            where: {
                id: taskId
            },
            data
        });

        res.status(200).json(task);
    } catch (error) {
        console.error(error)
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return res.status(404).json({ message: "Task not found" });
            }
        }
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

//? delete:/tasks/:id
export async function deleteTask(req: Request, res: Response) {
    try {
        const taskId = BigInt(req.params.id as string)
        await prisma.task.delete({
            where: {
                id: taskId
            }
        });

        res.status(204).send();
    } catch (error) {
        console.error(error)
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return res.status(404).json({ message: "Task not found" });
            }
        }
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

export async function getMyQueue(req: AuthRequest, res: Response) {
    try {
        const userId = BigInt(req.user!.userId);
        const page = Number(req.query.page ?? 1);
        const take = Number(req.query.amount ?? 20);
        const skip = (page - 1) * take;

        const [data, total] = await Promise.all([
            prisma.task.findMany({
                where: {
                    assigneeId: userId,
                    status: { notIn: [...CLOSED] },
                },
                include: {
                    project: { select: { id: true, projectName: true } },
                },
                orderBy: [
                    // Priority enum: LOW < MEDIUM < HIGH < URGENT
                    // Prisma ordina alfabeticamente i valori enum, quindi usiamo un sort lato JS
                    // oppure aggiungi un campo numerico separato — vedi nota sotto
                    { createdAt: 'asc' },
                ],
                skip,
                take,
            }),
            prisma.task.count({
                where: {
                    assigneeId: userId,
                    status: { notIn: [...CLOSED] },
                },
            }),
        ]);

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
            prisma.task.findMany({
                where: { reporterId: userId },
                include: {
                    project: { select: { id: true, projectName: true } },
                    assignee: { select: { id: true, name: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take,
            }),
            prisma.task.count({ where: { reporterId: userId } }),
        ]);

        res.status(200).json({ data, total, page });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
