import { Router } from 'express';
import { authLimiter } from '../middleware/rateLimit.js';
import {
	requestPasswordResetController,
	validateResetTokenController,
	resetPasswordController,
} from '../controllers/passwordResetController.js';

const router = Router();

// Password reset endpoints
router.post('/password-reset/request', authLimiter, requestPasswordResetController);
router.post('/password-reset/validate', authLimiter, validateResetTokenController);
router.post('/password-reset/reset', authLimiter, resetPasswordController);

export default router;
