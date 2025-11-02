import { Router } from 'express';
import { authenticate, requireRoles } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { uploadImages } from '../middleware/uploadMiddleware.js';
import { getRoomsController, getRoomController, createRoomController, updateRoomController, deleteRoomController, checkAvailabilityController, bulkUpdateStatusController, uploadImagesController, deleteImageController, getRoomStatsController, } from '../controllers/roomController.js';
const router = Router();
// Public routes (with rate limiting but no authentication required)
router.get('/rooms', authLimiter, getRoomsController);
router.get('/rooms/:id', authLimiter, getRoomController);
// Authenticated routes for all users
router.get('/rooms/availability', authLimiter, authenticate, requireRoles(['admin', 'staff', 'guest']), checkAvailabilityController);
// Admin and Staff routes
router.post('/rooms', authLimiter, authenticate, requireRoles(['admin', 'staff']), uploadImages, createRoomController);
router.put('/rooms/:id', authLimiter, authenticate, requireRoles(['admin', 'staff']), uploadImages, updateRoomController);
router.delete('/rooms/:id', authLimiter, authenticate, requireRoles(['admin', 'staff']), deleteRoomController);
router.patch('/rooms/bulk-status', authLimiter, authenticate, requireRoles(['admin', 'staff']), bulkUpdateStatusController);
router.post('/rooms/:id/images', authLimiter, authenticate, requireRoles(['admin', 'staff']), uploadImages, uploadImagesController);
router.delete('/rooms/:id/images', authLimiter, authenticate, requireRoles(['admin', 'staff']), deleteImageController);
// Admin-only routes
router.get('/rooms/stats/overview', authLimiter, authenticate, requireRoles(['admin']), getRoomStatsController);
export default router;
//# sourceMappingURL=roomRoutes.js.map