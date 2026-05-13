export const PRIORITY_BADGE: Record<string, string> = {
    LOW: 'bg-slate-200 text-slate-700',
    MEDIUM: 'bg-yellow-200 text-yellow-800',
    HIGH: 'bg-orange-200 text-orange-800',
    URGENT: 'bg-red-200 text-red-800',
};

export const STATUS_BADGE: Record<string, string> = {
    ON_QUEUE: 'bg-slate-200 text-slate-700',
    ON_HOLD: 'bg-yellow-200 text-yellow-800',
    ON_APPROVAL: 'bg-purple-200 text-purple-800',
    APPROVED: 'bg-teal-200 text-teal-800',
    FULFILLMENT: 'bg-blue-200 text-blue-800',
    DONE: 'bg-green-200 text-green-800',
    REJECTED: 'bg-red-200 text-red-800',
    CANCELLED: 'bg-gray-200 text-gray-700',
};

export const USER_STATUS_BADGE: Record<string, string> = {
    PENDING_APPROVAL: 'bg-yellow-500/20 text-yellow-300',
    APPROVED: 'bg-green-500/20 text-green-300',
    REJECTED: 'bg-red-500/20 text-red-300',
};

export const ROLE_BADGE = 'border border-secondary capitalize';

export const priorityBadge = (v: string) => PRIORITY_BADGE[v] ?? 'bg-slate-200 text-slate-700';
export const statusBadge = (v: string) => STATUS_BADGE[v] ?? 'bg-slate-200 text-slate-700';
export const userStatusBadge = (v: string) => USER_STATUS_BADGE[v] ?? '';
