const express = require('express');
const router = express.Router();
const { submissionsDB } = require('../database/db');

/**
 * GET /api/reports/user/:user_id
 * Get aggregated report for specific user
 */
router.get('/user/:user_id', (req, res) => {
  try {
    const { user_id } = req.params;
    const { period } = req.query; // 'week', 'month', 'all'

    let submissions = submissionsDB.find({ user_id });

    // Filter by period
    if (period === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      submissions = submissions.filter(s => new Date(s.created_at) >= weekAgo);
    } else if (period === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      submissions = submissions.filter(s => new Date(s.created_at) >= monthAgo);
    }

    // Only count approved submissions
    const approvedSubmissions = submissions.filter(s => 
      s.verification_status === 'approved' || s.verification_status === 'auto_approved'
    );

    const totalCo2Kg = approvedSubmissions.reduce((sum, s) => sum + (s.co2_final_kg || 0), 0);
    const totalPoints = approvedSubmissions.reduce((sum, s) => sum + (s.carbon_points_awarded || 0), 0);

    // Group by category
    const byCategory = {};
    approvedSubmissions.forEach(s => {
      if (!byCategory[s.challenge_category]) {
        byCategory[s.challenge_category] = {
          count: 0,
          total_co2_kg: 0,
          total_points: 0
        };
      }
      byCategory[s.challenge_category].count++;
      byCategory[s.challenge_category].total_co2_kg += s.co2_final_kg || 0;
      byCategory[s.challenge_category].total_points += s.carbon_points_awarded || 0;
    });

    res.json({
      success: true,
      data: {
        user_id,
        period: period || 'all',
        total_submissions: submissions.length,
        approved_submissions: approvedSubmissions.length,
        total_co2_avoided_kg: parseFloat(totalCo2Kg.toFixed(4)),
        total_carbon_points: totalPoints,
        by_category: byCategory,
        submission_history: approvedSubmissions.map(s => ({
          id: s.id,
          challenge_name: s.challenge_name,
          challenge_category: s.challenge_category,
          co2_kg: s.co2_final_kg,
          points: s.carbon_points_awarded,
          date: s.created_at
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/reports/cohort
 * Get aggregated report for cohort (campus/city/sponsor campaign)
 */
router.get('/cohort', (req, res) => {
  try {
    const { cohort_id, period } = req.query;

    // For prototype, we'll aggregate all users
    // In production, filter by cohort_id
    let submissions = submissionsDB.findAll();

    // Filter by period
    if (period === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      submissions = submissions.filter(s => new Date(s.created_at) >= weekAgo);
    } else if (period === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      submissions = submissions.filter(s => new Date(s.created_at) >= monthAgo);
    }

    const approvedSubmissions = submissions.filter(s => 
      s.verification_status === 'approved' || s.verification_status === 'auto_approved'
    );

    const totalCo2Kg = approvedSubmissions.reduce((sum, s) => sum + (s.co2_final_kg || 0), 0);
    const uniqueUsers = new Set(approvedSubmissions.map(s => s.user_id));
    const avgCo2PerUser = uniqueUsers.size > 0 ? totalCo2Kg / uniqueUsers.size : 0;

    // Verification rate
    const verificationRate = submissions.length > 0 
      ? approvedSubmissions.length / submissions.length 
      : 0;

    // Group by category
    const byCategory = {};
    approvedSubmissions.forEach(s => {
      if (!byCategory[s.challenge_category]) {
        byCategory[s.challenge_category] = {
          count: 0,
          total_co2_kg: 0
        };
      }
      byCategory[s.challenge_category].count++;
      byCategory[s.challenge_category].total_co2_kg += s.co2_final_kg || 0;
    });

    res.json({
      success: true,
      data: {
        cohort_id: cohort_id || 'all',
        period: period || 'all',
        total_co2_avoided_kg: parseFloat(totalCo2Kg.toFixed(2)),
        num_users: uniqueUsers.size,
        avg_co2_per_user_kg: parseFloat(avgCo2PerUser.toFixed(2)),
        total_submissions: submissions.length,
        approved_submissions: approvedSubmissions.length,
        verification_rate: parseFloat((verificationRate * 100).toFixed(2)),
        by_category: byCategory,
        methodology_note: 'Calculations use conservative emission factors. See /api/methodology for details.'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/reports/leaderboard
 * Get leaderboard of top users
 */
router.get('/leaderboard', (req, res) => {
  try {
    const { period, limit = 10 } = req.query;

    let submissions = submissionsDB.findAll();

    // Filter by period
    if (period === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      submissions = submissions.filter(s => new Date(s.created_at) >= weekAgo);
    } else if (period === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      submissions = submissions.filter(s => new Date(s.created_at) >= monthAgo);
    }

    const approvedSubmissions = submissions.filter(s => 
      s.verification_status === 'approved' || s.verification_status === 'auto_approved'
    );

    // Aggregate by user
    const userStats = {};
    approvedSubmissions.forEach(s => {
      if (!userStats[s.user_id]) {
        userStats[s.user_id] = {
          user_id: s.user_id,
          total_co2_kg: 0,
          total_points: 0,
          submission_count: 0
        };
      }
      userStats[s.user_id].total_co2_kg += s.co2_final_kg || 0;
      userStats[s.user_id].total_points += s.carbon_points_awarded || 0;
      userStats[s.user_id].submission_count++;
    });

    // Sort by points
    const leaderboard = Object.values(userStats)
      .sort((a, b) => b.total_points - a.total_points)
      .slice(0, parseInt(limit))
      .map((user, index) => ({
        rank: index + 1,
        ...user,
        total_co2_kg: parseFloat(user.total_co2_kg.toFixed(2))
      }));

    res.json({
      success: true,
      data: {
        period: period || 'all',
        leaderboard
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
