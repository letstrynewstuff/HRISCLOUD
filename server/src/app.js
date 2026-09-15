
// // src/app.js
// import express from "express";
// import cors from "cors";
// import morgan from "morgan";

// // ── Route imports ─────────────────────────────────────────────
// import authRoutes          from "./routes/auth.routes.js";
// import announcementRoutes  from "./routes/announcement.routes.js";
// import attendanceRouter    from "./routes/attendance.routes.js";
// import companyRouter       from "./routes/company.routes.js";
// import employeeRoutes      from "./routes/employee.routes.js";
// import leaveRoutes         from "./routes/leave.routes.js";
// import loanRoutes          from "./routes/loan.routes.js";
// import { notificationRouter as notificationRoutes } from "./routes/notification.routes.js";
// import departmentRoutes    from "./routes/department.routes.js";
// import jobRoleRouter       from "./routes/jobRole.routes.js";
// import gradeRoutes         from "./routes/grade.routes.js";
// import trainingRoutes      from "./routes/training.routes.js";
// import performanceRoutes   from "./routes/performance.routes.js";
// import goalsRoutes         from "./routes/goals.routes.js";
// import payrollRoutes       from "./routes/payroll.routes.js";
// import approvalRouter      from "./routes/approval.routes.js";
// import documentRouter      from "./routes/document.routes.js";
// import benefitsRouter      from "./routes/benefits.routes.js";
// import chatRoutes          from "./routes/chat.routes.js";
// import superAdminRoutes    from "./routes/super_admin.routes.js";
// // Accounting — covers Group 1 (Chart of Accounts, Journal Entries, General Ledger, Audit Trail)
// //              AND Group 3 (Tax Management + Bank Reconciliation)
// import accountingRouter    from "./routes/accounting.routes.js";
// import appraisalRoutes from "./routes/appraisal.routes.js";
// import timesheetRoutes from "./routes/timesheet.routes.js";
// import reportRoutes from "./routes/reportss.routes.js";
// import settingsRoutes from "./routes/settings.routes.js";
// import assetRoutes from "./routes/asset.routes.js";


// const app = express();

// // ─────────────────────────────────────────
// // Middleware
// // ─────────────────────────────────────────
// app.use(
//   cors({
//     origin:      true,
//     credentials: true,
//   }),
// );

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(morgan("dev"));

// // ─────────────────────────────────────────
// // Health Check
// // ─────────────────────────────────────────
// app.get("/", (_req, res) => res.send("🚀 BantaHR Backend Running"));

// // ─────────────────────────────────────────
// // Routes
// // ─────────────────────────────────────────
// app.use("/api/auth",         authRoutes);
// app.use("/api/announcements",announcementRoutes);
// app.use("/api/attendance",   attendanceRouter);
// app.use("/api/company",      companyRouter);
// app.use("/api/employees",    employeeRoutes);
// app.use("/api/leave",        leaveRoutes);
// app.use("/api/loans",        loanRoutes);
// app.use("/api/notifications",notificationRoutes);
// app.use("/api/departments",  departmentRoutes);
// app.use("/api/job-roles",    jobRoleRouter);
// app.use("/api/grades",       gradeRoutes);
// app.use("/api/trainings",    trainingRoutes);
// app.use("/api/performance",  performanceRoutes);
// app.use("/api/goals",        goalsRoutes);
// app.use("/api/payroll",      payrollRoutes);
// app.use("/api/approvals",    approvalRouter);
// app.use("/api/documents",    documentRouter);
// app.use("/api/benefits",     benefitsRouter);
// app.use("/api/chat",         chatRoutes);
// app.use("/api/appraisals", appraisalRoutes);
// app.use("/api/super-admin",  superAdminRoutes);
// app.use("/api/accounting",   accountingRouter);
// app.use("/api/timesheets", timesheetRoutes);
// app.use("/api/reports", reportRoutes);
// app.use("/api/settings", settingsRoutes);
// app.use("/api/assets", assetRoutes);

// // ─────────────────────────────────────────
// // 404 Handler
// // ─────────────────────────────────────────
// app.use((req, res) => {
//   res.status(404).json({ success: false, message: "Route not found" });
// });

