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
export function calculateShipCost(
  shipType: ShipType,
  currentCount: number
): Partial<Resources> {
  const config = SHIP_CONFIGS[shipType];
  if (!config) {
    console.error(`Invalid ship type: ${shipType}`);
    return {};
  }

  const { baseCost, costGrowth } = config;
  const multiplier = Math.pow(costGrowth, currentCount);

  // Apply multiplier to each resource in base cost
  const cost: Partial<Resources> = {};
  for (const [resource, amount] of Object.entries(baseCost)) {
    cost[resource as ResourceType] = Math.floor((amount as number) * multiplier);
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
 * @returns Total cost as a Resources object
 */
export function calculateBulkShipCost(
  shipType: ShipType,
  currentCount: number,
  amount: number
): Partial<Resources> {
  if (amount <= 0) return {};
  if (amount === 1) return calculateShipCost(shipType, currentCount);

  const config = SHIP_CONFIGS[shipType];
  if (!config) return {};

  const { baseCost, costGrowth } = config;
  
  // Geometric series formula
  const firstCost = Math.pow(costGrowth, currentCount);
  const seriesSum = (Math.pow(costGrowth, amount) - 1) / (costGrowth - 1);
  const totalMultiplier = firstCost * seriesSum;

  const cost: Partial<Resources> = {};
  for (const [resource, amount] of Object.entries(baseCost)) {
    cost[resource as ResourceType] = Math.floor((amount as number) * totalMultiplier);
  }

  return cost;
}

/**
 * Calculate production per second for a ship type
 * 
 * @param shipType - Type of ship
 * @param shipCount - Number of ships owned
 * @param multipliers - Global multipliers object
 * @returns Production per second
 */
export function calculateProduction(
  shipType: ShipType,
  shipCount: number,
  multipliers: {
    orbit?: number;
    tech?: number;
    prestige?: number;
    formation?: number;
    colony?: number;
  } = {}
): number {
  if (shipCount === 0) return 0;

  const config = SHIP_CONFIGS[shipType];
  if (!config || !config.baseProduction) return 0;

  // Calculate global multiplier
  const globalMultiplier =
    (multipliers.orbit ?? 1) *
    (multipliers.tech ?? 1) *
    (multipliers.prestige ?? 1) *
    (multipliers.formation ?? 1) *
    (multipliers.colony ?? 1);

  return config.baseProduction * shipCount * globalMultiplier;
}

/**
 * Calculate production per tick (called by game loop)
 * 
 * @param productionPerSecond - Production rate per second
 * @returns Production per tick
 */
export function calculatePerTickProduction(productionPerSecond: number): number {
  return productionPerSecond / TICKS_PER_SECOND;
}

/**
 * Calculate resource consumption for converter ships (Refinery, Fuel Synthesizer)
 * 
 * @param shipType - Type of converter ship
 * @param shipCount - Number of ships owned
 * @param availableInput - Amount of input resource available
 * @returns Object with input consumed and output produced
 */
export function calculateConversion(
  shipType: ShipType,
  shipCount: number,
  availableInput: number
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
  const produced = consumed * config.conversionRatio;

  return { consumed, produced };
}

/**
 * Calculate how many ships can be afforded with current resources
 * 
 * @param shipType - Type of ship
 * @param currentCount - Current ship count
 * @param availableResources - Resources available
 * @returns Maximum number of ships that can be purchased
 */
export function calculateMaxAffordable(
  shipType: ShipType,
  currentCount: number,
  availableResources: Resources
): number {
  let count = 0;
  
  // Binary search for efficiency (max 1000 ships at once)
  let low = 0;
  let high = 1000;
  
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const cost = calculateBulkShipCost(shipType, currentCount, mid);
    
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
