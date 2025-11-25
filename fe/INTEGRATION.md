# Ulinify Frontend

Frontend Next.js aplikasi Ulinify terintegrasi dengan Backend API.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd fe
npm install
```

### 2. Setup Environment Variables

Buat file `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### 3. Run Development Server

```bash
npm run dev
```

Frontend akan jalan di `http://localhost:3000`

## 📡 API Integration

Frontend sudah terintegrasi penuh dengan backend API:

### Features Terintegrasi:
- ✅ **Authentication** - Login, Register dengan JWT
- ✅ **Auto Token Refresh** - Seamless token refresh saat expired
- ✅ **Protected Routes** - Redirect otomatis ke login jika belum auth
- ✅ **Onboarding** - Submit jawaban ke backend
- ✅ **AI Recommendations** - Load personalized challenges dari backend
- ✅ **Challenge Management** - Accept & complete challenges

### API Client (`src/lib/api.ts`)

```typescript
import { authAPI, userAPI, challengeAPI } from '@/lib/api';

// Auth
await authAPI.login({ email, password });
await authAPI.register({ email, password, name });
await authAPI.logout();

// User
await userAPI.getProfile();
await userAPI.submitOnboarding(answers);
await userAPI.updatePreferences(preferences);

// Challenges
await challengeAPI.getRecommendations();
await challengeAPI.acceptChallenge(id);
await challengeAPI.completeChallenge(id, data);
```

### Auth Context (`src/contexts/AuthContext.tsx`)

```typescript
import { useAuth } from '@/contexts/AuthContext';

const { user, loading, login, register, logout, refreshUser } = useAuth();
```

## 🔐 Protected Routes

Gunakan `ProtectedRoute` component untuk halaman yang perlu authentication:

```typescript
import ProtectedRoute from '@/components/ProtectedRoute';

export default function MyPage() {
  return (
    <ProtectedRoute>
      {/* Your protected content */}
    </ProtectedRoute>
  );
}
```

## 📁 File Structure

```
fe/
├── src/
│   ├── app/
│   │   ├── login/              # Login page
│   │   ├── onboarding/         # Initial onboarding
│   │   ├── question/           # Onboarding questions
│   │   └── recommendations/    # AI recommendations
│   ├── components/
│   │   ├── login-form.tsx      # Login form terintegrasi
│   │   ├── onboarding-step.tsx # Onboarding steps
│   │   └── ProtectedRoute.tsx  # Auth guard component
│   ├── contexts/
│   │   └── AuthContext.tsx     # Global auth state
│   └── lib/
│       ├── api.ts              # API client & functions
│       └── utils.ts            # Utilities
├── .env.local                  # Environment variables
└── package.json
```

## 🧪 Testing Integration

### 1. Start Backend
```bash
cd be
npm run dev
```

### 2. Start Frontend
```bash
cd fe
npm run dev
```

### 3. Test Flow
1. Register user di `/login`
2. Complete onboarding di `/onboarding` → `/question/1`
3. View recommendations di `/recommendations`
4. Accept challenge
5. View stats update

## 🔄 Auto Token Refresh

API client otomatis handle token refresh:

```typescript
// Axios interceptor di api.ts
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Auto refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      const response = await axios.post('/auth/refresh', { refreshToken });
      
      // Retry original request dengan token baru
      return api(originalRequest);
    }
  }
);
```

## 📱 Pages Overview

### `/login`
- Login & Register forms
- Auto redirect based on onboarding status
- Integrated dengan `authAPI.login()` dan `authAPI.register()`

### `/onboarding`
- Welcome screen
- Check if user already completed onboarding
- Redirect ke questions atau recommendations

### `/question/[step]`
- Dynamic onboarding questions dari backend
- Submit answers ke `userAPI.submitOnboarding()`
- Progress bar & validation

### `/recommendations`
- Load AI-generated recommendations dari backend
- Accept challenges
- View user stats (CO₂ saved, streak, points)
- Refresh recommendations button

## 🎨 UI Components

Menggunakan shadcn/ui components:
- `Button` - CTA buttons
- `Card` - Challenge cards
- `Input` - Form inputs
- `Form` - React Hook Form integration

## ⚙️ Configuration

### Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api  # Backend API URL
```

### TypeScript Types
Semua API types sudah defined di `src/lib/api.ts`:
- `User`
- `Challenge`
- `OnboardingAnswers`
- `AuthResponse`
- dll.

## 🚨 Error Handling

```typescript
try {
  await challengeAPI.getRecommendations();
} catch (err: any) {
  // Check if onboarding required
  if (err.response?.data?.onboarding_required) {
    router.push('/onboarding');
  }
  
  // Show error message
  setError(err.response?.data?.error || 'Failed');
}
```

## 🔧 Development Tips

### Debug API Calls
```typescript
// Network tab di DevTools untuk melihat API requests
// atau log di console:
console.log('API Response:', response);
```

### Check Auth State
```typescript
const { user } = useAuth();
console.log('Current user:', user);
console.log('Onboarding completed:', user?.onboarding_completed);
```

### LocalStorage
```typescript
// Check tokens
localStorage.getItem('accessToken');
localStorage.getItem('refreshToken');
localStorage.getItem('user');
```

## 📚 Next Steps

1. **Challenge Submission**: Integrate prototype CO₂ calculator API
2. **Photo Upload**: Implement photo verification
3. **Leaderboard**: Show top users
4. **Notifications**: Real-time updates
5. **PWA**: Make it installable

## 🤝 Backend Integration Checklist

- ✅ Authentication (Login/Register)
- ✅ Token management (Access + Refresh)
- ✅ Protected routes
- ✅ Onboarding flow
- ✅ AI Challenge recommendations
- ✅ Accept challenges
- ⏳ Complete challenges (need photo upload)
- ⏳ View challenge history
- ⏳ Leaderboard
- ⏳ User profile edit

---

**🌱 Happy Coding!**