// // ─────────────────────────────────────────
// // Global Error Handler
// // ─────────────────────────────────────────
// app.use((err, _req, res, _next) => {
//   console.error(err);
//   res.status(err.status || 500).json({
//     success: false,
//     message: err.message || "Internal Server Error",
//   });
// });

// export default app;


// src/app.js
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import {
  apiLimiter,
  authLimiter,
  passwordResetLimiter,
  refreshLimiter,
} from "./middleware/rateLimiter.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

// ── Route imports ─────────────────────────────────────────────
import authRoutes          from "./routes/auth.routes.js";
import announcementRoutes  from "./routes/announcement.routes.js";
import attendanceRouter    from "./routes/attendance.routes.js";
import companyRouter       from "./routes/company.routes.js";
import employeeRoutes      from "./routes/employee.routes.js";
import leaveRoutes         from "./routes/leave.routes.js";
import loanRoutes          from "./routes/loan.routes.js";
import { notificationRouter as notificationRoutes } from "./routes/notification.routes.js";
import departmentRoutes    from "./routes/department.routes.js";
import jobRoleRouter       from "./routes/jobRole.routes.js";
import gradeRoutes         from "./routes/grade.routes.js";
import trainingRoutes      from "./routes/training.routes.js";
import performanceRoutes   from "./routes/performance.routes.js";
import goalsRoutes         from "./routes/goals.routes.js";
import payrollRoutes       from "./routes/payroll.routes.js";
import approvalRouter      from "./routes/approval.routes.js";
import documentRouter      from "./routes/document.routes.js";
import benefitsRouter      from "./routes/benefits.routes.js";
import chatRoutes          from "./routes/chat.routes.js";
import superAdminRoutes    from "./routes/super_admin.routes.js";
import accountingRouter    from "./routes/accounting.routes.js";
import appraisalRoutes     from "./routes/appraisal.routes.js";
import timesheetRoutes     from "./routes/timesheet.routes.js";
import reportRoutes        from "./routes/reportss.routes.js";
import settingsRoutes      from "./routes/settings.routes.js";
import assetRoutes         from "./routes/asset.routes.js";

const app = express();

// Render sits behind a reverse proxy — required so express-rate-limit
// sees real client IPs instead of the proxy's.
app.set("trust proxy", 1);

// ── Middleware ────────────────────────────────────────────────
app.use(helmet());

const ALLOWED_ORIGINS = [
  process.env.CLIENT_URL, // production URL from env
  "http://localhost:5173", 
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (curl, Postman, mobile apps, server-to-server)
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// ── Rate Limiting ─────────────────────────────────────────────
app.use("/api", apiLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register-company", authLimiter);
app.use("/api/auth/forgot-password", passwordResetLimiter);
app.use("/api/auth/reset-password", passwordResetLimiter);
app.use("/api/auth/refresh", refreshLimiter);

// ── Health Check ──────────────────────────────────────────────
app.get("/", (_req, res) => res.send("🚀 BantaHR Backend Running"));

// ── Routes ────────────────────────────────────────────────────
app.use("/api/auth",         authRoutes);
app.use("/api/announcements",announcementRoutes);
app.use("/api/attendance",   attendanceRouter);
app.use("/api/company",      companyRouter);
app.use("/api/employees",    employeeRoutes);
app.use("/api/leave",        leaveRoutes);
app.use("/api/loans",        loanRoutes);
app.use("/api/notifications",notificationRoutes);
app.use("/api/departments",  departmentRoutes);
app.use("/api/job-roles",    jobRoleRouter);
app.use("/api/grades",       gradeRoutes);
app.use("/api/trainings",    trainingRoutes);
app.use("/api/performance",  performanceRoutes);
app.use("/api/goals",        goalsRoutes);
app.use("/api/payroll",      payrollRoutes);
app.use("/api/approvals",    approvalRouter);
app.use("/api/documents",    documentRouter);
app.use("/api/benefits",     benefitsRouter);
app.use("/api/chat",         chatRoutes);
app.use("/api/appraisals",   appraisalRoutes);
app.use("/api/super-admin",  superAdminRoutes);
app.use("/api/accounting",   accountingRouter);
app.use("/api/timesheets",   timesheetRoutes);
app.use("/api/reports",      reportRoutes);
app.use("/api/settings",     settingsRoutes);
app.use("/api/assets",       assetRoutes);

// ── 404 + Global Error Handler (must be LAST) ─────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;