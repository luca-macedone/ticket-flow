import { z } from "zod";

export const UserBaseSchema = z.object({
    email: z.string().trim().email(),
    password: z.string().trim().min(8),
    name: z.string().trim().min(2).max(100),
});

export const CreateUserSchema = UserBaseSchema;

export const UpdateUserSchema = z.object({
    email: z.string().trim().email().optional(),
    name: z.string().trim().min(2).max(100).optional(),
    role: z.enum(["USER", "ADMIN", "GUEST", "ON_APPROVAL"]).optional(),
});

export const UserResponseSchema = UserBaseSchema.extend({
    id: z.string(),
    email: z.string().trim().email(),
    name: z.string().trim().min(2).max(100),
    role: z.enum(["USER", "ADMIN", "GUEST", "ON_APPROVAL"]),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});