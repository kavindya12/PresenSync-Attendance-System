import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import * as leaveController from '../controllers/leaveController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create leave request (Student)
router.post('/', authorize('STUDENT'), leaveController.createLeave);

// Get all leave requests
router.get('/', leaveController.getLeaves);

// Get leave by ID
router.get('/:id', leaveController.getLeaveById);

// Approve leave (Lecturer/Admin)
router.put('/:id/approve', authorize('LECTURER', 'ADMIN', 'DEPT_HEAD'), leaveController.approveLeave);

// Reject leave
router.put('/:id/reject', authorize('LECTURER', 'ADMIN', 'DEPT_HEAD'), leaveController.rejectLeave);

// Cancel leave (Student)
router.delete('/:id', authorize('STUDENT'), leaveController.cancelLeave);

export default router;

