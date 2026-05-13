import { Request, Response } from "express";
import { prisma } from "../db";
import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { AdminAction, logAdminAction } from "../utils/logger";
import { AuthRequest } from "../middlewares/requireAuth";

//? get:/users
export async function getUsers(req: Request, res: Response) {
    try {
        const page = Number(req.query.page ?? 1)
        const take = Number(req.query.amount ?? 20)
        const skip = (page - 1) * take;

        const users = await prisma.user.findMany({
            omit: { pswHash: true },
            skip,
            take
        });

        res.status(200).json(users);
    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

//? get:/users/:code
export async function getUserByCode(req: Request, res: Response) {
    try {
        const code = req.params.code as string;
        const user = await prisma.user.findUnique({
            where: { userCode: code },
            omit: { pswHash: true },
            include: {
                projects: {
                    select: {
                        id: true,
                        projectCode: true,
                        projectName: true,
                    }
                },
                assignedTickets: {
                    select: {
                        id: true,
                        ticketCode: true,
                        ticketName: true,
                        status: true,
                    }
                },
                reportedTickets: {
                    select: {
                        id: true,
                        ticketCode: true,
                        ticketName: true,
                        status: true,
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error(error)
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return res.status(404).json({ message: "User not found" });
            }
        }
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

//? post:/users
export async function createUser(req: Request, res: Response) {
    try {
        const {
            email,
            password,
            name,
            role,
        } = req.body;

        const hashed = await bcrypt.hash(password, 12);

        const user = await prisma.$transaction(async (tx) => {
            const temp = await tx.user.create({
                data: { email, pswHash: hashed, name, role, status: "APPROVED", userCode: randomUUID() }
            });
            const code = `USR-${temp.id.toString().padStart(8, '0')}`;
            return tx.user.update({ where: { id: temp.id }, data: { userCode: code } });
        });

        logAdminAction(
            (req as AuthRequest).user!.userId,
            'USER_CREATE',
            'USER',
            user.userCode ?? undefined,
            user.name
        );

        res.status(201).json(user);
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return res.status(409).json({ message: "Email already in use" });
        }
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

//? post:/users
export async function registerUser(req: Request, res: Response) {
    try {
        const {
            email,
            password,
            name,
            role
        } = req.body;

        const pswHash = await bcrypt.hash(password, 12);

        const user = await prisma.$transaction(async (tx) => {
            const temp = await tx.user.create({
                data: { email, pswHash, name, role, status: "PENDING_APPROVAL", userCode: randomUUID() }
            });
            const code = `USR-${temp.id.toString().padStart(8, '0')}`;
            return tx.user.update({ where: { id: temp.id }, data: { userCode: code } });
        });
        const { pswHash: _, ...safeUser } = user;

        res.status(201).json(safeUser);
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return res.status(409).json({ message: 'Email already in use' });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }

}

//? patch:/users/:id
export async function updateUser(req: Request, res: Response) {
    try {
        const code = req.params.code as string;
        const existing = await prisma.user.findUnique({ where: { userCode: code } });
        if (!existing) return res.status(404).json({ message: "User not found" });

        const {
            email,
            name,
            role,
            projects,
        } = req.body;

        const data: any = {};
        if (email !== undefined) data.email = email;
        if (name !== undefined) data.name = name;
        if (role !== undefined) data.role = role;
        if (projects !== undefined) data.projects = projects;

        const user = await prisma.user.update({
            where: {
                id: existing.id
            },
            data
        });

        logAdminAction(
            (req as AuthRequest).user!.userId,
            'USER_UPDATE',
            'USER',
            user.userCode ?? undefined,
            user.name
        );

        res.status(200).json(user);
    } catch (error) {
        console.error(error)
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return res.status(404).json({ message: "User not found" });
            }
        }
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

//? patch:/admin/users/:code/approve
export async function approveUser(req: Request, res: Response) {
    try {
        const code = req.params.code as string;
        const { role } = req.body;
        const existing = await prisma.user.findUnique({ where: { userCode: code } });
        if (!existing) return res.status(404).json({ message: "User not found" });

        const data: any = { status: "APPROVED" };
        if (role) data.role = role;

        const user = await prisma.user.update({
            where: {
                id: existing.id
            },
            data
        });

        logAdminAction(
            (req as AuthRequest).user!.userId,
            'USER_APPROVE',
            'USER',
            user.userCode ?? undefined,
            user.name
        );

        res.status(200).json(user);
    } catch (error) {
        console.error(error)
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return res.status(404).json({ message: "User not found" });
            }
        }
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

//? delete:/users/:code
export async function deleteUser(req: Request, res: Response) {
    try {
        const user = await prisma.user.delete({
            where: {
                userCode: req.params.code as string
            }
        });

        logAdminAction(
            (req as AuthRequest).user!.userId,
            'USER_DELETE',
            'USER',
            user.userCode ?? undefined,
            user.name
        );

        res.status(204).send();
    } catch (error) {
        console.error(error)
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return res.status(404).json({ message: "User not found" });
            }
        }
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

export async function changeUserStatus(req: AuthRequest, res: Response) {
    try {
        const { code } = req.params;
        const { status } = req.body; // 'REJECTED' | 'SUSPENDED' | 'APPROVED'

        const existing = await prisma.user.findUnique({ where: { userCode: code as string } });
        if (!existing) return res.status(404).json({ message: 'User not found' });

        const user = await prisma.user.update({
            where: { id: existing.id },
            data: { status }
        });

        const actionMap: Record<string, AdminAction> = {
            APPROVED: 'USER_REACTIVATE',
            REJECTED: 'USER_REJECT',
            SUSPENDED: 'USER_SUSPEND'
        };
        logAdminAction(
            req.user!.userId,
            actionMap[status],
            'USER',
            existing.userCode ?? undefined,
            existing.name
        );

        res.status(200).json(user)
    } catch (error) {
        console.error(error)
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return res.status(404).json({ message: "User not found" });
            }
        }
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}