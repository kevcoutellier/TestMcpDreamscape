// src/services/ai/recommendationService.ts
import { PrismaClient } from '@prisma/client';
import logger from '../../utils/Logger';
import { AppError } from '../../utils/errors';
import Redis from 'ioredis';

const prisma = new PrismaClient();
const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const CACHE_TTL = 60 * 30; // 30 minutes

// Basic recommendation algorithm for MVP
export async function getRecommendations(userId: string, type: 'DESTINATION' | 'ACTIVITY', count: number = 5) {
  try {
    // Check if recommendations are cached
    const cacheKey = `recommendations:${userId}:${type}:${count}`;
    const cachedRecommendations = await redisClient.get(cacheKey);
    
    if (cachedRecommendations) {
      logger.debug(`Cache hit for recommendations: ${cacheKey}`);
      return JSON.parse(cachedRecommendations);
    }
    
    // Get user preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true }
    });
    
    if (!user) {
      throw new AppError('User not found', 'NOT_FOUND', 404);
    }
    
    // In a real system, this would use more sophisticated algorithms
    // For MVP, we'll use a simple tag-based matching approach
    
    let recommendations;
    
    if (type === 'DESTINATION') {
      recommendations = await getDestinationRecommendations(user.preferences, count);
    } else {
      recommendations = await getActivityRecommendations(user.preferences, count);
    }
    
    // Cache the recommendations
    await redisClient.set(cacheKey, JSON.stringify(recommendations), 'EX', CACHE_TTL);
    
    return recommendations;
  } catch (error) {
    logger.error('Error getting recommendations:', error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to generate recommendations', 'AI_SERVICE_ERROR', 500);
  }
}

async function getDestinationRecommendations(preferences: any, count: number) {
  // Extract user preferences
  const userTravelTypes = preferences?.travelTypes || [];
  const budgetMax = preferences?.budgetRange?.max || 5000;
  
  // For MVP, we're just doing a simple query based on tags
  // In a real system, this would use more sophisticated techniques
  const destinations = await prisma.destination.findMany({
    where: {
      OR: [
        // Match by travel types (converted to tags)
        { tags: { hasSome: userTravelTypes.map((type: string) => type.toLowerCase()) } },
        // Include some popular destinations for diversity
        { rating: { gte: 4.5 } }
      ]
    },
    take: count * 2, // Fetch more than needed for diversity
  });
  
  // Simple scoring and sorting
  const scoredDestinations = destinations.map(destination => {
    let score = 0;
    
    // Score based on tag matches
    const matchingTags = destination.tags.filter((tag: string) => 
      userTravelTypes.map((type: string) => type.toLowerCase()).includes(tag)
    );
    score += matchingTags.length * 0.2;
    
    // Score based on rating
    score += destination.rating * 0.1;
    
    // Add some randomness for diversity
    score += Math.random() * 0.1;
    
    return {
      ...destination,
      score,
      relevanceFactors: [
        { factor: 'PREFERENCE_MATCH', weight: matchingTags.length > 0 ? 0.7 : 0 },
        { factor: 'POPULARITY', weight: 0.2 },
        { factor: 'DIVERSITY', weight: 0.1 }
      ]
    };
  });
  
  // Sort by score and take requested count
  return scoredDestinations
    .sort((a, b) => b.score - a.score)
    .slice(0, count);
}

async function getActivityRecommendations(preferences: any, count: number) {
  // Extract user preferences
  const userTravelTypes = preferences?.travelTypes || [];
  const budgetMax = preferences?.budgetRange?.max || 5000;
  
  // For MVP, simple query based on tags and price
  const activities = await prisma.activity.findMany({
    where: {
      OR: [
        // Match by tags derived from travel types
        { tags: { hasSome: userTravelTypes.map((type: string) => type.toLowerCase()) } },
        // Include some popular activities
        { vrAvailable: true } // Promote VR-enabled activities
      ],
      // Stay within budget
      price: {
        path: '$.amount',
        lte: budgetMax / 10 // Assuming activities are typically 1/10 of total budget
      }
    },
    take: count * 2, // Fetch more than needed for diversity
  });
  
  // Simple scoring and sorting
  const scoredActivities = activities.map(activity => {
    let score = 0;
    
    // Score based on tag matches
    const matchingTags = activity.tags.filter((tag: string) => 
      userTravelTypes.map((type: string) => type.toLowerCase()).includes(tag)
    );
    score += matchingTags.length * 0.2;
    
    // Bonus for VR-enabled activities
    if (activity.vrAvailable) {
      score += 0.1;
    }
    
    // Add some randomness for diversity
    score += Math.random() * 0.1;
    
    return {
      ...activity,
      score,
      relevanceFactors: [
        { factor: 'PREFERENCE_MATCH', weight: matchingTags.length > 0 ? 0.7 : 0 },
        { factor: 'VR_EXPERIENCE', weight: activity.vrAvailable ? 0.2 : 0 },
        { factor: 'DIVERSITY', weight: 0.1 }
      ]
    };
  });
  
  // Sort by score and take requested count
  return scoredActivities
    .sort((a, b) => b.score - a.score)
    .slice(0, count);
}