import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
    prisma?: PrismaClient;
}

const adapter = new PrismaMariaDb({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT),
    user: process.env.DB_USER,
    password: process.env.DB_PSW,
    database: process.env.DB_NAME
})

export const prisma = globalForPrisma.prisma ??
    new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development"
            ? ["query", "error", "warn"]
            : ["error"],
    });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma
}