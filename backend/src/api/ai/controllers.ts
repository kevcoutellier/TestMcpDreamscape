// src/api/ai/controllers.ts
import { Request, Response, NextFunction } from 'express';
import * as recommendationService from '../../services/ai/recommendationService';
import logger from '../../utils/Logger';

export const getRecommendations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const { 
      type = 'DESTINATION',
      count = 5 
    } = req.query as {
      type?: 'DESTINATION' | 'ACTIVITY';
      count?: number;
    };
    
    const recommendations = await recommendationService.getRecommendations(
      userId,
      type,
      Number(count)
    );
    
    return res.status(200).json({
      success: true,
      data: {
        recommendationId: `rec-${Date.now()}`,
        userId,
        type,
        items: recommendations,
        timestamp: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      }
    });
  } catch (error) {
    logger.error('Error in getRecommendations controller:', error);
    next(error);
  }
};