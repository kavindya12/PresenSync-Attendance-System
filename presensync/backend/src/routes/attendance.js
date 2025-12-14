import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import * as attendanceController from '../controllers/attendanceController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Mark attendance
router.post('/mark', attendanceController.markAttendance);

// Get attendance records
router.get('/', attendanceController.getAttendanceRecords);

// Get attendance for specific class
router.get('/class/:classId', attendanceController.getClassAttendance);

// Get student attendance history
router.get('/student/:studentId', attendanceController.getStudentAttendance);

// Manual override (Lecturer/Admin)
router.put('/:id', authorize('LECTURER', 'ADMIN', 'DEPT_HEAD'), attendanceController.updateAttendance);

// Get attendance statistics
router.get('/stats', attendanceController.getAttendanceStats);

export default router;

