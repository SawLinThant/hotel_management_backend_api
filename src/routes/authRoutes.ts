import { Router } from 'express';
import { authLimiter } from '../middleware/rateLimit.js';
import { authenticate } from '../middleware/authMiddleware.js';
import {
    loginGuestController,
    loginStaffController,
    registerGuestController,
    registerStaffController,
    loginController,
    registerController,
    refreshTokenController,
    logoutController,
    logoutAllSessionsController,
} from '../controllers/authController.js';

const router = Router();

router.post('/auth/guest/register', authLimiter, registerGuestController);
router.post('/auth/guest/login', authLimiter, loginGuestController);
router.post('/auth/staff/register', authLimiter, registerStaffController);
router.post('/auth/staff/login', authLimiter, loginStaffController);

// Optional generic endpoints
router.post('/auth/register', authLimiter, registerController);
router.post('/auth/login', authLimiter, loginController);

// Token management endpoints
router.post('/auth/refresh', authLimiter, refreshTokenController);
router.post('/auth/logout', authLimiter, logoutController);
router.post('/auth/logout-all', authLimiter, authenticate, logoutAllSessionsController);

export default router;

