# Ulinify CO2 Calculator API

Backend API untuk sistem perhitungan CO₂ avoided/reduced dari berbagai aktivitas ramah lingkungan.

## 🌱 Fitur Utama

- **Perhitungan CO₂ Multi-Kategori**: Transport, food, energy, waste, reusable items, carbon sequestration, repair
- **Verifikasi Otomatis**: EXIF extraction, geotag validation, AI image classification (GPT-4 Vision)
- **Anti-Gaming System**: Duplicate detection, rate limiting, daily caps, trust scoring
- **Reporting**: User reports, cohort reports, leaderboards
- **Conservative Calculation**: Menggunakan conservative factors untuk menghindari overclaiming

## 📋 Prerequisites

- Node.js 16+ dan npm
- OpenAI API key (untuk image classification)

## 🚀 Quick Start

### 1. Installation

```bash
cd prototype
npm install
```

### 2. Configuration

Copy `.env.example` ke `.env` dan sesuaikan:

```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=3000
OPENAI_API_KEY=your_actual_openai_api_key_here
```

### 3. Run Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Server akan berjalan di `http://localhost:3000`

## 📡 API Endpoints

### Health Check
```
GET /api/health
```

### Methodology Documentation
```
GET /api/methodology
```
Dokumentasi lengkap metodologi perhitungan CO₂.

---

### Challenges

#### Get All Challenges
```
GET /api/challenges
```

Response:
```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "id": "transport-modal-shift",
      "category": "transport",
      "name": "Beralih ke Transportasi Ramah Lingkungan",
      "required_inputs": ["distance_km", "mode_before", "mode_after", "trips"],
      ...
    }
  ]
}
```

#### Get Challenge by ID
```
GET /api/challenges/:id
```

#### Get Challenges by Category
```
GET /api/challenges/category/:category
```

#### Get Emission Factors for Challenge
```
GET /api/challenges/:id/emission-factors
```

---

### Submissions

#### Create Submission
```
POST /api/submissions
Content-Type: multipart/form-data

Fields:
- user_id (string, required)
- challenge_id (string, required)
- inputs (JSON string, required)
- photo (file, optional but recommended)
- expected_location (JSON string, optional): {"latitude": -6.xxx, "longitude": 106.xxx}
```

**Example dengan curl:**
```bash
curl -X POST http://localhost:3000/api/submissions \
  -F "user_id=user123" \
  -F "challenge_id=transport-modal-shift" \
  -F 'inputs={"distance_km":3,"mode_before":"motorbike","mode_after":"walk","trips":1}' \
  -F "photo=@path/to/photo.jpg"
```

**Example inputs untuk berbagai challenge:**

Transport:
```json
{
  "distance_km": 5,
  "mode_before": "car",
  "mode_after": "bus_per_passenger",
  "trips": 1
}
```

Reusable Bottle:
```json
{
  "count": 7
}
```

Meatless Meal:
```json
{
  "meal_type_before": "beef",
  "meal_type_after": "vegetarian",
  "portions": 1
}
```

Energy Saving:
```json
{
  "device_power_kw": 1.2,
  "hours_saved": 2,
  "device_type": "ac_1_5_pk"
}
```

Composting:
```json
{
  "composted_weight_kg": 2.5
}
```

Recycling:
```json
{
  "material_type": "PET_plastic",
  "weight_kg": 1.5
}
```

Tree Planting:
```json
{
  "number_of_trees": 1,
  "species": "fast_growing",
  "timeframe_years": 1
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "user123",
    "challenge_id": "transport-modal-shift",
    "verification_status": "auto_approved",
    "confidence_score": 0.91,
    "co2_raw_kg": 0.24,
    "co2_final_kg": 0.1512,
    "carbon_points_awarded": 2,
    "calculation_details": {...},
    "created_at": "2025-11-23T10:30:00.000Z"
  }
}
```

#### Get All Submissions
```
GET /api/submissions?user_id=xxx&challenge_id=xxx&verification_status=xxx
```

#### Get Submission by ID
```
GET /api/submissions/:id
```

#### Update Verification Status (Moderator)
```
PATCH /api/submissions/:id/verify
Content-Type: application/json

{
  "verification_status": "approved",
  "moderator_id": "mod123",
  "notes": "Verified manually"
}
```

---

### Reports

#### User Report
```
GET /api/reports/user/:user_id?period=week|month|all
```

Response:
```json
{
  "success": true,
  "data": {
    "user_id": "user123",
    "period": "week",
    "total_submissions": 10,
    "approved_submissions": 9,
    "total_co2_avoided_kg": 15.234,
    "total_carbon_points": 152,
    "by_category": {
      "transport": {
        "count": 5,
        "total_co2_kg": 10.5,
        "total_points": 105
      }
    }
  }
}
```

#### Cohort Report
```
GET /api/reports/cohort?cohort_id=xxx&period=week|month|all
```

#### Leaderboard
```
GET /api/reports/leaderboard?period=week|month|all&limit=10
```

---

## 🧮 Kategori Challenge & Formula

### Transport
- **Modal Shift**: `CO2 = (EF_before - EF_after) × distance_km × trips`
- Contoh: Motor → Jalan kaki, Mobil → Bus

### Reusable Items
- **Formula**: `CO2 = count × EF_item`
- Contoh: Tumbler, tas belanja reusable

### Food
- **Meatless Meal**: `CO2 = (EF_meat - EF_veg) × portions`
- **Food Waste**: `CO2 = weight_kg × EF_waste`

### Energy Saving
- **Formula**: `CO2 = power_kW × hours × EF_grid`
- Contoh: Matikan AC, lampu

