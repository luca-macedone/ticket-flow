import { Priority, PrismaClient, Status, TicketCategory } from "@prisma/client";
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

function makePrng(seed: number) {
    let s = (seed >>> 0) || 1;
    const next = (): number => {
        s ^= 5 << 13; s ^= s >> 17; s ^= s << 5;
        return (s >>> 0) / 4294967296;
    };
    return {
        float: () => next(),
        int: (min: number, max: number) => min + Math.floor(next() * (max - min + 1)),
        pick: <T>(arr: readonly T[]): T => arr[Math.floor(next() * arr.length)],
        date: (start: Date, end: Date) => new Date(start.getTime() + Math.floor(next() * (end.getTime() - start.getTime()))),
        addDays: (d: Date, n: number) => new Date(d.getTime() + n * 86_400_000),
        weightedPick: <T>(items: readonly T[], weights: readonly number[]): T => {
            const total = weights.reduce((a, b) => a + b, 0);
            let r = next() * total;
            for (let i = 0; i < items.length; i++) { r -= weights[i]; if (r <= 0) return items[i]; }
            return items[items.length - 1];
        },
    };
}

const rng = makePrng(20250428);
const TODAY = new Date("2026-04-28T12:00:00Z");

const POOL: Record<TicketCategory, readonly string[]> = {
    BUG: [
        "Login page unresponsive on mobile",
        "Data not saving on form submit",
        "Incorrect totals in dashboard widget",
        "Session timeout not working correctly",
        "Email notifications not delivered",
        "PDF export corrupted on large datasets",
        "Filter reset clears all user preferences",
        "Date picker broken in Firefox",
        "Dropdown values missing after page refresh",
        "API returns 500 on concurrent requests",
        "Search results returned out of order",
        "Image upload fails for files over 2MB",
        "Pagination jump to last page fails",
        "Webhook signature verification error",
        "Timezone mismatch in displayed timestamps",
        "Deadlock on simultaneous DB writes",
        "CORS error on preflight OPTIONS requests",
        "Memory leak in background job processor",
        "Rate limiter incorrectly blocking admin users",
        "CSV import silently skips duplicate rows",
        "Mobile keyboard overlaps form input fields",
        "Charts render blank after data update",
        "Token refresh fails on slow connections",
        "Bulk delete only removes first 50 records",
        "Notification badge count not resetting",
    ],
    FEATURE: [
        "Add CSV export for all reports",
        "Implement role-based access control",
        "Dashboard widget for KPI overview",
        "Bulk ticket assignment interface",
        "Real-time notifications via WebSocket",
        "Two-factor authentication support",
        "Custom fields on ticket forms",
        "Audit log for all user actions",
        "SLA tracking and breach alerts",
        "Public REST API for integrations",
        "Dark mode theme support",
        "Saved filters and quick search panel",
        "Weekly email digest summary for agents",
        "Ticket merging and parent-child linking",
        "File attachment support on tickets",
        "Customer satisfaction survey after close",
        "Auto-assignment based on agent workload",
        "Project milestone tracking",
        "Recurring ticket scheduler",
        "Executive reporting dashboard",
        "Kanban board view for tickets",
        "Time tracking on ticket resolution",
        "Multi-language localization support",
        "Webhook outbound for external systems",
        "Batch status update for multiple tickets",
    ],
    SUPPORT: [
        "Cannot access project after password reset",
        "Invoice data not matching ERP export",
        "Onboarding new team member access",
        "Account locked after failed logins",
        "Billing discrepancy in last invoice",
        "User cannot upload attachments",
        "Third-party SSO configuration issue",
        "Dashboard loading extremely slowly",
        "Request for additional user seats",
        "Data export required for compliance audit",
        "Bulk user deactivation request",
        "VPN access configuration needed",
        "API key rotation request",
        "Data migration assistance",
        "Training session scheduling",
        "Custom report configuration help",
        "Backup restoration request",
        "User permissions review",
    ],
    MAINTENANCE: [
        "SSL certificate renewal",
        "Database index optimization",
        "Security dependency patch",
        "Server disk space cleanup",
        "Log rotation configuration",
        "Backup verification run",
        "Performance profiling session",
        "API versioning cleanup",
        "Remove deprecated endpoints",
        "Update runtime to latest LTS",
        "Database migration dry run",
        "Cache layer tuning",
        "Queue worker scaling configuration",
        "Monitoring alert threshold review",
        "Container base image update",
        "Rotate database credentials",
        "Archive old audit logs",
    ],
    GENERAL: [
        "Initial project setup and kickoff",
        "Environment configuration review",
        "Technical documentation update",
        "Stakeholder review meeting prep",
        "Architecture decision record",
        "Team onboarding checklist",
        "Deploy to staging environment",
        "Pre-release security scan",
        "Performance baseline measurement",
        "Vendor evaluation for tooling",
        "Define project SLAs and KPIs",
        "Sprint retrospective action items",
        "Code review for release candidate",
        "UAT coordination with client",
        "CI/CD pipeline optimization",
        "Post-mortem documentation",
    ],
};

