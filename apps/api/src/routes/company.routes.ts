import { Router } from "express";
import { createCompany, deleteCompany, getCompanies, getCompanyById, updateCompany } from "../controllers/company.controller";
import { zodValidate } from "../middlewares/zodValidate";
import { CreateCompanySchema, UpdateCompanySchema } from "@packages/shared";
import { requireAuth } from "../middlewares/requireAuth";
import { requireRole } from "../middlewares/requireRole";

const router = Router();

router.get("/", requireAuth, requireRole("AGENT"), getCompanies);
router.get("/:id", requireAuth, requireRole("AGENT"), getCompanyById);
router.post(
    "/",
    requireAuth,
    requireRole("ADMIN"),
    zodValidate(CreateCompanySchema),
    createCompany
);
router.patch(
    "/:id",
    requireAuth,
    requireRole("ADMIN"),
    zodValidate(UpdateCompanySchema),
    updateCompany
);
router.delete(
    "/:id",
    requireAuth,
    requireRole("ADMIN"),
    deleteCompany
);

export default router;