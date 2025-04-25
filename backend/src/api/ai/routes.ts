// src/api/ai/routes.ts
import { Router } from 'express';
import { query } from 'express-validator';
import * as aiController from './controllers';
import validate from '../../middleware/validate';
import authenticate from '../../middleware/authenticate';

const router = Router();

// All routes in this module require authentication
router.use(authenticate);

// Validation rules for recommendations
const recommendationsValidation = [
  query('type').isIn(['DESTINATION', 'ACTIVITY']).withMessage('Type must be either DESTINATION or ACTIVITY'),
  query('count').optional().isInt({ min: 1, max: 20 }).withMessage('Count must be between 1 and 20')
];

// Routes
router.get('/recommendations', recommendationsValidation, validate, aiController.getRecommendations);

export default router;