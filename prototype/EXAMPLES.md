# Example API Requests

## Setup
```bash
# Set base URL
export API_URL=http://localhost:3000
```

## 1. Health Check

```bash
curl $API_URL/api/health
```

## 2. Get All Challenges

```bash
curl $API_URL/api/challenges
```

## 3. Get Specific Challenge

```bash
curl $API_URL/api/challenges/transport-modal-shift
```

## 4. Submit Transport Challenge

```bash
curl -X POST $API_URL/api/submissions \
  -F "user_id=alice123" \
  -F "challenge_id=transport-modal-shift" \
  -F 'inputs={"distance_km":5,"mode_before":"car","mode_after":"bus_per_passenger","trips":1}' \
  -F "photo=@sample_photo.jpg"
```

## 5. Submit Reusable Bottle Challenge

```bash
curl -X POST $API_URL/api/submissions \
  -F "user_id=bob456" \
  -F "challenge_id=reusable-bottle" \
  -F 'inputs={"count":7}' \
  -F "photo=@tumbler_photo.jpg"
```

## 6. Submit Meatless Meal Challenge

```bash
curl -X POST $API_URL/api/submissions \
  -F "user_id=charlie789" \
  -F "challenge_id=meatless-meal" \
  -F 'inputs={"meal_type_before":"beef","meal_type_after":"vegetarian","portions":1}' \
  -F "photo=@meal_photo.jpg"
```

## 7. Submit Energy Saving Challenge

```bash
curl -X POST $API_URL/api/submissions \
  -F "user_id=diana321" \
  -F "challenge_id=energy-ac-reduction" \
  -F 'inputs={"device_power_kw":1.2,"hours_saved":2}' \
  -F "photo=@ac_off_photo.jpg"
```

## 8. Submit Composting Challenge

```bash
curl -X POST $API_URL/api/submissions \
  -F "user_id=evan654" \
  -F "challenge_id=composting" \
  -F 'inputs={"composted_weight_kg":2.5}' \
  -F "photo=@compost_photo.jpg"
```

## 9. Submit Recycling Challenge

```bash
curl -X POST $API_URL/api/submissions \
  -F "user_id=fiona987" \
  -F "challenge_id=recycling" \
  -F 'inputs={"material_type":"PET_plastic","weight_kg":1.5}' \
  -F "photo=@recycle_photo.jpg"
```

## 10. Submit Tree Planting Challenge

```bash
curl -X POST $API_URL/api/submissions \
  -F "user_id=george147" \
  -F "challenge_id=tree-planting" \
  -F 'inputs={"number_of_trees":1,"species":"fast_growing","timeframe_years":1}' \
  -F "photo=@tree_photo.jpg" \
  -F 'expected_location={"latitude":-6.9175,"longitude":107.6191}'
```

## 11. Get All Submissions

```bash
curl "$API_URL/api/submissions"
```

## 12. Get Submissions by User

```bash
curl "$API_URL/api/submissions?user_id=alice123"
```

## 13. Get Specific Submission

```bash
curl $API_URL/api/submissions/{submission_id}
```

## 14. Moderator: Approve Submission

```bash
curl -X PATCH $API_URL/api/submissions/{submission_id}/verify \
  -H "Content-Type: application/json" \
  -d '{
    "verification_status": "approved",
    "moderator_id": "mod_john",
    "notes": "Photo verified, good quality evidence"
  }'
```

## 15. Moderator: Reject Submission

```bash
curl -X PATCH $API_URL/api/submissions/{submission_id}/verify \
  -H "Content-Type: application/json" \
  -d '{
    "verification_status": "rejected",
    "moderator_id": "mod_jane",
    "notes": "Photo does not match challenge requirements"
  }'
```

## 16. Get User Report (Weekly)

```bash
curl "$API_URL/api/reports/user/alice123?period=week"
```

## 17. Get User Report (Monthly)

```bash
curl "$API_URL/api/reports/user/bob456?period=month"
```

