// Production calculation engine for Space Salvage Empire

import { FORMATION_CONFIGS } from '@/config/formations';
import { ORBIT_CONFIGS } from '@/config/orbits';
import { SHIP_CONFIGS } from '@/config/ships';
import type { GameState, ResourceType, ShipType } from '@/types';
import {
    calculateConversion,
    calculatePerTickProduction,
    calculateProduction,
} from '@/utils/formulas';
import { getTechMultipliers } from './getTechMultipliers';
import { getUpgradeMultipliers, type UpgradeMultipliers } from './getUpgradeMultipliers';

/**
 * Calculate all production for the current tick
 * This is called 10 times per second by the game loop
 *
 * @param state - Current game state
 * @returns Resource deltas to apply
 */
export function calculateTickProduction(
  state: GameState
): Partial<Record<ResourceType, number>> {
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
        availableInput,
        multipliers
      );

      // Cap consumption at available input
      const actualConsumed = Math.min(consumed, availableInput);
      
      // Calculate actual production based on what was actually consumed
      // If we consumed less than required, production scales down linearly
      const productionRatio = consumed > 0 ? actualConsumed / consumed : 0;
      const actualProduced = produced * productionRatio;

      // Apply resource-specific orbit multiplier to production
      const orbitMultiplier = multipliers.orbit[outputResource] || 1.0;
      const multipliedProduction = actualProduced * orbitMultiplier;

      // console.log(`Ship: ${shipType}, Input: ${inputResource}, Available: ${availableInput}, Consumed: ${consumed}, ActualConsumed: ${actualConsumed}, Produced: ${produced}, ActualProduced: ${actualProduced}`);

      deltas[inputResource] = (deltas[inputResource] || 0) - actualConsumed;
      deltas[outputResource] =
        (deltas[outputResource] || 0) + multipliedProduction;
    }
    // Handle simple production ships (Drones, Extractors, Miners)
    else if (config.producesResource) {
      const productionPerSecond = calculateProduction(
        shipType as ShipType,
        count,
        multipliers,
        config.producesResource
      );

      const productionPerTick = calculatePerTickProduction(productionPerSecond);
      const resource = config.producesResource;

      deltas[resource] = (deltas[resource] || 0) + productionPerTick;
    }
  }

  // === PASSIVE DATA FRAGMENT GENERATION ===
  // Data Fragments: passive generation based on total ships owned
  const totalShips = Object.values(state.ships).reduce((sum, count) => sum + count, 0);
  
  // Only generate if player has ships (0.01 DF/sec per 10 ships)
  if (totalShips > 0) {
    const shipBonus = Math.floor(totalShips / 10) * 0.01;
    
    // Apply tech multipliers if any
    const dataFragmentMultiplier = multipliers.tech['dataFragment_production'] || 1.0;
    const finalDataFragmentRate = shipBonus * dataFragmentMultiplier;
    
    const dataFragmentPerTick = calculatePerTickProduction(finalDataFragmentRate);
    deltas['dataFragments'] = (deltas['dataFragments'] || 0) + dataFragmentPerTick;
  }

  return deltas;
}

/**
 * Calculate global production multipliers
 */
function calculateMultipliers(state: GameState): {
  orbit: Record<ResourceType, number>;
  tech: Record<string, number>;
  prestige: number;
  formation: Record<string, number>;
  colony: number;
  upgrade: UpgradeMultipliers;
} {
  const orbitConfig = ORBIT_CONFIGS[state.currentOrbit];

  // Resource-specific orbit multipliers
  const orbitMultipliers: Record<ResourceType, number> = {
    debris: 1.0, // Debris always 1x (base resource)
    metal: orbitConfig.metalMultiplier,
    electronics: orbitConfig.electronicsMultiplier,
    fuel: 1.0, // Fuel production not affected by orbit
    rareMaterials: orbitConfig.rareMultiplier,
    exoticAlloys: orbitConfig.rareMultiplier, // Exotic alloys use rare multiplier
    aiCores: orbitConfig.rareMultiplier, // AI cores use rare multiplier
    dataFragments: 1.0, // Data fragments not affected by orbit
    darkMatter: 1.0, // Dark matter not affected by orbit
  };

  // Calculate tech multipliers from purchased technologies
  const techMultipliers = getTechMultipliers(state.techTree.purchased);
  const upgradeMultipliers = getUpgradeMultipliers(state);
  
  const prestigeMultiplier = 1.0; // TODO: Calculate from prestige perks
  
  // Calculate formation multipliers
  const formationMultipliers: Record<string, number> = {};
  if (state.activeFormation) {
      const config = FORMATION_CONFIGS[state.activeFormation];
      if (config) {
          config.effects.forEach(effect => {
              if (effect.type === 'multiplier') {
                  formationMultipliers[effect.target] = effect.value;
              }
          });
      }
  }
  
  const colonyMultiplier = hasColonyInOrbit(state) ? 1.25 : 1.0;

  return {
    orbit: orbitMultipliers,
    tech: techMultipliers,
    prestige: prestigeMultiplier,
    formation: formationMultipliers,
    colony: colonyMultiplier,
    upgrade: upgradeMultipliers,
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
export function calculateProductionRates(
  state: GameState
): Partial<Record<ResourceType, number>> {
  const rates: Partial<Record<ResourceType, number>> = {};
  const multipliers = calculateMultipliers(state);

  for (const [shipType, count] of Object.entries(state.ships)) {
    if (count === 0) continue;

    // Skip disabled ships
    if (!state.shipEnabled[shipType as ShipType]) continue;

    const config = SHIP_CONFIGS[shipType as ShipType];
    if (!config || config.category !== 'production') continue;

    // Handle converters
    if (config.consumesResource && config.conversionRatio) {
      const consumptionPerSecond = config.baseProduction! * count;
      
      // Calculate production based on consumption * ratio * efficiency
      // Assuming full input availability for rate display
      let efficiencyMultiplier = 1.0;
      if (multipliers.tech && typeof multipliers.tech !== 'number') {
           efficiencyMultiplier *= (multipliers.tech[`${shipType}_efficiency`] || 1.0);
      }
      // Also apply orbit multiplier to output
      const outputResource = config.producesResource!;
      const orbitMultiplier = multipliers.orbit[outputResource] || 1.0;

      // Apply upgrade multipliers
      let upgradeEfficiency = 1.0;
      let conversionRatio = config.conversionRatio;
      
      if (multipliers.upgrade) {
         upgradeEfficiency = multipliers.upgrade.production[`${shipType}_production`] || 1.0;
         const ratioKey = `${shipType}_ratio`;
         if (multipliers.upgrade.conversion[ratioKey]) {
            conversionRatio = multipliers.upgrade.conversion[ratioKey];
         }
      }

      const productionPerSecond = consumptionPerSecond * conversionRatio * efficiencyMultiplier * upgradeEfficiency * orbitMultiplier;

      rates[outputResource] = (rates[outputResource] || 0) + productionPerSecond;
      rates[config.consumesResource] = (rates[config.consumesResource] || 0) - consumptionPerSecond;
    }
    // Handle simple production ships
    else if (config.producesResource) {
      const productionPerSecond = calculateProduction(
        shipType as ShipType,
        count,
        multipliers,
        config.producesResource
      );

      const resource = config.producesResource;
      rates[resource] = (rates[resource] || 0) + productionPerSecond;
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
