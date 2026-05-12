import { Router } from "express";
import { createUser, deleteUser, getUserByCode, getUsers, registerUser, updateUser } from "../controllers/user.controller";
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
    "/:code",
    requireAuth,
    requireRole("ADMIN"),
    getUserByCode
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
    "/:code",
    requireAuth,
    requireRole("ADMIN"),
    zodValidate(UpdateUserSchema),
    updateUser
);
router.delete(
    "/:code",
    requireAuth,
    requireRole("ADMIN"),
    deleteUser
);

export default router;