import bcrypt from "bcrypt";
import { Request, Response, Router } from "express";
import { prisma } from "../db";
import { JwtPayload, signAccessToken, signRefreshToken, verifyRefreshToken } from "../auth/jwt";
import { requireAuth } from "../middlewares/requireAuth";
import { zodValidate } from "../middlewares/zodValidate";
import { LoginSchema } from "@packages/shared";
import { loginRateLimit } from "../middlewares/rateLimiters";

const router = Router();

const SECURE = process.env.NODE_ENV === 'production';

const BASE_COOKIE = {
    httpOnly: true,
    secure: SECURE,
    sameSite: 'strict' as const,
};

const ACCESS_COOKIE_OPTIONS = { ...BASE_COOKIE, maxAge: 15 * 60 * 1000 };
const REFRESH_COOKIE_OPTIONS = { ...BASE_COOKIE, maxAge: 7 * 24 * 60 * 60 * 1000, path: '/api/auth/refresh' };
const ACCESS_SESSION_OPTIONS = BASE_COOKIE;
const REFRESH_SESSION_OPTIONS = { ...BASE_COOKIE, path: '/api/auth/refresh' };

router.post("/login", loginRateLimit, zodValidate(LoginSchema), async (req: Request, res: Response) => {
    const { email, password, rememberMe } = req.body;

    const user = await prisma.user.findUnique({
        where: { email },
        omit: { pswHash: false }  // override del global omit
    });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.pswHash);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    if (user.status !== "APPROVED") {
        return res.status(403).json({ message: "User not approved yet", name: user.name });
    }

    const payload: JwtPayload = {
        userId: user.id.toString(),
        role: user.role.toLowerCase(),
        persist: !!rememberMe
    };

    res.clearCookie('refreshToken', BASE_COOKIE);
    res.cookie('accessToken', signAccessToken(payload), rememberMe ? ACCESS_COOKIE_OPTIONS : ACCESS_SESSION_OPTIONS);
    res.cookie('refreshToken', signRefreshToken(payload), rememberMe ? REFRESH_COOKIE_OPTIONS : REFRESH_SESSION_OPTIONS);
    res.json({ name: user.name, role: user.role.toLowerCase(), status: user.status });
});


router.get('/me', requireAuth, async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
        where: { id: BigInt(req.user.userId) },
        select: { name: true, role: true, status: true }
    });
    if (!user) return res.status(401).json({ message: 'User not found' });
    res.json({ name: user.name, role: user.role.toLowerCase(), status: user.status });
});

router.post("/refresh", async (req: Request, res: Response) => {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ message: "No refresh token" });

    try {
        const payload = verifyRefreshToken(token);

        // verifica che l'utente esista ancora ed sia ancora approvato
        const user = await prisma.user.findUnique({ where: { id: BigInt(payload.userId) } });
        if (!user || user.status !== "APPROVED") {
            return res.status(401).json({ message: "Invalid session" });
        }

        const newPayload: JwtPayload = { userId: user.id.toString(), role: user.role.toLowerCase(), persist: payload.persist };

        res.clearCookie('refreshToken', BASE_COOKIE);
        res.cookie('accessToken', signAccessToken(newPayload), payload.persist ? ACCESS_COOKIE_OPTIONS : ACCESS_SESSION_OPTIONS);
        res.cookie('refreshToken', signRefreshToken(newPayload), payload.persist ? REFRESH_COOKIE_OPTIONS : REFRESH_SESSION_OPTIONS);

        res.sendStatus(200);
    } catch {
        res.status(401).json({ message: "Invalid or expired refresh token" });
    }
});

router.post("/logout", (_req: Request, res: Response) => {
    res.clearCookie('accessToken', BASE_COOKIE);
    res.clearCookie('refreshToken', BASE_COOKIE);
    res.clearCookie('refreshToken', { ...BASE_COOKIE, path: '/api/auth/refresh' });
    res.sendStatus(204);
});

export default router;
