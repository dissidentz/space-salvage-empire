// Mathematical formulas for Space Salvage Empire
// See docs/FORMULAS.md for detailed explanations

import { TICKS_PER_SECOND } from '@/config/constants';
import { SHIP_CONFIGS } from '@/config/ships';
import type { ResourceType, Resources, ShipType } from '@/types';

/**
 * Calculate the cost of purchasing a ship based on current count
 * Uses exponential scaling: cost(n) = baseCost * (growthRate^n)
 *
 * @param shipType - Type of ship to calculate cost for
 * @param currentCount - Number of ships already owned
 * @returns Cost as a Resources object
 *
 * @example
 * const cost = calculateShipCost('salvageDrone', 10);
 * // Returns { debris: 40 }
 */
export interface Multipliers {
  orbit?: number | Record<ResourceType, number>;
  tech?: number | Record<string, number>;
  prestige?: number;
  formation?: number;
  colony?: number;
  upgrade?: {
    production: Record<string, number>;
    flatBonus: Record<string, number>;
    conversion: Record<string, number>;
    unlocks: Record<string, number>;
  };
}

/**
 * Calculate the cost of purchasing a ship based on current count
 * Uses exponential scaling: cost(n) = baseCost * (growthRate^n)
 *
 * @param shipType - Type of ship to calculate cost for
 * @param currentCount - Number of ships already owned
 * @param multipliers - Global multipliers object
 * @returns Cost as a Resources object
 */
export function calculateShipCost(
  shipType: ShipType,
  currentCount: number,
  multipliers: Multipliers = {}
): Partial<Resources> {
  const config = SHIP_CONFIGS[shipType];
  if (!config) {
    console.error(`Invalid ship type: ${shipType}`);
    return {};
  }

  const { baseCost, costGrowth } = config;
  const multiplier = Math.pow(costGrowth, currentCount);
  
  // Apply tech cost reduction
  let costMultiplier = 1.0;
  if (multipliers.tech && typeof multipliers.tech !== 'number') {
    // Global ship cost reduction
    costMultiplier *= (multipliers.tech['shipCost'] || 1.0);
    // Specific ship cost reduction
    costMultiplier *= (multipliers.tech[`${shipType}_cost`] || 1.0);
  }

  // Apply multiplier to each resource in base cost
  const cost: Partial<Resources> = {};
  for (const [resource, amount] of Object.entries(baseCost)) {
    cost[resource as ResourceType] = Math.floor(
      (amount as number) * multiplier * costMultiplier
    );
  }

  return cost;
}

/**
 * Calculate the total cost of purchasing multiple ships
 * Uses geometric series: sum(i=n to n+amount-1) of baseCost * (growthRate^i)
 * Simplified: baseCost * (growthRate^n) * ((growthRate^amount - 1) / (growthRate - 1))
 *
 * @param shipType - Type of ship to calculate cost for
 * @param currentCount - Number of ships already owned
 * @param amount - Number of ships to purchase
 * @param multipliers - Global multipliers object
 * @returns Total cost as a Resources object
 */
export function calculateBulkShipCost(
  shipType: ShipType,
  currentCount: number,
  amount: number,
  multipliers: Multipliers = {}
): Partial<Resources> {
  if (amount <= 0) return {};
  if (amount === 1) return calculateShipCost(shipType, currentCount, multipliers);

  const config = SHIP_CONFIGS[shipType];
  if (!config) return {};

  const { baseCost, costGrowth } = config;

  // Geometric series formula
  const firstCost = Math.pow(costGrowth, currentCount);
  const seriesSum = (Math.pow(costGrowth, amount) - 1) / (costGrowth - 1);
  
  // Apply tech cost reduction
  let costMultiplier = 1.0;
  if (multipliers.tech && typeof multipliers.tech !== 'number') {
    costMultiplier *= (multipliers.tech['shipCost'] || 1.0);
    costMultiplier *= (multipliers.tech[`${shipType}_cost`] || 1.0);
  }

  const totalMultiplier = firstCost * seriesSum * costMultiplier;

  const cost: Partial<Resources> = {};
  for (const [resource, amount] of Object.entries(baseCost)) {
    cost[resource as ResourceType] = Math.floor(
      (amount as number) * totalMultiplier
    );
  }

  return cost;
}

/**
 * Calculate production per second for a ship type
 *
 * @param shipType - Type of ship
 * @param shipCount - Number of ships owned
 * @param multipliers - Global multipliers object
 * @param resourceType - The resource being produced (for orbit-specific multipliers)
 * @returns Production per second
 */
