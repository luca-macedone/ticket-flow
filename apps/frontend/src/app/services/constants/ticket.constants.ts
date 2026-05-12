import { PriorityEnum, StatusEnum, TicketCategoryEnum } from "@packages/shared";
import { SelectOption } from "../../components/fields/select-field/select-field";

const labelMap: Record<string, string> = {
    ON_HOLD: 'On Hold',
    ON_APPROVAL: 'On Approval',
    ON_QUEUE: 'On Queue',
    FULFILLMENT: 'Fulfillment',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    DONE: 'Done',
    CANCELLED: 'Cancelled',
    GENERAL: 'General',
    BUG: 'Bug',
    FEATURE: 'Feature',
    SUPPORT: 'Support',
    MAINTENANCE: 'Maintenance',
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
    URGENT: 'Urgent',
};

const toOptions = (values: readonly string[]): SelectOption[] =>
    values.map(v => ({ value: v, label: labelMap[v] ?? v }));

export const TICKET_STATUS_OPTIONS = toOptions(StatusEnum.options);
export const TICKET_CATEGORY_OPTIONS = toOptions(TicketCategoryEnum.options);
export const TICKET_PRIORITY_OPTIONS = toOptions(PriorityEnum.options);