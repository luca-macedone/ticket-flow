import { Router } from "express";
import { createUser, deleteUser, getUserById, getUsers, registerUser, updateUser } from "../controllers/user.controller";
import { zodValidate } from "../middlewares/zodValidate";
import { CreateUserSchema, UpdateUserSchema } from "@packages/shared";
import { AuthRequest, requireAuth } from "../middlewares/requireAuth";
import { requireRole } from "../middlewares/requireRole";

const router = Router();


router.get("/", getUsers);
router.get(
    "/me",
    requireAuth,
    (req: AuthRequest, res) => {
        res.json({
            id: req.user!.userId,
            role: req.user!.role,
        });
    }
);
router.get(
    "/:id",
    requireRole("ADMIN"),
    getUserById
);
router.post(
    "/register",
    zodValidate(CreateUserSchema),
    registerUser
)
router.post(
    "/",
    requireRole("ADMIN"),
    zodValidate(CreateUserSchema),
    createUser
);
router.patch(
    "/:id",
    requireRole("ADMIN"),
    zodValidate(UpdateUserSchema),
    updateUser
);
router.delete(
    "/:id",
    requireRole("ADMIN"),
    deleteUser
);

export default router;