import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../auth/jwt";

export interface AuthRequest extends Request {
    user?: {
        userId: string,
        role: string
    }
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
    const token = req.cookies?.accessToken;

    if (!token) {
        return res.status(401).json({ message: "Missing token" });
    }

    try {
        req.user = verifyAccessToken(token);
        next();
    } catch {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}
