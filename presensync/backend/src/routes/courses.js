import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import * as courseController from '../controllers/courseController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all courses (filtered by role)
router.get('/', courseController.getAllCourses);

// Get course by ID
router.get('/:id', courseController.getCourseById);

// Create course (Lecturer/Admin)
router.post('/', authorize('LECTURER', 'ADMIN', 'DEPT_HEAD'), courseController.createCourse);

// Update course (Lecturer/Admin)
router.put('/:id', authorize('LECTURER', 'ADMIN', 'DEPT_HEAD'), courseController.updateCourse);

// Delete course (Admin only)
router.delete('/:id', authorize('ADMIN'), courseController.deleteCourse);

// Enroll students (bulk)
router.post('/:id/enroll', authorize('LECTURER', 'ADMIN', 'DEPT_HEAD'), courseController.enrollStudents);

// Get enrolled students
router.get('/:id/students', courseController.getEnrolledStudents);

export default router;

