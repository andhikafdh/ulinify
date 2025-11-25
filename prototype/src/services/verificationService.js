const exifr = require('exifr');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Extract EXIF data from image
 */
async function extractExifData(imagePath) {
  try {
    const exifData = await exifr.parse(imagePath, {
      gps: true,
      pick: ['DateTimeOriginal', 'CreateDate', 'GPSLatitude', 'GPSLongitude', 'Make', 'Model']
    });
    
    return {
      timestamp: exifData?.DateTimeOriginal || exifData?.CreateDate || null,
      latitude: exifData?.GPSLatitude || null,
      longitude: exifData?.GPSLongitude || null,
      device: exifData?.Make && exifData?.Model ? `${exifData.Make} ${exifData.Model}` : null,
      hasExif: !!exifData
    };
  } catch (error) {
    console.error('EXIF extraction error:', error);
    return {
      timestamp: null,
      latitude: null,
      longitude: null,
      device: null,
      hasExif: false
    };
  }
}

/**
 * Validate geotag proximity (if expected location provided)
 */
function validateGeotag(latitude, longitude, expectedLat, expectedLon, radiusKm = 5) {
  if (!latitude || !longitude || !expectedLat || !expectedLon) {
    return { valid: false, distance: null };
  }

  // Haversine formula
  const R = 6371; // Earth radius in km
  const dLat = toRad(expectedLat - latitude);
  const dLon = toRad(expectedLon - longitude);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(latitude)) * Math.cos(toRad(expectedLat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return {
    valid: distance <= radiusKm,
    distance: distance
  };
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Classify image using OpenAI GPT-4 Vision
 */
async function classifyImage(imagePath, challengeType) {
  try {
    // Read image and convert to base64
    const fs = require('fs');
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';

    // Prompts based on challenge type
    const prompts = {
      'transport': 'Analyze this image and determine if it shows evidence of eco-friendly transportation (bicycle, walking, public transport, etc.). Describe what you see and rate confidence 0-1.',
      'reusable_items': 'Analyze this image and identify if it shows reusable items like bottles, bags, containers. Describe the items and rate confidence 0-1.',
      'food_substitution': 'Analyze this image of a meal. Identify if it appears to be vegetarian/vegan or contains meat. Describe the food and rate confidence 0-1.',
      'energy_saving': 'Analyze this image for evidence of energy-saving actions (turned off AC, lights off, thermostat settings). Describe what you see and rate confidence 0-1.',
      'composting': 'Analyze this image for evidence of composting (compost bin, organic waste, compost pile). Describe what you see and rate confidence 0-1.',
      'recycling': 'Analyze this image for recyclable materials (plastic, paper, metal, glass). Identify the material types and rate confidence 0-1.',
      'tree_planting': 'Analyze this image for evidence of tree planting or urban greening. Describe what you see and rate confidence 0-1.',
      'repair': 'Analyze this image for evidence of repair or upcycling activities. Describe the before/after or repair process and rate confidence 0-1.'
    };

    const prompt = prompts[challengeType] || prompts['transport'];

    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 500
    });

    const description = response.choices[0].message.content;
    
    // Simple confidence extraction (look for numbers 0-1 in response)
    const confidenceMatch = description.match(/confidence[:\s]+([0-9.]+)/i);
    let confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.7;
    
    // Clamp confidence between 0 and 1
    confidence = Math.max(0, Math.min(1, confidence));

    return {
      description,
      confidence,
      classifierUsed: 'gpt-4-vision'
    };
  } catch (error) {
    console.error('Image classification error:', error);
    // Return default medium confidence if API fails
    return {
      description: 'Classification unavailable',
      confidence: 0.5,
      classifierUsed: 'fallback',
      error: error.message
    };
  }
}

/**
 * Compute overall confidence score based on verification methods
 */
function computeConfidenceScore(verification) {
  let score = 0.3; // Base score for any submission

  // EXIF timestamp present: +0.2
  if (verification.exif?.timestamp) {
    score += 0.2;
  }

  // Geotag present and valid: +0.2
  if (verification.geotag?.valid) {
    score += 0.2;
  } else if (verification.exif?.latitude && verification.exif?.longitude) {
    score += 0.1; // Has geotag but not validated
  }

  // Classifier confidence contribution: up to +0.3
  if (verification.classifier?.confidence) {
    score += verification.classifier.confidence * 0.3;
  }

  // Cap at 1.0
  return Math.min(1.0, score);
}

/**
 * Perform full verification on a submission
 */
async function verifySubmission(imagePath, challengeType, expectedLocation = null) {
  // Extract EXIF
  const exifData = await extractExifData(imagePath);

  // Validate geotag if expected location provided
  let geotagValidation = { valid: false, distance: null };
  if (expectedLocation && exifData.latitude && exifData.longitude) {
    geotagValidation = validateGeotag(
      exifData.latitude,
      exifData.longitude,
      expectedLocation.latitude,
      expectedLocation.longitude
    );
  }

  // Classify image
  const classification = await classifyImage(imagePath, challengeType);

  // Compute confidence score
  const verification = {
    exif: exifData,
    geotag: geotagValidation,
    classifier: classification
  };

  const confidenceScore = computeConfidenceScore(verification);

  // Determine verification status
  let status = 'pending';
  if (confidenceScore >= 0.85 && exifData.hasExif && classification.confidence > 0.7) {
    status = 'auto_approved';
  } else if (confidenceScore >= 0.6) {
    status = 'pending_review';
  } else {
    status = 'low_confidence';
  }

  return {
    verification_status: status,
    confidence_score: confidenceScore,
    verification_details: verification
  };
}

module.exports = {
  extractExifData,
  validateGeotag,
  classifyImage,
  computeConfidenceScore,
  verifySubmission
};
