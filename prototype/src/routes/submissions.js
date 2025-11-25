const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { submissionsDB, auditLogDB } = require('../database/db');
const { verifySubmission } = require('../services/verificationService');
const { calculateCO2Avoided } = require('../services/calculationService');
const { performAntiGamingChecks } = require('../services/antiGamingService');
const { systemParameters } = require('../config/emissionFactors');
const { getChallengeById } = require('../config/challenges');

// Configure multer for file uploads
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG and PNG images are allowed'));
    }
  }
});

/**
 * POST /api/submissions
 * Submit a new challenge completion
 */
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const { user_id, challenge_id, inputs, expected_location } = req.body;

    // Validate required fields
    if (!user_id || !challenge_id || !inputs) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: user_id, challenge_id, inputs'
      });
    }

    // Validate challenge exists
    const challenge = getChallengeById(challenge_id);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: 'Challenge not found'
      });
    }

    // Parse inputs if string
    const parsedInputs = typeof inputs === 'string' ? JSON.parse(inputs) : inputs;

    // Parse expected location if provided
    const parsedLocation = expected_location 
      ? (typeof expected_location === 'string' ? JSON.parse(expected_location) : expected_location)
      : null;

    const imagePath = req.file ? req.file.path : null;

    // Anti-gaming checks
    const antiGamingResults = await performAntiGamingChecks(
      user_id,
      challenge_id,
      imagePath,
      systemParameters
    );

    if (!antiGamingResults.passed) {
      // Clean up uploaded file
      if (imagePath && fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }

      return res.status(429).json({
        success: false,
        error: 'Anti-gaming violation',
        violations: antiGamingResults.violations
      });
    }

    // Verification (if image provided)
    let verificationResult = {
      verification_status: 'pending',
      confidence_score: 0.5,
      verification_details: {}
    };

    if (imagePath) {
      verificationResult = await verifySubmission(
        imagePath,
        challenge.category,
        parsedLocation
      );
    }

    // Calculate CO2 avoided
    const calculationResult = calculateCO2Avoided(
      challenge_id,
      parsedInputs,
      verificationResult.confidence_score
    );

    // Create submission record
    const submission = {
      user_id,
      challenge_id,
      challenge_name: challenge.name,
      challenge_category: challenge.category,
      timestamp_submitted: new Date().toISOString(),
      inputs: parsedInputs,
      photo_url: imagePath ? `/uploads/${path.basename(imagePath)}` : null,
      image_hash: antiGamingResults.imageHash || null,
      exif_timestamp: verificationResult.verification_details.exif?.timestamp || null,
      geotag: verificationResult.verification_details.exif?.latitude ? {
        latitude: verificationResult.verification_details.exif.latitude,
        longitude: verificationResult.verification_details.exif.longitude
      } : null,
      classifier_label: verificationResult.verification_details.classifier?.description || null,
      classifier_confidence: verificationResult.verification_details.classifier?.confidence || null,
      verification_status: verificationResult.verification_status,
      confidence_score: verificationResult.confidence_score,
      co2_raw_kg: calculationResult.co2_raw_kg,
      co2_final_kg: calculationResult.co2_final_kg,
      conservativeness_factor: calculationResult.conservativeness_factor,
      carbon_points_awarded: calculationResult.carbon_points_awarded,
      calculation_details: calculationResult.calculation_details,
      trust_score: antiGamingResults.trustScore,
      moderator_id: null,
      voucher_issued: null
    };

    const savedSubmission = submissionsDB.insert(submission);

    // Log audit trail
    auditLogDB.insert({
      user_id,
      submission_id: savedSubmission.id,
      action: 'submission_created',
      details: {
        challenge_id,
        verification_status: verificationResult.verification_status,
        co2_final_kg: calculationResult.co2_final_kg,
        carbon_points: calculationResult.carbon_points_awarded
      }
    });

    res.status(201).json({
      success: true,
      data: savedSubmission,
      anti_gaming_warnings: antiGamingResults.warnings
    });

  } catch (error) {
    console.error('Submission error:', error);
    
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/submissions
 * Get all submissions (with optional filters)
 */
router.get('/', (req, res) => {
  try {
    const { user_id, challenge_id, verification_status } = req.query;

    let submissions = submissionsDB.findAll();

    // Apply filters
    if (user_id) {
      submissions = submissions.filter(s => s.user_id === user_id);
    }
    if (challenge_id) {
      submissions = submissions.filter(s => s.challenge_id === challenge_id);
    }
    if (verification_status) {
      submissions = submissions.filter(s => s.verification_status === verification_status);
    }

    // Sort by created date descending
    submissions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/submissions/:id
 * Get specific submission by ID
 */
router.get('/:id', (req, res) => {
  try {
    const submission = submissionsDB.findById(req.params.id);
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }

    res.json({
      success: true,
      data: submission
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PATCH /api/submissions/:id/verify
 * Update verification status (moderator action)
 */
router.patch('/:id/verify', (req, res) => {
  try {
    const { verification_status, moderator_id, notes } = req.body;

    if (!verification_status || !moderator_id) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: verification_status, moderator_id'
      });
    }

    const allowedStatuses = ['approved', 'rejected', 'pending_review'];
    if (!allowedStatuses.includes(verification_status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid verification_status. Allowed: ${allowedStatuses.join(', ')}`
      });
    }

    const submission = submissionsDB.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }

    const updated = submissionsDB.update(req.params.id, {
      verification_status,
      moderator_id,
      moderator_notes: notes || null
    });

    // Log audit trail
    auditLogDB.insert({
      user_id: submission.user_id,
      submission_id: submission.id,
      moderator_id,
      action: 'verification_updated',
      details: {
        old_status: submission.verification_status,
        new_status: verification_status,
        notes
      }
    });

    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/submissions/:id
 * Delete a submission (admin only)
 */
router.delete('/:id', (req, res) => {
  try {
    const submission = submissionsDB.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }

    // Delete associated image file
    if (submission.photo_url) {
      const imagePath = path.join(UPLOAD_DIR, path.basename(submission.photo_url));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    submissionsDB.delete(req.params.id);

    res.json({
      success: true,
      message: 'Submission deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
