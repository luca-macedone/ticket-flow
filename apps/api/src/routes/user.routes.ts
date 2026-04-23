import { Router } from "express";
import { createUser, deleteUser, getUserById, getUsers, registerUser, updateUser } from "../controllers/user.controller";
import { zodValidate } from "../middlewares/zodValidate";
import { RegisterApiSchema, UpdateUserSchema } from "@packages/shared";
import { requireAuth } from "../middlewares/requireAuth";
import { requireRole } from "../middlewares/requireRole";

const router = Router();

router.get("/",
    requireAuth,
    requireRole("ADMIN"),
    getUsers
);

router.get(
    "/:id",
    requireAuth,
    requireRole("ADMIN"),
    getUserById
);
router.post(
    "/register",
    zodValidate(RegisterApiSchema),
    registerUser
)
router.post(
    "/",
    requireAuth,
    requireRole("ADMIN"),
    zodValidate(RegisterApiSchema),
    createUser
);
router.patch(
    "/:id",
    requireAuth,
    requireRole("ADMIN"),
    zodValidate(UpdateUserSchema),
    updateUser
);
router.delete(
    "/:id",
    requireAuth,
    requireRole("ADMIN"),
    deleteUser
);

export default router;