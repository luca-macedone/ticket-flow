import { Router } from "express";
import { createProject, deleteProject, getProjectByCode, getProjects, updateProject } from "../controllers/project.controller";
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
    "/:code",
    requireAuth,
    requireRole("CUSTOMER"),
    getProjectByCode
);
router.post(
    "/",
    requireAuth,
    requireRole("ADMIN"),
    zodValidate(CreateProjectSchema),
    createProject
);
router.patch(
    "/:code",
    requireAuth,
    requireRole("ADMIN"),
    zodValidate(UpdateProjectSchema),
    updateProject
);
router.delete(
    "/:code",
    requireAuth,
    requireRole("ADMIN"),
    deleteProject
);

export default router;