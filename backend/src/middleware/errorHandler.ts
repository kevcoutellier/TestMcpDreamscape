// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import logger from '../utils/Logger';

export default function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error(`Error: ${err.message}`, { stack: err.stack });
  
  // Handle specific known errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details
      }
    });
  }
  
  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Database operation failed',
      }
    });
  }
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid authentication token',
      }
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_EXPIRED',
        message: 'Authentication token expired',
      }
    });
  }
  
  // Default error handler for unhandled errors
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    }
  });
}