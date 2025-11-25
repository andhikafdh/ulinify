"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { challengeAPI, Challenge } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Sparkles, TrendingUp, Clock, Target, Leaf } from 'lucide-react';

export default function ChallengeRecommendationsPage() {
	const [recommendations, setRecommendations] = useState<Challenge[]>([]);
	const [loading, setLoading] = useState(true);
	const [accepting, setAccepting] = useState<string | null>(null);
	const [error, setError] = useState('');
	const router = useRouter();
	const { user, refreshUser } = useAuth();

	useEffect(() => {
		loadRecommendations();
	}, []);

	const loadRecommendations = async () => {
		try {
			setLoading(true);
			const response = await challengeAPI.getRecommendations();
			
			if (response.success) {
				setRecommendations(response.data.recommendations);
			}
		} catch (err: any) {
			setError(err.response?.data?.error || 'Failed to load recommendations');
			
			if (err.response?.data?.onboarding_required) {
				router.push('/onboarding');
			}
		} finally {
			setLoading(false);
		}
	};

	const handleAcceptChallenge = async (challengeId: string) => {
		try {
			setAccepting(challengeId);
			const response = await challengeAPI.acceptChallenge(challengeId);
			
			if (response.success) {
				await refreshUser();
				alert('Challenge accepted! 🎉');
				setRecommendations(prev => prev.filter(c => c.id !== challengeId));
			}
		} catch (err: any) {
			alert(err.response?.data?.error || 'Failed to accept challenge');
		} finally {
			setAccepting(null);
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

	const getDifficultyColor = (difficulty: string) => {
		const colors: Record<string, string> = {
			easy: 'bg-green-500',
			medium: 'bg-yellow-500',
			hard: 'bg-red-500'
		};
		return colors[difficulty] || 'bg-gray-500';
	};

	if (loading) {
		return (
			<ProtectedRoute>
				<div className="min-h-screen flex items-center justify-center bg-[#001E31]">
					<div className="text-center">
						<div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#FF00BF] mx-auto"></div>
						<p className="mt-4 text-white text-lg">Generating personalized challenges...</p>
					</div>
				</div>
			</ProtectedRoute>
		);
	}
	return (
		<ProtectedRoute>
			<div className="min-h-screen bg-[#001E31] py-10 px-4 pb-32">
				<div className="max-w-6xl mx-auto">
					<motion.div 
						className="text-center mb-10"
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
					>
						<h1 className="text-5xl md:text-6xl font-bold text-white mb-4 flex items-center justify-center gap-3">
							<Sparkles className="text-[#FF00BF]" size={48} />
							Rekomendasi Tantangan Untukmu
						</h1>
						<p className="text-xl text-gray-300">
							Dibuat khusus berdasarkan gaya hidupmu
						</p>
						
						{user && (
							<div className="mt-6 flex items-center justify-center gap-6 text-white flex-wrap">
								<div className="flex items-center gap-2">
									<Target className="text-[#FF00BF]" />
									<span>{user.stats?.total_challenges_completed || 0} Selesai</span>
								</div>
								<div className="flex items-center gap-2">
									<Leaf className="text-green-400" />
									<span>{user.stats?.total_co2_saved?.toFixed(1) || 0} kg CO₂</span>
								</div>
								<div className="flex items-center gap-2">
									<TrendingUp className="text-yellow-400" />
									<span>{user.stats?.current_streak || 0} Hari Streak</span>
								</div>
							</div>
						)}
					</motion.div>

					{error && (
						<div className="bg-red-500/10 border border-red-500 text-red-500 px-6 py-4 rounded-lg mb-6">
							{error}
						</div>
					)}

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{recommendations.map((challenge, index) => (
							<motion.div
								key={challenge.id}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: index * 0.1 }}
							>
								<Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-[#FF00BF]/50 transition-all h-full flex flex-col">
									<CardHeader>
										<div className="flex items-start justify-between mb-2">
											<span className="text-4xl">{getCategoryIcon(challenge.category)}</span>
											<div className="flex gap-2">
												<span className={`px-2 py-1 rounded text-xs font-semibold text-white ${getDifficultyColor(challenge.difficulty)}`}>
													{challenge.difficulty}
												</span>
												{challenge.source === 'ai_generated' && (
													<span className="px-2 py-1 rounded text-xs font-semibold bg-[#FF00BF] text-white">
														AI
													</span>
												)}
											</div>
										</div>
										<CardTitle className="text-white text-xl mb-2">
											{challenge.title}
										</CardTitle>
										<CardDescription className="text-gray-300">
											{challenge.description}
										</CardDescription>
									</CardHeader>
									
									<CardContent className="grow flex flex-col justify-between">
										<div className="space-y-3 mb-4">
											<div className="flex items-center gap-2 text-gray-300 text-sm">
												<Leaf className="text-green-400" size={16} />
												<span>~{challenge.estimated_co2_savings_kg} kg CO₂</span>
											</div>
											<div className="flex items-center gap-2 text-gray-300 text-sm">
												<Clock className="text-blue-400" size={16} />
												<span>{challenge.frequency} • {challenge.duration_days} hari</span>
											</div>
											
											{challenge.reasoning && (
												<div className="bg-white/5 rounded-lg p-3 mt-3">
													<p className="text-xs text-gray-300 italic">
														"{challenge.reasoning}"
													</p>
												</div>
											)}
											
											{challenge.tips && challenge.tips.length > 0 && (
												<div className="mt-3">
													<p className="text-xs font-semibold text-white mb-1">Tips:</p>
													<ul className="text-xs text-gray-300 space-y-1">
														{challenge.tips.slice(0, 2).map((tip, i) => (
															<li key={i}>• {tip}</li>
														))}
													</ul>
												</div>
											)}
										</div>
										
										<Button
											onClick={() => handleAcceptChallenge(challenge.id)}
											disabled={accepting === challenge.id}
											className="w-full bg-[#FF00BF] hover:bg-[#FF00BF]/90 text-white font-semibold py-3 rounded-lg"
										>
											{accepting === challenge.id ? 'Menerima...' : 'Terima Tantangan'}
										</Button>
									</CardContent>
								</Card>
							</motion.div>
						))}
					</div>

					{recommendations.length === 0 && !loading && !error && (
						<div className="text-center py-20">
							<p className="text-gray-300 text-xl mb-4">Belum ada rekomendasi</p>
							<Button 
								onClick={loadRecommendations}
								className="bg-[#FF00BF] hover:bg-[#FF00BF]/90 text-white"
							>
								Generate Rekomendasi Baru
							</Button>
						</div>
					)}

					<div className="mt-10 flex justify-center gap-4">
						<Button
							onClick={loadRecommendations}
							className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold px-8 py-6 rounded-xl transition-all"
						>
							🔄 Generate Ulang
						</Button>
						<Button
							onClick={() => router.push('/dashboard')}
							className="bg-[#FF00BF] hover:bg-[#FF00BF]/90 text-white font-semibold px-8 py-6 rounded-xl transition-all"
						>
							Lanjut →
						</Button>
					</div>
				</div>
			</div>
		</ProtectedRoute>
	);
}