const DESC: Record<TicketCategory, readonly string[]> = {
    BUG: ["Reported on production by end user.", "Reproducible on v2.x — steps in attached log.", "Intermittent since last deployment."],
    FEATURE: ["Business requirement from client.", "Prioritized in sprint planning.", "Part of quarterly product roadmap."],
    SUPPORT: ["Client contacted support team directly.", "Escalated from tier-1.", "Active SLA timer running."],
    MAINTENANCE: ["Scheduled maintenance window.", "Required for compliance.", "Identified in last infrastructure review."],
    GENERAL: ["Coordination task.", "Administrative project item.", "Project management overhead."],
};

const CATEGORIES = ["BUG", "FEATURE", "SUPPORT", "MAINTENANCE", "GENERAL"] as TicketCategory[];
const CAT_W = [28, 30, 18, 12, 12];

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as Priority[];
const PRI_W = [15, 40, 30, 15];

const RES_DAYS: Record<Priority, [number, number]> = {
    URGENT: [1, 3], HIGH: [2, 7], MEDIUM: [4, 14], LOW: [7, 30],
}

function statusWeights(ageDays: number): [Status[], number[]] {
    if (ageDays >= 120) return [["DONE", "CANCELLED", "REJECTED", "FULFILLMENT", "ON_HOLD"], [62, 8, 5, 15, 10]];
    if (ageDays >= 60) return [["DONE", "CANCELLED", "REJECTED", "FULFILLMENT", "ON_APPROVAL", "ON_QUEUE", "ON_HOLD"], [45, 6, 4, 22, 10, 8, 5]];
    if (ageDays >= 30) return [["DONE", "FULFILLMENT", "ON_APPROVAL", "ON_QUEUE", "APPROVED", "ON_HOLD"], [25, 28, 18, 20, 5, 4]];
    return [["FULFILLMENT", "ON_QUEUE", "ON_APPROVAL", "APPROVED", "DONE", "ON_HOLD"], [32, 35, 18, 8, 4, 3]];
}

interface TicketInput {
    ticketCode: string; ticketName: string; ticketDescription: string;
    status: Status; category: TicketCategory; priority: Priority;
    createdAt: Date; updatedAt: Date;
    startDate: Date | null; endDate: Date | null; resolvedAt: Date | null;
    projectId: bigint; assigneeId: bigint | null; reporterId: bigint | null;
}

