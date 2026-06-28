

// // src/routes/attendance.routes.js
// //
// // FIX: GET /today and GET / used requireRole(HR_ROLES) which blocked managers.
// //      Replaced with requireManagerial on both.
// //      The controller (getTodayAttendance, getAllAttendanceHandler) reads
// //      req.user.isHR to scope results to team vs full company.
// //
// // Mount in app.js:
// //   import attendanceRouter from "./routes/attendance.routes.js";
// //   app.use("/api/attendance", attendanceRouter);

// import { Router } from "express";
// import multer from "multer";
// import { authenticate, requireRole, requireManagerial } from "../middleware/authenticate.js";
// import {
//   clockIn,
//   clockOut,
//   getAllAttendanceHandler,
//   getTodayAttendance,
//   getMyAttendance,
//   getEmployeeAttendanceHandler,
//   correctAttendance,
//   createShift,
//   updateShift,
//   getShiftsHandler,
// } from "../controllers/attendance.controller.js";
// import {
//   clockInRules,
//   correctRules,
//   createShiftRules,
//   updateShiftRules,
//   listQueryRules,
// } from "../validators/attendance.validators.js";

// const router = Router();
// const HR_ROLES = ["hr_admin", "super_admin"];

// const selfieUpload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 5 * 1024 * 1024 },
//   fileFilter: (_req, file, cb) => {
//     if (file.mimetype.startsWith("image/")) return cb(null, true);
//     cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Only image files are allowed for selfies."));
//   },
// });

// function handleMulterError(err, req, res, next) {
//   if (err instanceof multer.MulterError) {
//     if (err.code === "LIMIT_FILE_SIZE")
//       return res.status(413).json({ message: "Selfie must not exceed 5 MB." });
//     return res.status(400).json({ message: err.message });
//   }
//   next(err);
// }

// // ── Employee self-service ─────────────────────────────────────

// router.post(
//   "/clock-in",
//   authenticate,
//   selfieUpload.single("selfie"),
//   handleMulterError,
//   ...clockInRules,
//   // requireManagerial,          
//   clockIn,
// );

// router.post("/clock-out", authenticate, clockOut);

// router.get("/me", authenticate, ...listQueryRules, getMyAttendance);

// // ── HR / Manager ──────────────────────────────────────────────
// // FIX: requireRole(HR_ROLES) blocked managers.
// //      requireManagerial allows HR admins + actual managers.
// //      GET /today must be BEFORE GET /:id to avoid param clash.

// // GET /api/attendance/today
// router.get(
//   "/today",
//   authenticate,
//   requireManagerial,              // ← FIX (was requireRole(HR_ROLES))
//   getTodayAttendance,
// );

// // GET /api/attendance
// router.get(
//   "/",
//   authenticate,
//   requireManagerial,              // ← FIX (was requireRole(HR_ROLES))
//   ...listQueryRules,
//   getAllAttendanceHandler,
// );

// // GET /api/attendance/employee/:id  — manager can view their direct report's history
// router.get(
//   "/employee/:id",
//   authenticate,
//   requireManagerial,              // ← FIX (was requireRole(HR_ROLES))
//   ...listQueryRules,
//   getEmployeeAttendanceHandler,
// );

// // PUT /api/attendance/:id/correct  — HR only (managers cannot edit records)
// router.put(
//   "/:id/correct",
//   authenticate,
//   requireRole(HR_ROLES),          // ← stays HR-only (correction is a privileged action)
//   ...correctRules,
//   correctAttendance,
// );

// // ── Shifts ────────────────────────────────────────────────────

// router.get("/shifts", authenticate, getShiftsHandler);  // any authenticated user

// router.post(
//   "/shifts",
//   authenticate,
//   requireRole(HR_ROLES),
//   ...createShiftRules,
//   createShift,
// );


