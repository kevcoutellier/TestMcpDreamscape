// src/services/auth/service.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../../utils/errors';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_EXPIRES_IN = '1h';

type RegisterUserInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export const registerUser = async (userData: RegisterUserInput) => {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: userData.email }
  });
  
  if (existingUser) {
    throw new AppError('User with this email already exists', 'USER_EXISTS', 400);
  }
  
  // Hash password
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(userData.password, saltRounds);
  
  // Create user
  const user = await prisma.user.create({
    data: {
      email: userData.email,
      passwordHash,
      firstName: userData.firstName,
      lastName: userData.lastName,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      createdAt: true,
    }
  });
  
  // Generate token
  const token = jwt.sign(
    { userId: user.id },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
  
  // Create session
  await prisma.session.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 3600000), // 1 hour
    }
  });
  
  return { user, token };
};

export const loginUser = async (email: string, password: string) => {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });
  
  if (!user) {
    throw new AppError('Invalid credentials', 'INVALID_CREDENTIALS', 401);
  }
  
  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 'INVALID_CREDENTIALS', 401);
  }
  
  // Generate token
  const token = jwt.sign(
    { userId: user.id },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
  
  // Create session
  await prisma.session.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 3600000), // 1 hour
    }
  });
  
  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    token
  };
};

export const refreshUserToken = async (refreshToken: string) => {
  try {
    // Verify token
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as { userId: string };
    
    // Find session
    const session = await prisma.session.findFirst({
      where: {
        userId: decoded.userId,
        token: refreshToken,
        expiresAt: {
          gt: new Date()
        }
      }
    });
    
    if (!session) {
      throw new AppError('Invalid or expired token', 'INVALID_TOKEN', 401);
    }
    
    // Generate new token
    const newToken = jwt.sign(
      { userId: decoded.userId },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    // Update session
    await prisma.session.update({
      where: { id: session.id },
      data: {
        token: newToken,
        expiresAt: new Date(Date.now() + 3600000), // 1 hour
      }
    });
    
    return { token: newToken };
  } catch (error) {
    throw new AppError('Invalid or expired token', 'INVALID_TOKEN', 401);
  }
};

export const logoutUser = async (userId: string) => {
  // Delete all sessions for user
  await prisma.session.deleteMany({
    where: { userId }
  });
  
  return true;
};

export const validateToken = async (token: string) => {
  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    // Find session
    const session = await prisma.session.findFirst({
      where: {
        userId: decoded.userId,
        token,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    });
    
    if (!session) {
      throw new AppError('Invalid or expired token', 'INVALID_TOKEN', 401);
    }
    
    return { user: session.user };
  } catch (error) {
    throw new AppError('Invalid or expired token', 'INVALID_TOKEN', 401);
  }
};