import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../config/logger";
import { AppError } from "../utils/http";

export const notFoundHandler = (_req: Request, _res: Response, next: NextFunction) => {
  next(new AppError("Route not found", 404));
};

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (error instanceof ZodError) {
    return res.status(422).json({
      message: "Validation failed",
      issues: error.flatten()
    });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  logger.error("Unhandled server error", error);
  return res.status(500).json({ message: "Internal server error" });
};
