// src/index.ts (mise à jour)
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import userRoutes from './api/users/routes';
import travelRoutes from './api/travel/routes';
import aiRoutes from './api/ai/routes';
import errorHandler from './middleware/errorHandler';
import logger from './utils/Logger';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/travel', travelRoutes);
app.use('/api/v1/ai', aiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Start server
app.listen(port, () => {
  logger.info(`🚀 Server running on port ${port} in ${process.env.NODE_ENV} mode`);
});

export default app;