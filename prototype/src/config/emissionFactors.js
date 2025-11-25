/**
 * Emission Factors Configuration
 * 
 * IMPORTANT: These are PLACEHOLDER values for prototype/MVP.
 * Replace with official emission factors from:
 * - IPCC / GWP factors
 * - GHG Protocol emission factor database
 * - Indonesia Ministry of Environment reports
 * - Peer-reviewed LCA studies
 * - Local transport studies for Indonesia
 */

const emissionFactors = {
  // Transport (kgCO2 per km)
  transport: {
    motorbike: 0.08,
    car: 0.21,
    bus_per_passenger: 0.05,
    angkot_per_passenger: 0.06,
    walk: 0.0,
    bicycle: 0.0,
    electric_scooter: 0.02,
    train_per_passenger: 0.04
  },

  // Food (kgCO2 per meal/unit)
  food: {
    beef_meal: 5.0,
    chicken_meal: 1.5,
    fish_meal: 1.8,
    pork_meal: 2.5,
    vegetarian_meal: 1.2,
    vegan_meal: 0.8,
    // Per kg for waste
    food_waste_per_kg: 2.5
  },

  // Reusable items (kgCO2 per single-use item avoided)
  reusable: {
    plastic_bottle: 0.06,
    plastic_bag: 0.01,
    coffee_cup: 0.04,
    food_container: 0.05,
    straw: 0.005
  },

  // Energy (kgCO2 per kWh) - Indonesia grid average
  energy: {
    grid_kg_per_kwh: 0.8,
    // Common appliance power ratings (kW)
    appliances: {
      ac_1_pk: 0.75,
      ac_1_5_pk: 1.2,
      ac_2_pk: 1.5,
      fan: 0.05,
      lamp_led_10w: 0.01,
      lamp_incandescent_60w: 0.06,
      refrigerator: 0.15,
      water_heater: 2.0
    }
  },

  // Waste management (kgCO2e per kg material)
  waste: {
    // Avoided emissions from composting vs landfill
    organic_waste_composted: 0.5,
    
    // Avoided emissions from recycling vs virgin production
    recycling: {
      PET_plastic: 1.5,
      HDPE_plastic: 1.3,
      paper: 1.2,
      cardboard: 0.9,
      aluminum: 9.0,
      steel: 1.8,
      glass: 0.3,
      mixed_plastic: 1.0
    }
  },

  // Carbon sequestration (kgCO2 per tree per year)
  // VERY conservative estimate - varies by species, age, location
  carbon_sequestration: {
    tree_per_year_generic: 5.0,
    tree_per_year_fast_growing: 8.0,
    tree_per_year_slow_growing: 3.0,
    urban_greening_per_sqm_per_year: 0.5
  },

  // Packaging (kgCO2 per unit)
  packaging: {
    plastic_packaging_per_100g: 0.3,
    cardboard_box_small: 0.15,
    cardboard_box_large: 0.4
  },

  // Product lifecycle extension (kgCO2 avoided per item repaired)
  repair: {
    clothing_item: 2.0,
    electronic_small: 5.0,
    electronic_large: 15.0,
    furniture_small: 10.0,
    furniture_large: 30.0
  }
};

/**
 * Conservativeness factors per category
 * Applied to reduce overclaiming uncertainty
 */
const conservativenessFactors = {
  transport: 0.7,
  food_substitution: 0.7,
  food_waste: 0.7,
  reusable_items: 0.7,
  energy_saving: 0.7,
  composting: 0.6,  // More conservative due to timing uncertainty
  recycling: 0.6,   // LCA variability
  tree_planting: 0.5, // Long-term uncertainty
  repair: 0.6,
  local_purchase: 0.5, // High assumption dependency
  default: 0.7
};

/**
 * System-wide parameters
 */
const systemParameters = {
  points_per_kg: parseFloat(process.env.POINTS_PER_KG) || 10,
  conservativeness_factor_global: parseFloat(process.env.CONSERVATIVENESS_FACTOR_GLOBAL) || 0.7,
  min_co2_threshold_kg: parseFloat(process.env.MIN_CO2_THRESHOLD_KG) || 0.01,
  daily_max_per_user_kg: parseFloat(process.env.DAILY_MAX_CO2_PER_USER_KG) || 10,
  min_submission_interval_minutes: parseInt(process.env.MIN_SUBMISSION_INTERVAL_MINUTES) || 60
};

module.exports = {
  emissionFactors,
  conservativenessFactors,
  systemParameters
};
