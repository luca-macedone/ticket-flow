import { Request, Response } from "express";
import { prisma } from "../db";
import { Prisma } from "@prisma/client";
import { AuthRequest } from "../middlewares/requireAuth";
import { parseSortParams, PRIORITY_SQL_ORDER, serializeOrmRow, serializeRawRow } from "../utils/ticket-sort";

const CLOSED = ['DONE', 'CANCELLED', 'REJECTED'] as const;

//? get:/tickets
export async function getTickets(req: Request, res: Response) {
    try {
        const page = Number(req.query.page ?? 1);
        const take = Number(req.query.amount ?? 20);
        const skip = (page - 1) * take;
        const { sortBy, sortDir, sqlDir } = parseSortParams(req.query as any);

        const total = await prisma.ticket.count();
        let data: any[];

        if (sortBy === 'priority') {
            const rows = await prisma.$queryRaw<any[]>`
                SELECT t.*,
                       p.id AS proj_id, p.projectName AS proj_name,
                       a.id AS asn_id,  a.name        AS asn_name
                FROM   Ticket t
                LEFT JOIN Project p ON t.projectId  = p.id
                LEFT JOIN User    a ON t.assigneeId = a.id
                ORDER BY ${PRIORITY_SQL_ORDER} ${sqlDir}
                LIMIT ${take} OFFSET ${skip}
            `;
            data = rows.map(serializeRawRow);
        } else {
            const rows = await prisma.ticket.findMany({
                skip, take,
                include: {
                    project: { select: { id: true, projectName: true } },
                    assignee: { select: { id: true, name: true } },
                },
                orderBy: { [sortBy]: sortDir },
            });
            data = rows.map(serializeOrmRow);
        }

        res.status(200).json({ data, total, page });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}


export async function getMyQueue(req: AuthRequest, res: Response) {
    try {
        const userId = BigInt(req.user!.userId);
        const page = Number(req.query.page ?? 1);
        const take = Number(req.query.amount ?? 20);
        const skip = (page - 1) * take;
        const { sortBy, sortDir, sqlDir } = parseSortParams(req.query as any);

        const where = { assigneeId: userId, status: { notIn: [...CLOSED] } };
        const total = await prisma.ticket.count({ where });
        let data: any[];

        if (sortBy === 'priority') {
            const rows = await prisma.$queryRaw<any[]>`
                SELECT t.*,
                       p.id AS proj_id, p.projectName AS proj_name
                FROM   Ticket t
                LEFT JOIN Project p ON t.projectId = p.id
                WHERE  t.assigneeId = ${userId}
                  AND  t.status NOT IN ('DONE', 'CANCELLED', 'REJECTED')
                ORDER BY ${PRIORITY_SQL_ORDER} ${sqlDir}
                LIMIT ${take} OFFSET ${skip}
            `;
            data = rows.map(serializeRawRow);
        } else {
            const rows = await prisma.ticket.findMany({
                where, skip, take,
                include: { project: { select: { id: true, projectName: true } } },
                orderBy: { [sortBy]: sortDir },
            });
            data = rows.map(serializeOrmRow);
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
        const { sortBy, sortDir, sqlDir } = parseSortParams(req.query as any);

        const total = await prisma.ticket.count({ where: { reporterId: userId } });
        let data: any[];

        if (sortBy === 'priority') {
            const rows = await prisma.$queryRaw<any[]>`
                SELECT t.*,
                       p.id AS proj_id, p.projectName AS proj_name,
                       a.id AS asn_id,  a.name        AS asn_name
                FROM   Ticket t
                LEFT JOIN Project p ON t.projectId  = p.id
                LEFT JOIN User    a ON t.assigneeId = a.id
                WHERE  t.reporterId = ${userId}
                ORDER BY ${PRIORITY_SQL_ORDER} ${sqlDir}
                LIMIT ${take} OFFSET ${skip}
            `;
            data = rows.map(serializeRawRow);
        } else {
            const rows = await prisma.ticket.findMany({
                where: { reporterId: userId },
                include: {
                    project: { select: { id: true, projectName: true } },
                    assignee: { select: { id: true, name: true } },
                },
                orderBy: { [sortBy]: sortDir },
                skip, take,
            });
            data = rows.map(serializeOrmRow);
        }

        res.status(200).json({ data, total, page });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}


//? get:/tickets/:id
export async function getTicketById(req: AuthRequest, res: Response) {
    try {
        const ticketId = BigInt(req.params.id as string);
        const role = req.user!.role.toUpperCase();

        const ticket = await prisma.ticket.findUnique({
            where: { id: ticketId },
            include: {
                project: { select: { id: true, projectName: true } },
                assignee: { select: { id: true, name: true } },
                reporter: { select: { id: true, name: true, email: true } },
            }
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
