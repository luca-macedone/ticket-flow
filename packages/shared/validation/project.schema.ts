
import { z } from "zod";
import { idSchema, isoDate } from "./common.schema";

export const ProjectShape = z.object({
    projectName: z.string().trim().min(2).max(100),
    description: z.string().trim().max(500).optional().nullable(),
    startDate: isoDate,
    endDate: isoDate.optional().nullable(),
    companyId: idSchema,
});


export const CreateProjectSchema = ProjectShape
    .refine(
        d => !d.endDate || new Date(d.endDate) >= new Date(d.startDate),
        {
            path: ["endDate"],
            message: "endDate must be after startDate",
        }
    );

export const UpdateProjectSchema = ProjectShape
    .partial()
    .refine(
        d =>
            !d.startDate ||
            !d.endDate ||
            new Date(d.endDate) >= new Date(d.startDate),
        {
            path: ["endDate"],
            message: "endDate must be after startDate",
        }
    );

export const ProjectResponseSchema = ProjectShape
    .extend({
        id: z.string(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
    });
