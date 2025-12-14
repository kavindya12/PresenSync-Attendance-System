import express from 'express';
import { authenticate } from '../middleware/auth.js';
import * as gamificationController from '../controllers/gamificationController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get streak for a course
router.get('/streak/:courseId', gamificationController.getStreak);

// Get all achievements for a student
router.get('/achievements', gamificationController.getAchievements);

// Get achievements for a specific course
router.get('/achievements/:courseId', gamificationController.getCourseAchievements);

export default router;

