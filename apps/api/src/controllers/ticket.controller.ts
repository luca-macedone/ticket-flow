import { Request, Response } from "express";
import { prisma } from "../db";
import { Prisma } from "@prisma/client";
import { AuthRequest } from "../middlewares/requireAuth";
import { parseSortParams, PRIORITY_SQL_ORDER, serializeOrmRow, serializeRawRow } from "../utils/ticket-sort";
import { randomUUID } from 'crypto';
import { logAdminAction } from "../utils/logger";
import { AssignTicketSchema, TicketFilterQuerySchema } from "@packages/shared";

const CLOSED = ['DONE', 'CANCELLED', 'REJECTED'] as const;

//? get:/tickets
export async function getTickets(req: Request, res: Response) {
    try {
        const { status, category, priority, projectCode, assigneeCode, page, amount, sortBy, sortDir, sqlDir } = TicketFilterQuerySchema.parse(req.query);
        const skip = (page - 1) * amount;

        const where: Prisma.TicketWhereInput = {};

        if (status) where.status = status;

        if (category) where.category = category;

        if (priority) where.priority = priority;

        if (projectCode) where.project = { projectCode };

        if (assigneeCode) where.assignee = { userCode: assigneeCode };

        const total = await prisma.ticket.count({ where });
        let data: any[];

        if (sortBy === 'priority') {
            const conditions: Prisma.Sql[] = [];
            if (status) conditions.push(Prisma.sql`t.status = ${status}`);
            if (category) conditions.push(Prisma.sql`t.category = ${category}`);
            if (priority) conditions.push(Prisma.sql`t.priority = ${priority}`);
            if (projectCode) conditions.push(Prisma.sql`p.projectCode = ${projectCode}`);
            if (assigneeCode) conditions.push(Prisma.sql`a.userCode = ${assigneeCode}`);

            const whereClause = conditions.length
                ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
                : Prisma.empty;

            const rows = await prisma.$queryRaw<any[]>`
                SELECT t.*,
                    p.id AS proj_id, p.projectName AS proj_name,
                    a.id AS asn_id,  a.name        AS asn_name
                FROM   Ticket t
                LEFT JOIN Project p ON t.projectId  = p.id
                LEFT JOIN User    a ON t.assigneeId = a.id
                ${whereClause}
                ORDER BY ${PRIORITY_SQL_ORDER} ${sqlDir}
                LIMIT ${amount} OFFSET ${skip}
            `;
            data = rows.map(serializeRawRow);
        } else {
            const rows = await prisma.ticket.findMany({
                skip,
                take: amount,
                where,
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
        const { status, category, priority, projectCode, assigneeCode, page, amount, sortBy, sortDir }
            = TicketFilterQuerySchema.parse(req.query);
        const skip = (page - 1) * amount;

        const where: Prisma.TicketWhereInput = {};
        if (status) where.status = status
        else where.status = { notIn: [...CLOSED] };

        if (category) where.category = category;

        if (priority) where.priority = priority;

        if (projectCode) where.project = { projectCode };

        if (assigneeCode) where.assignee = { userCode: assigneeCode };

        where.assigneeId = userId;

        const total = await prisma.ticket.count({ where });
        let data: any[];

        if (sortBy === 'priority') {
            const conditions: Prisma.Sql[] = [
                Prisma.sql`t.assigneeId = ${userId}`,
            ];
            if (status) {
                conditions.push(Prisma.sql`t.status = ${status}`);
            } else {
                conditions.push(Prisma.sql`t.status NOT IN ('DONE', 'CANCELLED', 'REJECTED')`);
            }
            if (category) conditions.push(Prisma.sql`t.category = ${category}`);
            if (priority) conditions.push(Prisma.sql`t.priority = ${priority}`);
            if (projectCode) conditions.push(Prisma.sql`p.projectCode = ${projectCode}`);

            const rows = await prisma.$queryRaw<any[]>`
                SELECT t.*,
                    p.id AS proj_id, p.projectName AS proj_name
                FROM   Ticket t
                LEFT JOIN Project p ON t.projectId = p.id
                WHERE ${Prisma.join(conditions, ' AND ')}
                ORDER BY ${PRIORITY_SQL_ORDER} ${sortDir}
                LIMIT ${amount} OFFSET ${skip}
            `;
            data = rows.map(serializeRawRow);
        } else {
            const rows = await prisma.ticket.findMany({
                where, skip, take: amount,
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
        const { status, category, priority, projectCode, assigneeCode, page, amount, sortBy, sortDir }
            = TicketFilterQuerySchema.parse(req.query);
        const skip = (page - 1) * amount;

        const where: Prisma.TicketWhereInput = {};
        if (status) where.status = status
        else where.status = { notIn: [...CLOSED] };

        if (category) where.category = category;

        if (priority) where.priority = priority;

        if (projectCode) where.project = { projectCode };

        if (assigneeCode) where.assignee = { userCode: assigneeCode };

        where.reporterId = userId;

        const total = await prisma.ticket.count({ where });
        let data: any[];

        if (sortBy === 'priority') {
            const conditions: Prisma.Sql[] = [
                Prisma.sql`t.reporterId = ${userId}`,
            ];
            if (status) {
                conditions.push(Prisma.sql`t.status = ${status}`);
            } else {
                conditions.push(Prisma.sql`t.status NOT IN ('DONE', 'CANCELLED', 'REJECTED')`);
            }
            if (category) conditions.push(Prisma.sql`t.category = ${category}`);
            if (priority) conditions.push(Prisma.sql`t.priority = ${priority}`);
            if (projectCode) conditions.push(Prisma.sql`p.projectCode = ${projectCode}`);

            const rows = await prisma.$queryRaw<any[]>`
                SELECT t.*,
                    p.id AS proj_id, p.projectName AS proj_name,
                    a.id AS asn_id,  a.name        AS asn_name
                FROM   Ticket t
                LEFT JOIN Project p ON t.projectId  = p.id
                LEFT JOIN User    a ON t.assigneeId = a.id
                WHERE ${Prisma.join(conditions, ' AND ')}
                ORDER BY ${PRIORITY_SQL_ORDER} ${sortDir}
                LIMIT ${amount} OFFSET ${skip}
            `;
            data = rows.map(serializeRawRow);
        } else {
            const rows = await prisma.ticket.findMany({
                where,
                include: {
                    project: { select: { id: true, projectName: true } },
                    assignee: { select: { id: true, name: true } },
                },
                orderBy: { [sortBy]: sortDir },
                skip, take: amount,
            });
            data = rows.map(serializeOrmRow);
        }

        res.status(200).json({ data, total, page });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}


//? get:/tickets/:code
export async function getTicketByCode(req: AuthRequest, res: Response) {
    try {
        const code = req.params.code as string;
        const role = req.user!.role.toUpperCase();

        const ticket = await prisma.ticket.findUnique({
            where: { ticketCode: code },
            include: {
                project: { select: { id: true, projectCode: true, projectName: true } },
                assignee: { select: { id: true, userCode: true, name: true } },
                reporter: { select: { id: true, userCode: true, name: true, email: true } },
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
        const { ticketName, ticketDescription, startDate, endDate, status, projectId } = req.body;

        const baseData = {
            ticketName, ticketDescription, startDate, endDate, status, projectId,
            reporterId: BigInt(req.user!.userId),
        };

        const ticket = await prisma.$transaction(async (tx) => {
            const temp = await tx.ticket.create({
                data: { ...baseData, ticketCode: randomUUID() },
            });
            const code = `TF-${temp.id.toString().padStart(8, '0')}`;
            return tx.ticket.update({ where: { id: temp.id }, data: { ticketCode: code } });
        });

        logAdminAction(
            (req as AuthRequest).user!.userId,
            'TICKET_CREATE',
            'TICKET',
            ticket.ticketCode ?? undefined,
            ticket.ticketName
        );

        res.status(201).json(ticket);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}


//? patch:/tickets/:code
export async function updateTicket(req: AuthRequest, res: Response) {
    try {
        const code = req.params.code as string;
        const role = req.user!.role.toUpperCase();
        const existing = await prisma.ticket.findUnique({ where: { ticketCode: code } });

        if (!existing) return res.status(404).json({ message: "Ticket not found" });

        if (role === 'CUSTOMER' && existing.reporterId?.toString() !== req.user!.userId) {
            const ticket = await prisma.ticket.findUnique({ where: { ticketCode: code }, select: { reporterId: true, ticketCode: true } });
            if (!ticket || ticket.reporterId?.toString() !== req.user!.userId) {
                return res.status(403).json({ message: "Forbidden" });
            }
        }

        const {
            ticketName,
            ticketDescription,
            startDate,
            endDate,
            status,
            projectId
        } = req.body;

        const data: any = {};
        if (ticketName !== undefined) data.ticketName = ticketName;
        if (ticketDescription !== undefined) data.ticketDescription = ticketDescription;
        if (startDate !== undefined) data.startDate = startDate;
        if (endDate !== undefined) data.endDate = endDate;
        if (projectId !== undefined) data.projectId = projectId;
        if (status !== undefined) {
            data.status = status;
            data.resolvedAt = status === "DONE" ? new Date() : null
        }

        const ticket = await prisma.ticket.update({
            where: {
                id: existing.id
            },
            data
        });

        logAdminAction(
            (req as AuthRequest).user!.userId,
            'TICKET_UPDATE',
            'TICKET',
            ticket.ticketCode ?? undefined,
            ticket.ticketName
        );

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

//? delete:/tickets/:code
export async function deleteTicket(req: Request, res: Response) {
    try {
        const ticket = await prisma.ticket.delete({ where: { ticketCode: req.params.code as string } });

        logAdminAction(
            (req as AuthRequest).user!.userId,
            'TICKET_DELETE',
            'TICKET',
            ticket.ticketCode ?? undefined,
            ticket.ticketName
        );

        res.status(204).send();
    } catch (error) {
        console.error(error);
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return res.status(404).json({ message: 'Ticket not found' });
        }
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

export const assignTicket = async (req: AuthRequest, res: Response) => {
    const { code } = req.params;
    const { assigneeCode } = AssignTicketSchema.parse(req.body);
    const { userId, role } = req.user!;

    const ticket = await prisma.ticket.findUniqueOrThrow({ where: { ticketCode: code as string } });

    if (role.toUpperCase() === 'AGENT') {
        const me = await prisma.user.findUniqueOrThrow({ where: { id: BigInt(userId) } });
        if (assigneeCode !== null && assigneeCode !== me.userCode)
            return res.status(403).json({ error: 'Agent can only assign to self' });
    }

    let assigneeId: bigint | null = null;
    if (assigneeCode !== null) {
        const agent = await prisma.user.findUniqueOrThrow({
            where: { userCode: assigneeCode },
            select: { id: true, role: true },
        })
        if (agent.role.toUpperCase() === 'CUSTOMER')
            return res.status(400).json({ error: 'Cannot assign to customer' });
        assigneeId = agent.id;
    }

    const updated = await prisma.ticket.update({
        where: { ticketCode: code as string },
        data: { assigneeId },
        include: { assignee: { select: { userCode: true, name: true } } },
    });

    await logAdminAction(userId, 'TICKET_UPDATE', 'TICKET', code as string, ticket.ticketName, { field: 'assignee', assigneeCode });

    return res.json({ data: updated });
}