// src/middleware/validate.js
//
// Central validation error handler.
// Place this AFTER any express-validator rule arrays in the route,
// and BEFORE the controller. It reads the accumulated errors from
// validationResult() and short-circuits with a 422 if any exist.
//
// Usage in a route:
//   import { validate } from "../middleware/validate.js";
//   router.post("/cycles", cycleRules, validate, requireRole([...]), createCycle);

import { validationResult } from "express-validator";

export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Validation failed.",
      errors: errors.array().map((e) => ({
        field: e.path ?? e.param,
        message: e.msg,
        value: e.value,
      })),
    });
  }
  next();
}
