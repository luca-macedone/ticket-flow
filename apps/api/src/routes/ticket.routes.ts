import { Router } from "express";
import { assignTicket, createTicket, deleteTicket, getMyQueue, getMyTickets, getTicketByCode, getTickets, updateTicket } from "../controllers/ticket.controller";
import { zodValidate } from "../middlewares/zodValidate";
import { AssignTicketSchema, CreateTicketSchema, UpdateTicketSchema } from "@packages/shared";
import { requireAuth } from "../middlewares/requireAuth";
import { requireRole } from "../middlewares/requireRole";

const router = Router();

router.get(
    "/",
    requireAuth,
    requireRole("AGENT"),
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
    "/:code",
    requireAuth,
    requireRole("CUSTOMER"),
    getTicketByCode
);
router.post(
    "/",
    requireAuth,
    requireRole("CUSTOMER"),
    zodValidate(CreateTicketSchema),
    createTicket
);
router.patch(
    "/:code",
    requireAuth,
    requireRole("CUSTOMER"),
    zodValidate(UpdateTicketSchema),
    updateTicket
);
router.delete(
    "/:code",
    requireAuth,
    requireRole("ADMIN"),
    deleteTicket
);
router.patch(
    "/:code/assign",
    requireAuth,
    requireRole("AGENT"),
    zodValidate(AssignTicketSchema),
    assignTicket
)

export default router;