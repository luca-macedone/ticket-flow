import z from "zod";

export const RoleEnum = z.enum([
    "USER",
    "ADMIN",
    "GUEST",
    "ON_APPROVAL",
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