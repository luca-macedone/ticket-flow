import { Request, Response, NextFunction } from "express";
import z from "zod";

type ParseableSchema = {
    safeParse(data: unknown): { success: boolean; data?: unknown; error?: any };
};

export const zodValidate = <T extends z.ZodTypeAny>(schema: T) =>
    (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                message: "Validation error",
                errors: result.error?.flatten(),
            });
        }

        req.body = result.data as z.infer<T>;
        next();
    };