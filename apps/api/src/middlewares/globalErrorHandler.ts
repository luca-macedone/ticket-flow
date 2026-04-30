import { NextFunction, Request, Response } from "express";

export function globalErrorHandler(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) {
    console.error(err);

    const status = err.status ?? 500;

    res.status(status).json({
        title: err.title ?? "Internal Server Error",
        status,
        detail: err.message ?? "Unexpected error"
    });
}