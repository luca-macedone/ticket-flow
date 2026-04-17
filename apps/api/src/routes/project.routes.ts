import { Router } from "express";
import { createCompany, deleteCompany, getCompanies, getCompanyById, updateCompany } from "../controllers/company.controller";
import { zodValidate } from "../middlewares/zodValidate";
import { CreateProjectSchema, UpdateProjectSchema } from "@packages/shared";

const router = Router();

router.get("/", getCompanies);
router.get("/:id", getCompanyById);
router.post("/", zodValidate(CreateProjectSchema), createCompany);
router.patch("/:id", zodValidate(UpdateProjectSchema), updateCompany);
router.delete("/:id", deleteCompany);

export default router;