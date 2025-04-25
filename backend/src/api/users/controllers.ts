// src/api/users/controllers.ts
import { Request, Response, NextFunction } from 'express';
import * as userService from '../../services/users/service';
import logger from '../../utils/Logger';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userData = req.body;
    const result = await userService.registerUser(userData);
    
    return res.status(201).json({
      success: true,
      data: {
        user: result.user,
        tokens: result.tokens
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
    const result = await userService.loginUser(email, password);
    
    return res.status(200).json({
      success: true,
      data: {
        user: result.user,
        tokens: result.tokens
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
    const tokens = await userService.refreshTokens(refreshToken);
    
    return res.status(200).json({
      success: true,
      data: { tokens }
    });
  } catch (error) {
    logger.error('Error in refreshToken controller:', error);
    next(error);
  }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const user = await userService.getUserProfile(userId);
    
    return res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    logger.error('Error in getProfile controller:', error);
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const profileData = req.body;
    const user = await userService.updateUserProfile(userId, profileData);
    
    return res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    logger.error('Error in updateProfile controller:', error);
    next(error);
  }
};

export const updatePreferences = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const preferences = req.body;
    const user = await userService.updateUserPreferences(userId, preferences);
    
    return res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    logger.error('Error in updatePreferences controller:', error);
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    await userService.logoutUser(refreshToken);
    
    return res.status(200).json({
      success: true,
      data: { message: 'Logged out successfully' }
    });
  } catch (error) {
    logger.error('Error in logout controller:', error);
    next(error);
  }
};