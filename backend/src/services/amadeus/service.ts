// src/services/amadeus/service.ts
import logger from '../../utils/Logger';
import { AppError } from '../../utils/errors';
import Redis from 'ioredis';

// Normalement, vous utiliseriez le SDK officiel d'Amadeus, mais pour cet exemple, nous simulons une API
// import { Amadeus } from 'amadeus';

// Configuration Redis pour le cache
const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const CACHE_TTL = 60 * 15; // 15 minutes en secondes

// Simuler le SDK Amadeus pour l'exemple
class MockAmadeusSDK {
  async searchFlights(origin: string, destination: string, departureDate: string, returnDate?: string) {
    logger.info(`Searching flights from ${origin} to ${destination}`);
    // Simuler un délai de requête API
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Retourner des données simulées
    return {
      data: [
        {
          id: 'flight1',
          origin: origin,
          destination: destination,
          departureDate: departureDate,
          returnDate: returnDate,
          price: {
            total: '350.42',
            currency: 'EUR'
          },
          availableSeats: 12
        },
        {
          id: 'flight2',
          origin: origin,
          destination: destination,
          departureDate: departureDate,
          returnDate: returnDate,
          price: {
            total: '420.10',
            currency: 'EUR'
          },
          availableSeats: 5
        }
      ]
    };
  }
  
  async searchHotels(cityCode: string, checkInDate: string, checkOutDate: string) {
    logger.info(`Searching hotels in ${cityCode}`);
    // Simuler un délai de requête API
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Retourner des données simulées
    return {
      data: [
        {
          hotelId: 'hotel1',
          name: 'Grand Hotel',
          cityCode: cityCode,
          rating: 4.5,
          price: {
            total: '210.00',
            currency: 'EUR'
          },
          amenities: ['WIFI', 'POOL', 'SPA']
        },
        {
          hotelId: 'hotel2',
          name: 'Boutique Residence',
          cityCode: cityCode,
          rating: 4.2,
          price: {
            total: '175.50',
            currency: 'EUR'
          },
          amenities: ['WIFI', 'BREAKFAST']
        }
      ]
    };
  }
  
  async searchActivities(cityCode: string, date: string) {
    logger.info(`Searching activities in ${cityCode}`);
    // Simuler un délai de requête API
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Retourner des données simulées
    return {
      data: [
        {
          activityId: 'activity1',
          name: 'City Tour',
          cityCode: cityCode,
          duration: '3:00',
          price: {
            amount: '45.00',
            currency: 'EUR'
          },
          rating: 4.7,
          bookingDate: date
        },
        {
          activityId: 'activity2',
          name: 'Museum Visit',
          cityCode: cityCode,
          duration: '2:30',
          price: {
            amount: '22.50',
            currency: 'EUR'
          },
          rating: 4.3,
          bookingDate: date
        }
      ]
    };
  }
}

// Création d'une instance mock du SDK
const amadeus = new MockAmadeusSDK();

// Fonction utilitaire pour gérer le cache
async function withCache<T>(key: string, ttl: number, fetchData: () => Promise<T>): Promise<T> {
  try {
    // Vérifier dans le cache
    const cachedData = await redisClient.get(key);
    
    if (cachedData) {
      logger.debug(`Cache hit for key: ${key}`);
      return JSON.parse(cachedData);
    }
    
    // Si pas en cache, récupérer les données
    logger.debug(`Cache miss for key: ${key}`);
    const data = await fetchData();
    
    // Stocker dans le cache
    await redisClient.set(key, JSON.stringify(data), 'EX', ttl);
    
    return data;
  } catch (error) {
    logger.error(`Cache error for key ${key}:`, error);
    return fetchData();
  }
}

export async function searchFlights(
  origin: string,
  destination: string,
  departureDate: string,
  returnDate?: string
) {
  try {
    const cacheKey = `flights:${origin}:${destination}:${departureDate}:${returnDate || 'one-way'}`;
    
    return await withCache(cacheKey, CACHE_TTL, () => 
      amadeus.searchFlights(origin, destination, departureDate, returnDate)
    );
  } catch (error) {
    logger.error('Error searching flights:', error);
    throw new AppError(
      'Failed to search flights', 
      'AMADEUS_API_ERROR', 
      500
    );
  }
}

export async function searchHotels(
  cityCode: string,
  checkInDate: string,
  checkOutDate: string
) {
  try {
    const cacheKey = `hotels:${cityCode}:${checkInDate}:${checkOutDate}`;
    
    return await withCache(cacheKey, CACHE_TTL, () => 
      amadeus.searchHotels(cityCode, checkInDate, checkOutDate)
    );
  } catch (error) {
    logger.error('Error searching hotels:', error);
    throw new AppError(
      'Failed to search hotels', 
      'AMADEUS_API_ERROR', 
      500
    );
  }
}

export async function searchActivities(
  cityCode: string,
  date: string
) {
  try {
    const cacheKey = `activities:${cityCode}:${date}`;
    
    return await withCache(cacheKey, CACHE_TTL, () => 
      amadeus.searchActivities(cityCode, date)
    );
  } catch (error) {
    logger.error('Error searching activities:', error);
    throw new AppError(
      'Failed to search activities', 
      'AMADEUS_API_ERROR', 
      500
    );
  }
}