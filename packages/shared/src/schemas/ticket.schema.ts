import { z } from "zod";
import { StatusEnum, TicketCategoryEnum, PriorityEnum } from "./enums.js";
import { idSchema, isoDate } from "./common.schema.js";

export const TicketShape = z.object({
    ticketCode: z.string().trim().min(3).max(20),
    ticketName: z.string().trim().min(2).max(100),
    ticketDescription: z.string().trim().max(500).optional().nullable(),
    startDate: isoDate.optional().nullable(),
    endDate: isoDate.optional().nullable(),
    status: StatusEnum.optional(),
    category: TicketCategoryEnum.optional(),
    priority: PriorityEnum.optional(),
    projectId: idSchema.optional().nullable(),
    assigneeId: idSchema.optional().nullable(),
});

export const CreateTicketSchema = TicketShape.refine(
    d => !d.startDate || !d.endDate || new Date(d.endDate) >= new Date(d.startDate),
    { path: ["endDate"], message: "endDate must be after startDate" }
);

export const UpdateTicketSchema = TicketShape
    .partial()
    .refine(
        d => !d.startDate || !d.endDate || new Date(d.endDate) >= new Date(d.startDate),
        { path: ["endDate"], message: "endDate must be after startDate" }
    );

export const TicketResponseSchema = TicketShape.extend({
    id: z.string(),
    createdAt: isoDate,
    updatedAt: isoDate,
    resolvedAt: isoDate.optional().nullable(),
    reporterId: idSchema.optional().nullable(),
});
