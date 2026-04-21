import { Router } from "express";
import { createProject, deleteProject, getProjectById, getProjects, updateProject } from "../controllers/project.controller";
import { zodValidate } from "../middlewares/zodValidate";
import { CreateProjectSchema, UpdateProjectSchema } from "@packages/shared";
import { requireAuth } from "../middlewares/requireAuth";
import { requireRole } from "../middlewares/requireRole";

const router = Router();

router.get(
    "/",
    requireAuth,
    requireRole("USER"),
    getProjects
);
router.get(
    "/:id",
    requireAuth,
    requireRole("USER"),
    getProjectById
);
router.post(
    "/",
    requireAuth,
    requireRole("ADMIN"),
    zodValidate(CreateProjectSchema),
    createProject
);
router.patch(
    "/:id",
    requireAuth,
    requireRole("ADMIN"),
    zodValidate(UpdateProjectSchema),
    updateProject
);
router.delete(
    "/:id",
    requireAuth,
    requireRole("ADMIN"),
    deleteProject
);

export default router;