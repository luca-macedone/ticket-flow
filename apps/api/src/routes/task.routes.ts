import { Router } from "express";
import { createTask, deleteTask, getTaskById, getTasks, updateTask } from "../controllers/task.controller";

const router = Router();

router.get("/", getTasks);
router.get("/:id", getTaskById);
router.post("/", createTask);
router.patch("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;