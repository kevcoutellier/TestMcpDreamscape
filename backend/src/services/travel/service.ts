// src/services/travel/service.ts
import { PrismaClient } from '@prisma/client';
import { AppError } from '../../utils/errors';
import logger from '../../utils/Logger';

const prisma = new PrismaClient();

type BookingInput = {
  type: 'FLIGHT' | 'ACCOMMODATION' | 'ACTIVITY';
  details: any;
};

export async function getUserBookings(userId: string) {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId }
    });
    
    return bookings;
  } catch (error) {
    logger.error('Error getting user bookings:', error);
    throw new AppError(
      'Failed to retrieve bookings', 
      'DATABASE_ERROR', 
      500
    );
  }
}

export async function createBooking(userId: string, bookingData: BookingInput) {
  try {
    // Validate booking data
    if (!['FLIGHT', 'ACCOMMODATION', 'ACTIVITY'].includes(bookingData.type)) {
      throw new AppError(
        'Invalid booking type', 
        'VALIDATION_ERROR', 
        400
      );
    }
    
    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId,
        type: bookingData.type,
        status: 'PENDING',
        details: bookingData.details
      }
    });
    
    // In a real system, you would integrate with payment processors here
    // and update the booking status accordingly
    
    // For simplicity, we'll just confirm the booking directly
    const confirmedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: { status: 'CONFIRMED' }
    });
    
    return confirmedBooking;
  } catch (error) {
    logger.error('Error creating booking:', error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      'Failed to create booking', 
      'DATABASE_ERROR', 
      500
    );
  }
}

export async function getBookingDetails(userId: string, bookingId: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });
    
    if (!booking) {
      throw new AppError(
        'Booking not found', 
        'NOT_FOUND', 
        404
      );
    }
    
    // Ensure the user can only access their own bookings
    if (booking.userId !== userId) {
      throw new AppError(
        'Unauthorized access to booking', 
        'FORBIDDEN', 
        403
      );
    }
    
    return booking;
  } catch (error) {
    logger.error('Error getting booking details:', error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      'Failed to retrieve booking details', 
      'DATABASE_ERROR', 
      500
    );
  }
}

export async function cancelBooking(userId: string, bookingId: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });
    
    if (!booking) {
      throw new AppError(
        'Booking not found', 
        'NOT_FOUND', 
        404
      );
    }
    
    // Ensure the user can only cancel their own bookings
    if (booking.userId !== userId) {
      throw new AppError(
        'Unauthorized access to booking', 
        'FORBIDDEN', 
        403
      );
    }
    
    // Check if booking can be cancelled
    if (booking.status === 'CANCELLED') {
      throw new AppError(
        'Booking is already cancelled', 
        'INVALID_OPERATION', 
        400
      );
    }
    
    // In a real system, you might have more complex cancellation rules
    // based on the booking type, time until the booking, etc.
    
    // Update booking status
    const cancelledBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' }
    });
    
    return cancelledBooking;
  } catch (error) {
    logger.error('Error cancelling booking:', error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      'Failed to cancel booking', 
      'DATABASE_ERROR', 
      500
    );
  }
}