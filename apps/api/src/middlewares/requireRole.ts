import { NextFunction, Response } from "express";
import { AuthRequest } from "./requireAuth";

const ROLE_HIERARCHY = { CUSTOMER: 0, AGENT: 1, ADMIN: 2 };

export function requireRole(...allowedRoles: string[]) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const userLevel = ROLE_HIERARCHY[req.user.role.toUpperCase() as keyof typeof ROLE_HIERARCHY] ?? -1;

        const minRequired = Math.min(...allowedRoles.map(r => ROLE_HIERARCHY[r as keyof typeof ROLE_HIERARCHY] ?? 99));

        if (userLevel < minRequired) return res.status(403).json({ message: "Forbidden" });

        next();
    }
}