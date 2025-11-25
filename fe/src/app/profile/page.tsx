"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  User,
  Award,
  TrendingUp,
  Leaf,
  Calendar,
  ChevronLeft,
  Edit,
  Settings
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);

  // Achievement badges
  const achievements = [
    {
      id: 'streak_master',
      icon: '🔥',
      title: 'Streak Master',
      description: 'Pertahankan streak 7 hari',
      unlocked: (user?.stats?.current_streak || 0) >= 7,
      progress: Math.min((user?.stats?.current_streak || 0) / 7, 1) * 100
    },
    {
      id: 'bus_rider',
      icon: '🚌',
      title: 'Pejuang Bis',
      description: 'Selesaikan 5 challenge transportasi',
      unlocked: false,
      progress: 40
    },
    {
      id: 'cyclist',
      icon: '🚴',
      title: 'Sepeda',
      description: 'Gunakan sepeda 10 kali',
      unlocked: false,
      progress: 30
    }
  ];

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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <Button
                onClick={() => router.push('/dashboard')}
                variant="ghost"
                className="text-gray-300 hover:text-white p-2"
              >
                <ChevronLeft size={24} />
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => router.push('/settings')}
                  variant="ghost"
                  className="text-gray-300 hover:text-white p-2"
                >
                  <Settings size={24} />
                </Button>
              </div>
            </div>

            {/* Profile Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FF00BF] to-[#7D9CB1] flex items-center justify-center">
                  <User className="text-white" size={48} />
                </div>
                <Button
                  size="sm"
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#FF00BF] hover:bg-[#FF00BF]/90 p-0"
                >
                  <Edit size={16} />
                </Button>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  {user?.name}
                </h1>
                <p className="text-gray-400 text-sm">
                  {user?.email}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Overview Section */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Carbon Saved Card */}
              <Card className="bg-gradient-to-br from-[#FF00BF] to-[#FF00BF]/80 border-none">
                <CardContent className="p-6">
                  <div className="flex flex-col">
                    <p className="text-white/90 text-sm mb-2">Carbon Saved</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-bold text-white">
                        -{Math.floor(user?.stats?.total_co2_saved || 0)}
                      </span>
                      <span className="text-2xl font-semibold text-white">g</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Day Streaks Card */}
              <Card className="bg-[#003B5C] border-none">
                <CardContent className="p-6">
                  <div className="flex flex-col">
                    <p className="text-gray-300 text-sm mb-2">Day Streaks</p>
                    <p className="text-5xl font-bold text-white">
                      {user?.stats?.current_streak || 0}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Ulinify Points Card - Full Width */}
              <Card className="md:col-span-2 bg-gradient-to-br from-[#00FFA1] to-[#00CC81] border-none">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#001E31] text-sm mb-2">Ulinify Points</p>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center">
                          <span className="text-sm">🪙</span>
                        </div>
                        <span className="text-4xl font-bold text-[#001E31]">
                          {user?.stats?.total_points || 45201}
                        </span>
                      </div>
                      <p className="text-[#001E31]/70 text-xs mt-2">Tukar Poin</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Achievements Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Achievements</h2>
              <Button
                variant="ghost"
                className="text-[#00FFA1] hover:text-[#00FFA1]/80 text-sm"
              >
                Lihat Semua
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                >
                  <Card 
                    className={`border-none relative overflow-hidden ${
                      achievement.unlocked 
                        ? 'bg-gradient-to-br from-[#FF00BF]/20 to-[#FF00BF]/5' 
                        : 'bg-[#003B5C]'
                    }`}
                  >
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                      {/* Progress bar at the bottom */}
                      {!achievement.unlocked && (
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10">
                          <div 
                            className="h-full bg-[#00FFA1] transition-all"
                            style={{ width: `${achievement.progress}%` }}
                          />
                        </div>
                      )}
                      
                      <div className={`text-5xl mb-3 ${!achievement.unlocked && 'grayscale opacity-50'}`}>
                        {achievement.icon}
                      </div>
                      <h3 className={`text-sm font-semibold mb-1 ${
                        achievement.unlocked ? 'text-white' : 'text-gray-400'
                      }`}>
                        {achievement.title}
                      </h3>
                      {achievement.unlocked && (
                        <div className="absolute top-2 right-2">
                          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Additional Stats */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Leaf className="text-green-400" size={24} />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Total Challenge</p>
                      <p className="text-2xl font-bold text-white">
                        {user?.stats?.total_challenges_completed || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Calendar className="text-blue-400" size={24} />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Member Since</p>
                      <p className="text-lg font-semibold text-white">
                        {new Date(user?.created_at || Date.now()).toLocaleDateString('id-ID', { 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Logout Button */}
          <motion.div
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Button
              onClick={() => logout()}
              variant="outline"
              className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 py-6 rounded-xl"
            >
              Logout
            </Button>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
