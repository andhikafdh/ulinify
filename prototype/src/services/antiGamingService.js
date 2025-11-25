const { submissionsDB, usersDB, auditLogDB } = require('../database/db');
const crypto = require('crypto');
const fs = require('fs');

/**
 * Check for duplicate image submissions using crypto hash
 */
async function checkDuplicateImage(imagePath, userId) {
  try {
    // Create hash from image file
    const fileBuffer = fs.readFileSync(imagePath);
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    
    // Check if this hash exists in recent submissions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const submissions = submissionsDB.find({ user_id: userId });
    
    for (const submission of submissions) {
      if (submission.image_hash === hash && 
          new Date(submission.created_at) > thirtyDaysAgo) {
        return {
          isDuplicate: true,
          duplicateSubmissionId: submission.id,
          message: 'Image has been submitted before'
        };
      }
    }

    return {
      isDuplicate: false,
      hash
    };
  } catch (error) {
    console.error('Error checking duplicate image:', error);
    return {
      isDuplicate: false,
      hash: null,
      error: error.message
    };
  }
}

/**
 * Check daily submission limits
 */
function checkDailyLimit(userId, maxCo2PerDay) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const submissions = submissionsDB.find({ user_id: userId });
  
  const todaySubmissions = submissions.filter(sub => {
    const subDate = new Date(sub.created_at);
    subDate.setHours(0, 0, 0, 0);
    return subDate.getTime() === today.getTime() && sub.verification_status !== 'rejected';
  });

  const totalCo2Today = todaySubmissions.reduce((sum, sub) => sum + (sub.co2_final_kg || 0), 0);

  return {
    withinLimit: totalCo2Today < maxCo2PerDay,
    currentTotal: totalCo2Today,
    maxAllowed: maxCo2PerDay,
    submissionsToday: todaySubmissions.length
  };
}

/**
 * Check minimum time interval between submissions for same challenge
 */
function checkSubmissionInterval(userId, challengeId, minIntervalMinutes) {
  const submissions = submissionsDB.find({ 
    user_id: userId, 
    challenge_id: challengeId 
  });

  if (submissions.length === 0) return { allowed: true };

  // Get most recent submission
  const sortedSubmissions = submissions.sort((a, b) => 
    new Date(b.created_at) - new Date(a.created_at)
  );

  const lastSubmission = sortedSubmissions[0];
  const timeSinceLastMs = Date.now() - new Date(lastSubmission.created_at).getTime();
  const timeSinceLastMinutes = timeSinceLastMs / (1000 * 60);

  return {
    allowed: timeSinceLastMinutes >= minIntervalMinutes,
    timeSinceLastMinutes: Math.round(timeSinceLastMinutes),
    minRequired: minIntervalMinutes,
    lastSubmissionId: lastSubmission.id
  };
}

/**
 * Check user trust score
 * Higher trust score = more lenient auto-approval
 */
function getUserTrustScore(userId) {
  const submissions = submissionsDB.find({ user_id: userId });
  
  if (submissions.length === 0) {
    return { trustScore: 0.5, reason: 'new_user' };
  }

  const approvedCount = submissions.filter(s => 
    s.verification_status === 'approved' || s.verification_status === 'auto_approved'
  ).length;

  const rejectedCount = submissions.filter(s => 
    s.verification_status === 'rejected'
  ).length;

  const totalCount = submissions.length;

  // Simple trust calculation
  let trustScore = 0.5; // Base trust

  if (totalCount >= 10) {
    const approvalRate = approvedCount / totalCount;
    trustScore = Math.min(0.95, 0.5 + (approvalRate * 0.5));
    
    // Penalize for rejections
    if (rejectedCount > 0) {
      trustScore -= (rejectedCount / totalCount) * 0.2;
    }
  } else {
    // New users start at 0.5, gradually increase
    trustScore = 0.5 + (approvedCount / 20);
  }

  return {
    trustScore: Math.max(0.1, Math.min(1.0, trustScore)),
    totalSubmissions: totalCount,
    approvedSubmissions: approvedCount,
    rejectedSubmissions: rejectedCount
  };
}

/**
 * Log anti-gaming event
 */
function logAntiGamingEvent(userId, eventType, details) {
  return auditLogDB.insert({
    user_id: userId,
    event_type: eventType,
    details,
    severity: 'warning'
  });
}

/**
 * Comprehensive anti-gaming check
 */
async function performAntiGamingChecks(userId, challengeId, imagePath, systemParams) {
  const results = {
    passed: true,
    violations: [],
    warnings: []
  };

  // 1. Check daily CO2 limit
  const dailyLimit = checkDailyLimit(userId, systemParams.daily_max_per_user_kg);
  if (!dailyLimit.withinLimit) {
    results.passed = false;
    results.violations.push({
      type: 'daily_limit_exceeded',
      message: `Daily CO2 limit exceeded (${dailyLimit.currentTotal.toFixed(2)}/${dailyLimit.maxAllowed} kg)`,
      data: dailyLimit
    });
    logAntiGamingEvent(userId, 'daily_limit_exceeded', dailyLimit);
  }

  // 2. Check submission interval
  const intervalCheck = checkSubmissionInterval(
    userId, 
    challengeId, 
    systemParams.min_submission_interval_minutes
  );
  if (!intervalCheck.allowed) {
    results.passed = false;
    results.violations.push({
      type: 'submission_too_frequent',
      message: `Please wait ${intervalCheck.minRequired - intervalCheck.timeSinceLastMinutes} more minutes`,
      data: intervalCheck
    });
    logAntiGamingEvent(userId, 'submission_too_frequent', intervalCheck);
  }

  // 3. Check duplicate image
  if (imagePath) {
    const duplicateCheck = await checkDuplicateImage(imagePath, userId);
    if (duplicateCheck.isDuplicate) {
      results.passed = false;
      results.violations.push({
        type: 'duplicate_image',
        message: 'This image has been submitted before',
        data: duplicateCheck
      });
      logAntiGamingEvent(userId, 'duplicate_image', duplicateCheck);
    } else {
      results.imageHash = duplicateCheck.hash;
    }
  }

  // 4. Check user trust score (warning only)
  const trustScore = getUserTrustScore(userId);
  results.trustScore = trustScore;
  
  if (trustScore.trustScore < 0.3) {
    results.warnings.push({
      type: 'low_trust_score',
      message: 'User has low trust score - flagged for manual review',
      data: trustScore
    });
  }

  return results;
}

module.exports = {
  checkDuplicateImage,
  checkDailyLimit,
  checkSubmissionInterval,
  getUserTrustScore,
  logAntiGamingEvent,
  performAntiGamingChecks
};
