import { Request, Response } from "express";
import { prisma } from "../db";
import { Prisma } from "@prisma/client";

//? get:/companies
export async function getCompanies(req: Request, res: Response) {
    try {
        const page = Number(req.query.page ?? 1)
        const take = Number(req.query.amount ?? 20)
        const skip = (page - 1) * take;

        const companies = await prisma.company.findMany({
            skip,
            take
        });
        res.status(200).json(companies);
    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

//? get:/companies/:id
export async function getCompanyById(req: Request, res: Response) {
    try {
        const companyId = BigInt(req.params.id as string);
        const company = await prisma.company.findUnique({
            where: { id: companyId },
            include: {
                projects: {
                    select: {
                        id: true,
                        projectName: true,
                        startDate: true,
                        endDate: true,
                    }
                },
            }
        });

        if (!company) {
            return res.status(404).json({ message: "Company not found" });
        }

        res.status(200).json(company);
    } catch (error) {
        console.error(error)
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return res.status(404).json({ message: "Company not found" });
            }
        }
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

//? post:/companies
export async function createCompany(req: Request, res: Response) {
    try {
        const { companyName, nationality, description, referralEmail } = req.body;
        const company = await prisma.company.create({
            data: {
                companyName,
                nationality,
                description,
                referralEmail
            }
        });

        res.status(201).json(company);
    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

//? patch:/companies/:id
export async function updateCompany(req: Request, res: Response) {
    try {
        const companyId = BigInt(req.params.id as string)
        const { companyName, nationality, description, referralEmail } = req.body;

        const data: any = {};
        if (companyName !== undefined) data.companyName = companyName;
        if (nationality !== undefined) data.nationality = nationality;
        if (description !== undefined) data.description = description;
        if (referralEmail !== undefined) data.referralEmail = referralEmail;

        const company = await prisma.company.update({
            where: {
                id: companyId
            },
            data
        });

        res.status(200).json(company);
    } catch (error) {
        console.error(error)
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return res.status(404).json({ message: "Company not found" });
            }
        }
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

//? delete:/companies/:id
export async function deleteCompany(req: Request, res: Response) {
    try {
        const companyId = BigInt(req.params.id as string)
        await prisma.company.delete({
            where: {
                id: companyId
            }
        });

        res.status(204).send();
    } catch (error) {
        console.error(error)
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return res.status(404).json({ message: "Company not found" });
            }
        }
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

