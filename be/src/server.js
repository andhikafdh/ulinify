require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const challengeRoutes = require('./routes/challenges');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    error: 'Too many requests, please try again later'
  }
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/challenges', challengeRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Ulinify Backend API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API documentation
app.get('/api/docs', (req, res) => {
  res.json({
    success: true,
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register new user',
        'POST /api/auth/login': 'Login user',
        'POST /api/auth/refresh': 'Refresh access token',
        'GET /api/auth/me': 'Get current user (requires auth)',
        'POST /api/auth/logout': 'Logout user (requires auth)'
      },
      user: {
        'GET /api/user/profile': 'Get user profile (requires auth)',
        'PUT /api/user/profile': 'Update user profile (requires auth)',
        'GET /api/user/onboarding': 'Get onboarding questions',
        'POST /api/user/onboarding': 'Submit onboarding answers (requires auth)',
        'PUT /api/user/preferences': 'Update user preferences (requires auth)',
        'GET /api/user/stats': 'Get user statistics (requires auth)'
      },
      challenges: {
        'GET /api/challenges/recommendations': 'Get AI-generated challenge recommendations (requires auth)',
        'POST /api/challenges/generate': 'Generate new personalized challenges (requires auth)',
        'GET /api/challenges/my-challenges': 'Get user challenges (requires auth)',
        'GET /api/challenges/:id': 'Get challenge details (requires auth)',
        'POST /api/challenges/:id/accept': 'Accept a challenge (requires auth)',
        'POST /api/challenges/:id/complete': 'Complete a challenge (requires auth)'
      }
    },
    features: {
      authentication: 'JWT-based authentication with refresh tokens',
      ai_powered: 'OpenAI GPT-4 for personalized challenge generation',
      onboarding: 'Smart onboarding to understand user lifestyle',
      recommendations: 'Personalized challenge recommendations based on user profile',
      progress_tracking: 'Track CO2 savings, points, and streaks'
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
  console.log(`🚀 Ulinify Backend API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📖 API Docs: http://localhost:${PORT}/api/docs`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth/*`);
  console.log(`👤 User endpoints: http://localhost:${PORT}/api/user/*`);
  console.log(`🎯 Challenge endpoints: http://localhost:${PORT}/api/challenges/*`);
  console.log(`\n🤖 AI Challenge Generator: ${process.env.OPENAI_API_KEY ? 'ENABLED' : 'DISABLED (using templates)'}`);
});

module.exports = app;
