const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * AI-powered personalized challenge generator
 * Uses GPT-4 to create custom challenges based on user profile
 */
class ChallengeGeneratorAI {
  
  /**
   * Generate personalized challenges for user
   */
  async generatePersonalizedChallenges(userProfile, count = 5) {
    try {
      const prompt = this.buildPrompt(userProfile, count);
      
      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert sustainability coach and environmental scientist. Your role is to generate personalized eco-friendly challenges that are:
1. Realistic and achievable based on the user's current lifestyle
2. Impactful in reducing carbon footprint
3. Engaging and motivating
4. Culturally appropriate for Indonesia
5. Scientifically accurate in terms of environmental impact

Generate challenges in JSON format with proper structure.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(response.choices[0].message.content);
      return this.formatChallenges(result.challenges);

    } catch (error) {
      console.error('AI challenge generation error:', error);
      // Fallback to template-based challenges
      return this.generateTemplateChallenges(userProfile, count);
    }
  }

  /**
   * Build AI prompt based on user profile
   */
  buildPrompt(userProfile, count) {
    const { onboarding_answers, preferences, stats } = userProfile;
    
    let prompt = `Generate ${count} personalized sustainability challenges for a user with this profile:\n\n`;
    
    // Add onboarding answers context
    if (onboarding_answers) {
      prompt += `Current Lifestyle:\n`;
      if (onboarding_answers.transportation) {
        prompt += `- Transportation: ${Array.isArray(onboarding_answers.transportation) ? onboarding_answers.transportation.join(', ') : onboarding_answers.transportation}\n`;
      }
      if (onboarding_answers.diet) {
        prompt += `- Diet: ${onboarding_answers.diet}\n`;
      }
      if (onboarding_answers.waste_management) {
        prompt += `- Waste management: ${onboarding_answers.waste_management}\n`;
      }
      if (onboarding_answers.energy_usage) {
        prompt += `- Energy usage: ${onboarding_answers.energy_usage}\n`;
      }
      if (onboarding_answers.shopping_habits) {
        prompt += `- Shopping habits: ${Array.isArray(onboarding_answers.shopping_habits) ? onboarding_answers.shopping_habits.join(', ') : onboarding_answers.shopping_habits}\n`;
      }
      if (onboarding_answers.interests) {
        prompt += `- Interests: ${Array.isArray(onboarding_answers.interests) ? onboarding_answers.interests.join(', ') : onboarding_answers.interests}\n`;
      }
    }

    // Add preferences
    if (preferences) {
      prompt += `\nPreferences:\n`;
      prompt += `- Difficulty level: ${preferences.challenge_difficulty}\n`;
      if (preferences.categories_of_interest?.length > 0) {
        prompt += `- Categories of interest: ${preferences.categories_of_interest.join(', ')}\n`;
      }
    }

    // Add progress context
    if (stats) {
      prompt += `\nProgress:\n`;
      prompt += `- Challenges completed: ${stats.total_challenges_completed}\n`;
      prompt += `- CO2 saved: ${stats.total_co2_saved} kg\n`;
      prompt += `- Current streak: ${stats.current_streak} days\n`;
    }

    prompt += `\nGenerate challenges in this JSON format:
{
  "challenges": [
    {
      "title": "Challenge title in Indonesian",
      "description": "Detailed description in Indonesian",
      "category": "transport|food|energy|waste|water|shopping|lifestyle",
      "difficulty": "easy|medium|hard",
      "frequency": "daily|weekly|monthly|one_time",
      "estimated_impact": "Brief impact description",
      "estimated_co2_savings_kg": 0.5,
      "tips": ["tip 1", "tip 2", "tip 3"],
      "verification_method": "photo|self_report|tracker",
      "duration_days": 7,
      "reasoning": "Why this challenge fits the user"
    }
  ]
}

Important:
- Make challenges specific and actionable
- make challenges diverse across categories
- Use Indonesian language for title, description, and tips
- Consider the user's current habits to suggest meaningful improvements
- Provide realistic CO2 savings estimates
- Include 3-5 practical tips for each challenge
- Ensure challenges are culturally appropriate for Indonesia`;

    return prompt;
  }

  /**
   * Format AI-generated challenges
   */
  formatChallenges(challenges) {
    return challenges.map(challenge => ({
      ...challenge,
      id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      source: 'ai_generated',
      created_at: new Date().toISOString()
    }));
  }

