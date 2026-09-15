// // src/routes/asset.routes.js
// //
// // Endpoints:
// //   GET    /api/assets                    → listAssets
// //   POST   /api/assets                    → createAsset
// //   GET    /api/assets/:id                → getAsset
// //   PUT    /api/assets/:id                → updateAsset
// //   DELETE /api/assets/:id                → retireAsset      (soft delete)
// //   POST   /api/assets/:id/assign         → assignAsset      (HR gives asset to an employee)
// //   POST   /api/assets/:id/return         → returnAsset      (manual return, outside offboarding)
// //   GET    /api/assets/:id/history        → getAssetHistory
// //
// // All routes are HR-only. Assets are a company-owned resource that only
// // hr_admin / super_admin manage — regular employees never call these
// // directly (if you later want "my assigned assets" on an employee's own
// // profile, add a scoped GET under employee.routes.js backed by the same
// // asset_assignments table rather than opening these routes up).
// //
// // Mount in app.js:
// //   import assetRoutes from "./routes/asset.routes.js";
// //   app.use("/api/assets", assetRoutes);

// import { Router } from "express";
// import { body, param, query } from "express-validator";
// import { authenticate, requireRole } from "../middleware/authenticate.js";

// import {
//   listAssets,
//   createAsset,
//   getAsset,
//   updateAsset,
//   retireAsset,
//   assignAsset,
//   returnAsset,
//   getAssetHistory,
// } from "../controllers/asset.controller.js";

// const router = Router();

// const VALID_STATUSES = [
//   "available",
//   "assigned",
//   "under_repair",
//   "retired",
//   "lost",
// ];
// const VALID_CONDITIONS = ["good", "fair", "damaged", "lost"];
// const VALID_CATEGORIES = [
//   "laptop",
//   "phone",
//   "monitor",
//   "access_card",
//   "vehicle",
//   "furniture",
//   "other",
// ];

// const hrOnly = [authenticate, requireRole(["hr_admin", "super_admin"])];

// /* ── VALIDATORS ─────────────────────────────────────────────── */

// const listAssetsValidators = [
//   query("page").optional().isInt({ min: 1 }),
//   query("limit").optional().isInt({ min: 1, max: 100 }),
//   query("status").optional().isIn(VALID_STATUSES),
//   query("category").optional().isIn(VALID_CATEGORIES),
//   query("employeeId").optional().isUUID(),
// ];

// // const createAssetValidators = [
// //   body("name").trim().notEmpty().withMessage("Asset name is required."),
// //   body("category").optional().isIn(VALID_CATEGORIES),
// //   body("condition").optional().isIn(VALID_CONDITIONS),
// //   body("serialNumber").optional().trim(),
// //   body("purchaseDate").optional().isDate(),
// //   body("purchaseCost").optional().isFloat({ min: 0 }),
// //   body("warrantyExpiry").optional().isDate(),
// // ];
// const createAssetValidators = [
//   body("name").trim().notEmpty().withMessage("Asset name is required."),
//   body("category").optional({ checkFalsy: true }).isIn(VALID_CATEGORIES),
//   body("condition").optional({ checkFalsy: true }).isIn(VALID_CONDITIONS),
//   body("serialNumber").optional({ checkFalsy: true }).trim(),
//   body("purchaseDate").optional({ checkFalsy: true }).isDate(),
//   body("purchaseCost").optional({ nullable: true }).isFloat({ min: 0 }),
//   body("warrantyExpiry").optional({ checkFalsy: true }).isDate(),
// ];
// const updateAssetValidators = [
//   param("id").isUUID(),
//   body("category").optional().isIn(VALID_CATEGORIES),
//   body("condition").optional().isIn(VALID_CONDITIONS),
//   body("status").optional().isIn(VALID_STATUSES),
//   body("purchaseDate").optional().isDate(),
//   body("purchaseCost").optional().isFloat({ min: 0 }),
//   body("warrantyExpiry").optional().isDate(),
// ];

// const assignAssetValidators = [
//   param("id").isUUID(),
//   body("employeeId").isUUID().withMessage("A valid employeeId is required."),
//   body("condition").optional().isIn(VALID_CONDITIONS),
//   body("expectedReturnDate").optional().isDate(),
//   body("notes").optional().trim(),
// ];

// const returnAssetValidators = [
//   param("id").isUUID(),
//   body("condition")
//     .isIn(VALID_CONDITIONS)
//     .withMessage(
//       `condition is required and must be one of: ${VALID_CONDITIONS.join(", ")}.`,
//     ),
//   body("notes").optional().trim(),
// ];

// /* ── LIST + CREATE ──────────────────────────────────────────── */
// router.get("/", ...hrOnly, listAssetsValidators, listAssets);
// router.post("/", ...hrOnly, createAssetValidators, createAsset);

// /* ── ASSIGN / RETURN / HISTORY (must precede the generic /:id) ── */
// router.post("/:id/assign", ...hrOnly, assignAssetValidators, assignAsset);
// router.post("/:id/return", ...hrOnly, returnAssetValidators, returnAsset);
// router.get("/:id/history", ...hrOnly, [param("id").isUUID()], getAssetHistory);

