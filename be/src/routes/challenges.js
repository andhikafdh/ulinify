const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { usersDB, challengesDB, userChallengesDB } = require('../database/db');
const challengeGeneratorAI = require('../services/challengeGeneratorAI');

/**
 * GET /api/challenges/recommendations
 * Get personalized challenge recommendations
 */
router.get('/recommendations', authMiddleware, async (req, res) => {
  try {
    const user = usersDB.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if user completed onboarding
    if (!user.onboarding_completed) {
      return res.status(400).json({
        success: false,
        error: 'Please complete onboarding first',
        onboarding_required: true
      });
    }

    // Generate AI-powered recommendations
    const generatedChallenges = await challengeGeneratorAI.generateRecommendations(user);

    // Save generated challenges to database so they can be accepted
    const savedChallenges = generatedChallenges.map(challenge => {
      // Check if challenge with same ID already exists
      const existing = challengesDB.findById(challenge.id);
      if (existing) {
        return existing;
      }
      
      // Save new challenge (preserve the generated ID)
      const challengeData = {
        id: challenge.id, // Keep the AI-generated ID
        title: challenge.title,
        description: challenge.description,
        category: challenge.category,
        difficulty: challenge.difficulty,
        frequency: challenge.frequency,
        duration_days: challenge.duration_days,
        estimated_co2_savings_kg: challenge.estimated_co2_savings_kg,
        points_reward: challenge.points_reward,
        tips: challenge.tips,
        reasoning: challenge.reasoning,
        source: challenge.source,
        user_id: user.id,
        status: 'suggested'
      };
      
      return challengesDB.insert(challengeData);
    });

    res.json({
      success: true,
      data: {
        recommendations: savedChallenges,
        total: savedChallenges.length,
        generated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate recommendations'
    });
  }
});

/**
 * POST /api/challenges/generate
 * Generate new personalized challenges
 */
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const { count = 5 } = req.body;

    const user = usersDB.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (!user.onboarding_completed) {
      return res.status(400).json({
        success: false,
        error: 'Please complete onboarding first'
      });
    }

    // Generate challenges using AI
    const challenges = await challengeGeneratorAI.generatePersonalizedChallenges(user, count);

    // Save generated challenges
    const savedChallenges = challenges.map(challenge => 
      challengesDB.insert({
        ...challenge,
        user_id: user.id,
        status: 'suggested'
      })
    );

    res.json({
      success: true,
      data: {
        challenges: savedChallenges,
        total: savedChallenges.length
      }
    });

  } catch (error) {
    console.error('Challenge generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate challenges'
    });
  }
});

/**
 * GET /api/challenges/my-challenges
 * Get user's active and completed challenges
 */
router.get('/my-challenges', authMiddleware, async (req, res) => {
  try {
    const { status } = req.query; // 'active', 'completed', 'all'

    const userChallenges = userChallengesDB.find({ user_id: req.user.id });

    let filtered = userChallenges;
    if (status === 'active') {
      filtered = userChallenges.filter(uc => uc.status === 'active' || uc.status === 'in_progress');
    } else if (status === 'completed') {
      filtered = userChallenges.filter(uc => uc.status === 'completed');
    }

    // Populate challenge details
    const populated = filtered.map(uc => {
      const challenge = challengesDB.findById(uc.challenge_id);
      return {
        ...uc,
        challenge_details: challenge
      };
    });

    res.json({
      success: true,
      data: populated,
      total: populated.length
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get challenges'
    });
  }
});

/**
 * POST /api/challenges/:id/accept
 * Accept a suggested challenge
 */
router.post('/:id/accept', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const challenge = challengesDB.findById(id);
    
    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: 'Challenge not found'
      });
    }

    // Create user challenge
    const userChallenge = userChallengesDB.insert({
      user_id: req.user.id,
      challenge_id: id,
      status: 'active',
      progress: 0,
      started_at: new Date().toISOString(),
      target_completion: new Date(Date.now() + challenge.duration_days * 24 * 60 * 60 * 1000).toISOString(),
      submissions: []
    });

    // Update challenge status
    challengesDB.update(id, { status: 'accepted' });

    res.json({
      success: true,
      message: 'Challenge accepted',
      data: userChallenge
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to accept challenge'
    });
  }
});

/**
 * POST /api/challenges/:id/complete
 * Mark challenge as completed
 */
router.post('/:id/complete', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { proof_url, notes } = req.body;

    const userChallenge = userChallengesDB.findOne({
      user_id: req.user.id,
      challenge_id: id
    });

    if (!userChallenge) {
      return res.status(404).json({
        success: false,
        error: 'User challenge not found'
      });
    }

    if (userChallenge.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Challenge already completed'
      });
    }

    const challenge = challengesDB.findById(id);

    // Update user challenge
    const updated = userChallengesDB.update(userChallenge.id, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      progress: 100,
      proof_url,
      notes
    });

    // Update user stats
    const user = usersDB.findById(req.user.id);
    const newStats = {
      ...user.stats,
      total_challenges_completed: user.stats.total_challenges_completed + 1,
      total_co2_saved: user.stats.total_co2_saved + (challenge.estimated_co2_savings_kg || 0),
      total_points: user.stats.total_points + Math.round((challenge.estimated_co2_savings_kg || 0) * 10),
      current_streak: user.stats.current_streak + 1
    };

    if (newStats.current_streak > user.stats.longest_streak) {
      newStats.longest_streak = newStats.current_streak;
    }

    usersDB.update(req.user.id, { stats: newStats });

    res.json({
      success: true,
      message: 'Challenge completed!',
      data: {
        user_challenge: updated,
        rewards: {
          co2_saved: challenge.estimated_co2_savings_kg,
          points_earned: Math.round((challenge.estimated_co2_savings_kg || 0) * 10),
          new_streak: newStats.current_streak
        }
      }
    });

  } catch (error) {
    console.error('Complete challenge error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete challenge'
    });
  }
});

/**
 * GET /api/challenges/:id
 * Get challenge details
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const challenge = challengesDB.findById(id);
    
    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: 'Challenge not found'
      });
    }

    // Check if user has accepted this challenge
    const userChallenge = userChallengesDB.findOne({
      user_id: req.user.id,
      challenge_id: id
    });

    res.json({
      success: true,
      data: {
        ...challenge,
        user_status: userChallenge ? userChallenge.status : 'not_accepted',
        user_progress: userChallenge ? userChallenge.progress : 0
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get challenge'
    });
  }
});

module.exports = router;
