/**
 * Challenge definitions
 * Each challenge has metadata, required inputs, and calculation parameters
 */

const challenges = {
  // === TRANSPORT CATEGORY ===
  'transport-modal-shift': {
    id: 'transport-modal-shift',
    category: 'transport',
    name: 'Beralih ke Transportasi Ramah Lingkungan',
    description: 'Ganti kendaraan bermotor dengan jalan kaki, sepeda, atau transportasi umum',
    unit_type: 'km',
    required_inputs: ['distance_km', 'mode_before', 'mode_after', 'trips'],
    optional_inputs: [],
    verification_requirements: ['photo', 'geotag'],
    conservativeness_override: null // use category default
  },

  'transport-public': {
    id: 'transport-public',
    category: 'transport',
    name: 'Gunakan Transportasi Umum',
    description: 'Pakai bus, angkot, atau kereta alih-alih motor/mobil pribadi',
    unit_type: 'km',
    required_inputs: ['distance_km', 'mode_before', 'mode_after'],
    optional_inputs: ['trips'],
    verification_requirements: ['photo', 'geotag'],
    conservativeness_override: null
  },

  'cycling': {
    id: 'cycling',
    category: 'transport',
    name: 'Bersepeda',
    description: 'Gunakan sepeda untuk perjalanan harian',
    unit_type: 'km',
    required_inputs: ['distance_km', 'mode_before'],
    optional_inputs: ['trips'],
    verification_requirements: ['photo'],
    conservativeness_override: null
  },

  'walking': {
    id: 'walking',
    category: 'transport',
    name: 'Jalan Kaki',
    description: 'Jalan kaki alih-alih menggunakan kendaraan',
    unit_type: 'km',
    required_inputs: ['distance_km', 'mode_before'],
    optional_inputs: ['trips'],
    verification_requirements: ['photo'],
    conservativeness_override: null
  },

  // === REUSABLE ITEMS CATEGORY ===
  'reusable-bottle': {
    id: 'reusable-bottle',
    category: 'reusable_items',
    name: 'Tumbler/Botol Reusable',
    description: 'Pakai tumbler alih-alih membeli botol plastik sekali pakai',
    unit_type: 'count',
    required_inputs: ['count'],
    optional_inputs: ['period_days'],
    verification_requirements: ['photo', 'exif'],
    conservativeness_override: null
  },

  'reusable-bag': {
    id: 'reusable-bag',
    category: 'reusable_items',
    name: 'Tas Belanja Reusable',
    description: 'Gunakan tas belanja sendiri, hindari kantong plastik',
    unit_type: 'count',
    required_inputs: ['count_bags_avoided'],
    optional_inputs: [],
    verification_requirements: ['photo'],
    conservativeness_override: null
  },

  'reusable-container': {
    id: 'reusable-container',
    category: 'reusable_items',
    name: 'Wadah Makanan Reusable',
    description: 'Bawa wadah sendiri untuk takeaway/beli makanan',
    unit_type: 'count',
    required_inputs: ['count'],
    optional_inputs: [],
    verification_requirements: ['photo'],
    conservativeness_override: null
  },

  // === FOOD CATEGORY ===
  'meatless-meal': {
    id: 'meatless-meal',
    category: 'food_substitution',
    name: 'Makan Tanpa Daging',
    description: 'Pilih menu vegetarian/nabati alih-alih daging',
    unit_type: 'meal',
    required_inputs: ['meal_type_before', 'meal_type_after', 'portions'],
    optional_inputs: [],
    verification_requirements: ['photo'],
    conservativeness_override: null
  },

  'food-waste-reduction': {
    id: 'food-waste-reduction',
    category: 'food_waste',
    name: 'Kurangi Sampah Makanan',
    description: 'Habiskan makanan, simpan sisa dengan baik',
    unit_type: 'kg',
    required_inputs: ['food_weight_kg'],
    optional_inputs: ['food_type'],
    verification_requirements: ['photo'],
    conservativeness_override: null
  },

  // === ENERGY CATEGORY ===
  'energy-ac-reduction': {
    id: 'energy-ac-reduction',
    category: 'energy_saving',
    name: 'Kurangi Penggunaan AC',
    description: 'Matikan AC atau kurangi jam penggunaan',
    unit_type: 'kWh',
    required_inputs: ['device_power_kw', 'hours_saved'],
    optional_inputs: ['device_type'],
    verification_requirements: ['photo'],
    conservativeness_override: null
  },

  'energy-lights-off': {
    id: 'energy-lights-off',
    category: 'energy_saving',
    name: 'Matikan Lampu Tidak Terpakai',
    description: 'Matikan lampu saat tidak digunakan',
    unit_type: 'kWh',
    required_inputs: ['device_power_kw', 'hours_saved'],
    optional_inputs: [],
    verification_requirements: ['photo'],
    conservativeness_override: null
  },

  'energy-appliance-efficient': {
    id: 'energy-appliance-efficient',
    category: 'energy_saving',
    name: 'Gunakan Peralatan Hemat Energi',
    description: 'Kurangi penggunaan peralatan boros energi',
    unit_type: 'kWh',
    required_inputs: ['device_power_kw', 'hours_saved'],
    optional_inputs: ['device_type'],
    verification_requirements: ['photo'],
    conservativeness_override: null
  },

  // === WASTE MANAGEMENT CATEGORY ===
  'composting': {
    id: 'composting',
    category: 'composting',
    name: 'Kompos Sampah Organik',
    description: 'Kompos sampah dapur/organik alih-alih buang ke TPA',
    unit_type: 'kg',
    required_inputs: ['composted_weight_kg'],
    optional_inputs: [],
    verification_requirements: ['photo'],
    conservativeness_override: 0.6
  },

  'recycling': {
    id: 'recycling',
    category: 'recycling',
    name: 'Daur Ulang Sampah',
    description: 'Pisahkan dan setor sampah ke bank sampah',
    unit_type: 'kg',
    required_inputs: ['material_type', 'weight_kg'],
    optional_inputs: [],
    verification_requirements: ['photo'],
    conservativeness_override: 0.6
  },

  // === CARBON SEQUESTRATION CATEGORY ===
  'tree-planting': {
    id: 'tree-planting',
    category: 'carbon_sequestration',
    name: 'Tanam Pohon',
    description: 'Tanam pohon untuk menyerap karbon',
    unit_type: 'tree',
    required_inputs: ['number_of_trees'],
    optional_inputs: ['species', 'timeframe_years'],
    verification_requirements: ['photo', 'geotag'],
    conservativeness_override: 0.5
  },

  'urban-greening': {
    id: 'urban-greening',
    category: 'carbon_sequestration',
    name: 'Penghijauan Perkotaan',
    description: 'Buat taman atau area hijau di lingkungan',
    unit_type: 'sqm',
    required_inputs: ['area_sqm'],
    optional_inputs: ['timeframe_years'],
    verification_requirements: ['photo', 'geotag'],
    conservativeness_override: 0.5
  },

  // === REPAIR & CIRCULAR ECONOMY ===
  'repair-item': {
    id: 'repair-item',
    category: 'repair',
    name: 'Perbaiki Barang Rusak',
    description: 'Perbaiki alih-alih beli baru',
    unit_type: 'item',
    required_inputs: ['product_type'],
    optional_inputs: ['estimated_extension_years'],
    verification_requirements: ['photo'],
    conservativeness_override: 0.6
  },

  'upcycle': {
    id: 'upcycle',
    category: 'repair',
    name: 'Upcycle/Daur Ulang Kreatif',
    description: 'Ubah barang bekas jadi berguna',
    unit_type: 'item',
    required_inputs: ['product_type'],
    optional_inputs: [],
    verification_requirements: ['photo'],
    conservativeness_override: 0.6
  }
};

/**
 * Get challenge by ID
 */
function getChallengeById(challengeId) {
  return challenges[challengeId] || null;
}

/**
 * Get all challenges
 */
function getAllChallenges() {
  return Object.values(challenges);
}

/**
 * Get challenges by category
 */
function getChallengesByCategory(category) {
  return Object.values(challenges).filter(c => c.category === category);
}

module.exports = {
  challenges,
  getChallengeById,
  getAllChallenges,
  getChallengesByCategory
};
