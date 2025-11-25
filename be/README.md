# Ulinify Backend API

Backend lengkap untuk aplikasi Ulinify dengan fitur authentication, AI-powered challenge generation, dan personalized recommendations.

## 🚀 Features

### 🔐 Authentication
- **Register/Login**: JWT-based authentication dengan bcrypt password hashing
- **Refresh Token**: Auto-refresh untuk seamless user experience  
- **Secure**: Rate limiting dan input validation

### 🤖 AI-Powered Challenge Generation
- **GPT-4 Integration**: Generate personalized challenges menggunakan OpenAI GPT-4
- **Smart Recommendations**: Analisis user profile, habits, dan preferences
- **Template Fallback**: Jika API unavailable, gunakan template-based challenges
- **Multi-Category**: Transport, Food, Energy, Waste, Water, Shopping, Lifestyle

### 👤 User Management
- **Onboarding**: Smart questionnaire untuk pahami lifestyle user
- **Profile**: Customizable user profile dengan preferences
- **Stats Tracking**: CO2 saved, points, streak tracking
- **Preferences**: Difficulty level, category interests, notifications

### 🎯 Challenge System
- **Personalized**: Challenges disesuaikan dengan user profile
- **Progress Tracking**: Monitor challenge completion dan impact
- **Rewards**: Points dan CO2 savings calculation
- **Streak System**: Motivasi user dengan streak tracking

## 📋 Prerequisites

- Node.js 16+
- npm atau yarn
- OpenAI API key (optional, untuk AI generation)

## 🛠️ Installation

```bash
cd be
npm install
```

## ⚙️ Configuration

Copy `.env.example` ke `.env`:

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=4000
JWT_SECRET=your_strong_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_here
OPENAI_API_KEY=your_openai_api_key_here  # Optional
FRONTEND_URL=http://localhost:3000
```

**Important**: Ganti `JWT_SECRET` dan `JWT_REFRESH_SECRET` dengan string random yang kuat!

Generate JWT secrets:
```bash
# Di PowerShell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🚀 Run Server

```bash
# Development mode dengan auto-reload
npm run dev

# Production mode
npm start
```

Server akan berjalan di `http://localhost:4000`

## 📡 API Endpoints

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {...},
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your_refresh_token"
}
```

---

### User Management

#### Get Profile
```http
GET /api/user/profile
Authorization: Bearer <access_token>
```

#### Update Profile
```http
PUT /api/user/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "New Name",
  "profile": {
    "bio": "My bio",
    "location": "Jakarta",
    "avatar": "url"
  }
}
```

#### Get Onboarding Questions
```http
GET /api/user/onboarding
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "transportation",
      "question": "Bagaimana cara Anda biasanya berpergian?",
      "type": "multiple",
      "options": [...]
    },
    ...
  ]
}
```

#### Submit Onboarding Answers
```http
POST /api/user/onboarding
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "answers": {
    "transportation": ["motorcycle", "public_transport"],
    "diet": "balanced",
    "waste_management": "sometimes",
    "energy_usage": "often",
    "shopping_habits": ["reusable_bag", "local_store"],
    "interests": ["cycling", "cooking"]
  }
}
```

#### Update Preferences
```http
PUT /api/user/preferences
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "challenge_difficulty": "medium",
  "categories_of_interest": ["transport", "food"],
  "notification_enabled": true
}
```

#### Get User Stats
```http
GET /api/user/stats
Authorization: Bearer <access_token>
```

Response:
```json
{
  "success": true,
  "data": {
    "total_challenges_completed": 15,
    "total_co2_saved": 45.5,
    "total_points": 455,
    "current_streak": 7,
    "longest_streak": 12
  }
}
```

---

### Challenges

#### Get AI Recommendations
```http
GET /api/challenges/recommendations
Authorization: Bearer <access_token>
```

Response:
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "id": "ai_xxx",
        "title": "Gunakan Transportasi Umum",
        "description": "...",
        "category": "transport",
        "difficulty": "medium",
        "frequency": "daily",
        "estimated_co2_savings_kg": 2.5,
        "tips": ["...", "...", "..."],
        "reasoning": "Based on your current commute habits...",
        "score": 85
      },
      ...
    ],
    "total": 5
  }
}
```

#### Generate New Challenges
```http
POST /api/challenges/generate
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "count": 5
}
```

#### Get My Challenges
```http
GET /api/challenges/my-challenges?status=active
Authorization: Bearer <access_token>
```

Query params:
- `status`: `active`, `completed`, `all` (optional)

#### Get Challenge Details
```http
GET /api/challenges/:id
Authorization: Bearer <access_token>
```

#### Accept Challenge
```http
POST /api/challenges/:id/accept
Authorization: Bearer <access_token>
```

Response:
```json
{
  "success": true,
  "message": "Challenge accepted",
  "data": {
    "id": "user_challenge_id",
    "user_id": "...",
    "challenge_id": "...",
    "status": "active",
    "progress": 0,
    "started_at": "2025-11-25T...",
    "target_completion": "2025-12-02T..."
  }
}
```

#### Complete Challenge
```http
POST /api/challenges/:id/complete
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "proof_url": "url_to_photo",
  "notes": "Challenge completed successfully!"
}
```

Response:
```json
{
  "success": true,
  "message": "Challenge completed!",
  "data": {
    "user_challenge": {...},
    "rewards": {
      "co2_saved": 2.5,
      "points_earned": 25,
      "new_streak": 8
    }
  }
}
```

