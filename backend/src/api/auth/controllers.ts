// src/api/auth/controllers.ts
import { Request, Response, NextFunction } from 'express';
import * as authService from '../../services/auth/service';
import logger from '../../utils/Logger';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    const result = await authService.registerUser({
      email,
      password,
      firstName,
      lastName
    });
    
    return res.status(201).json({
      success: true,
      data: {
        user: result.user,
        token: result.token
      }
    });
  } catch (error) {
    logger.error('Error in register controller:', error);
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    
    const result = await authService.loginUser(email, password);
    
    return res.status(200).json({
      success: true,
      data: {
        user: result.user,
        token: result.token
      }
    });
  } catch (error) {
    logger.error('Error in login controller:', error);
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'REFRESH_TOKEN_REQUIRED',
          message: 'Refresh token is required'
        }
      });
    }
    
    const result = await authService.refreshUserToken(refreshToken);
    
    return res.status(200).json({
      success: true,
      data: {
        token: result.token
      }
    });
  } catch (error) {
    logger.error('Error in refreshToken controller:', error);
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    
    await authService.logoutUser(userId);
    
    return res.status(200).json({
      success: true,
      data: {
        message: 'Successfully logged out'
      }
    });
  } catch (error) {
    logger.error('Error in logout controller:', error);
    next(error);
  }
};