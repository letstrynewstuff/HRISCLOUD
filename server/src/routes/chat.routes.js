// // src/routes/chat.routes.js
// //
// // Mount in app.js:
// //   import chatRouter from "./routes/chat.routes.js";
// //   app.use("/api/chat", chatRouter);

// import { Router } from "express";
// import multer from "multer";
// import { authenticate, requireRole } from "../middleware/authenticate.js";
// import {
//   listChannels,
//   createChannel,
//   getChannel,
//   closeChannel,
//   addMembers,
//   removeMember,
//   getMessages,
//   sendMessage,
//   deleteMessage,
// } from "../controllers/chat.controller.js";

// const router = Router();
// const MANAGERS = ["manager", "hr_admin", "super_admin"];

// // File upload for documents in messages (10 MB, memory storage)
// const fileUpload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 10 * 1024 * 1024 },
// });

// function multerErrorHandler(err, req, res, next) {
//   if (err instanceof multer.MulterError) {
//     if (err.code === "LIMIT_FILE_SIZE") {
//       return res.status(413).json({ message: "File must not exceed 10 MB." });
//     }
//     return res.status(400).json({ message: err.message });
//   }
//   next(err);
// }

// // All chat routes require authentication
// router.use(authenticate);

// // ── Channels ──────────────────────────────────────────────────
// router.get("/channels", listChannels);
// router.post("/channels", requireRole(MANAGERS), createChannel);
// router.get("/channels/:id", getChannel);
// router.put("/channels/:id/close", requireRole(MANAGERS), closeChannel);

// // ── Members ───────────────────────────────────────────────────
// router.post("/channels/:id/members", requireRole(MANAGERS), addMembers);
// router.delete(
//   "/channels/:id/members/:empId",
//   requireRole(MANAGERS),
//   removeMember,
// );

// // ── Messages ──────────────────────────────────────────────────
// router.get("/channels/:id/messages", getMessages);
// router.post(
//   "/channels/:id/messages",
//   fileUpload.single("file"),
//   multerErrorHandler,
//   sendMessage,
// );
// router.delete("/messages/:id", deleteMessage);

// export default router;


// src/routes/chat.routes.js
//
// Mount in app.js:
//   import chatRouter from "./routes/chat.routes.js";
//   app.use("/api/chat", chatRouter);

import { Router } from "express";
import multer from "multer";
import { authenticate, requireRole } from "../middleware/authenticate.js";
import {
  listChannels,
  createChannel,
  getChannel,
  closeChannel,
  addMembers,
  removeMember,
  getMessages,
  sendMessage,
  deleteMessage,
  openOrCreateDM,
  listDMs,
} from "../controllers/chat.controller.js";

const router = Router();
const MANAGERS = ["manager", "hr_admin", "super_admin"];

// File upload for documents in messages (10 MB, memory storage)
const fileUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

function multerErrorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ message: "File must not exceed 10 MB." });
    }
    return res.status(400).json({ message: err.message });
  }
  next(err);
}

// All chat routes require authentication
router.use(authenticate);

// ── Group Channels ─────────────────────────────────────────────────────────
router.get("/channels", listChannels);
router.post("/channels", requireRole(MANAGERS), createChannel);
router.get("/channels/:id", getChannel);
router.put("/channels/:id/close", requireRole(MANAGERS), closeChannel);

// ── Members (manager only) ────────────────────────────────────────────────
router.post("/channels/:id/members", requireRole(MANAGERS), addMembers);
router.delete("/channels/:id/members/:empId", requireRole(MANAGERS), removeMember);

// ── Messages ──────────────────────────────────────────────────────────────
router.get("/channels/:id/messages", getMessages);
router.post(
  "/channels/:id/messages",
  fileUpload.single("file"),
  multerErrorHandler,
  sendMessage,
);
router.delete("/messages/:id", deleteMessage);

// ── Direct Messages ───────────────────────────────────────────────────────
// GET  /api/chat/dm/list           → list all DM threads for current user
// POST /api/chat/dm/:targetEmpId   → open or create DM with target employee
router.get("/dm/list", listDMs);
router.post("/dm/:targetEmployeeId", openOrCreateDM);

// DM channels share the same message endpoints above (same channel_messages table)
// so GET /api/chat/channels/:id/messages and POST /api/chat/channels/:id/messages
// work for both group and DM channels automatically.

export default router;