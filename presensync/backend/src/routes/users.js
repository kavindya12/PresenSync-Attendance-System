import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import * as userController from '../controllers/userController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get current user profile
router.get('/me', userController.getMe);

// Update own profile
router.put('/me', userController.updateMe);

// Admin routes
router.get('/', authorize('ADMIN', 'DEPT_HEAD'), userController.getAllUsers);
router.get('/:id', authorize('ADMIN', 'DEPT_HEAD'), userController.getUserById);
router.put('/:id', authorize('ADMIN', 'DEPT_HEAD'), userController.updateUser);
router.delete('/:id', authorize('ADMIN'), userController.deleteUser);

export default router;

