// src/middleware/validate.ts
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export default function validate(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: errors.array().map(error => ({
          field: error.param,
          message: error.msg,
          value: error.value
        }))
      }
    });
  }
  
  next();
}