import { PrismaClient } from "@prisma/client";
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
    const adminHash = await bcrypt.hash("Admin@1234", 12);
    const userHash = await bcrypt.hash("User@1234", 12);

    await prisma.user.upsert({
        where: { email: "admin@ticketflow.dev" },
        update: {},
        create: {
            email: "admin@ticketflow.dev", name: "Admin",
            pswHash: adminHash, role: "ADMIN", status: "APPROVED"
        },
    });

    const acme = await prisma.company.upsert({
        where: { referralEmail: "contact@acmecorp.io" },
        update: {},
        create: {
            companyName: "Acme Corp", nationality: "USA",
            description: "Leader of software enterprise distribution.",
            referralEmail: "contact@acmecorp.io"
        },
    });
    const meridian = await prisma.company.upsert({
        where: { referralEmail: "info@meridiansolutions.it" },
        update: {},
        create: {
            companyName: "Meridian Solutions", nationality: "Italy",
            description: "IT services partner and PMI digital transformation.",
            referralEmail: "info@meridiansolutions.it"
        },
    });
    const bluewave = await prisma.company.upsert({
        where: { referralEmail: "hello@bluewave.tech" },
        update: {},
        create: {
            companyName: "Bluewave Tech", nationality: "Germany",
            description: "Fintech company specialized on payment methods.",
            referralEmail: "hello@bluewave.tech"
        },
    });

    const agent1 = await prisma.user.upsert({
        where: { email: "marco.rossi@ticketflow.dev" },
        update: {},
        create: {
            email: "marco.rossi@ticketflow.dev", name: "Marco Rossi",
            pswHash: userHash, role: "AGENT", status: "APPROVED"
        },
    });
    const agent2 = await prisma.user.upsert({
        where: { email: "sara.bianchi@ticketflow.dev" },
        update: {},
        create: {
            email: "sara.bianchi@ticketflow.dev", name: "Sara Bianchi",
            pswHash: userHash, role: "AGENT", status: "APPROVED"
        },
    });

    const cust1 = await prisma.user.upsert({
        where: { email: "john.doe@acmecorp.io" },
        update: {},
        create: {
            email: "john.doe@acmecorp.io", name: "John Doe",
            pswHash: userHash, role: "CUSTOMER", status: "APPROVED"
        },
    });
    const cust2 = await prisma.user.upsert({
        where: { email: "luca.ferrari@meridiansolutions.it" },
        update: {},
        create: {
            email: "luca.ferrari@meridiansolutions.it", name: "Luca Ferrari",
            pswHash: userHash, role: "CUSTOMER", status: "APPROVED"
        },
    });
    const cust3 = await prisma.user.upsert({
        where: { email: "anna.klein@bluewave.tech" },
        update: {},
        create: {
            email: "anna.klein@bluewave.tech", name: "Anna Klein",
            pswHash: userHash, role: "CUSTOMER", status: "APPROVED"
        },
    });

    await prisma.user.upsert({
        where: { email: "pending.user@example.com" },
        update: {},
        create: {
            email: "pending.user@example.com", name: "Mario Verdi",
            pswHash: userHash, role: "CUSTOMER", status: "PENDING_APPROVAL"
        },
    });

    if (await prisma.project.count() === 0) {
        await prisma.task.deleteMany();
        await prisma.project.deleteMany();
        const proj1 = await prisma.project.create({
            data: {
                projectName: "Customer Portal v2",
                description: "Complete rebuild of the customer portal with new UX.",
                startDate: new Date("2025-01-10"),
                endDate: new Date("2025-06-30"),
                companyId: acme.id,
                users: { connect: [{ id: cust1.id }, { id: agent1.id }] },
            }
        });
        const proj2 = await prisma.project.create({
            data: {
                projectName: "ERP Migration",
                description: "Migration of the legacy management system to cloud platform.",
                startDate: new Date("2025-03-01"),
                companyId: meridian.id,
                users: { connect: [{ id: cust2.id }, { id: agent2.id }] },
            }
        });
        const proj3 = await prisma.project.create({
            data: {
                projectName: "Payment Gateway Integration",
                description: "Integration with European payment gateways (PSD2).",
                startDate: new Date("2025-02-15"),
                endDate: new Date("2025-09-01"),
                companyId: bluewave.id,
                users: { connect: [{ id: cust3.id }, { id: agent1.id }] },
            }
        });
        const proj4 = await prisma.project.create({
            data: {
                projectName: "Internal HR System",
                description: "Internal system for human resources management.",
                startDate: new Date("2025-04-01"),
                companyId: acme.id,
                users: { connect: [{ id: cust1.id }, { id: agent2.id }] },
            }
        });

        await prisma.task.createMany({
            data: [
                {
                    taskCode: "TF-001", taskName: "Setup working environments",
                    taskDescription: "Repo configuration, CI/CD and staging/prod locations.",
                    status: "DONE", category: "GENERAL", priority: "HIGH",
                    startDate: new Date("2025-01-10"), endDate: new Date("2025-01-15"),
                    resolvedAt: new Date("2025-01-15"),
                    projectId: proj1.id, assigneeId: agent1.id, reporterId: cust1.id
                },

                {
                    taskCode: "TF-002", taskName: "Bug: login loop on Safari",
                    taskDescription: "After the refresh of the token, the user is redirect in a loop.",
                    status: "FULFILLMENT", category: "BUG", priority: "URGENT",
                    startDate: new Date("2025-02-01"),
                    projectId: proj1.id, assigneeId: agent1.id, reporterId: cust1.id
                },

                {
                    taskCode: "TF-003", taskName: "Feature: export of the data in CSV format",
                    taskDescription: "The client requires the export of the data by CSV format file.",
                    status: "ON_QUEUE", category: "FEATURE", priority: "MEDIUM",
                    projectId: proj1.id, reporterId: cust1.id
                },

                {
                    taskCode: "TF-004", taskName: "DB legacy scheme analysis",
                    taskDescription: "Mapping of existing tables for migration pourpose.",
                    status: "DONE", category: "GENERAL", priority: "HIGH",
                    startDate: new Date("2025-03-01"), endDate: new Date("2025-03-10"),
                    resolvedAt: new Date("2025-03-09"),
                    projectId: proj2.id, assigneeId: agent2.id, reporterId: cust2.id
                },

                {
                    taskCode: "TF-005", taskName: "Support: ERP credentials expired",
                    taskDescription: "The users cannot login to HR module after the reset.",
                    status: "ON_APPROVAL", category: "SUPPORT", priority: "HIGH",
                    startDate: new Date("2025-04-05"),
                    projectId: proj2.id, assigneeId: agent2.id, reporterId: cust2.id
                },

                {
                    taskCode: "TF-006", taskName: "Stripe webhook integration",
                    taskDescription: "payment_intent.succeeded and payment_failed events handling.",
                    status: "FULFILLMENT", category: "FEATURE", priority: "URGENT",
                    startDate: new Date("2025-03-01"),
                    projectId: proj3.id, assigneeId: agent1.id, reporterId: cust3.id
                },

                {
                    taskCode: "TF-007", taskName: "SSL certificates renewal",
                    taskDescription: "Renewal of SSL certificates expiring on May.",
                    status: "ON_HOLD", category: "MAINTENANCE", priority: "MEDIUM",
                    projectId: proj3.id, reporterId: cust3.id
                },

                {
                    taskCode: "TF-008", taskName: "Holiday end permits handling",
                    taskDescription: "Implementation of holiday request calendar with approvation manager feature.",
                    status: "ON_QUEUE", category: "FEATURE", priority: "LOW",
                    startDate: new Date("2025-04-10"),
                    projectId: proj4.id, assigneeId: agent2.id, reporterId: cust1.id
                },
            ]
        });
    }

    console.log("Seed completed.");
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
