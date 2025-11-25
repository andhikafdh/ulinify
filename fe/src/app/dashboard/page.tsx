"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { challengeAPI, Challenge } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Target, 
  Leaf,
  Award,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Plus
} from 'lucide-react';

interface UserChallenge {
  id: string;
  challenge_id: string;
  status: string;
  progress: number;
  started_at: string;
  target_completion: string;
  challenge_details?: Challenge;
}

export default function DashboardPage() {
  const [activeChallenges, setActiveChallenges] = useState<UserChallenge[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<UserChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user, logout } = useAuth();

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      const [activeResponse, completedResponse] = await Promise.all([
        challengeAPI.getMyChallenges('active'),
        challengeAPI.getMyChallenges('completed')
      ]);

      if (activeResponse.success) {
        setActiveChallenges(activeResponse.data);
      }
      if (completedResponse.success) {
        setCompletedChallenges(completedResponse.data);
      }
    } catch (error) {
      console.error('Failed to load challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      transport: '🚌',
      food: '🍃',
      energy: '⚡',
      waste: '♻️',
      water: '💧',
      shopping: '🛍️',
      lifestyle: '🌱'
    };
    return icons[category] || '🌍';
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-[#001E31]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#FF00BF]"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#001E31] py-8 px-4 pb-32">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  Halo, {user?.name}! 👋
                </h1>
                <p className="text-gray-300 text-lg">
                  Terus lanjutkan perjalanan ramah lingkunganmu
                </p>
              </div>
              <Button
                onClick={() => logout()}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Logout
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <Card className="bg-gradient-to-br from-[#FF00BF]/20 to-[#FF00BF]/5 border-[#FF00BF]/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm">Total Challenge</p>
                      <p className="text-3xl font-bold text-white mt-1">
                        {user?.stats?.total_challenges_completed || 0}
                      </p>
                    </div>
                    <Target className="text-[#FF00BF]" size={40} />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/20 to-green-500/5 border-green-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm">CO₂ Tersimpan</p>
                      <p className="text-3xl font-bold text-white mt-1">
                        {user?.stats?.total_co2_saved?.toFixed(1) || 0} kg
                      </p>
                    </div>
                    <Leaf className="text-green-400" size={40} />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border-yellow-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm">Streak</p>
                      <p className="text-3xl font-bold text-white mt-1">
                        {user?.stats?.current_streak || 0} hari
                      </p>
                    </div>
                    <TrendingUp className="text-yellow-400" size={40} />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-blue-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm">Total Poin</p>
                      <p className="text-3xl font-bold text-white mt-1">
                        {user?.stats?.total_points || 0}
                      </p>
                    </div>
                    <Award className="text-blue-400" size={40} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => router.push('/recommendations')}
                className="bg-[#FF00BF] hover:bg-[#FF00BF]/90 text-white font-semibold py-8 rounded-xl text-lg"
              >
                <Plus className="mr-2" size={24} />
                Cari Challenge Baru
              </Button>
              
              <Button
                onClick={() => router.push('/challenges/active')}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 font-semibold py-8 rounded-xl text-lg"
              >
                <Target className="mr-2" size={24} />
                Challenge Aktif
              </Button>
              
              <Button
                onClick={() => router.push('/profile')}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 font-semibold py-8 rounded-xl text-lg"
              >
                <Award className="mr-2" size={24} />
                Profil & Riwayat
              </Button>
            </div>
          </motion.div>

          {/* Active Challenges */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Target className="text-[#FF00BF]" />
                Challenge Aktif
              </h2>
              {activeChallenges.length > 0 && (
                <Button
                  onClick={() => router.push('/challenges/active')}
                  variant="ghost"
                  className="text-gray-300 hover:text-white"
                >
                  Lihat Semua
                  <ChevronRight size={20} />
                </Button>
              )}
            </div>

            {activeChallenges.length === 0 ? (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-12 text-center">
                  <Target className="mx-auto text-gray-500 mb-4" size={64} />
                  <p className="text-gray-300 text-lg mb-4">
                    Belum ada challenge aktif
                  </p>
                  <Button
                    onClick={() => router.push('/recommendations')}
                    className="bg-[#FF00BF] hover:bg-[#FF00BF]/90 text-white"
                  >
                    Mulai Challenge Sekarang
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeChallenges.slice(0, 3).map((userChallenge) => (
                  <Card 
                    key={userChallenge.id}
                    className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-[#FF00BF]/50 transition-all cursor-pointer"
                    onClick={() => router.push(`/challenges/${userChallenge.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-4xl">
                          {getCategoryIcon(userChallenge.challenge_details?.category || '')}
                        </span>
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-green-500 text-white">
                          Aktif
                        </span>
                      </div>
                      <CardTitle className="text-white text-lg">
                        {userChallenge.challenge_details?.title}
                      </CardTitle>
                      <CardDescription className="text-gray-300 text-sm">
                        {userChallenge.challenge_details?.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Progress</span>
                          <span className="text-white font-semibold">
                            {userChallenge.progress}%
                          </span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div 
                            className="bg-[#FF00BF] h-2 rounded-full transition-all"
                            style={{ width: `${userChallenge.progress}%` }}
                          />
                        </div>
                        <div className="flex items-center gap-2 text-gray-300 text-xs mt-3">
                          <Calendar size={14} />
                          <span>
                            Target: {new Date(userChallenge.target_completion).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>

          {/* Recent Completions */}
          {completedChallenges.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-4">
                <CheckCircle2 className="text-green-400" />
                Challenge Selesai
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedChallenges.slice(0, 3).map((userChallenge) => (
                  <Card 
                    key={userChallenge.id}
                    className="bg-white/5 border-white/10 hover:border-green-400/50 transition-all"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-3xl">
                          {getCategoryIcon(userChallenge.challenge_details?.category || '')}
                        </span>
                        <CheckCircle2 className="text-green-400" size={24} />
                      </div>
                      <CardTitle className="text-white text-lg">
                        {userChallenge.challenge_details?.title}
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-green-400">
                          <Leaf size={16} />
                          <span>
                            {userChallenge.challenge_details?.estimated_co2_savings_kg} kg CO₂
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-yellow-400">
                          <Award size={16} />
                          <span>
                            +{userChallenge.challenge_details?.points_reward} poin
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
