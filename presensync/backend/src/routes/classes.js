import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import * as classController from '../controllers/classController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all classes
router.get('/', classController.getAllClasses);

// Get class by ID
router.get('/:id', classController.getClassById);

// Create class (Lecturer/Admin)
router.post('/', authorize('LECTURER', 'ADMIN', 'DEPT_HEAD'), classController.createClass);

// Update class
router.put('/:id', authorize('LECTURER', 'ADMIN', 'DEPT_HEAD'), classController.updateClass);

// Delete class
router.delete('/:id', authorize('LECTURER', 'ADMIN', 'DEPT_HEAD'), classController.deleteClass);

// Generate QR code for class
router.post('/:id/generate-qr', authorize('LECTURER', 'ADMIN', 'DEPT_HEAD'), classController.generateQR);

// Get QR code
router.get('/:id/qr', classController.getQR);

export default router;

