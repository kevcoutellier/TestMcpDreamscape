// src/services/users/service.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppError } from '../../utils/errors';
import logger from '../../utils/Logger';

const prisma = new PrismaClient();

// Tokens
const generateTokens = (userId: string) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'default_jwt_secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );
  
  const refreshToken = jwt.sign(
    { userId, tokenType: 'refresh' },
    process.env.JWT_SECRET || 'default_jwt_secret',
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
};

// User services
export async function registerUser(userData: any) {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    });
    
    if (existingUser) {
      throw new AppError('Email already in use', 'EMAIL_IN_USE', 400);
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(userData.password, 10);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        passwordHash,
        firstName: userData.firstName,
        lastName: userData.lastName,
        preferences: userData.preferences || {}
      }
    });
    
    // Generate tokens
    const tokens = generateTokens(user.id);
    
    // Return user (without password hash) and tokens
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        preferences: user.preferences
      },
      tokens
    };
  } catch (error) {
    logger.error('Error registering user:', error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to register user', 'REGISTRATION_FAILED', 500);
  }
}

export async function loginUser(email: string, password: string) {
  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      throw new AppError('Invalid credentials', 'INVALID_CREDENTIALS', 401);
    }
    
    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    
    if (!passwordMatch) {
      throw new AppError('Invalid credentials', 'INVALID_CREDENTIALS', 401);
    }
    
    // Generate tokens
    const tokens = generateTokens(user.id);
    
    // Return user (without password hash) and tokens
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        preferences: user.preferences
      },
      tokens
    };
  } catch (error) {
    logger.error('Error logging in user:', error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to login', 'LOGIN_FAILED', 500);
  }
}

export async function refreshTokens(refreshToken: string) {
  try {
    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_SECRET || 'default_jwt_secret'
    ) as { userId: string; tokenType?: string };
    
    // Ensure it's a refresh token
    if (decoded.tokenType !== 'refresh') {
      throw new AppError('Invalid token type', 'INVALID_TOKEN', 401);
    }
    
    // Generate new tokens
    const tokens = generateTokens(decoded.userId);
    
    return tokens;
  } catch (error) {
    logger.error('Error refreshing tokens:', error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw new AppError('Invalid or expired token', 'INVALID_TOKEN', 401);
    }
    
    if (error instanceof AppError) {
      throw error;
    }
    
    throw new AppError('Failed to refresh tokens', 'TOKEN_REFRESH_FAILED', 500);
  }
}

export async function getUserProfile(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      throw new AppError('User not found', 'NOT_FOUND', 404);
    }
    
    // Return user without password hash
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      preferences: user.preferences
    };
  } catch (error) {
    logger.error('Error getting user profile:', error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to get user profile', 'PROFILE_FETCH_FAILED', 500);
  }
}

export async function updateUserProfile(userId: string, profileData: any) {
  try {
    // Ensure user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!existingUser) {
      throw new AppError('User not found', 'NOT_FOUND', 404);
    }
    
    // Update user
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: profileData.firstName ?? existingUser.firstName,
        lastName: profileData.lastName ?? existingUser.lastName
      }
    });
    
    // Return updated user without password hash
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      preferences: user.preferences
    };
  } catch (error) {
    logger.error('Error updating user profile:', error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to update user profile', 'PROFILE_UPDATE_FAILED', 500);
  }
}

export async function updateUserPreferences(userId: string, preferences: any) {
  try {
    // Ensure user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!existingUser) {
      throw new AppError('User not found', 'NOT_FOUND', 404);
    }
    
    // Update user preferences
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        preferences: preferences
      }
    });
    
    // Return updated user without password hash
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      preferences: user.preferences
    };
  } catch (error) {
    logger.error('Error updating user preferences:', error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to update user preferences', 'PREFERENCES_UPDATE_FAILED', 500);
  }
}

export async function logoutUser(refreshToken: string) {
  // In a real system, you would invalidate the refresh token
  // This might involve adding it to a blacklist or removing it from a whitelist
  
  // For MVP, we'll just return a success response
  // In a production environment, you would implement token invalidation
  
  return true;
}