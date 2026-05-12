import { Router } from "express";
import { createCompany, deleteCompany, getCompanies, getCompanyByCode, updateCompany } from "../controllers/company.controller";
import { zodValidate } from "../middlewares/zodValidate";
import { CreateCompanySchema, UpdateCompanySchema } from "@packages/shared";
import { requireAuth } from "../middlewares/requireAuth";
import { requireRole } from "../middlewares/requireRole";

const router = Router();

router.get("/", requireAuth, requireRole("AGENT"), getCompanies);
router.get("/:code", requireAuth, requireRole("AGENT"), getCompanyByCode);
router.post(
    "/",
    requireAuth,
    requireRole("ADMIN"),
    zodValidate(CreateCompanySchema),
    createCompany
);
router.patch(
    "/:code",
    requireAuth,
    requireRole("ADMIN"),
    zodValidate(UpdateCompanySchema),
    updateCompany
);
router.delete(
    "/:code",
    requireAuth,
    requireRole("ADMIN"),
    deleteCompany
);

export default router;