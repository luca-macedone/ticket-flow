import { Request, Response } from "express";
import { prisma } from "../db";
import { Prisma } from "@prisma/client";
import { randomUUID } from "crypto";

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

//? get:/companies/:code
export async function getCompanyByCode(req: Request, res: Response) {
    try {
        const code = req.params.code as string;
        const company = await prisma.company.findUnique({
            where: { companyCode: code },
            include: {
                projects: {
                    select: {
                        id: true,
                        projectCode: true,
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
        const company = await prisma.$transaction(async (tx) => {
            const temp = await tx.company.create({
                data: { companyName, nationality, description, referralEmail, companyCode: randomUUID() }
            });
            const code = `CMP-${temp.id.toString().padStart(8, '0')}`;
            return tx.company.update({ where: { id: temp.id }, data: { companyCode: code } });
        });


        res.status(201).json(company);
    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

//? patch:/companies/:code
export async function updateCompany(req: Request, res: Response) {
    try {
        const code = req.params.code as string;
        const existing = await prisma.company.findUnique({ where: { companyCode: code } });
        if (!existing) return res.status(404).json({ message: "Company not found" });

        const { companyName, nationality, description, referralEmail } = req.body;

        const data: any = {};
        if (companyName !== undefined) data.companyName = companyName;
        if (nationality !== undefined) data.nationality = nationality;
        if (description !== undefined) data.description = description;
        if (referralEmail !== undefined) data.referralEmail = referralEmail;

        const company = await prisma.company.update({
            where: {
                id: existing.id
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

//? delete:/companies/:code
export async function deleteCompany(req: Request, res: Response) {
    try {
        await prisma.company.delete({
            where: {
                companyCode: req.params.code as string
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

