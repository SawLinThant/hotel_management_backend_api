import { Router } from 'express';
import { authLimiter } from '../middleware/rateLimit.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { createBookingController, getBookingByIdController, getBookingsController, updateBookingController, cancelBookingController, deleteBookingController, getBookingStatsController, } from '../controllers/bookingController.js';
const router = Router();
// All booking routes require authentication
router.use(authenticate);
// Booking CRUD operations
router.post('/bookings', authLimiter, createBookingController);
router.get('/bookings', authLimiter, getBookingsController);
router.get('/bookings/:id', authLimiter, getBookingByIdController);
router.put('/bookings/:id', authLimiter, updateBookingController);
router.delete('/bookings/:id', authLimiter, deleteBookingController);
// Booking management
router.post('/bookings/:id/cancel', authLimiter, cancelBookingController);
router.get('/bookings/stats/overview', authLimiter, getBookingStatsController);
export default router;
//# sourceMappingURL=bookingRoutes.js.map