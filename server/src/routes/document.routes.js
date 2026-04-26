// src/routes/document.routes.js
// Mount in app.js: app.use("/api/documents", documentRouter);

import { Router } from "express";
import { authenticate, requireRole } from "../middleware/authenticate.js";
import {
  createTemplate,
  getTemplates,
  updateTemplate,
  deleteTemplate,
  sendDocument,
  getAllDocuments,
  getDocumentById,
  signDocument,
} from "../controllers/document.controller.js";

const router = Router();
const ADMIN = ["hr_admin", "super_admin"];

// ── Templates ─────────────────────────────────────────────────
router.post("/templates", authenticate, requireRole(ADMIN), createTemplate);
router.get("/templates", authenticate, getTemplates);
router.put("/templates/:id", authenticate, requireRole(ADMIN), updateTemplate);
router.delete(
  "/templates/:id",
  authenticate,
  requireRole(ADMIN),
  deleteTemplate,
);

// ── Documents ─────────────────────────────────────────────────
router.post("/send", authenticate, requireRole(ADMIN), sendDocument);
router.get("/", authenticate, getAllDocuments);
router.get("/:id", authenticate, getDocumentById);
router.put("/:id/sign", authenticate, signDocument);

export default router;
