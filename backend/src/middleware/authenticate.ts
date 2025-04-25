// src/middleware/authenticate.ts
import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth/service';
import logger from '../utils/Logger';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export default async function authenticate(
  req: Request, 
  res: Response, 
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }
    
    const { user } = await authService.validateToken(token);
    
    // Attach user to request
    req.user = user;
    
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required'
      }
    });
  }
}