### Waste Management
- **Composting**: `CO2 = weight_kg × EF_compost`
- **Recycling**: `CO2 = weight_kg × EF_material`

### Carbon Sequestration
- **Tree Planting**: `CO2 = trees × EF_tree × years`
- **Urban Greening**: `CO2 = area_sqm × EF_sqm × years`

### Repair/Upcycle
- **Formula**: `CO2 = EF_product_type`

## 🔒 Anti-Gaming Measures

1. **Daily CO₂ Limit**: Max 10 kg per user per hari (configurable)
2. **Submission Interval**: Min 60 menit antar submission untuk challenge sama
3. **Duplicate Image Detection**: Image hash comparison
4. **Trust Score**: Berdasarkan approval rate
5. **Rate Limiting**: 100 requests per 15 menit

## 📊 Verification & Confidence Scoring

| Confidence | Range | Kriteria |
|------------|-------|----------|
| High | 0.9-1.0 | Photo + EXIF + geotag + classifier match + moderator |
| Medium | 0.6-0.89 | Photo + EXIF atau geotag + classifier partial |
| Low | 0.3-0.59 | Photo tanpa EXIF/geotag |
| Very Low | 0.0-0.29 | Self-report text only |

## 🛠️ Project Structure

```
prototype/
├── src/
│   ├── config/
│   │   ├── challenges.js         # Challenge definitions
│   │   └── emissionFactors.js    # Emission factors & parameters
│   ├── database/
│   │   └── db.js                 # Simple JSON database
│   ├── routes/
│   │   ├── challenges.js         # Challenge endpoints
│   │   ├── submissions.js        # Submission endpoints
│   │   └── reports.js            # Reporting endpoints
│   ├── services/
│   │   ├── calculationService.js # CO2 calculation logic
│   │   ├── verificationService.js# EXIF, geotag, AI classifier
│   │   └── antiGamingService.js  # Anti-gaming checks
│   └── server.js                 # Express app entry point
├── data/                         # JSON database files
├── uploads/                      # Uploaded images
├── package.json
└── .env
```

## 🧪 Testing

### Test Manual Calculation
```bash
npm test
```

### Test API dengan curl

**Submit cycling challenge:**
```bash
curl -X POST http://localhost:3000/api/submissions \
  -F "user_id=test_user" \
  -F "challenge_id=cycling" \
  -F 'inputs={"distance_km":5,"mode_before":"motorbike","trips":1}' \
  -F "photo=@test_photo.jpg"
```

**Get user report:**
```bash
curl http://localhost:3000/api/reports/user/test_user?period=week
```

**Get leaderboard:**
```bash
curl http://localhost:3000/api/reports/leaderboard?limit=5
```

## ⚠️ Important Notes

### Placeholder Emission Factors
**SEMUA emission factors adalah PLACEHOLDER untuk prototype.** Harus diganti dengan nilai resmi dari:

- IPCC / GWP factors
- GHG Protocol database
- Indonesia Ministry of Environment
- Peer-reviewed LCA studies
- Local transport emission studies

### OpenAI API Key
Image classification menggunakan GPT-4 Vision API. Pastikan:
1. Punya OpenAI API key yang valid
2. Punya akses ke GPT-4 Vision model
3. Set `OPENAI_API_KEY` di `.env`

Jika tidak ada API key, classifier akan return confidence 0.5 (fallback).

## 🔧 Configuration

File `.env` parameters:

```env
# Server
PORT=3000

# OpenAI
OPENAI_API_KEY=sk-xxx

# Storage
UPLOAD_DIR=./uploads
DATABASE_DIR=./data

# Security
RATE_LIMIT_WINDOW_MS=900000        # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
DAILY_MAX_CO2_PER_USER_KG=10
MIN_SUBMISSION_INTERVAL_MINUTES=60

# Calculation
POINTS_PER_KG=10
CONSERVATIVENESS_FACTOR_GLOBAL=0.7
MIN_CO2_THRESHOLD_KG=0.01
```

## 📚 Example Calculations

### Contoh 1: Walking instead of Motorbike
```
Input: 3 km, motorbike → walk
- EF_motorbike = 0.08 kg/km
- EF_walk = 0.0 kg/km
- Baseline diff = 0.08 kg/km
- CO2_raw = 3 × 0.08 = 0.24 kg
- Conservative (0.7) = 0.168 kg
- Confidence (0.9) = 0.1512 kg
- Points = 2
```

### Contoh 2: Reusable Bottle (1 week)
```
Input: 7 bottles avoided
- EF_bottle = 0.06 kg
- CO2_raw = 7 × 0.06 = 0.42 kg
- Conservative (0.7) = 0.294 kg
- Confidence (0.9) = 0.2646 kg
- Points = 3
```

### Contoh 3: Meatless Meal
```
Input: beef → vegetarian, 1 portion
- EF_beef = 5.0 kg
- EF_veg = 1.2 kg
- Baseline diff = 3.8 kg
- CO2_raw = 3.8 kg
- Conservative (0.7) = 2.66 kg
- Confidence (0.8) = 2.128 kg
- Points = 21
```

## 🎯 Roadmap

- [ ] Replace placeholder emission factors dengan data resmi
- [ ] Implementasi PostgreSQL/MongoDB untuk production
- [ ] User authentication & authorization
- [ ] Admin dashboard untuk moderasi
- [ ] Webhook integration untuk sponsor reporting
- [ ] Mobile app integration
- [ ] Real-time notifications
- [ ] Advanced fraud detection ML model

## 📝 License

MIT

## 👥 Contributors

Ulinify Hackathon ITB Team

---

**💚 Mari bersama kurangi emisi CO₂ dan selamatkan bumi!**
