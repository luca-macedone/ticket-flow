import { Router } from "express";
import { createCompany, deleteCompany, getCompanies, getCompanyById, updateCompany } from "../controllers/company.controller";

const router = Router();

router.get("/", getCompanies);
router.get("/:id", getCompanyById);
router.post("/", createCompany);
router.patch("/:id", updateCompany);
router.delete("/:id", deleteCompany);

export default router;