---

## 🤖 AI Challenge Generation

### How It Works

1. **User Profile Analysis**: AI menganalisis onboarding answers, preferences, dan statistics
2. **GPT-4 Prompt Engineering**: Membuat prompt yang detail dengan konteks user
3. **Personalized Generation**: GPT-4 generate challenges yang spesifik dan actionable
4. **Scoring & Ranking**: System score challenges berdasarkan relevance
5. **Fallback Templates**: Jika AI unavailable, gunakan template-based challenges

### AI Prompt Structure

```
Generate personalized sustainability challenges for a user with this profile:

Current Lifestyle:
- Transportation: motorcycle, public_transport
- Diet: balanced
- Waste management: sometimes
- Energy usage: often
- Shopping habits: reusable_bag, local_store
- Interests: cycling, cooking

Preferences:
- Difficulty level: medium
- Categories of interest: transport, food

Progress:
- Challenges completed: 5
- CO2 saved: 12.5 kg
- Current streak: 3 days

[Detailed format instructions...]
```

### Template Fallback

Jika OpenAI API tidak tersedia atau error, system otomatis menggunakan template-based challenges yang sudah dioptimasi untuk berbagai profil user.

## 📊 Database Schema

### Users Collection
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "password": "hashed_password",
  "name": "User Name",
  "role": "user",
  "onboarding_completed": true,
  "onboarding_answers": {...},
  "profile": {
    "avatar": "url",
    "bio": "text",
    "location": "city"
  },
  "preferences": {
    "challenge_difficulty": "medium",
    "categories_of_interest": ["transport", "food"],
    "notification_enabled": true
  },
  "stats": {
    "total_challenges_completed": 10,
    "total_co2_saved": 25.5,
    "total_points": 255,
    "current_streak": 5,
    "longest_streak": 8
  },
  "created_at": "ISO timestamp",
  "updated_at": "ISO timestamp"
}
```

### Challenges Collection
```json
{
  "id": "uuid",
  "title": "Challenge Title",
  "description": "Detailed description",
  "category": "transport",
  "difficulty": "medium",
  "frequency": "daily",
  "estimated_impact": "Impact description",
  "estimated_co2_savings_kg": 2.5,
  "tips": ["tip1", "tip2", "tip3"],
  "verification_method": "photo",
  "duration_days": 7,
  "source": "ai_generated|template",
  "reasoning": "Why this challenge fits",
  "user_id": "creator_user_id",
  "status": "suggested|accepted",
  "created_at": "ISO timestamp"
}
```

### User Challenges Collection
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "challenge_id": "uuid",
  "status": "active|completed",
  "progress": 75,
  "started_at": "ISO timestamp",
  "completed_at": "ISO timestamp|null",
  "target_completion": "ISO timestamp",
  "proof_url": "url|null",
  "notes": "text|null",
  "submissions": [],
  "created_at": "ISO timestamp"
}
```

## 🔒 Security Features

- **Password Hashing**: bcryptjs dengan configurable rounds
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: express-validator untuk semua inputs
- **Rate Limiting**: Prevent brute force dan abuse
- **CORS**: Configured untuk frontend URL
- **Environment Variables**: Sensitive data di .env

## 🧪 Testing

```bash
npm test
```

Test script akan test semua endpoints.

## 🎯 Integration dengan Frontend

### Setup di Frontend (Next.js)

```typescript
// lib/api.ts
const API_URL = 'http://localhost:4000/api';

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

export async function getRecommendations(token: string) {
  const res = await fetch(`${API_URL}/challenges/recommendations`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}
```

### Token Storage

```typescript
// Store tokens in localStorage or cookies
localStorage.setItem('accessToken', data.accessToken);
localStorage.setItem('refreshToken', data.refreshToken);

// Add to all authenticated requests
headers: {
  'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
}
```

## 📁 Project Structure

```
be/
├── src/
│   ├── config/
│   │   └── constants.js         # App constants
│   ├── database/
│   │   └── db.js                # JSON database
│   ├── middleware/
│   │   └── auth.js              # Auth middleware
│   ├── routes/
│   │   ├── auth.js              # Auth endpoints
│   │   ├── user.js              # User endpoints
│   │   └── challenges.js        # Challenge endpoints
│   ├── services/
│   │   └── challengeGeneratorAI.js  # AI generation logic
│   └── server.js                # Express app
├── data/                        # JSON database files
├── package.json
├── .env
└── README.md
```

## 🚀 Deployment

### Environment Variables untuk Production

```env
NODE_ENV=production
PORT=4000
JWT_SECRET=<strong_random_secret>
JWT_REFRESH_SECRET=<strong_random_secret>
OPENAI_API_KEY=<your_key>
FRONTEND_URL=https://your-frontend-domain.com
```

### Recommendations
- Gunakan PostgreSQL/MongoDB untuk production (ganti JSON database)
- Deploy di Vercel, Railway, atau VPS
- Setup HTTPS dengan SSL certificate
- Implement token blacklist untuk logout
- Add logging dan monitoring
- Setup backup database

## 📝 License

MIT

## 👥 Support

Untuk bantuan atau pertanyaan, hubungi tim Ulinify.

---

**🌱 Build by Ulinify Team - Making sustainability accessible for everyone!**
