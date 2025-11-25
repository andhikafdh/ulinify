const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { usersDB } = require('../database/db');
const { USER_ROLES } = require('../config/constants');
const { authMiddleware } = require('../middleware/auth');

/**
 * Generate JWT tokens
 */
function generateTokens(userId) {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
}

/**
 * POST /api/auth/register
 * Register new user
 */
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().notEmpty()
], async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = usersDB.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(process.env.BCRYPT_ROUNDS) || 10
    );

    // Create user
    const user = usersDB.insert({
      email,
      password: hashedPassword,
      name,
      role: USER_ROLES.USER,
      onboarding_completed: false,
      onboarding_answers: null,
      profile: {
        avatar: null,
        bio: null,
        location: null
      },
      preferences: {
        challenge_difficulty: 'medium',
        categories_of_interest: [],
        notification_enabled: true
      },
      stats: {
        total_challenges_completed: 0,
        total_co2_saved: 0,
        total_points: 0,
        current_streak: 0,
        longest_streak: 0
      }
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Remove password from response
    delete user.password;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = usersDB.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Update last login
    usersDB.update(user.id, {
      last_login: new Date().toISOString()
    });

    // Remove password from response
    delete user.password;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Check if user still exists
    const user = usersDB.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    // Generate new tokens
    const tokens = generateTokens(user.id);

    res.json({
      success: true,
      data: tokens
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired refresh token'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Token refresh failed'
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user
 */
router.get('/me', authMiddleware, (req, res) => {
  try {
    const user = usersDB.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    delete user.password;

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get user data'
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user (client should delete tokens)
 */
router.post('/logout', authMiddleware, (req, res) => {
  // In a real app with token blacklist, add token to blacklist here
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router;
