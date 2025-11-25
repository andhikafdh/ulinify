/**
 * Test calculation examples
 * Run: node src/examples/testCalculations.js
 */

const { calculateCO2Avoided } = require('../services/calculationService');

console.log('🧪 Testing CO2 Calculation Examples\n');
console.log('=' .repeat(80));

// Example 1: Transport - Walking instead of motorbike
console.log('\n📍 Example 1: Transport Modal Shift (Motorbike → Walk)');
console.log('-'.repeat(80));
const example1 = calculateCO2Avoided(
  'transport-modal-shift',
  {
    distance_km: 3,
    mode_before: 'motorbike',
    mode_after: 'walk',
    trips: 1
  },
  0.9 // confidence score
);
console.log('Input: 3 km, motorbike → walk, confidence 0.9');
console.log('Steps:');
console.log('  1. Baseline diff = 0.08 - 0.0 = 0.08 kg/km');
console.log('  2. CO2_raw = 3 × 0.08 × 1 = 0.24 kg');
console.log('  3. Apply conservativeness (0.7) = 0.24 × 0.7 = 0.168 kg');
console.log('  4. Apply confidence (0.9) = 0.168 × 0.9 = 0.1512 kg');
console.log('  5. Convert to points (×10) = 1.512 → round = 2 pts');
console.log('\nResult:', example1);

// Example 2: Reusable bottle
console.log('\n📍 Example 2: Reusable Bottle (1 week, 7 bottles)');
console.log('-'.repeat(80));
const example2 = calculateCO2Avoided(
  'reusable-bottle',
  {
    count: 7
  },
  0.9
);
console.log('Input: 7 bottles avoided, confidence 0.9');
console.log('Steps:');
console.log('  1. CO2_raw = 7 × 0.06 = 0.42 kg');
console.log('  2. Apply conservativeness (0.7) = 0.42 × 0.7 = 0.294 kg');
console.log('  3. Apply confidence (0.9) = 0.294 × 0.9 = 0.2646 kg');
console.log('  4. Convert to points (×10) = 2.646 → round = 3 pts');
console.log('\nResult:', example2);

// Example 3: Meatless meal
console.log('\n📍 Example 3: Meatless Meal (Beef → Vegetarian)');
console.log('-'.repeat(80));
const example3 = calculateCO2Avoided(
  'meatless-meal',
  {
    meal_type_before: 'beef',
    meal_type_after: 'vegetarian',
    portions: 1
  },
  0.8
);
console.log('Input: beef → vegetarian, 1 portion, confidence 0.8');
console.log('Steps:');
console.log('  1. Baseline diff = 5.0 - 1.2 = 3.8 kg');
console.log('  2. CO2_raw = 3.8 × 1 = 3.8 kg');
console.log('  3. Apply conservativeness (0.7) = 3.8 × 0.7 = 2.66 kg');
console.log('  4. Apply confidence (0.8) = 2.66 × 0.8 = 2.128 kg');
console.log('  5. Convert to points (×10) = 21.28 → round = 21 pts');
console.log('\nResult:', example3);

// Example 4: Energy saving - AC
console.log('\n📍 Example 4: Energy Saving (AC Off for 1 hour)');
console.log('-'.repeat(80));
const example4 = calculateCO2Avoided(
  'energy-ac-reduction',
  {
    device_power_kw: 1.2,
    hours_saved: 1
  },
  0.9
);
console.log('Input: AC 1.2 kW, 1 hour saved, confidence 0.9');
console.log('Steps:');
console.log('  1. Energy saved = 1.2 × 1 = 1.2 kWh');
console.log('  2. CO2_raw = 1.2 × 0.8 = 0.96 kg');
console.log('  3. Apply conservativeness (0.7) = 0.96 × 0.7 = 0.672 kg');
console.log('  4. Apply confidence (0.9) = 0.672 × 0.9 = 0.6048 kg');
console.log('  5. Convert to points (×10) = 6.048 → round = 6 pts');
console.log('\nResult:', example4);

// Example 5: Composting
console.log('\n📍 Example 5: Composting (2 kg organic waste)');
console.log('-'.repeat(80));
const example5 = calculateCO2Avoided(
  'composting',
  {
    composted_weight_kg: 2
  },
  0.8
);
console.log('Input: 2 kg composted, confidence 0.8');
console.log('Steps:');
console.log('  1. CO2_raw = 2 × 0.5 = 1.0 kg');
console.log('  2. Apply conservativeness (0.6) = 1.0 × 0.6 = 0.6 kg');
console.log('  3. Apply confidence (0.8) = 0.6 × 0.8 = 0.48 kg');
console.log('  4. Convert to points (×10) = 4.8 → round = 5 pts');
console.log('\nResult:', example5);

// Example 6: Recycling PET plastic
console.log('\n📍 Example 6: Recycling (1 kg PET plastic)');
console.log('-'.repeat(80));
const example6 = calculateCO2Avoided(
  'recycling',
  {
    material_type: 'PET_plastic',
    weight_kg: 1
  },
  0.9
);
console.log('Input: 1 kg PET, confidence 0.9');
console.log('Steps:');
console.log('  1. CO2_raw = 1 × 1.5 = 1.5 kg');
console.log('  2. Apply conservativeness (0.6) = 1.5 × 0.6 = 0.9 kg');
console.log('  3. Apply confidence (0.9) = 0.9 × 0.9 = 0.81 kg');
console.log('  4. Convert to points (×10) = 8.1 → round = 8 pts');
console.log('\nResult:', example6);

// Example 7: Tree planting
console.log('\n📍 Example 7: Tree Planting (1 tree, 1 year)');
console.log('-'.repeat(80));
const example7 = calculateCO2Avoided(
  'tree-planting',
  {
    number_of_trees: 1,
    timeframe_years: 1
  },
  0.9
);
console.log('Input: 1 tree, 1 year, confidence 0.9');
console.log('Steps:');
console.log('  1. CO2_raw = 1 × 5 × 1 = 5 kg');
console.log('  2. Apply conservativeness (0.5) = 5 × 0.5 = 2.5 kg');
console.log('  3. Apply confidence (0.9) = 2.5 × 0.9 = 2.25 kg');
console.log('  4. Convert to points (×10) = 22.5 → round = 23 pts');
console.log('\nResult:', example7);

console.log('\n' + '='.repeat(80));
console.log('✅ All test calculations completed!\n');
console.log('⚠️  REMEMBER: All emission factors are PLACEHOLDERS.');
console.log('   Replace with official data before production use.\n');
