import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../auth/jwt";

export interface AuthRequest extends Request {
    user?: {
        userId: string,
        role: string
    }
}

export function requireAuth(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Missing token" });
    }

    const token = header.substring(7);

    try {
        const payload = verifyAccessToken(token);
        req.user = payload;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}