import { Router } from 'express';
import { authenticate, requireRoles } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimit.js';
import {
  getBookingsController,
  getBookingByIdController,
  createBookingController,
  updateBookingController,
  cancelBookingController,
  deleteBookingController,
  checkInController,
  checkOutController,
  statsController,
  getBookingStatsController,
  arrivalsController,
  departuresController,
  sendConfirmationController,
  paymentController,
  invoiceController,
} from '../controllers/bookingController.js';

const router = Router();

// Booking CRUD operations (require authentication)
router.post('/bookings', authLimiter, authenticate, requireRoles(['admin', 'staff', 'guest']), createBookingController);
router.get('/bookings', authLimiter, authenticate, requireRoles(['admin', 'staff', 'guest']), getBookingsController);
router.get('/bookings/:id', authLimiter, authenticate, requireRoles(['admin', 'staff', 'guest']), getBookingByIdController);
router.put('/bookings/:id', authLimiter, authenticate, requireRoles(['admin', 'staff']), updateBookingController);
router.delete('/bookings/:id', authLimiter, authenticate, requireRoles(['admin', 'staff']), deleteBookingController);

// Booking management operations
router.post('/bookings/:id/cancel', authLimiter, authenticate, requireRoles(['admin', 'staff']), cancelBookingController);
router.post('/bookings/:id/check-in', authLimiter, authenticate, requireRoles(['admin', 'staff']), checkInController);
router.post('/bookings/:id/check-out', authLimiter, authenticate, requireRoles(['admin', 'staff']), checkOutController);

// Booking statistics and reports
router.get('/bookings/stats', authLimiter, authenticate, requireRoles(['admin', 'staff']), statsController);
router.get('/bookings/stats/overview', authLimiter, authenticate, requireRoles(['admin', 'staff']), getBookingStatsController);
router.get('/bookings/arrivals', authLimiter, authenticate, requireRoles(['admin', 'staff']), arrivalsController);
router.get('/bookings/departures', authLimiter, authenticate, requireRoles(['admin', 'staff']), departuresController);

// Booking notifications and payments
router.post('/bookings/:id/send-confirmation', authLimiter, authenticate, requireRoles(['admin', 'staff']), sendConfirmationController);
router.post('/bookings/:id/payment', authLimiter, authenticate, requireRoles(['admin', 'staff']), paymentController);
router.get('/bookings/:id/invoice', authLimiter, authenticate, requireRoles(['admin', 'staff']), invoiceController);

export default router;
