import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../../models/userModel";
import ErrorHandler from "../../utils/errorHandler";
import asyncErrorHandler from "../helpers/asyncErrorHandler";

/**
 * Extend Express Request to include user
 * (Ideally place this in a global typings file)
 */
export interface AuthenticatedRequest extends Request {
  user?: any; // replace `any` with IUser if you have a User interface
}

interface DecodedToken extends JwtPayload {
  id: string;
  email: string;
}

// Check if user is authenticated
export const isAuthenticatedUser = asyncErrorHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authorization = req.header("authorization");
    const token = authorization?.startsWith("Bearer ")
      ? authorization.slice(7)
      : undefined;

    if (!token) {
      return next(new ErrorHandler("Authentication token required", 401));
    }

    if (!process.env.JWT_SECRET) {
      return next(new ErrorHandler("JWT signing secret is not configured", 500));
    }

    const decodedData = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as DecodedToken;

    const user = await User.findById(decodedData.id);

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    req.user = user;
    next();
  }
);

// Role-based authorization
export const authorizeRoles =
  (...roles: string[]) =>
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(`Role: ${req.user?.role} is not allowed`, 403)
      );
    }

    next();
  };
