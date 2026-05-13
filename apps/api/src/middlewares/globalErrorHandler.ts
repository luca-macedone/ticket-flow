import { NextFunction, Request, Response } from "express";
import { logSystem } from "../utils/logger";

export function globalErrorHandler(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) {
    console.error(err);

    const status = err.status ?? 500;

    logSystem(
        'ERROR',
        err.message ?? 'Unexpected error',
        err.stack,
        { url: req.url, method: req.method, status }
    );

    res.status(status).json({
        title: err.title ?? "Internal Server Error",
        status,
        detail: err.message ?? "Unexpected error"
    });
}
