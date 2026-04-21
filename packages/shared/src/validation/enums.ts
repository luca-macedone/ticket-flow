import z from "zod";

export const RoleEnum = z.enum([
    "USER",
    "ADMIN",
    "GUEST",
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