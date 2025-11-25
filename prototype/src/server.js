require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

const challengesRouter = require('./routes/challenges');
const submissionsRouter = require('./routes/submissions');
const reportsRouter = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
});
app.use('/api/', limiter);

// Static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/challenges', challengesRouter);
app.use('/api/submissions', submissionsRouter);
app.use('/api/reports', reportsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Ulinify CO2 Calculator API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Methodology documentation endpoint
app.get('/api/methodology', (req, res) => {
  res.json({
    success: true,
    data: {
      title: 'CO2 Avoided Calculation Methodology',
      version: '1.0.0',
      last_updated: '2025-11-23',
      description: 'Methodology for calculating CO2 emissions avoided through sustainable actions',
      key_principles: [
        'Conservative estimation to avoid overclaiming',
        'Evidence-based verification using EXIF, geotag, and AI classification',
        'Confidence scoring to reflect uncertainty',
        'Anti-gaming measures to prevent manipulation'
      ],
      emission_factors_sources: [
        'IPCC / GWP factors (placeholder)',
        'GHG Protocol emission factor database (placeholder)',
        'Indonesia Ministry of Environment reports (placeholder)',
        'Peer-reviewed LCA studies (placeholder)'
      ],
      calculation_formula: 'CO2_final = baseline_emission * units * conservativeness_factor * confidence_score',
      conservativeness_factors: {
        transport: 0.7,
        food: 0.7,
        energy: 0.7,
        composting: 0.6,
        recycling: 0.6,
        tree_planting: 0.5
      },
      confidence_scoring: {
        high: '0.9-1.0: Photo + EXIF + geotag + classifier match + moderator approval',
        medium: '0.6-0.89: Photo + EXIF or geotag + classifier partial match',
        low: '0.3-0.59: Photo without EXIF/geotag or screenshot only',
        very_low: '0.0-0.29: Self-report text only'
      },
      anti_gaming_measures: [
        'Daily CO2 limit per user',
        'Minimum time interval between submissions',
        'Duplicate image detection',
        'Trust score system',
        'Random audit reviews'
      ],
      important_note: 'ALL EMISSION FACTORS ARE PLACEHOLDERS. Replace with official data before production use.'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🌱 Ulinify CO2 Calculator API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📖 Methodology: http://localhost:${PORT}/api/methodology`);
  console.log(`🏆 Challenges: http://localhost:${PORT}/api/challenges`);
});

module.exports = app;
