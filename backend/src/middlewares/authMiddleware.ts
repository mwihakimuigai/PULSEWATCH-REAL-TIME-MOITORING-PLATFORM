import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";
import { AppError } from "../utils/http";
import { UserRole } from "../types/auth";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: UserRole;
      };
    }
  }
}

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return next(new AppError("Authentication required", 401));
  }

  const token = authHeader.split(" ")[1];
  const payload = verifyToken(token);
  req.user = {
    id: payload.sub,
    email: payload.email,
    role: payload.role
  };
  next();
};

export const authorize = (...roles: UserRole[]) => (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError("Forbidden", 403));
  }

  next();
};
