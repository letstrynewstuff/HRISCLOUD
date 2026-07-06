// // src/routes/settings.routes.js
// //
// // Mount in app.js:
// //   import settingsRouter from "./routes/settings.routes.js";
// //   app.use("/api/settings", settingsRouter);

// import { Router } from "express";
// import multer from "multer";
// import { body } from "express-validator";
// import { authenticate } from "../middleware/authenticate.js";
// import { validate } from "../middleware/validate.js";
// import {
//   changePassword,
//   toggleTwoFactor,
//   getNotificationPrefs,
//   updateNotificationPrefs,
//   getMyProfile,
//   updateMyProfile,
//   getCompany,
//   updateCompany,
//   uploadLogo,
//   getUsers,
//   getTeamMembers,
//   inviteUser,
//   updateUserRole,
//   removeUser,
//   getRoles,
//   updateRolePermissions,
//   getAuditLogs,
//   getBilling,
//   getIntegrations,
//   toggleIntegration,
// } from "../controllers/settings.controller.js";

// const router = Router();

// // Logo upload: memory storage so the buffer streams straight to Cloudinary
// // without touching disk. 5MB cap, images only.
// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 5 * 1024 * 1024 },
//   fileFilter: (req, file, cb) => {
//     if (!file.mimetype.startsWith("image/")) {
//       return cb(new Error("Only image files are allowed."));
//     }
//     cb(null, true);
//   },
// });

// router.use(authenticate);

// // ── Security ──────────────────────────────────────────────────
// router.put(
//   "/security/password",
//   [
//     body("currentPassword")
//       .notEmpty()
//       .withMessage("currentPassword is required."),
//     body("newPassword")
//       .notEmpty()
//       .withMessage("newPassword is required.")
//       .isLength({ min: 8 })
//       .withMessage("Password must be at least 8 characters.")
//       .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
//       .withMessage("Password must include uppercase, lowercase, and a number."),
//   ],
//   validate,
//   changePassword,
// );

// router.put(
//   "/security/2fa",
//   [body("enabled").isBoolean().withMessage("enabled must be a boolean.")],
//   validate,
//   toggleTwoFactor,
// );

// // ── Notification preferences ──────────────────────────────────
// router.get("/notifications", getNotificationPrefs);
// router.put("/notifications", updateNotificationPrefs);

// // ── My Profile ───────────────────────────────────────────────
// router.get("/me", getMyProfile);
// router.put(
//   "/me",
//   [
//     body("name").notEmpty().withMessage("name is required."),
//     body("email").isEmail().withMessage("A valid email is required."),
//   ],
//   validate,
//   updateMyProfile,
// );

// // ── Company Profile ────────────────────────────────────────────
// router.get("/company", getCompany);
// router.put(
//   "/company",
//   [body("name").notEmpty().withMessage("Company name is required.")],
//   validate,
//   updateCompany,
// );
// router.post("/company/logo", upload.single("logo"), uploadLogo);

// // ── Users / Team ────────────────────────────────────────────────
// router.get("/users", getUsers);
// router.get("/users/team", getTeamMembers);
// router.post(
//   "/users/invite",
//   [
//     body("email").isEmail().withMessage("A valid email is required."),
//     body("role").notEmpty().withMessage("role is required."),
//   ],
//   validate,
//   inviteUser,
// );
// router.put(
//   "/users/:userId/role",
//   [body("role").notEmpty().withMessage("role is required.")],
//   validate,
//   updateUserRole,
// );
// router.delete("/users/:userId", removeUser);

// // ── Roles & Permissions ─────────────────────────────────────────
// router.get("/roles", getRoles);
// router.put(
//   "/roles/:roleId",
//   [
//     body("permissions")
//       .isObject()
//       .withMessage("permissions object is required."),
//   ],
//   validate,
//   updateRolePermissions,
// );

// // ── Audit Log ────────────────────────────────────────────────────
// router.get("/audit", getAuditLogs);

// // ── Billing ──────────────────────────────────────────────────────
// router.get("/billing", getBilling);