export function calculateProduction(
  shipType: ShipType,
  shipCount: number,
  multipliers: Multipliers = {},
  resourceType?: ResourceType
): number {
  if (shipCount === 0) return 0;

  const config = SHIP_CONFIGS[shipType];
  if (!config || !config.baseProduction) return 0;

  // Calculate orbit multiplier (can be resource-specific)
  let orbitMultiplier = 1.0;
  if (multipliers.orbit) {
    if (typeof multipliers.orbit === 'number') {
      orbitMultiplier = multipliers.orbit;
    } else if (resourceType && multipliers.orbit[resourceType]) {
      orbitMultiplier = multipliers.orbit[resourceType];
    }
  }

  // Calculate tech multiplier
  let techMultiplier = 1.0;
  if (multipliers.tech) {
    if (typeof multipliers.tech === 'number') {
      techMultiplier = multipliers.tech;
    } else {
      // Apply global production bonus
      techMultiplier *= (multipliers.tech['all_production'] || 1.0);
      
      // Apply ship-specific production bonus (e.g. 'salvageDrone_production')
      const shipSpecificKey = `${shipType}_production`;
      if (multipliers.tech[shipSpecificKey]) {
        techMultiplier *= multipliers.tech[shipSpecificKey];
      }
    }
  }

  // Calculate global multiplier
  const globalMultiplier =
    orbitMultiplier *
    techMultiplier *
    (multipliers.prestige ?? 1) *
    (multipliers.formation ?? 1) *
    (multipliers.colony ?? 1);

  // Calculate upgrade multiplier and flat bonus
  let upgradeMultiplier = 1.0;
  let flatBonus = 0;
  if (multipliers.upgrade) {
    const shipSpecificKey = `${shipType}_production`;
    upgradeMultiplier *= (multipliers.upgrade.production[shipSpecificKey] || 1.0);
    flatBonus += (multipliers.upgrade.flatBonus[shipSpecificKey] || 0);
  }

  return (config.baseProduction * globalMultiplier * upgradeMultiplier + flatBonus) * shipCount;
}

/**
 * Calculate production per tick (called by game loop)
 *
 * @param productionPerSecond - Production rate per second
 * @returns Production per tick
 */
export function calculatePerTickProduction(
  productionPerSecond: number
): number {
  return productionPerSecond / TICKS_PER_SECOND;
}

/**
 * Calculate resource consumption for converter ships (Refinery, Fuel Synthesizer)
 *
 * @param shipType - Type of converter ship
 * @param shipCount - Number of ships owned
 * @param availableInput - Amount of input resource available
 * @param multipliers - Global multipliers object
 * @returns Object with input consumed and output produced
 */
export function calculateConversion(
  shipType: ShipType,
  shipCount: number,
  availableInput: number,
  multipliers: Multipliers = {}
): { consumed: number; produced: number } {
  if (shipCount === 0) return { consumed: 0, produced: 0 };

  const config = SHIP_CONFIGS[shipType];
  if (!config || !config.consumesResource || !config.conversionRatio) {
    return { consumed: 0, produced: 0 };
  }

  // Calculate max consumption per second
  const maxConsumptionPerSecond = config.baseProduction! * shipCount;
  const maxConsumptionPerTick = maxConsumptionPerSecond / TICKS_PER_SECOND;

  // Cap at available input
  const consumed = Math.min(availableInput, maxConsumptionPerTick);
  
  // Apply efficiency multiplier
  let efficiencyMultiplier = 1.0;
  if (multipliers.tech && typeof multipliers.tech !== 'number') {
    efficiencyMultiplier *= (multipliers.tech[`${shipType}_efficiency`] || 1.0);
  }

  // Apply upgrade conversion ratio override if present
  let conversionRatio = config.conversionRatio;
  let upgradeEfficiency = 1.0;
  
  if (multipliers.upgrade) {
    const ratioKey = `${shipType}_ratio`;
    if (multipliers.upgrade.conversion[ratioKey]) {
      conversionRatio = multipliers.upgrade.conversion[ratioKey];
    }
    
    const efficiencyKey = `${shipType}_production`;
    upgradeEfficiency = (multipliers.upgrade.production[efficiencyKey] || 1.0);
  }

  const produced = consumed * conversionRatio * efficiencyMultiplier * upgradeEfficiency;

  return { consumed, produced };
}

/**
 * Calculate how many ships can be afforded with current resources
 *
 * @param shipType - Type of ship
 * @param currentCount - Current ship count
 * @param availableResources - Resources available
 * @param multipliers - Global multipliers object
 * @returns Maximum number of ships that can be purchased
 */
export function calculateMaxAffordable(
  shipType: ShipType,
  currentCount: number,
  availableResources: Resources,
  multipliers: Multipliers = {}
): number {
  let count = 0;

  // Binary search for efficiency (max 1000 ships at once)
  let low = 0;
  let high = 1000;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const cost = calculateBulkShipCost(shipType, currentCount, mid, multipliers);

    if (canAffordCost(cost, availableResources)) {
      count = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return count;
}

/**
 * Check if player can afford a cost
 *
 * @param cost - Cost to check
 * @param availableResources - Resources available
 * @returns True if can afford
 */
export function canAffordCost(
  cost: Partial<Resources>,
  availableResources: Resources
): boolean {
  for (const [resource, amount] of Object.entries(cost)) {
    if (availableResources[resource as ResourceType] < amount) {
      return false;
    }
  }
  return true;
}

/**
 * Calculate Dark Matter gain on prestige
 * Formula from docs/FORMULAS.md
 *
 * @param stats - Player statistics
 * @returns Dark Matter to award
 */
export function calculateDarkMatterGain(stats: {
  totalDataFragments: number;
  maxOrbitReached: number; // 0-7 (LEO to Deep Space)
  totalDerelictsSalvaged: number;
  hoursPlayed: number;
}): number {
  const baseDM = Math.sqrt(stats.totalDataFragments / 100);
  const orbitBonus = 1 + stats.maxOrbitReached * 0.3;
  const derelictBonus = 1 + stats.totalDerelictsSalvaged / 50;
  const timeBonus = 1 + Math.min(stats.hoursPlayed / 10, 3.0); // capped at 3x

  return Math.floor(baseDM * orbitBonus * derelictBonus * timeBonus);
}
