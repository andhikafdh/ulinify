const { emissionFactors, conservativenessFactors, systemParameters } = require('../config/emissionFactors');
const { getChallengeById } = require('../config/challenges');

/**
 * Main CO2 calculation function
 * Returns: { co2_raw_kg, co2_final_kg, carbon_points, details }
 */
function calculateCO2Avoided(challengeId, inputs, confidenceScore) {
  const challenge = getChallengeById(challengeId);
  if (!challenge) {
    throw new Error(`Challenge not found: ${challengeId}`);
  }

  // Validate required inputs
  for (const requiredInput of challenge.required_inputs) {
    if (inputs[requiredInput] === undefined || inputs[requiredInput] === null) {
      throw new Error(`Missing required input: ${requiredInput}`);
    }
  }

  // Route to appropriate calculator based on category
  let result;
  switch (challenge.category) {
    case 'transport':
      result = calculateTransport(challengeId, inputs);
      break;
    case 'reusable_items':
      result = calculateReusableItems(challengeId, inputs);
      break;
    case 'food_substitution':
      result = calculateFoodSubstitution(inputs);
      break;
    case 'food_waste':
      result = calculateFoodWaste(inputs);
      break;
    case 'energy_saving':
      result = calculateEnergySaving(inputs);
      break;
    case 'composting':
      result = calculateComposting(inputs);
      break;
    case 'recycling':
      result = calculateRecycling(inputs);
      break;
    case 'carbon_sequestration':
      result = calculateCarbonSequestration(challengeId, inputs);
      break;
    case 'repair':
      result = calculateRepair(inputs);
      break;
    default:
      throw new Error(`Unsupported category: ${challenge.category}`);
  }

  // Apply conservativeness factor
  const conservFactor = challenge.conservativeness_override || 
                        conservativenessFactors[challenge.category] || 
                        conservativenessFactors.default;

  const co2RawAdjusted = result.co2_raw_kg * conservFactor;

  // Apply confidence score
  const co2Final = co2RawAdjusted * confidenceScore;

  // Apply min/max thresholds
  const co2FinalCapped = Math.max(
    systemParameters.min_co2_threshold_kg,
    Math.min(co2Final, systemParameters.daily_max_per_user_kg)
  );

  // Convert to points
  const carbonPoints = Math.round(co2FinalCapped * systemParameters.points_per_kg);

  return {
    co2_raw_kg: round4(result.co2_raw_kg),
    co2_final_kg: round4(co2FinalCapped),
    carbon_points: carbonPoints,
    conservativeness_factor: conservFactor,
    confidence_score: confidenceScore,
    calculation_details: result.details
  };
}

/**
 * Transport modal shift calculation
 */
function calculateTransport(challengeId, inputs) {
  const { distance_km, mode_before, mode_after, trips = 1 } = inputs;

  const efBefore = emissionFactors.transport[mode_before];
  const efAfter = emissionFactors.transport[mode_after] || 0;

  if (efBefore === undefined) {
    throw new Error(`Unknown transport mode: ${mode_before}`);
  }

  const baselineDiff = efBefore - efAfter;
  const co2Raw = distance_km * baselineDiff * trips;

  return {
    co2_raw_kg: co2Raw,
    details: {
      distance_km,
      mode_before,
      mode_after,
      trips,
      ef_before: efBefore,
      ef_after: efAfter,
      baseline_diff: baselineDiff
    }
  };
}

/**
 * Reusable items calculation
 */
function calculateReusableItems(challengeId, inputs) {
  const { count, count_bags_avoided } = inputs;
  const units = count || count_bags_avoided || 1;

  // Determine item type from challenge ID
  let efPerUnit;
  if (challengeId.includes('bottle')) {
    efPerUnit = emissionFactors.reusable.plastic_bottle;
  } else if (challengeId.includes('bag')) {
    efPerUnit = emissionFactors.reusable.plastic_bag;
  } else if (challengeId.includes('container')) {
    efPerUnit = emissionFactors.reusable.food_container;
  } else {
    efPerUnit = emissionFactors.reusable.plastic_bottle; // default
  }

  const co2Raw = units * efPerUnit;

  return {
    co2_raw_kg: co2Raw,
    details: {
      units,
      ef_per_unit: efPerUnit,
      item_type: challengeId
    }
  };
}

/**
 * Food substitution (meatless meal) calculation
 */
