import express from 'express';
import passport from '../config/passport.js';
import { authenticate } from '../middleware/auth.js';
import * as authController from '../controllers/authController.js';

const router = express.Router();

// Email/password registration
router.post('/register', authController.register);

// Email/password login
router.post('/login', authController.login);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
  passport.authenticate('google', { session: false }),
  authController.oauthCallback
);

// Microsoft OAuth
router.get('/microsoft', passport.authenticate('microsoft', { scope: ['user.read'] }));
router.get('/microsoft/callback',
  passport.authenticate('microsoft', { session: false }),
  authController.oauthCallback
);

// Refresh token
router.post('/refresh', authController.refreshToken);

// Get current user
router.get('/me', authenticate, authController.getMe);

// Logout
router.post('/logout', authenticate, authController.logout);

export default router;

