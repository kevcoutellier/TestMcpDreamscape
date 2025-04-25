// src/api/auth/routes.ts
import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from './controllers';
import validate from '../../middleware/validate';
import authenticate from '../../middleware/authenticate';

const router = Router();

// Validation rules for registration
const registerValidation = [
  body('email').isEmail().withMessage('Email must be valid'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
];

// Validation rules for login
const loginValidation = [
  body('email').isEmail().withMessage('Email must be valid'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Routes
router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authenticate, authController.logout);

export default router;