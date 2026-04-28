// src/app.js
import express from "express";
import cors from "cors";
import morgan from "morgan";

// Route imports
import authRoutes from "./routes/auth.routes.js";
import announcementRoutes from "./routes/announcement.routes.js";
import attendanceRouter from "./routes/attendance.routes.js";
import companyRouter from "./routes/company.routes.js";
import employeeRoutes from "./routes/employee.routes.js";
import leaveRoutes from "./routes/leave.routes.js";
import loanRoutes from "./routes/loan.routes.js";
// import notificationRoutes from "./routes/notification.routes.js";
import { notificationRouter as notificationRoutes } from "./routes/notification.routes.js";
// import reportRoutes from "./routes/report.routes.js";
// import performanceRoutes from "./routes/performance.routes.js";
import departmentRoutes from "./routes/department.routes.js";
import jobRoleRouter from "./routes/jobRole.routes.js";
import gradeRoutes from "./routes/grade.routes.js";
import trainingRoutes from "./routes/training.routes.js";
import performanceRoutes from "./routes/performance.routes.js";
import goalsRoutes from "./routes/goals.routes.js";
import payrollRoutes from "./routes/payroll.routes.js";
import approvalRouter from "./routes/approval.routes.js";
import documentRouter from "./routes/document.routes.js";
import benefitsRouter from "./routes/benefits.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import superAdminRoutes from "./routes/super_admin.routes.js";

const app = express();

// ─────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",

    credentials: true,
  }),
);
// app.use(
//   cors({

//     origin: true,
//     credentials: true,
//   }),
// );

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// ─────────────────────────────────────────
// Health Check
// ─────────────────────────────────────────
app.get("/", (req, res) => {
  res.send("🚀 HRIS Backend Running");
});

// ─────────────────────────────────────────
// Routes
// ─────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/attendance", attendanceRouter);
app.use("/api/company", companyRouter);
app.use("/api/employees", employeeRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/notifications", notificationRoutes);
// app.use("/api/reports", reportRoutes);
// app.use("/api/performance", performanceRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/trainings", trainingRoutes);
app.use("/api/performance", performanceRoutes);
app.use("/api/goals", goalsRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/job-roles", jobRoleRouter);
app.use("/api/grades", gradeRoutes);
app.use("/api/approvals", approvalRouter);
app.use("/api/documents", documentRouter);
app.use("/api/benefits", benefitsRouter);
app.use("/api/chat", chatRoutes);
app.use("/api/super-admin", superAdminRoutes);
// ─────────────────────────────────────────
// 404 Handler
// ─────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ─────────────────────────────────────────
// Global Error Handler
// ─────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;
