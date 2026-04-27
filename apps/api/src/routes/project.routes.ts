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
    requireRole("CUSTOMER"),
    getProjects
);
router.get(
    "/:id",
    requireAuth,
    requireRole("CUSTOMER"),
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