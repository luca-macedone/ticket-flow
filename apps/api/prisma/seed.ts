import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDb({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT),
    user: process.env.DB_USER,
    password: process.env.DB_PSW,
    database: process.env.DB_NAME,
});

const prisma = new PrismaClient({ adapter });

async function main() {
    const hash = await bcrypt.hash("Admin@1234", 12);

    await prisma.user.upsert({
        where: { email: "admin@ticketflow.dev" },
        update: {},
        create: {
            email: "admin@ticketflow.dev",
            name: "Admin",
            pswHash: hash,
            role: "ADMIN",
            status: "APPROVED"
        }
    })

    console.log('Seed completato: admin@ticketflow.dev / Admin@1234');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());