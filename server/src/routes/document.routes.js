// // src/routes/document.routes.js
// // Mount in app.js: app.use("/api/documents", documentRouter);

// import { Router } from "express";
// import { authenticate, requireRole } from "../middleware/authenticate.js";
// import {
//   createTemplate,
//   getTemplates,
//   updateTemplate,
//   deleteTemplate,
//   sendDocument,
//   getAllDocuments,
//   getDocumentById,
//   signDocument,
// } from "../controllers/document.controller.js";

// const router = Router();
// const ADMIN = ["hr_admin", "super_admin"];

// // ── Templates ─────────────────────────────────────────────────
// router.post("/templates", authenticate, requireRole(ADMIN), createTemplate);
// router.get("/templates", authenticate, getTemplates);
// router.put("/templates/:id", authenticate, requireRole(ADMIN), updateTemplate);
// router.delete(
//   "/templates/:id",
//   authenticate,
//   requireRole(ADMIN),
//   deleteTemplate,
// );

// // ── Documents ─────────────────────────────────────────────────
// router.post("/send", authenticate, requireRole(ADMIN), sendDocument);
// router.get("/", authenticate, getAllDocuments);
// router.get("/:id", authenticate, getDocumentById);
// router.put("/:id/sign", authenticate, signDocument);

// export default router;


// ─────────────────────────────────────────────────────────────────────────────
// ADDITIONS to your existing document routes file
// src/routes/document.routes.js
//
// Add these imports at the top of your existing routes file:
//
//   import multer from "multer";
//   import path   from "path";
//   import {
//     uploadDocument,
//     sendUploadedDocument,
//     getEmployeeDocuments,
//   } from "../controllers/document.controller.js";
//
// Then register the new routes alongside your existing ones.
// ─────────────────────────────────────────────────────────────────────────────

// import { Router } from "express";
// import multer   from "multer";
// import path     from "path";
// import { authenticate, requireRole } from "../middleware/authenticate.js";
// import {
//   // ── existing ──
//   createTemplate,
//   getTemplates,
//   updateTemplate,
//   deleteTemplate,
//   sendDocument,
//   getAllDocuments,
//   getDocumentById,
//   signDocument,
//   // ── new ──
//   uploadDocument,
//   sendUploadedDocument,
//   getEmployeeDocuments,
// } from "../controllers/document.controller.js";

// const router = Router();

// // ── Multer config ─────────────────────────────────────────────────────────────
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, "uploads/documents/"),
//   filename:    (req, file, cb) => {
//     const ext  = path.extname(file.originalname);
//     const stem = path.basename(file.originalname, ext).replace(/\s+/g, "_");
//     cb(null, `${Date.now()}_${stem}${ext}`);
//   },
// });

// const upload = multer({
//   storage,
//   limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
//   fileFilter: (req, file, cb) => {
//     const allowed = [
//       "application/pdf",
//       "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//       "application/msword",
//     ];
//     if (allowed.includes(file.mimetype)) return cb(null, true);
//     cb(new Error("Only PDF and DOCX files are allowed."));
//   },
// });

// // ── Template routes (unchanged) ───────────────────────────────────────────────
// router.post(   "/templates",     authenticate, requireRole(["hr_admin","super_admin"]), createTemplate);
// router.get(    "/templates",     authenticate,                                          getTemplates);
// router.put(    "/templates/:id", authenticate, requireRole(["hr_admin","super_admin"]), updateTemplate);
// router.delete( "/templates/:id", authenticate, requireRole(["hr_admin","super_admin"]), deleteTemplate);

// // ── Document send (template-based, unchanged) ─────────────────────────────────
// router.post("/send", authenticate, requireRole(["hr_admin","super_admin"]), sendDocument);

// // ── NEW: Upload a raw PDF/DOCX file ──────────────────────────────────────────
// // POST /api/documents/upload
// // multipart/form-data: file + { name, category? }
// router.post(
//   "/upload",
//   authenticate,
//   requireRole(["hr_admin", "super_admin"]),
//   upload.single("file"),
//   uploadDocument,
// );

// // ── NEW: Send an uploaded document to one or more employees ──────────────────
// // POST /api/documents/send-uploaded
// // Body: { documentId, employeeIds: string[], message? }
// router.post(
//   "/send-uploaded",
//   authenticate,
//   requireRole(["hr_admin", "super_admin"]),
//   sendUploadedDocument,
// );

// // ── Existing document routes ──────────────────────────────────────────────────
// router.get("/:id/sign", authenticate, getDocumentById); // keep order
// router.get("/",         authenticate, getAllDocuments);
// router.get("/:id",      authenticate, getDocumentById);
// router.put("/:id/sign", authenticate, signDocument);

// // ── NEW: Employee's own documents ─────────────────────────────────────────────
// // GET /api/documents/my
// router.get("/my", authenticate, getEmployeeDocuments);

// export default router;


// src/routes/document.routes.js
//
// Uses multer memoryStorage + Cloudinary — no local disk writes.
// Mount in app.js:
//   import documentRoutes from "./routes/document.routes.js";
//   app.use("/api/documents", documentRoutes);

import { Router } from "express";
import multer   from "multer";
import { authenticate, requireRole } from "../middleware/authenticate.js";
import {
  // ── existing ──────────────────────────────────────────
  createTemplate,
  getTemplates,
  updateTemplate,
  deleteTemplate,
  sendDocument,
  getAllDocuments,
  getDocumentById,
  signDocument,
  // ── new ───────────────────────────────────────────────
  uploadDocument,
  sendUploadedDocument,
  getEmployeeDocuments,
} from "../controllers/document.controller.js";

const router = Router();

// ── Multer — memory storage (no disk) ────────────────────────────────────────
// Buffer is passed to Cloudinary's upload_stream in the controller.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error("Only PDF and DOCX files are allowed."));
  },
});

// ── Template routes ───────────────────────────────────────────────────────────
router.post(   "/templates",     authenticate, requireRole(["hr_admin","super_admin"]), createTemplate);
router.get(    "/templates",     authenticate, getTemplates);
router.put(    "/templates/:id", authenticate, requireRole(["hr_admin","super_admin"]), updateTemplate);
router.delete( "/templates/:id", authenticate, requireRole(["hr_admin","super_admin"]), deleteTemplate);

// ── Template-based send (existing) ───────────────────────────────────────────
router.post("/send", authenticate, requireRole(["hr_admin","super_admin"]), sendDocument);

// ── NEW: Upload raw PDF/DOCX → Cloudinary ─────────────────────────────────
// POST /api/documents/upload
// multipart/form-data: file + { name, category? }
router.post(
  "/upload",
  authenticate,
  requireRole(["hr_admin", "super_admin"]),
  upload.single("file"),   // populates req.file.buffer + req.file.mimetype
  uploadDocument,
);

// ── NEW: Assign uploaded doc to employees + notify ────────────────────────
// POST /api/documents/send-uploaded
// Body: { documentId, employeeIds: string[], message? }
router.post(
  "/send-uploaded",
  authenticate,
  requireRole(["hr_admin", "super_admin"]),
  sendUploadedDocument,
);

// ── NEW: Employee's own documents ─────────────────────────────────────────
// GET /api/documents/my   ← must come BEFORE /:id
router.get("/my", authenticate, getEmployeeDocuments);

// ── Existing document routes ──────────────────────────────────────────────
router.get("/",    authenticate, getAllDocuments);
router.get("/:id", authenticate, getDocumentById);
router.put("/:id/sign", authenticate, signDocument);

export default router;