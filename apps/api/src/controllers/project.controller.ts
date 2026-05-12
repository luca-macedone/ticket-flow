import { Request, Response } from "express";
import { prisma } from "../db";
import { Prisma } from "@prisma/client";
import { AuthRequest } from "../middlewares/requireAuth";
import { randomUUID } from "crypto";

//? get:/projects
export async function getProjects(req: AuthRequest, res: Response) {
    try {
        const page = Number(req.query.page ?? 1)
        const take = Number(req.query.amount ?? 20)
        const skip = (page - 1) * take;
        const role = req.user!.role.toUpperCase();

        const where = role === "ADMIN" ? {} : {
            users: {
                some: {
                    id: BigInt(req.user!.userId)
                }
            }
        };

        const projects = await prisma.project.findMany({
            where,
            skip,
            take
        });
        res.status(200).json(projects);
    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

//? get:/projects/:code
export async function getProjectByCode(req: AuthRequest, res: Response) {
    try {
        const code = req.params.code as string;
        const role = req.user!.role.toUpperCase();
        const project = await prisma.project.findUnique({
            where: { projectCode: code },
            include: {
                company: { select: { id: true, companyCode: true, companyName: true, referralEmail: true } },
                tickets: { select: { id: true, ticketCode: true, ticketName: true, status: true } },
                ...(role !== 'CUSTOMER' && {
                    users: { select: { id: true, userCode: true, name: true, email: true } }
                }),
            }
        });

        if (!project) return res.status(404).json({ message: "Project not found" });

        if (role === 'CUSTOMER') {
            const isMember = await prisma.project.count({
                where: { projectCode: code, users: { some: { id: BigInt(req.user!.userId) } } }
            });
            if (!isMember) return res.status(403).json({ message: "Forbidden" });
        }

        res.status(200).json(project);
    } catch (error) {
        console.error(error)
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return res.status(404).json({ message: "Project not found" });
            }
        }
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

//? post:/projects
export async function createProject(req: Request, res: Response) {
    try {
        const { projectName, description, startDate, endDate, status, companyId, users, tickets } = req.body;

        const project = await prisma.$transaction(async (tx) => {
            const temp = await tx.project.create({
                data: {
                    projectName, description, startDate, endDate, status,
                    companyId: BigInt(companyId), users, tickets, projectCode: randomUUID()
                }
            });
            const code = `PRJ-${temp.id.toString().padStart(8, '0')}`;
            return tx.project.update({ where: { id: temp.id }, data: { projectCode: code } });
        });

        res.status(201).json(project);
    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

//? patch:/projects/:code
export async function updateProject(req: Request, res: Response) {
    try {
        const code = req.params.code as string;
        const existing = await prisma.project.findUnique({ where: { projectCode: code } });

        if (!existing) return res.status(404).json({ message: "Project not found" });

        const {
            projectName,
            description,
            startDate,
            endDate,
            status,
            companyId,
            users,
            tickets
        } = req.body;

        const data: any = {};
        if (projectName !== undefined) data.projectName = projectName;
        if (description !== undefined) data.description = description;
        if (startDate !== undefined) data.startDate = startDate;
        if (endDate !== undefined) data.endDate = endDate;
        if (status !== undefined) data.status = status;
        if (companyId !== undefined) data.companyId = BigInt(companyId);
        if (users !== undefined) data.users = users;
        if (tickets !== undefined) data.tickets = tickets;

        const project = await prisma.project.update({
            where: {
                id: existing.id
            },
            data
        });

        res.status(200).json(project);
    } catch (error) {
        console.error(error)
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return res.status(404).json({ message: "Project not found" });
            }
        }
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

//? delete:/projects/:code
export async function deleteProject(req: Request, res: Response) {
    try {
        await prisma.project.delete({
            where: {
                projectCode: req.params.code as string
            },
        });

        res.status(204).send();
    } catch (error) {
        console.error(error)
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return res.status(404).json({ message: "Project not found" });
            }
            if (error.code === "P2003") {
                return res.status(409).json({ message: "Cannot delete project with existing tickets" });
            }
        }
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

