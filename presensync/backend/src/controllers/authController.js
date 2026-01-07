import { supabaseClient } from '../config/database.js'; // fixed import
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
    const { data: existingUser, error: existingUserError } = await supabaseClient
      .from('user')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUserError && existingUserError.code !== 'PGRST116') {
      return res.status(500).json({ error: existingUserError.message });
    }

    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const { data: user, error: createUserError } = await supabaseClient
      .from('user')
      .insert({
        email,
        password: hashedPassword,
        fullName,
        role,
        studentId,
        department,
      })
      .select('id, email, fullName, role, studentId, department, avatarUrl, createdAt')
      .single();

    if (createUserError) {
      return res.status(500).json({ error: createUserError.message });
    }

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
    const { data: user, error: userError } = await supabaseClient
      .from('user')
      .select('*')
      .eq('email', email)
      .single();

    if (userError) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    // Check password
    if (user.password) {
      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    } else {
      return res.status(401).json({ error: 'Please use OAuth login for this account' });
    }

    const token = generateToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id });

    const { password: _, ...userData } = user; // exclude password
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

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const decoded = verifyRefreshToken(refreshToken);

    // Verify user
    const { data: user, error: userError } = await supabaseClient
      .from('user')
      .select('id, email, role, isActive')
      .eq('id', decoded.userId)
      .single();

    if (userError || !user.isActive) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

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
  res.json({ message: 'Logged out successfully' });
};
