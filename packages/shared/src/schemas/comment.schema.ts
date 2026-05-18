import z from "zod";

export const CommentVisibilityEnum = z.enum(['PUBLIC', 'INTERNAL']);

export const CreateCommentSchema = z.object({
    content: z.string().trim().min(1).max(2000),
    visibility: CommentVisibilityEnum.default('PUBLIC'),
});

export const CommentResponseSchema = z.object({
    id: z.string(),
    content: z.string(),
    visibility: CommentVisibilityEnum,
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    ticketCode: z.string(),
    author: z.object({
        userCode: z.string(),
        name: z.string(),
        role: z.string(),
    })
});