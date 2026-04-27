import { Router } from "express";
import { createTask, deleteTask, getMyQueue, getMyTickets, getTaskById, getTasks, updateTask } from "../controllers/task.controller";
import { zodValidate } from "../middlewares/zodValidate";
import { CreateTaskSchema, UpdateTaskSchema } from "@packages/shared";
import { requireAuth } from "../middlewares/requireAuth";
import { requireRole } from "../middlewares/requireRole";

const router = Router();

router.get(
    "/",
    requireAuth,
    requireRole("CUSTOMER"),
    getTasks
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
    getTaskById
);
router.post(
    "/",
    requireAuth,
    requireRole("CUSTOMER"),
    zodValidate(CreateTaskSchema),
    createTask
);
router.patch(
    "/:id",
    requireAuth,
    requireRole("CUSTOMER"),
    zodValidate(UpdateTaskSchema),
    updateTask
);
router.delete(
    "/:id",
    requireAuth,
    requireRole("ADMIN"),
    deleteTask
);

export default router;