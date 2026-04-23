import { z } from "zod";

const PasswordSchema = z.string()
    .min(8, "Minimo 8 caratteri")
    .regex(/[A-Z]/, "Almeno una maiuscola")
    .regex(/[a-z]/, "Almeno una minuscola")
    .regex(/[0-9]/, "Almeno un numero")
    .regex(/[^A-Za-z0-9]/, "Almeno un carattere speciale");

export const LoginSchema = z.object({
    email: z.string().trim().email(),
    password: z.string().min(1),
})

export const LoginResponseSchema = z.object({
    ok: z.boolean(),
    name: z.string(),
    role: z.string(),
})

export const UserBaseSchema = z.object({
    email: z.string().trim().email(),
    password: z.string().trim().min(8),
    name: z.string().trim().min(2).max(100),
});

export const CreateUserSchema = UserBaseSchema.extend({
    password: PasswordSchema,
    confirmPassword: PasswordSchema,
}).refine(d => d.password === d.confirmPassword, {
    message: "Le password non coincidono",
    path: ["confirmPassword"],
}).transform(({ confirmPassword: _, ...rest }) => rest);

export const UpdateUserSchema = z.object({
    email: z.string().trim().email().optional(),
    name: z.string().trim().min(2).max(100).optional(),
    role: z.enum(["USER", "ADMIN", "GUEST"]).optional(),
});

export const UserResponseSchema = UserBaseSchema.extend({
    id: z.string(),
    email: z.string().trim().email(),
    name: z.string().trim().min(2).max(100),
    role: z.enum(["USER", "ADMIN", "GUEST"]),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});

export const RegisterApiSchema = z.object({
    email: z.string().trim().email(),
    password: PasswordSchema,
    name: z.string().trim().min(2).max(100),
});