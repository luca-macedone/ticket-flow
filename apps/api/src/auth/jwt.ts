import jwt, { SignOptions } from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES!;

export interface JwtPayload {
    userId: string;
    role: string;
    persist?: boolean;
}

export function signAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, ACCESS_SECRET, {
        expiresIn: ACCESS_EXPIRES as SignOptions["expiresIn"]
    });
}

export function signRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, REFRESH_SECRET, {
        expiresIn: REFRESH_EXPIRES as SignOptions["expiresIn"]
    });
}

export function verifyAccessToken(token: string): JwtPayload {
    const decoded = jwt.verify(token, ACCESS_SECRET) as JwtPayload;
    return { userId: decoded.userId, role: String(decoded.role) };
}

export function verifyRefreshToken(token: string): JwtPayload {
    const decoded = jwt.verify(token, REFRESH_SECRET) as JwtPayload;
    return { userId: decoded.userId, role: String(decoded.role), persist: decoded.persist };
}