import { z } from "zod";
import { StatusEnum } from "./enums.js";
import { idSchema } from "./common.schema.js";

export const TaskShape = z.object({
    taskCode: z.string().trim().min(3).max(20),
    taskName: z.string().trim().min(2).max(100),
    taskDescription: z.string().trim().max(500).optional().nullable(),
    startDate: z.string().datetime().optional().nullable(),
    endDate: z.string().datetime().optional().nullable(),
    status: StatusEnum.optional(),
    projectId: idSchema.optional().nullable(),
});

export const CreateTaskSchema = TaskShape.refine(
    d =>
        !d.startDate ||
        !d.endDate ||
        new Date(d.endDate) >= new Date(d.startDate),
    {
        path: ["endDate"],
        message: "endDate must be after startDate",
    }
);

export const UpdateTaskSchema = TaskShape
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

export const TaskResponseSchema = TaskShape.extend({
    id: z.string(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});
