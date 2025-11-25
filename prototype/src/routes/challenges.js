const express = require('express');
const router = express.Router();
const { getAllChallenges, getChallengeById, getChallengesByCategory } = require('../config/challenges');
const { emissionFactors } = require('../config/emissionFactors');

/**
 * GET /api/challenges
 * Get all available challenges
 */
router.get('/', (req, res) => {
  try {
    const challenges = getAllChallenges();
    res.json({
      success: true,
      count: challenges.length,
      data: challenges
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/challenges/:id
 * Get specific challenge by ID
 */
router.get('/:id', (req, res) => {
  try {
    const challenge = getChallengeById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: 'Challenge not found'
      });
    }

    res.json({
      success: true,
      data: challenge
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/challenges/category/:category
 * Get challenges by category
 */
router.get('/category/:category', (req, res) => {
  try {
    const challenges = getChallengesByCategory(req.params.category);
    res.json({
      success: true,
      count: challenges.length,
      data: challenges
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/challenges/:id/emission-factors
 * Get emission factors for a specific challenge
 */
router.get('/:id/emission-factors', (req, res) => {
  try {
    const challenge = getChallengeById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: 'Challenge not found'
      });
    }

    // Return relevant emission factors based on challenge category
    let relevantFactors = {};
    
    switch (challenge.category) {
      case 'transport':
        relevantFactors = emissionFactors.transport;
        break;
      case 'reusable_items':
        relevantFactors = emissionFactors.reusable;
        break;
      case 'food_substitution':
        relevantFactors = emissionFactors.food;
        break;
      case 'food_waste':
        relevantFactors = { food_waste_per_kg: emissionFactors.food.food_waste_per_kg };
        break;
      case 'energy_saving':
        relevantFactors = emissionFactors.energy;
        break;
      case 'composting':
        relevantFactors = { organic_waste_composted: emissionFactors.waste.organic_waste_composted };
        break;
      case 'recycling':
        relevantFactors = emissionFactors.waste.recycling;
        break;
      case 'carbon_sequestration':
        relevantFactors = emissionFactors.carbon_sequestration;
        break;
      case 'repair':
        relevantFactors = emissionFactors.repair;
        break;
    }

    res.json({
      success: true,
      challenge_id: challenge.id,
      category: challenge.category,
      emission_factors: relevantFactors,
      note: 'These are placeholder values. Replace with official emission factors before production.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