// router.put(
//   "/shifts/:id",
//   authenticate,
//   requireRole(HR_ROLES),
//   ...updateShiftRules,
//   updateShift,
// );


// export default router;


// src/routes/attendance.routes.js
//
// FIX: GET /today and GET / used requireRole(HR_ROLES) which blocked managers.
//      Replaced with requireManagerial on both.
//      The controller (getTodayAttendance, getAllAttendanceHandler) reads
//      req.user.isHR to scope results to team vs full company.
//
// FIX: Added /break-start and /break-end routes (pause/resume) — these were
//      called by the frontend (attendanceApi.startBreak / endBreak) but
//      never registered, causing "Route not found".
//
// Mount in app.js:
//   import attendanceRouter from "./routes/attendance.routes.js";
//   app.use("/api/attendance", attendanceRouter);

import { Router } from "express";
import multer from "multer";
import { authenticate, requireRole, requireManagerial } from "../middleware/authenticate.js";
import {
  clockIn,
  clockOut,
  breakStart,
  breakEnd,
  getAllAttendanceHandler,
  getTodayAttendance,
  getMyAttendance,
  getEmployeeAttendanceHandler,
  correctAttendance,
  createShift,
  updateShift,
  getShiftsHandler,
} from "../controllers/attendance.controller.js";
import {
  clockInRules,
  correctRules,
  createShiftRules,
  updateShiftRules,
  listQueryRules,
} from "../validators/attendance.validators.js";

const router = Router();
const HR_ROLES = ["hr_admin", "super_admin"];

const selfieUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) return cb(null, true);
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Only image files are allowed for selfies."));
  },
});

function handleMulterError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE")
      return res.status(413).json({ message: "Selfie must not exceed 5 MB." });
    return res.status(400).json({ message: err.message });
  }
  next(err);
}

// ── Employee self-service ─────────────────────────────────────

router.post(
  "/clock-in",
  authenticate,
  selfieUpload.single("selfie"),
  handleMulterError,
  ...clockInRules,
  // requireManagerial,
  clockIn,
);

router.post("/clock-out", authenticate, clockOut);

// ── Break / pause ────────────────────────────────────────────
router.post("/break-start", authenticate, breakStart);
router.post("/break-end",   authenticate, breakEnd);

router.get("/me", authenticate, ...listQueryRules, getMyAttendance);

// ── HR / Manager ──────────────────────────────────────────────
// FIX: requireRole(HR_ROLES) blocked managers.
//      requireManagerial allows HR admins + actual managers.
//      GET /today must be BEFORE GET /:id to avoid param clash.

// GET /api/attendance/today
router.get(
  "/today",
  authenticate,
  requireManagerial,              // ← FIX (was requireRole(HR_ROLES))
  getTodayAttendance,
);

// GET /api/attendance
router.get(
  "/",
  authenticate,
  requireManagerial,              // ← FIX (was requireRole(HR_ROLES))
  ...listQueryRules,
  getAllAttendanceHandler,
);

// GET /api/attendance/employee/:id  — manager can view their direct report's history
router.get(
  "/employee/:id",
  authenticate,
  requireManagerial,              // ← FIX (was requireRole(HR_ROLES))
  ...listQueryRules,
  getEmployeeAttendanceHandler,
);

// PUT /api/attendance/:id/correct  — HR only (managers cannot edit records)
router.put(
  "/:id/correct",
  authenticate,
  requireRole(HR_ROLES),          // ← stays HR-only (correction is a privileged action)
  ...correctRules,
  correctAttendance,
);

// ── Shifts ────────────────────────────────────────────────────

router.get("/shifts", authenticate, getShiftsHandler);  // any authenticated user

router.post(
  "/shifts",
  authenticate,
  requireRole(HR_ROLES),
  ...createShiftRules,
  createShift,
);

router.put(
  "/shifts/:id",
  authenticate,
  requireRole(HR_ROLES),
  ...updateShiftRules,
  updateShift,
);

export default router;