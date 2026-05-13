import { InputJsonValue } from "@prisma/client/runtime/client";
import { prisma } from "../db";

export type AdminAction =
    | 'TICKET_CREATE' | 'TICKET_UPDATE' | 'TICKET_DELETE'
    | 'PROJECT_CREATE' | 'PROJECT_UPDATE' | 'PROJECT_DELETE'
    | 'COMPANY_CREATE' | 'COMPANY_UPDATE' | 'COMPANY_DELETE'
    | 'USER_CREATE' | 'USER_UPDATE' | 'USER_DELETE'
    | 'USER_APPROVE' | 'USER_REJECT' | 'USER_SUSPEND' | 'USER_REACTIVATE';

export type TargetType = 'TICKET' | 'PROJECT' | 'COMPANY' | 'USER';

export function logAdminAction(
    actorId: string,
    action: AdminAction,
    targetType: TargetType,
    targetCode?: string,
    targetLabel?: string,
    details?: Record<string, unknown>
) {
    prisma.adminLog.create({
        data: {
            actorId: BigInt(actorId),
            action,
            targetType,
            targetCode: targetCode ?? null,
            targetLabel: targetLabel ?? null,
            details: details as InputJsonValue | undefined,
        }
    }).catch(e => console.error('AdminLog write failed:', e));
}

export function logSystem(
    level: 'INFO' | 'WARN' | 'ERROR',
    message: string,
    stack?: string,
    context?: Record<string, unknown>
) {
    prisma.systemLog.create({
        data: {
            level,
            message,
            stack: stack ?? null,
            context: context as InputJsonValue | undefined,
        }
    }).catch(() => { });
}