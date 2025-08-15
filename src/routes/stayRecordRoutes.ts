import { Router } from 'express';
import { authLimiter } from '../middleware/rateLimit.js';
import { authenticate } from '../middleware/authMiddleware.js';
import {
	createStayRecordController,
	getStayRecordByIdController,
	getStayRecordsController,
	updateStayRecordController,
	checkOutGuestController,
	deleteStayRecordController,
	getStayRecordStatsController,
} from '../controllers/stayRecordController.js';

const router = Router();

// All stay record routes require authentication
router.use(authenticate);

// Stay record CRUD operations
router.post('/stay-records', authLimiter, createStayRecordController);
router.get('/stay-records', authLimiter, getStayRecordsController);
router.get('/stay-records/:id', authLimiter, getStayRecordByIdController);
router.put('/stay-records/:id', authLimiter, updateStayRecordController);
router.delete('/stay-records/:id', authLimiter, deleteStayRecordController);

// Stay record management
router.post('/stay-records/:id/checkout', authLimiter, checkOutGuestController);
router.get('/stay-records/stats/overview', authLimiter, getStayRecordStatsController);

export default router;
