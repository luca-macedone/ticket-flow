import { Request, Response } from "express";
import { prisma } from "../db";
import { Prisma } from "@prisma/client";
import { AuthRequest } from "../middlewares/requireAuth";

const CLOSED = ['DONE', 'CANCELLED', 'REJECTED'] as const;

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
export async function getTicketById(req: Request, res: Response) {
    try {
        const ticketId = BigInt(req.params.id as string);
        const ticket = await prisma.ticket.findUnique({
            where: { id: ticketId }
        });

        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
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
export async function createTicket(req: Request, res: Response) {
    try {
        const {
            ticketCode,
            ticketName,
            ticketDescription,
            startDate,
            endDate,
            status,
            projectId
        } = req.body;
        const ticket = await prisma.ticket.create({
            data: {
                ticketCode,
                ticketName,
                ticketDescription,
                startDate,
                endDate,
                status,
                projectId
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
export async function updateTicket(req: Request, res: Response) {
    try {
        const ticketId = BigInt(req.params.id as string)
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

export async function getMyQueue(req: AuthRequest, res: Response) {
    try {
        const userId = BigInt(req.user!.userId);
        const page = Number(req.query.page ?? 1);
        const take = Number(req.query.amount ?? 20);
        const skip = (page - 1) * take;

        const [data, total] = await Promise.all([
            prisma.ticket.findMany({
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
            prisma.ticket.count({
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
