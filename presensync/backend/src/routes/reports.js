import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import * as reportController from '../controllers/reportController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Generate PDF report
router.get('/attendance/pdf', authorize('LECTURER', 'ADMIN', 'DEPT_HEAD'), reportController.generatePDFReport);

// Generate Excel report
router.get('/attendance/excel', authorize('LECTURER', 'ADMIN', 'DEPT_HEAD'), reportController.generateExcelReport);

// Get analytics data
router.get('/analytics', reportController.getAnalytics);

export default router;

