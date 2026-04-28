import z from "zod";

export const RoleEnum = z.enum([
    "ADMIN",
    "AGENT",
    "CUSTOMER",
]);

export const UserStatusEnum = z.enum([
    "PENDING_APPROVAL",
    "APPROVED",
    "REJECTED",
    "SUSPENDED"
]);

export const StatusEnum = z.enum([
    "ON_HOLD",
    "ON_APPROVAL",
    "ON_QUEUE",
    "FULFILLMENT",
    "APPROVED",
    "REJECTED",
    "DONE",
    "CANCELLED",
]);

export const TicketCategoryEnum = z.enum([
    "GENERAL",
    "BUG",
    "FEATURE",
    "SUPPORT",
    "MAINTENANCE",
]);

export const PriorityEnum = z.enum([
    "LOW",
    "MEDIUM",
    "HIGH",
    "URGENT",
]);
