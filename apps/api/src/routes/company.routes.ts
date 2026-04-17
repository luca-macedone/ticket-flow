import { Router } from "express";
import { createCompany, deleteCompany, getCompanies, getCompanyById, updateCompany } from "../controllers/company.controller";
import { zodValidate } from "../middlewares/zodValidate";
import { CreateCompanySchema, UpdateCompanySchema } from "@packages/shared";

const router = Router();

router.get("/", getCompanies);
router.get("/:id", getCompanyById);
router.post("/", zodValidate(CreateCompanySchema), createCompany);
router.patch("/:id", zodValidate(UpdateCompanySchema), updateCompany);
router.delete("/:id", deleteCompany);

export default router;