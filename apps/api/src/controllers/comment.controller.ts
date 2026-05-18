import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/requireAuth";
import { prisma } from "../db";
import { Prisma } from "@prisma/client";
import { logAdminAction } from "../utils/logger";

// ? get:/tickets/:code/comments
export async function getComments(req: AuthRequest, res: Response) {
    try {
        const { code } = req.params;
        const role = req.user!.role.toUpperCase();

        const page = Number(req.query.page ?? 1);
        const take = Number(req.query.amount ?? 20);
        const skip = (page - 1) * take;

        const ticket = await prisma.ticket.findUnique({ where: { ticketCode: code as string } });
        if (!ticket) return res.status(404).json({ error: "Ticket not found" });

        const where: Prisma.TicketCommentWhereInput = {
            ticketId: ticket.id,
            ...(role === 'CUSTOMER' ? { visibility: 'PUBLIC' } : {})
        }

        const [comments, total] = await Promise.all([
            prisma.ticketComment.findMany({
                where,
                orderBy: { createdAt: 'asc' },
                include: {
                    author: { select: { userCode: true, name: true, role: true } },
                },
                skip,
                take,
            }),
            prisma.ticketComment.count({ where }),
        ]);

        return res.json({ data: comments.map(c => ({ ...c, id: c.id.toString() })), total, page });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

// ? post:/tickets/:code/comments
export async function addComment(req: AuthRequest, res: Response) {
    try {
        const { code } = req.params;
        const { content, visibility } = req.body;
        const { userId, role: rawRole } = req.user!;
        const role = rawRole.toUpperCase();

        const ticket = await prisma.ticket.findUnique({ where: { ticketCode: code as string } });
        if (!ticket) return res.status(404).json({ error: "Ticket not found" });

        const finalVisibility = role === 'CUSTOMER' ? 'PUBLIC' : visibility ?? 'PUBLIC';

        const comment = await prisma.ticketComment.create({
            data: {
                content,
                visibility: finalVisibility,
                ticketId: ticket.id,
                authorId: BigInt(userId),
            },
            include: {
                author: { select: { userCode: true, name: true, role: true } }
            },
        });

        logAdminAction(userId, 'COMMENT_ADD', 'TICKET', ticket.ticketCode ?? undefined, ticket.ticketName);

        return res.status(201).json({ data: { ...comment, id: comment.id.toString() } });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" })
    }
}

// ? delete:/tickets/:code/comments
export async function deleteComment(req: AuthRequest, res: Response) {
    try {
        const { code, commentId } = req.params;
        const { userId, role } = req.user!;

        const ticket = await prisma.ticket.findUnique({ where: { ticketCode: code as string } });
        if (!ticket) return res.status(404).json({ error: "Ticket not found" });

        const comment = await prisma.ticketComment.findUnique({ where: { id: BigInt(commentId as string) } });
        if (!comment) return res.status(404).json({ error: 'Comment not found' });

        if (role !== 'ADMIN') {
            if (comment.authorId !== BigInt(userId) || comment.visibility === 'INTERNAL') {
                return res.status(403).json({ error: "Forbidden" });
            }
        }

        await prisma.ticketComment.delete({
            where: { id: BigInt(commentId as string) }
        });

        logAdminAction(userId, 'COMMENT_DELETE', 'TICKET', ticket.ticketCode ?? undefined, ticket.ticketName);

        return res.status(204).send();
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" })
    }
}