function calculateFoodSubstitution(inputs) {
  const { meal_type_before, meal_type_after, portions = 1 } = inputs;

  const efBefore = emissionFactors.food[`${meal_type_before}_meal`];
  const efAfter = emissionFactors.food[`${meal_type_after}_meal`];

  if (efBefore === undefined || efAfter === undefined) {
    throw new Error(`Unknown meal type: ${meal_type_before} or ${meal_type_after}`);
  }

  const baselineDiff = efBefore - efAfter;
  const co2Raw = baselineDiff * portions;

  return {
    co2_raw_kg: co2Raw,
    details: {
      meal_type_before,
      meal_type_after,
      portions,
      ef_before: efBefore,
      ef_after: efAfter,
      baseline_diff: baselineDiff
    }
  };
}

/**
 * Food waste reduction calculation
 */
function calculateFoodWaste(inputs) {
  const { food_weight_kg } = inputs;
  const efPerKg = emissionFactors.food.food_waste_per_kg;
  const co2Raw = food_weight_kg * efPerKg;

  return {
    co2_raw_kg: co2Raw,
    details: {
      food_weight_kg,
      ef_per_kg: efPerKg
    }
  };
}

/**
 * Energy saving calculation
 */
function calculateEnergySaving(inputs) {
  const { device_power_kw, hours_saved, device_type } = inputs;
  
  // If device_type specified, try to use specific power rating
  let powerKw = device_power_kw;
  if (device_type && emissionFactors.energy.appliances[device_type]) {
    powerKw = emissionFactors.energy.appliances[device_type];
  }

  const energySavedKwh = powerKw * hours_saved;
  const efGrid = emissionFactors.energy.grid_kg_per_kwh;
  const co2Raw = energySavedKwh * efGrid;

  return {
    co2_raw_kg: co2Raw,
    details: {
      device_power_kw: powerKw,
      hours_saved,
      energy_saved_kwh: energySavedKwh,
      ef_grid: efGrid
    }
  };
}

/**
 * Composting calculation
 */
function calculateComposting(inputs) {
  const { composted_weight_kg } = inputs;
  const efPerKg = emissionFactors.waste.organic_waste_composted;
  const co2Raw = composted_weight_kg * efPerKg;

  return {
    co2_raw_kg: co2Raw,
    details: {
      composted_weight_kg,
      ef_per_kg: efPerKg
    }
  };
}

/**
 * Recycling calculation
 */
function calculateRecycling(inputs) {
  const { material_type, weight_kg } = inputs;
  
  const efPerKg = emissionFactors.waste.recycling[material_type];
  if (efPerKg === undefined) {
    throw new Error(`Unknown material type: ${material_type}`);
  }

  const co2Raw = weight_kg * efPerKg;

  return {
    co2_raw_kg: co2Raw,
    details: {
      material_type,
      weight_kg,
      ef_per_kg: efPerKg
    }
  };
}

/**
 * Carbon sequestration (tree planting) calculation
 */
function calculateCarbonSequestration(challengeId, inputs) {
  if (challengeId === 'tree-planting') {
    const { number_of_trees, species, timeframe_years = 1 } = inputs;
    
    let efPerTree;
    if (species === 'fast_growing') {
      efPerTree = emissionFactors.carbon_sequestration.tree_per_year_fast_growing;
    } else if (species === 'slow_growing') {
      efPerTree = emissionFactors.carbon_sequestration.tree_per_year_slow_growing;
    } else {
      efPerTree = emissionFactors.carbon_sequestration.tree_per_year_generic;
    }

    const co2Raw = number_of_trees * efPerTree * timeframe_years;

    return {
      co2_raw_kg: co2Raw,
      details: {
        number_of_trees,
        species: species || 'generic',
        timeframe_years,
        ef_per_tree_per_year: efPerTree
      }
    };
  } else if (challengeId === 'urban-greening') {
    const { area_sqm, timeframe_years = 1 } = inputs;
    const efPerSqm = emissionFactors.carbon_sequestration.urban_greening_per_sqm_per_year;
    const co2Raw = area_sqm * efPerSqm * timeframe_years;

    return {
      co2_raw_kg: co2Raw,
      details: {
        area_sqm,
        timeframe_years,
        ef_per_sqm_per_year: efPerSqm
      }
    };
  }

  throw new Error(`Unsupported carbon sequestration challenge: ${challengeId}`);
}

/**
 * Repair/upcycle calculation
 */
function calculateRepair(inputs) {
  const { product_type } = inputs;
  
  const efPerItem = emissionFactors.repair[product_type];
  if (efPerItem === undefined) {
    throw new Error(`Unknown product type for repair: ${product_type}`);
  }

  const co2Raw = efPerItem;

  return {
    co2_raw_kg: co2Raw,
    details: {
      product_type,
      ef_per_item: efPerItem
    }
  };
}

/**
 * Helper: round to 4 decimal places
 */
function round4(num) {
  return Math.round(num * 10000) / 10000;
}

module.exports = {
  calculateCO2Avoided
};