  /**
   * Fallback template-based challenge generator
   */
  generateTemplateChallenges(userProfile, count) {
    const templates = {
      transport: [
        {
          title: 'Gunakan Transportasi Umum',
          description: 'Gunakan transportasi umum (bus, angkot, atau kereta) untuk perjalanan harian Anda selama 1 minggu',
          category: 'transport',
          difficulty: 'medium',
          frequency: 'daily',
          estimated_impact: 'Mengurangi emisi kendaraan pribadi',
          estimated_co2_savings_kg: 2.5,
          tips: [
            'Cek rute transportasi umum terdekat',
            'Berangkat lebih awal untuk antisipasi',
            'Ajak teman atau keluarga untuk ikut'
          ],
          verification_method: 'photo',
          duration_days: 7
        },
        {
          title: 'Bersepeda ke Tempat Kerja',
          description: 'Ganti kendaraan bermotor dengan sepeda untuk pergi ke tempat kerja atau kampus',
          category: 'transport',
          difficulty: 'medium',
          frequency: 'daily',
          estimated_impact: 'Zero emission transportasi',
          estimated_co2_savings_kg: 3.0,
          tips: [
            'Pilih rute yang aman dan nyaman',
            'Gunakan helm dan perlengkapan keselamatan',
            'Mulai dengan jarak dekat terlebih dahulu'
          ],
          verification_method: 'photo',
          duration_days: 7
        }
      ],
      food: [
        {
          title: 'Meatless Monday',
          description: 'Tidak makan daging setiap hari Senin selama 1 bulan',
          category: 'food',
          difficulty: 'easy',
          frequency: 'weekly',
          estimated_impact: 'Kurangi jejak karbon dari produksi daging',
          estimated_co2_savings_kg: 4.0,
          tips: [
            'Coba resep vegetarian Indonesia seperti gado-gado atau pecel',
            'Ganti protein hewani dengan tempe atau tahu',
            'Explore berbagai sayuran lokal'
          ],
          verification_method: 'photo',
          duration_days: 30
        },
        {
          title: 'Habiskan Makanan, Zero Waste',
          description: 'Habiskan semua makanan di piring, jangan ada yang terbuang selama 1 minggu',
          category: 'food',
          difficulty: 'easy',
          frequency: 'daily',
          estimated_impact: 'Kurangi food waste',
          estimated_co2_savings_kg: 1.5,
          tips: [
            'Ambil porsi secukupnya',
            'Simpan sisa makanan dengan baik',
            'Masak sesuai kebutuhan'
          ],
          verification_method: 'photo',
          duration_days: 7
        }
      ],
      energy: [
        {
          title: 'AC Off Challenge',
          description: 'Kurangi penggunaan AC minimal 4 jam per hari dengan membuka jendela atau menggunakan kipas angin',
          category: 'energy',
          difficulty: 'medium',
          frequency: 'daily',
          estimated_impact: 'Hemat energi listrik',
          estimated_co2_savings_kg: 5.0,
          tips: [
            'Buka jendela di pagi hari untuk sirkulasi udara',
            'Gunakan kipas angin sebagai alternatif',
            'Atur suhu AC lebih tinggi jika tetap digunakan (25-26°C)'
          ],
          verification_method: 'self_report',
          duration_days: 7
        }
      ],
      waste: [
        {
          title: 'Pilah Sampah 3R',
          description: 'Pisahkan sampah organik, anorganik, dan B3 setiap hari',
          category: 'waste',
          difficulty: 'easy',
          frequency: 'daily',
          estimated_impact: 'Memudahkan daur ulang',
          estimated_co2_savings_kg: 2.0,
          tips: [
            'Siapkan 3 tempat sampah terpisah',
            'Bersihkan kemasan sebelum dibuang',
            'Kompos sampah organik'
          ],
          verification_method: 'photo',
          duration_days: 14
        }
      ],
      shopping: [
        {
          title: 'Bawa Tas Belanja Sendiri',
          description: 'Selalu bawa tas belanja reusable saat berbelanja',
          category: 'shopping',
          difficulty: 'easy',
          frequency: 'weekly',
          estimated_impact: 'Kurangi penggunaan kantong plastik',
          estimated_co2_savings_kg: 0.5,
          tips: [
            'Simpan tas belanja di tas atau kendaraan',
            'Gunakan tas yang kuat dan tahan lama',
            'Tolak kantong plastik dengan sopan'
          ],
          verification_method: 'photo',
          duration_days: 30
        }
      ],
      lifestyle: [
        {
          title: 'Tumbler Challenge',
          description: 'Bawa tumbler sendiri dan hindari membeli minuman botol plastik',
          category: 'lifestyle',
          difficulty: 'easy',
          frequency: 'daily',
          estimated_impact: 'Kurangi sampah plastik',
          estimated_co2_savings_kg: 1.2,
          tips: [
            'Pilih tumbler berkapasitas cukup',
            'Cuci tumbler setiap hari',
            'Isi ulang di tempat minum yang tersedia'
          ],
          verification_method: 'photo',
          duration_days: 14
        }
      ]
    };

    // Select challenges based on user preferences
    const selectedChallenges = [];
    const categories = userProfile.preferences?.categories_of_interest?.length > 0
      ? userProfile.preferences.categories_of_interest
      : Object.keys(templates);

    for (const category of categories) {
      if (templates[category]) {
        selectedChallenges.push(...templates[category]);
      }
    }

    // Shuffle and take requested count
    const shuffled = selectedChallenges.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);

    return selected.map(challenge => ({
      ...challenge,
      id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      source: 'template',
      reasoning: 'Selected based on your preferences',
      created_at: new Date().toISOString()
    }));
  }

  /**
   * Generate challenge recommendations with ranking
   */
  async generateRecommendations(userProfile) {
    try {
      // Generate challenges
      const challenges = await this.generatePersonalizedChallenges(userProfile, 10);

      // Score and rank challenges
      const rankedChallenges = challenges.map(challenge => ({
        ...challenge,
        score: this.calculateChallengeScore(challenge, userProfile)
      }));

      // Sort by score
      rankedChallenges.sort((a, b) => b.score - a.score);

      return rankedChallenges.slice(0, 5); // Return top 5

    } catch (error) {
      console.error('Recommendation generation error:', error);
      throw error;
    }
  }

  /**
   * Calculate challenge relevance score
   */
  calculateChallengeScore(challenge, userProfile) {
    let score = 0;

    // Category match
    if (userProfile.preferences?.categories_of_interest?.includes(challenge.category)) {
      score += 30;
    }

    // Difficulty match
    if (challenge.difficulty === userProfile.preferences?.challenge_difficulty) {
      score += 20;
    }

    // Impact score
    score += challenge.estimated_co2_savings_kg * 5;

    // Frequency preference (daily challenges get slight boost)
    if (challenge.frequency === 'daily') score += 10;

    // Streak bonus (easier challenges if low streak)
    if (userProfile.stats?.current_streak < 3 && challenge.difficulty === 'easy') {
      score += 15;
    }

    return score;
  }
}

module.exports = new ChallengeGeneratorAI();
