import { Prisma } from "@prisma/client";

const SORTABLE_FIELDS = new Set(['ticketName', 'priority', 'status', 'createdAt']);

export function parseSortParams(query: Record<string, any>, defaultDir: 'asc' | 'desc' = 'desc') {
    const sortBy = SORTABLE_FIELDS.has(query.sortBy as string)
        ? (query.sortBy as string) : 'priority';
    const sortDir: 'asc' | 'desc' = query.sortDir === 'asc' ? 'asc' : defaultDir;
    const sqlDir = sortDir === 'desc' ? Prisma.sql`DESC` : Prisma.sql`ASC`;
    return { sortBy, sortDir, sqlDir };
}

export const PRIORITY_SQL_ORDER = Prisma.sql`CASE priority
    WHEN 'LOW'    THEN 1
    WHEN 'MEDIUM' THEN 2
    WHEN 'HIGH'   THEN 3
    WHEN 'URGENT' THEN 4
END`;

export function serializeOrmRow(r: any) {
    return {
        ...r,
        id: r.id.toString(),
        projectId: r.projectId?.toString() ?? null,
        assigneeId: r.assigneeId?.toString() ?? null,
        reporterId: r.reporterId?.toString() ?? null,
        project: r.project ? { id: r.project.id.toString(), projectName: r.project.projectName } : null,
        assignee: r.assignee ? { id: r.assignee.id.toString(), name: r.assignee.name } : null,
        reporter: r.reporter ? { id: r.reporter.id.toString(), name: r.reporter.name, email: r.reporter.email } : undefined,
    };
}

export function serializeRawRow(r: any) {
    return {
        id: r.id.toString(),
        ticketCode: r.ticketCode,
        ticketName: r.ticketName,
        ticketDescription: r.ticketDescription ?? null,
        status: r.status,
        category: r.category,
        priority: r.priority,
        startDate: r.startDate ?? null,
        endDate: r.endDate ?? null,
        resolvedAt: r.resolvedAt ?? null,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        projectId: r.projectId?.toString() ?? null,
        assigneeId: r.assigneeId?.toString() ?? null,
        reporterId: r.reporterId?.toString() ?? null,
        project: r.proj_id ? { id: r.proj_id.toString(), projectName: r.proj_name } : null,
        assignee: r.asn_id ? { id: r.asn_id.toString(), name: r.asn_name } : null,
    };
}