// // ── Integrations ─────────────────────────────────────────────────
// router.get("/integrations", getIntegrations);
// router.put(
//   "/integrations/:id",
//   [body("enabled").isBoolean().withMessage("enabled must be a boolean.")],
//   validate,
//   toggleIntegration,
// );

// export default router;



// src/routes/settings.routes.js
//
// Mount in app.js:
//   import settingsRouter from "./routes/settings.routes.js";
//   app.use("/api/settings", settingsRouter);

import { Router } from "express";
import multer from "multer";
import { body } from "express-validator";
import { authenticate } from "../middleware/authenticate.js";
import { validate } from "../middleware/validate.js";
import {
  changePassword,
  toggleTwoFactor,
  getNotificationPrefs,
  updateNotificationPrefs,
  getMyProfile,
  updateMyProfile,
  uploadAvatar,
  getCompany,
  updateCompany,
  uploadLogo,
  getUsers,
  getTeamMembers,
  inviteUser,
  updateUserRole,
  removeUser,
  getRoles,
  updateRolePermissions,
  getAuditLogs,
  getBilling,
  getIntegrations,
  toggleIntegration,
} from "../controllers/settings.controller.js";

const router = Router();

// Image upload: memory storage so the buffer streams straight to Cloudinary
// without touching disk. 5MB cap, images only. Shared by both the company
// logo upload and the admin's own avatar upload.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed."));
    }
    cb(null, true);
  },
});

router.use(authenticate);

// ── Security ──────────────────────────────────────────────────
router.put(
  "/security/password",
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("currentPassword is required."),
    body("newPassword")
      .notEmpty()
      .withMessage("newPassword is required.")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters.")
      .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage("Password must include uppercase, lowercase, and a number."),
  ],
  validate,
  changePassword,
);

router.put(
  "/security/2fa",
  [body("enabled").isBoolean().withMessage("enabled must be a boolean.")],
  validate,
  toggleTwoFactor,
);

// ── Notification preferences ──────────────────────────────────
router.get("/notifications", getNotificationPrefs);
router.put("/notifications", updateNotificationPrefs);

// ── My Profile ───────────────────────────────────────────────
router.get("/me", getMyProfile);
router.put(
  "/me",
  [
    body("name").notEmpty().withMessage("name is required."),
    body("email").isEmail().withMessage("A valid email is required."),
  ],
  validate,
  updateMyProfile,
);
// NEW: profile photo upload — any authenticated user can update their own.
router.post("/me/avatar", upload.single("avatar"), uploadAvatar);

// ── Company Profile ────────────────────────────────────────────
router.get("/company", getCompany);
router.put(
  "/company",
  [body("name").notEmpty().withMessage("Company name is required.")],
  validate,
  updateCompany,
);
router.post("/company/logo", upload.single("logo"), uploadLogo);

// ── Users / Team ────────────────────────────────────────────────
router.get("/users", getUsers);
router.get("/users/team", getTeamMembers);
router.post(
  "/users/invite",
  [
    body("email").isEmail().withMessage("A valid email is required."),
    body("role").notEmpty().withMessage("role is required."),
  ],
  validate,
  inviteUser,
);
router.put(
  "/users/:userId/role",
  [body("role").notEmpty().withMessage("role is required.")],
  validate,
  updateUserRole,
);
router.delete("/users/:userId", removeUser);

// ── Roles & Permissions ─────────────────────────────────────────
router.get("/roles", getRoles);
router.put(
  "/roles/:roleId",
  [
    body("permissions")
      .isObject()
      .withMessage("permissions object is required."),
  ],
  validate,
  updateRolePermissions,
);

// ── Audit Log ────────────────────────────────────────────────────
router.get("/audit", getAuditLogs);

// ── Billing ──────────────────────────────────────────────────────
router.get("/billing", getBilling);

// ── Integrations ─────────────────────────────────────────────────
router.get("/integrations", getIntegrations);
router.put(
  "/integrations/:id",
  [body("enabled").isBoolean().withMessage("enabled must be a boolean.")],
  validate,
  toggleIntegration,
);

export default router;
