import { Router } from 'express';
import { authLimiter } from '../middleware/rateLimit.js';
import { authenticate, requireRoles } from '../middleware/authMiddleware.js';
import { createRoomController, getRoomByIdController, getRoomsController, updateRoomController, deleteRoomController, getRoomStatsController, } from '../controllers/roomController.js';
const router = Router();
// Public routes (no authentication required)
router.get('/rooms', authLimiter, getRoomsController);
router.get('/rooms/:id', authLimiter, getRoomByIdController);
// Admin-only routes (require authentication and admin role)
router.post('/rooms', authLimiter, authenticate, requireRoles(['admin']), createRoomController);
router.put('/rooms/:id', authLimiter, authenticate, requireRoles(['admin']), updateRoomController);
router.delete('/rooms/:id', authLimiter, authenticate, requireRoles(['admin']), deleteRoomController);
router.get('/rooms/stats/overview', authLimiter, authenticate, requireRoles(['admin']), getRoomStatsController);
export default router;
//# sourceMappingURL=roomRoutes.js.map