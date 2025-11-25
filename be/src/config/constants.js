/**
 * Application constants
 */

const CHALLENGE_CATEGORIES = [
  'transport',
  'food',
  'energy',
  'waste',
  'water',
  'shopping',
  'lifestyle'
];

const CHALLENGE_DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
};

const CHALLENGE_FREQUENCY = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  ONE_TIME: 'one_time'
};

const USER_ROLES = {
  USER: 'user',
  MODERATOR: 'moderator',
  ADMIN: 'admin'
};

const ONBOARDING_QUESTIONS = [
  {
    id: 'transportation',
    question: 'Bagaimana cara Anda biasanya berpergian?',
    type: 'multiple',
    options: [
      { value: 'car', label: 'Mobil pribadi' },
      { value: 'motorcycle', label: 'Motor' },
      { value: 'public_transport', label: 'Transportasi umum' },
      { value: 'bicycle', label: 'Sepeda' },
      { value: 'walk', label: 'Jalan kaki' }
    ]
  },
  {
    id: 'diet',
    question: 'Bagaimana pola makan Anda?',
    type: 'single',
    options: [
      { value: 'meat_heavy', label: 'Sering makan daging' },
      { value: 'balanced', label: 'Seimbang' },
      { value: 'vegetarian', label: 'Vegetarian' },
      { value: 'vegan', label: 'Vegan' }
    ]
  },
  {
    id: 'waste_management',
    question: 'Apakah Anda memilah sampah?',
    type: 'single',
    options: [
      { value: 'never', label: 'Tidak pernah' },
      { value: 'sometimes', label: 'Kadang-kadang' },
      { value: 'always', label: 'Selalu' }
    ]
  },
  {
    id: 'energy_usage',
    question: 'Seberapa sering Anda menggunakan AC?',
    type: 'single',
    options: [
      { value: 'always', label: 'Sepanjang hari' },
      { value: 'often', label: 'Sering (>6 jam/hari)' },
      { value: 'sometimes', label: 'Kadang-kadang' },
      { value: 'rarely', label: 'Jarang' }
    ]
  },
  {
    id: 'shopping_habits',
    question: 'Bagaimana kebiasaan belanja Anda?',
    type: 'multiple',
    options: [
      { value: 'online_frequent', label: 'Sering belanja online' },
      { value: 'local_store', label: 'Belanja di toko lokal' },
      { value: 'reusable_bag', label: 'Membawa tas belanja sendiri' },
      { value: 'bulk_buy', label: 'Membeli dalam jumlah besar' }
    ]
  },
  {
    id: 'interests',
    question: 'Aktivitas mana yang Anda minati?',
    type: 'multiple',
    options: [
      { value: 'gardening', label: 'Berkebun' },
      { value: 'cooking', label: 'Memasak' },
      { value: 'cycling', label: 'Bersepeda' },
      { value: 'diy', label: 'DIY/Crafting' },
      { value: 'outdoor', label: 'Aktivitas outdoor' }
    ]
  }
];

module.exports = {
  CHALLENGE_CATEGORIES,
  CHALLENGE_DIFFICULTY,
  CHALLENGE_FREQUENCY,
  USER_ROLES,
  ONBOARDING_QUESTIONS
};
