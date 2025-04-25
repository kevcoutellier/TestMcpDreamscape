// src/api/travel/controllers.ts
import { Request, Response, NextFunction } from 'express';
import * as travelService from '../../services/travel/service';
import * as amadeusService from '../../services/amadeus/service';
import logger from '../../utils/Logger';

export const searchFlights = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      origin, 
      destination, 
      departureDate, 
      returnDate,
      adults = 1 
    } = req.query as {
      origin: string;
      destination: string;
      departureDate: string;
      returnDate?: string;
      adults?: number;
    };
    
    const flights = await amadeusService.searchFlights(
      origin,
      destination,
      departureDate,
      returnDate
    );
    
    return res.status(200).json({
      success: true,
      data: flights.data
    });
  } catch (error) {
    logger.error('Error in searchFlights controller:', error);
    next(error);
  }
};

export const searchHotels = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      cityCode, 
      checkInDate, 
      checkOutDate,
      guests = 1 
    } = req.query as {
      cityCode: string;
      checkInDate: string;
      checkOutDate: string;
      guests?: number;
    };
    
    const hotels = await amadeusService.searchHotels(
      cityCode,
      checkInDate,
      checkOutDate
    );
    
    return res.status(200).json({
      success: true,
      data: hotels.data
    });
  } catch (error) {
    logger.error('Error in searchHotels controller:', error);
    next(error);
  }
};

export const searchActivities = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      cityCode, 
      date
    } = req.query as {
      cityCode: string;
      date: string;
    };
    
    const activities = await amadeusService.searchActivities(
      cityCode,
      date
    );
    
    return res.status(200).json({
      success: true,
      data: activities.data
    });
  } catch (error) {
    logger.error('Error in searchActivities controller:', error);
    next(error);
  }
};

export const getUserBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    
    const bookings = await travelService.getUserBookings(userId);
    
    return res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    logger.error('Error in getUserBookings controller:', error);
    next(error);
  }
};

export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const bookingData = req.body;
    
    const booking = await travelService.createBooking(userId, bookingData);
    
    return res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    logger.error('Error in createBooking controller:', error);
    next(error);
  }
};

export const getBookingDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const { bookingId } = req.params;
    
    const booking = await travelService.getBookingDetails(userId, bookingId);
    
    return res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    logger.error('Error in getBookingDetails controller:', error);
    next(error);
  }
};

export const cancelBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const { bookingId } = req.params;
    
    await travelService.cancelBooking(userId, bookingId);
    
    return res.status(200).json({
      success: true,
      data: { message: 'Booking cancelled successfully' }
    });
  } catch (error) {
    logger.error('Error in cancelBooking controller:', error);
    next(error);
  }
};