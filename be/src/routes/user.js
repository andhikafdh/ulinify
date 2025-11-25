const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { usersDB } = require('../database/db');
const { authMiddleware } = require('../middleware/auth');
const { ONBOARDING_QUESTIONS } = require('../config/constants');

/**
 * GET /api/user/profile
 * Get user profile
 */
router.get('/profile', authMiddleware, (req, res) => {
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
      error: 'Failed to get profile'
    });
  }
});

/**
 * PUT /api/user/profile
 * Update user profile
 */
router.put('/profile', authMiddleware, [
  body('name').optional().trim().notEmpty(),
  body('profile.bio').optional(),
  body('profile.location').optional(),
  body('profile.avatar').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const user = usersDB.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const { name, profile } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (profile) {
      updateData.profile = {
        ...user.profile,
        ...profile
      };
    }

    const updatedUser = usersDB.update(req.user.id, updateData);
    delete updatedUser.password;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

/**
 * GET /api/user/onboarding
 * Get onboarding questions
 */
router.get('/onboarding', (req, res) => {
  res.json({
    success: true,
    data: ONBOARDING_QUESTIONS
  });
});

/**
 * POST /api/user/onboarding
 * Submit onboarding answers
 */
router.post('/onboarding', authMiddleware, async (req, res) => {
  try {
    const { answers } = req.body;

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid answers format'
      });
    }

    const user = usersDB.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Extract categories of interest from answers
    const categoriesOfInterest = [];
    
    if (answers.transportation?.includes('bicycle') || answers.transportation?.includes('walk')) {
      categoriesOfInterest.push('transport');
    }
    if (answers.diet && ['vegetarian', 'vegan'].includes(answers.diet)) {
      categoriesOfInterest.push('food');
    }
    if (answers.waste_management === 'always') {
      categoriesOfInterest.push('waste');
    }
    if (answers.energy_usage === 'rarely') {
      categoriesOfInterest.push('energy');
    }
    if (answers.shopping_habits?.includes('reusable_bag')) {
      categoriesOfInterest.push('shopping');
    }
    if (answers.interests) {
      if (answers.interests.includes('gardening')) categoriesOfInterest.push('lifestyle');
      if (answers.interests.includes('cooking')) categoriesOfInterest.push('food');
      if (answers.interests.includes('cycling')) categoriesOfInterest.push('transport');
    }

    // Update user with onboarding data
    const updatedUser = usersDB.update(req.user.id, {
      onboarding_completed: true,
      onboarding_answers: answers,
      preferences: {
        ...user.preferences,
        categories_of_interest: [...new Set(categoriesOfInterest)] // Remove duplicates
      }
    });

    delete updatedUser.password;

    res.json({
      success: true,
      message: 'Onboarding completed successfully',
      data: updatedUser
    });

  } catch (error) {
    console.error('Onboarding error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete onboarding'
    });
  }
});

/**
 * PUT /api/user/preferences
 * Update user preferences
 */
router.put('/preferences', authMiddleware, async (req, res) => {
  try {
    const { challenge_difficulty, categories_of_interest, notification_enabled } = req.body;

    const user = usersDB.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const updateData = {
      preferences: {
        ...user.preferences
      }
    };

    if (challenge_difficulty) updateData.preferences.challenge_difficulty = challenge_difficulty;
    if (categories_of_interest) updateData.preferences.categories_of_interest = categories_of_interest;
    if (notification_enabled !== undefined) updateData.preferences.notification_enabled = notification_enabled;

    const updatedUser = usersDB.update(req.user.id, updateData);
    delete updatedUser.password;

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: updatedUser
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update preferences'
    });
  }
});

/**
 * GET /api/user/stats
 * Get user statistics
 */
router.get('/stats', authMiddleware, (req, res) => {
  try {
    const user = usersDB.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user.stats
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get stats'
    });
  }
});

module.exports = router;
