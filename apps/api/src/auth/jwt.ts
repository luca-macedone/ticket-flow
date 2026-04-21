import jwt, { SignOptions } from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES!;

export interface JwtPayload {
    userId: string;
    role: string;
}

export function signAccessToken(payload: JwtPayload): string {
    const options: SignOptions = {
        expiresIn: ACCESS_EXPIRES as jwt.SignOptions["expiresIn"],
    }
    return jwt.sign(payload, ACCESS_SECRET, options);
}

export function verifyAccessToken(token: string): JwtPayload {
    const decoded = jwt.verify(token, ACCESS_SECRET) as JwtPayload;

    return {
        userId: decoded.userId,
        role: String(decoded.role)
    }
}