import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { requireRole } from "../middlewares/requireRole";
import { approveUser, changeUserStatus } from "../controllers/user.controller";
import { getAdminLogs, getAdminOverview, getSystemLogs } from "../controllers/overview.controller";

const router = Router();

router.patch(
    "/admin/users/:code/approve",
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

router.get(
    "/admin/logs/admin",
    requireAuth,
    requireRole("ADMIN"),
    getAdminLogs
);

router.get(
    "/admin/logs/system",
    requireAuth,
    requireRole("ADMIN"),
    getSystemLogs
);

router.patch(
    "/admin/users/:code/status",
    requireAuth,
    requireRole("ADMIN"),
    changeUserStatus
)

export default router;