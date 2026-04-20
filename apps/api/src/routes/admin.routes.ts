import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { requireRole } from "../middlewares/requireRole";
import { approveUser } from "../controllers/user.controller";

const router = Router();

router.patch(
    "/admin/users/:id/approve",
    requireAuth,
    requireRole("ADMIN"),
    approveUser
)

export default router;