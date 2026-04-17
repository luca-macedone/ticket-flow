import { Router } from "express";
import { createTask, deleteTask, getTaskById, getTasks, updateTask } from "../controllers/task.controller";
import { zodValidate } from "../middlewares/zodValidate";
import { CreateTaskSchema, UpdateTaskSchema } from "@packages/shared";

const router = Router();

router.get("/", getTasks);
router.get("/:id", getTaskById);
router.post("/", zodValidate(CreateTaskSchema), createTask);
router.patch("/:id", zodValidate(UpdateTaskSchema), updateTask);
router.delete("/:id", deleteTask);

export default router;