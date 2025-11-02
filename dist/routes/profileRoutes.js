import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { meController, updateMeController, changePasswordController, uploadAvatarController, requestPasswordResetController, confirmPasswordResetController, sendVerificationController, verifyEmailController, } from '../controllers/profileController.js';
const router = Router();
router.get('/me', authenticate, meController);
router.put('/me', authenticate, updateMeController);
router.post('/me/change-password', authenticate, changePasswordController);
router.post('/me/avatar', authenticate, uploadAvatarController);
router.post('/me/reset-password', requestPasswordResetController);
router.post('/me/confirm-reset', confirmPasswordResetController);
router.post('/me/send-verification', authenticate, sendVerificationController);
router.post('/me/verify-email', verifyEmailController);
export default router;
//# sourceMappingURL=profileRoutes.js.map