function makeTicket(
    n: number,
    createdAt: Date,
    projectId: bigint,
    assigneeId: bigint | null,
    reporterId: bigint,
): TicketInput {
    const ageDays = Math.max(0, Math.floor((TODAY.getTime() - createdAt.getTime()) / 86_400_000));
    const category = rng.weightedPick(CATEGORIES, CAT_W) as TicketCategory;
    const priority = rng.weightedPick(PRIORITIES, PRI_W) as Priority;
    const [statuses, weights] = statusWeights(ageDays);
    const status = rng.weightedPick(statuses, weights) as Status;

    const ticketName = rng.pick(POOL[category]) as string;
    const ticketDescription = (rng.pick(DESC[category]) as string) + ` [${ticketName.slice(0, 40)}]`;
    const ticketCode = `TF-${String(n).padStart(5, "0")}`;

    const resolved = status === "DONE" || status === "CANCELLED" || status === "REJECTED";
    const active = status === "FULFILLMENT" || status === "APPROVED" || status === "ON_APPROVAL";

    let startDate: Date | null = null;
    let endDate: Date | null = null;
    let resolvedAt: Date | null = null;

    if (resolved || active) {
        startDate = rng.addDays(createdAt, rng.int(0, 3));
    }
    if (resolved && startDate) {
        const [mn, mx] = RES_DAYS[priority];
        resolvedAt = rng.addDays(startDate, rng.int(mn, mx));
        if (resolvedAt > TODAY) resolvedAt = new Date(TODAY);
        if (status === "DONE") endDate = resolvedAt;
    }

    return {
        ticketCode, ticketName, ticketDescription,
        status, category, priority,
        startDate, endDate, resolvedAt,
        createdAt, updatedAt: resolvedAt ?? startDate ?? createdAt,
        projectId, assigneeId, reporterId,
    };
}

async function batchInsert(rows: TicketInput[]) {
    const SIZE = 500;
    for (let i = 0; i < rows.length; i += SIZE) {
        await prisma.ticket.createMany({ data: rows.slice(i, i + SIZE) });
        process.stdout.write(`\r  tickets: ${Math.min(i + SIZE, rows.length)} / ${rows.length}`);
    }
    process.stdout.write("\n");
}

