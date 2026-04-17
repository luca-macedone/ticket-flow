import { Router } from "express";
import { createUser, deleteUser, getUserById, getUsers, updateUser } from "../controllers/user.controller";
import { zodValidate } from "../middlewares/zodValidate";
import { CreateUserSchema, UpdateUserSchema } from "@packages/shared";

const router = Router();

router.get("/", getUsers);
router.get("/:id", getUserById);
router.post("/", zodValidate(CreateUserSchema), createUser);
router.patch("/:id", zodValidate(UpdateUserSchema), updateUser);
router.delete("/:id", deleteUser);

export default router;