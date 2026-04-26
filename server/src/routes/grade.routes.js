// import express from "express";
// import {
//   listGrades,
//   createGrade,
//   updateGrade,
//   deleteGrade,
// } from "../controllers/grade.controller.js";
// import { authenticate } from "../middleware/authenticate.js"; // Your JWT middleware

// const router = express.Router();

// router.get("/grades", authenticate, listGrades);
// router.post("/grades", authenticate, createGrade);
// router.put("/grades/:id", authenticate, updateGrade);
// router.delete("/grades/:id", authenticate, deleteGrade);

// export default router;

// src/routes/grade.routes.js
import express from "express";
import {
  listGrades,
  createGrade,
  updateGrade,
  deleteGrade,
} from "../controllers/grade.controller.js";
import { authenticate } from "../middleware/authenticate.js"; // Your JWT middleware

const router = express.Router();

// The base path "/api/grades" is already handled by app.js, 
// so we just use "/" and "/:id" here!
router.get("/", authenticate, listGrades);
router.post("/", authenticate, createGrade);
router.put("/:id", authenticate, updateGrade);
router.delete("/:id", authenticate, deleteGrade);

export default router;