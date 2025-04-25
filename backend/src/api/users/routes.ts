// src/api/users/routes.ts
import { Router } from 'express';
import { body } from 'express-validator';
import * as userController from './controllers';
import validate from '../../middleware/validate';
import authenticate from '../../middleware/authenticate';

const router = Router();

// Validation rules for registration
const registerValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required')
];

// Validation rules for login
const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// Validation rules for updating profile
const updateProfileValidation = [
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('preferences').optional().isObject().withMessage('Preferences must be an object')
];

// Public routes
router.post('/register', registerValidation, validate, userController.register);
router.post('/login', loginValidation, validate, userController.login);
router.post('/refresh-token', userController.refreshToken);

// Protected routes (require authentication)
router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, updateProfileValidation, validate, userController.updateProfile);
router.put('/preferences', authenticate, userController.updatePreferences);
router.post('/logout', authenticate, userController.logout);

export default router;