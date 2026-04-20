import { Router } from "express";
import { createUser, deleteUser, getUserById, getUsers, updateUser } from "../controllers/user.controller";
import { zodValidate } from "../middlewares/zodValidate";
import { CreateUserSchema, UpdateUserSchema } from "@packages/shared";
import { AuthRequest, requireAuth } from "../middlewares/requireAuth";

const router = Router();


router.get("/", getUsers);
router.get("/me", requireAuth, (req: AuthRequest, res) => {
    res.json({
        id: req.user!.userId,
        role: req.user!.role,
    });
});
router.get("/:id", getUserById);
router.post("/", zodValidate(CreateUserSchema), createUser);
router.patch("/:id", zodValidate(UpdateUserSchema), updateUser);
router.delete("/:id", deleteUser);

export default router;