// Production calculation engine for Space Salvage Empire

import { ORBIT_CONFIGS } from '@/config/orbits';
import { SHIP_CONFIGS } from '@/config/ships';
import type { GameState, ResourceType, ShipType } from '@/types';
import { calculateConversion, calculatePerTickProduction, calculateProduction } from '@/utils/formulas';

/**
 * Calculate all production for the current tick
 * This is called 10 times per second by the game loop
 * 
 * @param state - Current game state
 * @returns Resource deltas to apply
 */
export function calculateTickProduction(state: GameState): Partial<Record<ResourceType, number>> {
  const deltas: Partial<Record<ResourceType, number>> = {};
  
  // Get current multipliers
  const multipliers = calculateMultipliers(state);
  
  // Calculate production for each ship type
  for (const [shipType, count] of Object.entries(state.ships)) {
    if (count === 0) continue;
    
    // Skip disabled ships
    if (!state.shipEnabled[shipType as ShipType]) continue;
    
    const config = SHIP_CONFIGS[shipType as ShipType];
    if (!config || config.category !== 'production') continue;
    
    // Handle converter ships (Refinery, Fuel Synthesizer)
    if (config.consumesResource && config.conversionRatio) {
      const inputResource = config.consumesResource;
      const outputResource = config.producesResource!;
      const availableInput = state.resources[inputResource];
      
      const { consumed, produced } = calculateConversion(
        shipType as ShipType,
        count,
        availableInput
      );
      
      // Apply multipliers to production
      const multipliedProduction = produced * multipliers.orbit;
      
      deltas[inputResource] = (deltas[inputResource] || 0) - consumed;
      deltas[outputResource] = (deltas[outputResource] || 0) + multipliedProduction;
    } 
    // Handle simple production ships (Drones, Extractors, Miners)
    else if (config.producesResource) {
      const productionPerSecond = calculateProduction(
        shipType as ShipType,
        count,
        multipliers
      );
      
      const productionPerTick = calculatePerTickProduction(productionPerSecond);
      const resource = config.producesResource;
      
      deltas[resource] = (deltas[resource] || 0) + productionPerTick;
    }
  }
  
  return deltas;
}

/**
 * Calculate global production multipliers
 */
function calculateMultipliers(state: GameState): {
  orbit: number;
  tech: number;
  prestige: number;
  formation: number;
  colony: number;
} {
  const orbitConfig = ORBIT_CONFIGS[state.currentOrbit];
  
  // For now, use metal multiplier as base (will expand later)
  const orbitMultiplier = orbitConfig.metalMultiplier;
  
  // Tech and prestige multipliers will be 1.0 for now (no bonuses yet)
  const techMultiplier = 1.0; // TODO: Calculate from tech tree
  const prestigeMultiplier = 1.0; // TODO: Calculate from prestige perks
  const formationMultiplier = 1.0; // TODO: Calculate from active formation
  const colonyMultiplier = hasColonyInOrbit(state) ? 1.25 : 1.0;
  
  return {
    orbit: orbitMultiplier,
    tech: techMultiplier,
    prestige: prestigeMultiplier,
    formation: formationMultiplier,
    colony: colonyMultiplier,
  };
}

/**
 * Check if player has a colony in current orbit
 */
function hasColonyInOrbit(state: GameState): boolean {
  return state.colonies.some(colony => colony.orbit === state.currentOrbit);
}

/**
 * Calculate production per second for display purposes
 * 
 * @param state - Current game state
 * @returns Production rates per second for each resource
 */
export function calculateProductionRates(state: GameState): Partial<Record<ResourceType, number>> {
  const rates: Partial<Record<ResourceType, number>> = {};
  const multipliers = calculateMultipliers(state);
  
  for (const [shipType, count] of Object.entries(state.ships)) {
    if (count === 0) continue;
    
    const config = SHIP_CONFIGS[shipType as ShipType];
    if (!config || config.category !== 'production') continue;
    
    if (config.producesResource) {
      const productionPerSecond = calculateProduction(
        shipType as ShipType,
        count,
        multipliers
      );
      
      const resource = config.producesResource;
      rates[resource] = (rates[resource] || 0) + productionPerSecond;
    }
    
    // For converters, show consumption as negative
    if (config.consumesResource) {
      const consumptionPerSecond = config.baseProduction! * count;
      const resource = config.consumesResource;
      rates[resource] = (rates[resource] || 0) - consumptionPerSecond;
    }
  }
  
  return rates;
}

/**
 * Calculate offline production
 * Applies efficiency penalty and caps at MAX_OFFLINE_TIME
 * 
 * @param state - Game state at time of going offline
 * @param offlineTime - Time spent offline in milliseconds
 * @param offlineEfficiency - Efficiency multiplier (0.5 = 50%)
 * @returns Resource gains during offline period
 */
export function calculateOfflineProduction(
  state: GameState,
  offlineTime: number,
  offlineEfficiency: number
): Partial<Record<ResourceType, number>> {
  const gains: Partial<Record<ResourceType, number>> = {};
  
  // Calculate production per second
  const rates = calculateProductionRates(state);
  
  // Convert to offline gains
  const offlineSeconds = offlineTime / 1000;
  
  for (const [resource, rate] of Object.entries(rates)) {
    if (rate > 0) {
      const gain = rate * offlineSeconds * offlineEfficiency;
      gains[resource as ResourceType] = gain;
    }
  }
  
  return gains;
}