async function main() {
    const adminHash = await bcrypt.hash("Admin@1234", 12);
    const userHash = await bcrypt.hash("User@1234", 12);

    console.log("Seeding users...");
    await prisma.user.upsert({
        where: { email: "admin@ticketflow.dev" },
        update: {},
        create: { email: "admin@ticketflow.dev", name: "Admin", pswHash: adminHash, role: "ADMIN", status: "APPROVED" },
    });

    const [a1, a2, a3, a4, a5, a6] = await Promise.all([
        prisma.user.upsert({ where: { email: "marco.rossi@ticketflow.dev" }, update: {}, create: { email: "marco.rossi@ticketflow.dev", name: "Marco Rossi", pswHash: userHash, role: "AGENT", status: "APPROVED" } }),
        prisma.user.upsert({ where: { email: "sara.bianchi@ticketflow.dev" }, update: {}, create: { email: "sara.bianchi@ticketflow.dev", name: "Sara Bianchi", pswHash: userHash, role: "AGENT", status: "APPROVED" } }),
        prisma.user.upsert({ where: { email: "giulia.conti@ticketflow.dev" }, update: {}, create: { email: "giulia.conti@ticketflow.dev", name: "Giulia Conti", pswHash: userHash, role: "AGENT", status: "APPROVED" } }),
        prisma.user.upsert({ where: { email: "ahmed.hassan@ticketflow.dev" }, update: {}, create: { email: "ahmed.hassan@ticketflow.dev", name: "Ahmed Hassan", pswHash: userHash, role: "AGENT", status: "APPROVED" } }),
        prisma.user.upsert({ where: { email: "priya.sharma@ticketflow.dev" }, update: {}, create: { email: "priya.sharma@ticketflow.dev", name: "Priya Sharma", pswHash: userHash, role: "AGENT", status: "APPROVED" } }),
        prisma.user.upsert({ where: { email: "tom.weber@ticketflow.dev" }, update: {}, create: { email: "tom.weber@ticketflow.dev", name: "Tom Weber", pswHash: userHash, role: "AGENT", status: "APPROVED" } }),
    ]);

    console.log("Seeding companies...");
    const [acme, meridian, bluewave, novasoft, vertex] = await Promise.all([
        prisma.company.upsert({ where: { referralEmail: "contact@acmecorp.io" }, update: {}, create: { companyName: "Acme Corp", nationality: "USA", description: "Leader of software enterprise distribution.", referralEmail: "contact@acmecorp.io" } }),
        prisma.company.upsert({ where: { referralEmail: "info@meridiansolutions.it" }, update: {}, create: { companyName: "Meridian Solutions", nationality: "Italy", description: "IT services partner and PMI digital transformation.", referralEmail: "info@meridiansolutions.it" } }),
        prisma.company.upsert({ where: { referralEmail: "hello@bluewave.tech" }, update: {}, create: { companyName: "Bluewave Tech", nationality: "Germany", description: "Fintech company specialized on payment methods.", referralEmail: "hello@bluewave.tech" } }),
        prisma.company.upsert({ where: { referralEmail: "contact@novasoft.fr" }, update: {}, create: { companyName: "NovaSoft", nationality: "France", description: "SaaS CRM and sales solutions for SME.", referralEmail: "contact@novasoft.fr" } }),
        prisma.company.upsert({ where: { referralEmail: "info@vertexsystems.co.uk" }, update: {}, create: { companyName: "Vertex Systems", nationality: "UK", description: "Cloud infrastructure and DevOps consulting.", referralEmail: "info@vertexsystems.co.uk" } }),
    ]);

    console.log("Seeding customers...");
    const [c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12] = await Promise.all([
        prisma.user.upsert({ where: { email: "john.doe@acmecorp.io" }, update: {}, create: { email: "john.doe@acmecorp.io", name: "John Doe", pswHash: userHash, role: "CUSTOMER", status: "APPROVED" } }),
        prisma.user.upsert({ where: { email: "emily.carter@acmecorp.io" }, update: {}, create: { email: "emily.carter@acmecorp.io", name: "Emily Carter", pswHash: userHash, role: "CUSTOMER", status: "APPROVED" } }),
        prisma.user.upsert({ where: { email: "robert.chen@acmecorp.io" }, update: {}, create: { email: "robert.chen@acmecorp.io", name: "Robert Chen", pswHash: userHash, role: "CUSTOMER", status: "APPROVED" } }),
        prisma.user.upsert({ where: { email: "luca.ferrari@meridiansolutions.it" }, update: {}, create: { email: "luca.ferrari@meridiansolutions.it", name: "Luca Ferrari", pswHash: userHash, role: "CUSTOMER", status: "APPROVED" } }),
        prisma.user.upsert({ where: { email: "chiara.romano@meridiansolutions.it" }, update: {}, create: { email: "chiara.romano@meridiansolutions.it", name: "Chiara Romano", pswHash: userHash, role: "CUSTOMER", status: "APPROVED" } }),
        prisma.user.upsert({ where: { email: "anna.klein@bluewave.tech" }, update: {}, create: { email: "anna.klein@bluewave.tech", name: "Anna Klein", pswHash: userHash, role: "CUSTOMER", status: "APPROVED" } }),
        prisma.user.upsert({ where: { email: "felix.bauer@bluewave.tech" }, update: {}, create: { email: "felix.bauer@bluewave.tech", name: "Felix Bauer", pswHash: userHash, role: "CUSTOMER", status: "APPROVED" } }),
        prisma.user.upsert({ where: { email: "maria.schmidt@bluewave.tech" }, update: {}, create: { email: "maria.schmidt@bluewave.tech", name: "Maria Schmidt", pswHash: userHash, role: "CUSTOMER", status: "APPROVED" } }),
        prisma.user.upsert({ where: { email: "pierre.dupont@novasoft.fr" }, update: {}, create: { email: "pierre.dupont@novasoft.fr", name: "Pierre Dupont", pswHash: userHash, role: "CUSTOMER", status: "APPROVED" } }),
        prisma.user.upsert({ where: { email: "sophie.martin@novasoft.fr" }, update: {}, create: { email: "sophie.martin@novasoft.fr", name: "Sophie Martin", pswHash: userHash, role: "CUSTOMER", status: "APPROVED" } }),
        prisma.user.upsert({ where: { email: "james.wilson@vertexsystems.co.uk" }, update: {}, create: { email: "james.wilson@vertexsystems.co.uk", name: "James Wilson", pswHash: userHash, role: "CUSTOMER", status: "APPROVED" } }),
        prisma.user.upsert({ where: { email: "laura.thompson@vertexsystems.co.uk" }, update: {}, create: { email: "laura.thompson@vertexsystems.co.uk", name: "Laura Thompson", pswHash: userHash, role: "CUSTOMER", status: "APPROVED" } }),
    ]);

    await prisma.user.upsert({
        where: { email: "pending.user@example.com" },
        update: {},
        create: { email: "pending.user@example.com", name: "Mario Verdi", pswHash: userHash, role: "CUSTOMER", status: "PENDING_APPROVAL" },
    });

    const ticketCount = await prisma.ticket.count();
    if (ticketCount < 100) {
        console.log("Generating bulk data...");
        await prisma.ticket.deleteMany();
        await prisma.project.deleteMany();

        const p1 = await prisma.project.create({ data: { projectName: "Customer Portal v2", description: "Complete rebuild of the customer portal with new UX.", startDate: new Date("2025-01-10"), endDate: new Date("2025-06-30"), companyId: acme.id, users: { connect: [{ id: c1.id }, { id: c2.id }, { id: a1.id }, { id: a2.id }] } } });
        const p2 = await prisma.project.create({ data: { projectName: "ERP Migration", description: "Migration of legacy on-premise ERP to cloud-native platform.", startDate: new Date("2025-03-01"), companyId: meridian.id, users: { connect: [{ id: c4.id }, { id: c5.id }, { id: a2.id }, { id: a3.id }] } } });
        const p3 = await prisma.project.create({ data: { projectName: "Payment Gateway Integration", description: "Integration with European payment gateways and PSD2 compliance.", startDate: new Date("2025-02-15"), endDate: new Date("2025-09-01"), companyId: bluewave.id, users: { connect: [{ id: c6.id }, { id: c7.id }, { id: a1.id }, { id: a4.id }] } } });
        const p4 = await prisma.project.create({ data: { projectName: "Internal HR System", description: "HRMS for holiday management, payroll and org chart.", startDate: new Date("2025-04-01"), companyId: acme.id, users: { connect: [{ id: c1.id }, { id: c3.id }, { id: a2.id }, { id: a5.id }] } } });
        const p5 = await prisma.project.create({ data: { projectName: "Data Analytics Platform", description: "Real-time analytics platform for BI and executive dashboards.", startDate: new Date("2025-07-01"), endDate: new Date("2026-03-31"), companyId: acme.id, users: { connect: [{ id: c2.id }, { id: c3.id }, { id: a3.id }, { id: a5.id }] } } });
        const p6 = await prisma.project.create({ data: { projectName: "Cloud Infrastructure Setup", description: "Migration from bare-metal to AWS with IaC and auto-scaling.", startDate: new Date("2025-05-15"), endDate: new Date("2025-11-30"), companyId: meridian.id, users: { connect: [{ id: c4.id }, { id: c5.id }, { id: a4.id }, { id: a6.id }] } } });
        const p7 = await prisma.project.create({ data: { projectName: "Mobile Banking App", description: "Cross-platform mobile app for retail banking clients.", startDate: new Date("2025-06-01"), companyId: bluewave.id, users: { connect: [{ id: c6.id }, { id: c8.id }, { id: a1.id }, { id: a3.id }] } } });
        const p8 = await prisma.project.create({ data: { projectName: "CRM Redesign", description: "Complete redesign of the legacy CRM with modern UX and REST API.", startDate: new Date("2025-01-15"), endDate: new Date("2025-08-31"), companyId: novasoft.id, users: { connect: [{ id: c9.id }, { id: c10.id }, { id: a5.id }, { id: a6.id }] } } });
        const p9 = await prisma.project.create({ data: { projectName: "API Gateway Modernization", description: "Replace monolithic API with microservices gateway (Kong/Traefik).", startDate: new Date("2025-09-01"), companyId: novasoft.id, users: { connect: [{ id: c9.id }, { id: c10.id }, { id: a2.id }, { id: a4.id }] } } });
        const p10 = await prisma.project.create({ data: { projectName: "DevOps Automation", description: "End-to-end CI/CD pipelines, IaC templates and observability stack.", startDate: new Date("2025-03-15"), endDate: new Date("2025-12-31"), companyId: vertex.id, users: { connect: [{ id: c11.id }, { id: c12.id }, { id: a3.id }, { id: a6.id }] } } });
        const p11 = await prisma.project.create({ data: { projectName: "Security Compliance Audit", description: "ISO 27001 gap analysis and remediation before certification audit.", startDate: new Date("2025-10-01"), endDate: new Date("2026-02-28"), companyId: vertex.id, users: { connect: [{ id: c11.id }, { id: c12.id }, { id: a1.id }, { id: a5.id }] } } });
        const p12 = await prisma.project.create({ data: { projectName: "E-commerce Platform", description: "B2C e-commerce with product catalog, cart and payment flow.", startDate: new Date("2025-08-01"), companyId: vertex.id, users: { connect: [{ id: c11.id }, { id: c12.id }, { id: a4.id }, { id: a6.id }] } } });

        type UserRow = typeof a1;
        type Spec = { project: { id: bigint }; start: Date; end: Date; agents: UserRow[]; reporters: UserRow[]; count: number };

        const specs: Spec[] = [
            { project: p1, start: new Date("2025-01-10"), end: new Date("2025-06-30"), agents: [a1, a2], reporters: [c1, c2], count: 250 },
            { project: p2, start: new Date("2025-03-01"), end: TODAY, agents: [a2, a3], reporters: [c4, c5], count: 300 },
            { project: p3, start: new Date("2025-02-15"), end: new Date("2025-09-01"), agents: [a1, a4], reporters: [c6, c7], count: 220 },
            { project: p4, start: new Date("2025-04-01"), end: TODAY, agents: [a2, a5], reporters: [c1, c3], count: 160 },
            { project: p5, start: new Date("2025-07-01"), end: new Date("2026-03-31"), agents: [a3, a5], reporters: [c2, c3], count: 200 },
            { project: p6, start: new Date("2025-05-15"), end: new Date("2025-11-30"), agents: [a4, a6], reporters: [c4, c5], count: 130 },
            { project: p7, start: new Date("2025-06-01"), end: TODAY, agents: [a1, a3], reporters: [c6, c8], count: 280 },
            { project: p8, start: new Date("2025-01-15"), end: new Date("2025-08-31"), agents: [a5, a6], reporters: [c9, c10], count: 200 },
            { project: p9, start: new Date("2025-09-01"), end: TODAY, agents: [a2, a4], reporters: [c9, c10], count: 180 },
            { project: p10, start: new Date("2025-03-15"), end: new Date("2025-12-31"), agents: [a3, a6], reporters: [c11, c12], count: 200 },
            { project: p11, start: new Date("2025-10-01"), end: new Date("2026-02-28"), agents: [a1, a5], reporters: [c11, c12], count: 120 },
            { project: p12, start: new Date("2025-08-01"), end: TODAY, agents: [a4, a6], reporters: [c11, c12], count: 280 },
        ];

        const allTickets: TicketInput[] = [];
        let counter = 1;

        for (const spec of specs) {
            for (let i = 0; i < spec.count; i++) {
                const createdAt = rng.date(spec.start, spec.end);
                const assignee = rng.float() > 0.08 ? rng.pick(spec.agents) : null;
                const reporter = rng.pick(spec.reporters);
                allTickets.push(makeTicket(counter++, createdAt, spec.project.id, assignee?.id ?? null, reporter.id));
            }
        }

        allTickets.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

        console.log(`Inserting ${allTickets.length} tickets...`);
        await batchInsert(allTickets);
    }

    console.log("Seed completed.");
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());