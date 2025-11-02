import { Router } from 'express';
import { authenticate, requireRoles } from '../middleware/authMiddleware.js';
import {
  getUsersController,
  getUserController,
  createUserController,
  updateUserController,
  deleteUserController,
  bulkUpdateUsersController,
  bulkDeleteUsersController,
  userStatsController,
} from '../controllers/userController.js';

const router = Router();

router.get('/users', authenticate, requireRoles(['admin', 'staff']), getUsersController);
router.get('/users/stats', authenticate, requireRoles(['admin', 'staff']), userStatsController);
router.get('/users/:id', authenticate, requireRoles(['admin', 'staff']), getUserController);
router.post('/users', authenticate, requireRoles(['admin', 'staff']), createUserController);
router.put('/users/:id', authenticate, requireRoles(['admin', 'staff']), updateUserController);
router.delete('/users/:id', authenticate, requireRoles(['admin', 'staff']), deleteUserController);

router.patch('/users/bulk-update', authenticate, requireRoles(['admin', 'staff']), bulkUpdateUsersController);
router.delete('/users/bulk-delete', authenticate, requireRoles(['admin', 'staff']), bulkDeleteUsersController);

export default router;


