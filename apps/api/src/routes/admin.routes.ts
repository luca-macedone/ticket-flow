import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { requireRole } from "../middlewares/requireRole";
import { approveUser } from "../controllers/user.controller";
import { getAdminOverview } from "../controllers/overview.controller";

const router = Router();

router.patch(
    "/admin/users/:id/approve",
    requireAuth,
    requireRole("ADMIN"),
    approveUser
)

router.get(
    "/admin/overview",
    requireAuth,
    requireRole("ADMIN"),
    getAdminOverview
);

export default router;