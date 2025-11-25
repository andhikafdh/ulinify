import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add token
api.interceptors.request.use(
  (config: any) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response: any) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ==================== AUTH API ====================

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  onboarding_completed: boolean;
  created_at: string;
  profile?: {
    avatar?: string;
    bio?: string;
    location?: string;
  };
  preferences?: {
    challenge_difficulty?: string;
    categories_of_interest?: string[];
    notification_enabled?: boolean;
  };
  stats?: {
    total_challenges_completed: number;
    total_co2_saved: number;
    total_points: number;
    current_streak: number;
    longest_streak: number;
  };
}

export const authAPI = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    
    // Save tokens and user to localStorage
    if (response.data.success) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    
    // Save tokens and user to localStorage
    if (response.data.success) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    
    // Update user in localStorage
    if (response.data.success) {
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },
};

// ==================== USER API ====================

export interface OnboardingAnswers {
  transportation: string[];
  diet: string;
  waste_management: string;
  energy_usage: string;
  shopping_habits: string[];
  interests: string[];
}

export interface UpdateProfileData {
  name?: string;
  profile?: {
    avatar?: string;
    bio?: string;
    location?: string;
  };
}

export interface UpdatePreferencesData {
  challenge_difficulty?: 'easy' | 'medium' | 'hard';
  categories_of_interest?: string[];
  notification_enabled?: boolean;
}

export const userAPI = {
  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileData) => {
    const response = await api.put('/user/profile', data);
    
    // Update user in localStorage
    if (response.data.success) {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...currentUser, ...response.data.data }));
    }
    
    return response.data;
  },

  getOnboardingQuestions: async () => {
    const response = await api.get('/user/onboarding');
    return response.data;
  },

  submitOnboarding: async (answers: OnboardingAnswers) => {
    const response = await api.post('/user/onboarding', { answers });
    
    // Update user in localStorage
    if (response.data.success) {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...currentUser, onboarding_completed: true }));
    }
    
    return response.data;
  },

  updatePreferences: async (data: UpdatePreferencesData) => {
    const response = await api.put('/user/preferences', data);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/user/stats');
    return response.data;
  },
};

// ==================== CHALLENGE API ====================

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  frequency: string;
  estimated_impact?: string;
  estimated_co2_savings_kg: number;
  points_reward: number;
  tips: string[];
  verification_method?: string;
  duration_days: number;
  source: 'ai_generated' | 'template';
  reasoning?: string;
  score?: number;
  user_status?: string;
  user_progress?: number;
}

export interface UserChallenge {
  id: string;
  user_id: string;
  challenge_id: string;
  status: 'active' | 'completed';
  progress: number;
  started_at: string;
  completed_at?: string;
  target_completion: string;
  proof_url?: string;
  notes?: string;
  challenge_details?: Challenge;
}

export interface CompleteChallenge {
  proof_url?: string;
  notes?: string;
}

export const challengeAPI = {
  getRecommendations: async () => {
    const response = await api.get('/challenges/recommendations');
    return response.data;
  },

  generateChallenges: async (count: number = 5) => {
    const response = await api.post('/challenges/generate', { count });
    return response.data;
  },

  getMyChallenges: async (status?: 'active' | 'completed' | 'all') => {
    const params = status ? { status } : {};
    const response = await api.get('/challenges/my-challenges', { params });
    return response.data;
  },

  getChallengeDetails: async (id: string) => {
    const response = await api.get(`/challenges/${id}`);
    return response.data;
  },

  acceptChallenge: async (id: string) => {
    const response = await api.post(`/challenges/${id}/accept`);
    return response.data;
  },

  completeChallenge: async (id: string, data: CompleteChallenge) => {
    const response = await api.post(`/challenges/${id}/complete`, data);
    return response.data;
  },
};

// ==================== HELPER FUNCTIONS ====================

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('accessToken');
};

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const clearAuth = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

export default api;
