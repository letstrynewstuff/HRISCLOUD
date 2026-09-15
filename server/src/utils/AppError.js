// src/utils/AppError.js
export class AppError extends Error {
  constructor(message, statusCode = 500, details = undefined) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.isOperational = true; // marks this as an expected/handled error, not a bug
    if (details !== undefined) this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}
