
import { z } from "zod";

export const CompanyBaseSchema = z.object({
    companyName: z.string().trim().min(2).max(100),
    nationality: z.string().trim().min(2).max(50),
    description: z.string().trim().max(500).optional().nullable(),
    referralEmail: z.string().trim().email(),
});

export const CreateCompanySchema = CompanyBaseSchema;

export const UpdateCompanySchema = CompanyBaseSchema.partial();

export const CompanyResponseSchema = CompanyBaseSchema.extend({
    id: z.string(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});