## 18. Get User Report (All Time)

```bash
curl "$API_URL/api/reports/user/charlie789?period=all"
```

## 19. Get Cohort Report

```bash
curl "$API_URL/api/reports/cohort?period=month"
```

## 20. Get Leaderboard

```bash
curl "$API_URL/api/reports/leaderboard?period=week&limit=10"
```

## 21. Get Methodology Documentation

```bash
curl $API_URL/api/methodology
```

## 22. Get Emission Factors for Challenge

```bash
curl $API_URL/api/challenges/transport-modal-shift/emission-factors
```

---

## Test Scenarios

### Scenario 1: User Daily Routine (Alice)

```bash
# Morning: Walk to work (3 km)
curl -X POST $API_URL/api/submissions \
  -F "user_id=alice123" \
  -F "challenge_id=walking" \
  -F 'inputs={"distance_km":3,"mode_before":"motorbike","trips":1}'

# Lunch: Vegetarian meal
curl -X POST $API_URL/api/submissions \
  -F "user_id=alice123" \
  -F "challenge_id=meatless-meal" \
  -F 'inputs={"meal_type_before":"chicken","meal_type_after":"vegetarian","portions":1}'

# Afternoon: Use reusable bottle
curl -X POST $API_URL/api/submissions \
  -F "user_id=alice123" \
  -F "challenge_id=reusable-bottle" \
  -F 'inputs={"count":1}'

# Evening: Check weekly report
curl "$API_URL/api/reports/user/alice123?period=week"
```

### Scenario 2: Anti-Gaming Test (Too Frequent)

```bash
# First submission
curl -X POST $API_URL/api/submissions \
  -F "user_id=test_user" \
  -F "challenge_id=cycling" \
  -F 'inputs={"distance_km":2,"mode_before":"motorbike","trips":1}'

# Try to submit again immediately (should be rejected)
curl -X POST $API_URL/api/submissions \
  -F "user_id=test_user" \
  -F "challenge_id=cycling" \
  -F 'inputs={"distance_km":2,"mode_before":"motorbike","trips":1}'
```

### Scenario 3: Cohort Campaign Report

```bash
# Multiple users submit
for user in alice bob charlie diana evan; do
  curl -X POST $API_URL/api/submissions \
    -F "user_id=${user}123" \
    -F "challenge_id=cycling" \
    -F 'inputs={"distance_km":5,"mode_before":"motorbike","trips":1}'
done

# Get cohort report
curl "$API_URL/api/reports/cohort?period=week"

# Get leaderboard
curl "$API_URL/api/reports/leaderboard?period=week&limit=5"
```

---

## Response Examples

### Successful Submission Response
```json
{
  "success": true,
  "data": {
    "id": "abc123",
    "user_id": "alice123",
    "challenge_id": "transport-modal-shift",
    "verification_status": "auto_approved",
    "confidence_score": 0.91,
    "co2_raw_kg": 0.8,
    "co2_final_kg": 0.5096,
    "conservativeness_factor": 0.7,
    "carbon_points_awarded": 5,
    "created_at": "2025-11-23T10:30:00.000Z"
  }
}
```

### Anti-Gaming Violation Response
```json
{
  "success": false,
  "error": "Anti-gaming violation",
  "violations": [
    {
      "type": "submission_too_frequent",
      "message": "Please wait 55 more minutes"
    }
  ]
}
```

### User Report Response
```json
{
  "success": true,
  "data": {
    "user_id": "alice123",
    "period": "week",
    "total_submissions": 15,
    "approved_submissions": 14,
    "total_co2_avoided_kg": 25.5678,
    "total_carbon_points": 256,
    "by_category": {
      "transport": {
        "count": 8,
        "total_co2_kg": 15.2,
        "total_points": 152
      },
      "food_substitution": {
        "count": 4,
        "total_co2_kg": 8.5,
        "total_points": 85
      }
    }
  }
}
```
