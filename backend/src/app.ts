// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './api/auth/routes';
import userRoutes from './api/users/routes';
import travelRoutes from './api/travel/routes';
import recommendationsRoutes from './api/ai/routes';
import vrRoutes from './api/vr/routes';

import errorHandler from './middleware/errorHandler';
import logger from './utils/Logger';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/travel', travelRoutes);
app.use('/api/v1/recommendations', recommendationsRoutes);
app.use('/api/v1/vr', vrRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ 
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: 'The requested resource was not found'
    }
  });
});

export default app;