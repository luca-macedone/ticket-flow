import { Router } from "express";
import { addProjectMember, createProject, deleteProject, getProjectByCode, getProjects, removeProjectMember, updateProject } from "../controllers/project.controller";
import { zodValidate } from "../middlewares/zodValidate";
import { CreateProjectSchema, ProjectMemberSchema, UpdateProjectSchema } from "@packages/shared";
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
router.post(
    "/:code/members",
    requireAuth,
    requireRole("ADMIN"),
    zodValidate(ProjectMemberSchema),
    addProjectMember
);
router.delete(
    "/:code/members/:userCode",
    requireAuth,
    requireRole("ADMIN"),
    removeProjectMember
);

export default router;