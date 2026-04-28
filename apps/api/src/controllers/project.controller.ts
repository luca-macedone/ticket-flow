import { Request, Response } from "express";
import { prisma } from "../db";
import { Prisma } from "@prisma/client";

//? get:/projects
export async function getProjects(req: Request, res: Response) {
    try {
        const page = Number(req.query.page ?? 1)
        const take = Number(req.query.amount ?? 20)
        const skip = (page - 1) * take;

        const projects = await prisma.project.findMany({
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

//? get:/projects/:id
export async function getProjectById(req: Request, res: Response) {
    try {
        const projectId = BigInt(req.params.id as string);
        const project = await prisma.project.findUnique({
            where: { id: projectId }
        });

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
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
        const {
            projectName,
            description,
            startDate,
            endDate,
            status,
            company,
            users,
            tasks
        } = req.body;
        const project = await prisma.project.create({
            data: {
                projectName,
                description,
                startDate,
                endDate,
                status,
                company,
                users,
                tasks
            }
        });

        res.status(201).json(project);
    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

//? patch:/projects/:id
export async function updateProject(req: Request, res: Response) {
    try {
        const projectId = BigInt(req.params.id as string)
        const {
            projectName,
            description,
            startDate,
            endDate,
            status,
            company,
            users,
            tasks
        } = req.body;

        const data: any = {};
        if (projectName !== undefined) data.projectName = projectName;
        if (description !== undefined) data.description = description;
        if (startDate !== undefined) data.startDate = startDate;
        if (endDate !== undefined) data.endDate = endDate;
        if (status !== undefined) data.status = status;
        if (company !== undefined) data.company = company;
        if (users !== undefined) data.users = users;
        if (tasks !== undefined) data.tasks = tasks;

        const project = await prisma.project.update({
            where: {
                id: projectId
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

//? delete:/projects/:id
export async function deleteProject(req: Request, res: Response) {
    try {
        const projectId = BigInt(req.params.id as string)
        await prisma.project.delete({
            where: {
                id: projectId
            }
        });

        res.status(204).send();
    } catch (error) {
        console.error(error)
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return res.status(404).json({ message: "Project not found" });
            }
            if (error.code === "P2003") {
                return res.status(409).json({ message: "Cannot delete project with existing tasks" });
            }
        }
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

