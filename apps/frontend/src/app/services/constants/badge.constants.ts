export const PRIORITY_BADGE: Record<string, string> = {
    LOW: 'bg-slate-200 text-slate-700',
    MEDIUM: 'bg-yellow-200 text-yellow-800',
    HIGH: 'bg-orange-200 text-orange-800',
    URGENT: 'bg-red-200 text-red-800',
};

export const STATUS_BADGE: Record<string, string> = {
    ON_HOLD: 'bg-gray-200 text-gray-700',
    ON_APPROVAL: 'bg-blue-200 text-blue-800',
    ON_QUEUE: 'bg-indigo-200 text-indigo-800',
    FULFILLMENT: 'bg-purple-200 text-purple-800',
    APPROVED: 'bg-green-200 text-green-800',
    REJECTED: 'bg-red-200 text-red-800',
    DONE: 'bg-teal-200 text-teal-800',
    CANCELLED: 'bg-gray-400 text-gray-900',
};
