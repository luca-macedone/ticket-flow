import rateLimit from "express-rate-limit";

export const loginRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15min
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        message: "Too many login attempts, please try again later",
    }
})