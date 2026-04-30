import { Router } from "express";
import { createTicket, deleteTicket, getMyQueue, getMyTickets, getTicketById, getTickets, updateTicket } from "../controllers/ticket.controller";
import { zodValidate } from "../middlewares/zodValidate";
import { CreateTicketSchema, UpdateTicketSchema } from "@packages/shared";
import { requireAuth } from "../middlewares/requireAuth";
import { requireRole } from "../middlewares/requireRole";

const router = Router();

router.get(
    "/",
    requireAuth,
    requireRole("CUSTOMER"),
    getTickets
);
router.get(
    "/my-queue",
    requireAuth,
    requireRole("AGENT"),
    getMyQueue
);

router.get(
    "/my-tickets",
    requireAuth,
    requireRole("CUSTOMER"),
    getMyTickets
);
router.get(
    "/:id",
    requireAuth,
    requireRole("CUSTOMER"),
    getTicketById
);
router.post(
    "/",
    requireAuth,
    requireRole("CUSTOMER"),
    zodValidate(CreateTicketSchema),
    createTicket
);
router.patch(
    "/:id",
    requireAuth,
    requireRole("CUSTOMER"),
    zodValidate(UpdateTicketSchema),
    updateTicket
);
router.delete(
    "/:id",
    requireAuth,
    requireRole("ADMIN"),
    deleteTicket
);

export default router;