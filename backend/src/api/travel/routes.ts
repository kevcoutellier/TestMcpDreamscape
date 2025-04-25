// src/api/travel/routes.ts
import { Router } from 'express';
import { body, query, param } from 'express-validator';
import * as travelController from './controllers';
import validate from '../../middleware/validate';
import authenticate from '../../middleware/authenticate';

const router = Router();

// Validation rules for flight search
const flightSearchValidation = [
  query('origin').isLength({ min: 3, max: 3 }).withMessage('Origin must be a 3-letter IATA code'),
  query('destination').isLength({ min: 3, max: 3 }).withMessage('Destination must be a 3-letter IATA code'),
  query('departureDate').isISO8601().withMessage('Departure date must be valid ISO format'),
  query('returnDate').optional().isISO8601().withMessage('Return date must be valid ISO format'),
  query('adults').optional().isInt({ min: 1 }).withMessage('Adults must be a positive integer')
];

// Validation rules for hotel search
const hotelSearchValidation = [
  query('cityCode').isLength({ min: 3 }).withMessage('City code is required'),
  query('checkInDate').isISO8601().withMessage('Check-in date must be valid ISO format'),
  query('checkOutDate').isISO8601().withMessage('Check-out date must be valid ISO format'),
  query('guests').optional().isInt({ min: 1 }).withMessage('Guests must be a positive integer')
];

// Validation rules for activity search
const activitySearchValidation = [
  query('cityCode').isLength({ min: 3 }).withMessage('City code is required'),
  query('date').isISO8601().withMessage('Date must be valid ISO format')
];

// Routes
router.get('/flights', flightSearchValidation, validate, travelController.searchFlights);
router.get('/hotels', hotelSearchValidation, validate, travelController.searchHotels);
router.get('/activities', activitySearchValidation, validate, travelController.searchActivities);

// These routes require authentication
router.get('/bookings', authenticate, travelController.getUserBookings);
router.post('/bookings', authenticate, travelController.createBooking);
router.get('/bookings/:bookingId', authenticate, travelController.getBookingDetails);
router.delete('/bookings/:bookingId', authenticate, travelController.cancelBooking);

export default router;