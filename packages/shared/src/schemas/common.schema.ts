import { z } from "zod";

export const idSchema = z.string().regex(/^\d+$/);
export const isoDate = z.string().datetime();
export const PaginationQuerySchema = z.object({
    page: z.string().optional(),
    amount: z.string().optional(),
});
export const IdParamSchema = z.object({
    id: idSchema
});
