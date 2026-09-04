
// src/app.js
import express from "express";
import cors from "cors";
import morgan from "morgan";

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
// Accounting — covers Group 1 (Chart of Accounts, Journal Entries, General Ledger, Audit Trail)
//              AND Group 3 (Tax Management + Bank Reconciliation)
import accountingRouter    from "./routes/accounting.routes.js";
import appraisalRoutes from "./routes/appraisal.routes.js";
import timesheetRoutes from "./routes/timesheet.routes.js";
import reportRoutes from "./routes/reportss.routes.js";
import settingsRoutes from "./routes/settings.routes.js";


const app = express();

// ─────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────
app.use(
  cors({
    origin:      true,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// ─────────────────────────────────────────
// Health Check
// ─────────────────────────────────────────
app.get("/", (_req, res) => res.send("🚀 BantaHR Backend Running"));

// ─────────────────────────────────────────
// Routes
// ─────────────────────────────────────────
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
app.use("/api/appraisals", appraisalRoutes);
app.use("/api/super-admin",  superAdminRoutes);
app.use("/api/accounting",   accountingRouter);
app.use("/api/timesheets", timesheetRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/settings", settingsRoutes);

// ─────────────────────────────────────────
// 404 + Global Error Handler
// ─────────────────────────────────────────
// Both live in middleware/errorHandler.js. Everything that throws leaves
// as { success, message, errors? } with a message written for a human —
// stack traces and Postgres internals stay in the server log.
app.use(notFoundHandler);
app.use(errorHandler);

export default app;