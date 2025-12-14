import prisma from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { body, validationResult } from 'express-validator';

export const register = async (req, res, next) => {
  try {
    // Validation
    await Promise.all([
      body('email').isEmail().normalizeEmail().run(req),
      body('password').isLength({ min: 6 }).run(req),
      body('fullName').notEmpty().trim().run(req),
      body('role').optional().isIn(['STUDENT', 'LECTURER', 'ADMIN', 'DEPT_HEAD']).run(req),
    ]);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, fullName, role = 'STUDENT', studentId, department } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        role,
        studentId,
        department,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        studentId: true,
        department: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const token = generateToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id });

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    // Check password (skip if OAuth user)
    if (user.password) {
      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    } else {
      return res.status(401).json({ error: 'Please use OAuth login for this account' });
    }

    // Generate tokens
    const token = generateToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id });

    // Return user data (excluding password)
    const { password: _, ...userData } = user;

    res.json({
      message: 'Login successful',
      user: userData,
      token,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

export const oauthCallback = async (req, res) => {
  try {
    const user = req.user;

    // Generate tokens
    const token = generateToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id });

    // Redirect to frontend with tokens
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/callback?token=${token}&refreshToken=${refreshToken}`);
  } catch (error) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/login?error=oauth_failed`);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const decoded = verifyRefreshToken(refreshToken);

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Generate new tokens
    const newToken = generateToken({ userId: user.id, email: user.email, role: user.role });
    const newRefreshToken = generateRefreshToken({ userId: user.id });

    res.json({
      token: newToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res) => {
  res.json({ user: req.user });
};

export const logout = async (req, res) => {
  // In a stateless JWT system, logout is handled client-side
  // But we can add token blacklisting here if needed
  res.json({ message: 'Logged out successfully' });
};