// /* ── SINGLE ASSET ───────────────────────────────────────────── */
// router.get("/:id", ...hrOnly, [param("id").isUUID()], getAsset);
// router.put("/:id", ...hrOnly, updateAssetValidators, updateAsset);
// router.delete("/:id", ...hrOnly, [param("id").isUUID()], retireAsset);

// export default router;


// src/routes/asset.routes.js
//
// Endpoints:
//   GET    /api/assets                    → listAssets
//   POST   /api/assets                    → createAsset
//   GET    /api/assets/:id                → getAsset
//   PUT    /api/assets/:id                → updateAsset
//   DELETE /api/assets/:id                → retireAsset
//   POST   /api/assets/:id/assign         → assignAsset
//   POST   /api/assets/:id/return         → returnAsset
//   GET    /api/assets/:id/history        → getAssetHistory
//   GET    /api/assets/my                 → getMyAssets      (employee)
//   POST   /api/assets/request            → requestAsset     (employee)
//   GET    /api/assets/requests/my        → getMyRequests    (employee)
//
// Mount in app.js:
//   import assetRoutes from "./routes/asset.routes.js";
//   app.use("/api/assets", assetRoutes);

import { Router } from "express";
import { body, param, query } from "express-validator";
import { authenticate, requireRole } from "../middleware/authenticate.js";

import {
  listAssets,
  createAsset,
  getAsset,
  updateAsset,
  retireAsset,
  assignAsset,
  returnAsset,
  getAssetHistory,
  getMyAssets,
  requestAsset,
  getMyRequests,
} from "../controllers/asset.controller.js";

const router = Router();

const VALID_STATUSES = [
  "available",
  "assigned",
  "under_repair",
  "retired",
  "lost",
];
const VALID_CONDITIONS = ["good", "fair", "damaged", "lost"];
const VALID_CATEGORIES = [
  "laptop",
  "phone",
  "monitor",
  "access_card",
  "vehicle",
  "furniture",
  "other",
];

const hrOnly = [authenticate, requireRole(["hr_admin", "super_admin"])];

/* ── VALIDATORS ─────────────────────────────────────────────── */

const listAssetsValidators = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("status").optional().isIn(VALID_STATUSES),
  query("category").optional().isIn(VALID_CATEGORIES),
  query("employeeId").optional().isUUID(),
];

const createAssetValidators = [
  body("name").trim().notEmpty().withMessage("Asset name is required."),
  body("category").optional({ checkFalsy: true }).isIn(VALID_CATEGORIES),
  body("condition").optional({ checkFalsy: true }).isIn(VALID_CONDITIONS),
  body("serialNumber").optional({ checkFalsy: true }).trim(),
  body("purchaseDate").optional({ checkFalsy: true }).isDate(),
  body("purchaseCost").optional({ nullable: true }).isFloat({ min: 0 }),
  body("warrantyExpiry").optional({ checkFalsy: true }).isDate(),
];

const updateAssetValidators = [
  param("id").isUUID(),
  body("category").optional().isIn(VALID_CATEGORIES),
  body("condition").optional().isIn(VALID_CONDITIONS),
  body("status").optional().isIn(VALID_STATUSES),
  body("purchaseDate").optional().isDate(),
  body("purchaseCost").optional().isFloat({ min: 0 }),
  body("warrantyExpiry").optional().isDate(),
];

const assignAssetValidators = [
  param("id").isUUID(),
  body("employeeId").isUUID().withMessage("A valid employeeId is required."),
  body("condition").optional().isIn(VALID_CONDITIONS),
  body("expectedReturnDate").optional().isDate(),
  body("notes").optional().trim(),
];

const returnAssetValidators = [
  param("id").isUUID(),
  body("condition")
    .isIn(VALID_CONDITIONS)
    .withMessage(
      `condition is required and must be one of: ${VALID_CONDITIONS.join(", ")}.`,
    ),
  body("notes").optional().trim(),
];

const requestAssetValidators = [
  body("category").optional({ checkFalsy: true }).isIn(VALID_CATEGORIES),
  body("name").trim().notEmpty().withMessage("Asset name is required."),
  body("reason").trim().notEmpty().withMessage("Reason is required."),
  body("priority").optional({ checkFalsy: true }).isIn(["low", "normal", "high"]),
];

/* ── EMPLOYEE ROUTES (must precede /:id) ───────────────────── */
router.get("/my", authenticate, getMyAssets);
router.post("/request", authenticate, requestAssetValidators, requestAsset);
router.get("/requests/my", authenticate, getMyRequests);

/* ── HR-ONLY: LIST + CREATE ───────────────────────────────── */
router.get("/", ...hrOnly, listAssetsValidators, listAssets);
router.post("/", ...hrOnly, createAssetValidators, createAsset);

/* ── HR-ONLY: ASSIGN / RETURN / HISTORY ───────────────────── */
router.post("/:id/assign", ...hrOnly, assignAssetValidators, assignAsset);
router.post("/:id/return", ...hrOnly, returnAssetValidators, returnAsset);
router.get("/:id/history", ...hrOnly, [param("id").isUUID()], getAssetHistory);

/* ── HR-ONLY: SINGLE ASSET ────────────────────────────────── */
router.get("/:id", ...hrOnly, [param("id").isUUID()], getAsset);
router.put("/:id", ...hrOnly, updateAssetValidators, updateAsset);
router.delete("/:id", ...hrOnly, [param("id").isUUID()], retireAsset);

export default router;