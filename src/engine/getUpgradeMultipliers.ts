// Helper to calculate multipliers from purchased ship upgrades

import { SHIP_UPGRADES } from '@/config/shipUpgrades';
import type { GameState } from '@/types';

export interface UpgradeMultipliers {
  production: Record<string, number>; // shipType_production -> multiplier
  flatBonus: Record<string, number>; // shipType_production -> flat amount
  conversion: Record<string, number>; // shipType_ratio -> new ratio
  unlocks: Record<string, number>; // target -> value
}

export function getUpgradeMultipliers(state: GameState): UpgradeMultipliers {
  const multipliers: UpgradeMultipliers = {
    production: {},
    flatBonus: {},
    conversion: {},
    unlocks: {},
  };

  // Iterate through purchased upgrades
  for (const [upgradeId, upgradeState] of Object.entries(state.shipUpgrades)) {
    if (!upgradeState || upgradeState.currentLevel === 0) continue;

    const config = SHIP_UPGRADES[upgradeId];
    if (!config) continue;

    for (const effect of config.effects) {
      switch (effect.type) {
        case 'multiplier':
          // Multipliers stack multiplicatively
          multipliers.production[effect.target] = (multipliers.production[effect.target] || 1.0) * effect.value;
          break;
          
        case 'flat_bonus':
          // Flat bonuses stack additively
          multipliers.flatBonus[effect.target] = (multipliers.flatBonus[effect.target] || 0) + effect.value;
          break;
          
        case 'conversion_ratio':
          // Conversion ratios take the best value
          const current = multipliers.conversion[effect.target] || 0;
          if (effect.value > current) {
            multipliers.conversion[effect.target] = effect.value;
          }
          break;
          
        case 'unlock':
          // Unlocks set a value
          multipliers.unlocks[effect.target] = effect.value;
          break;
          
        case 'conditional':
           if (effect.condition === 'per_10_ships' && config.shipType) {
              const count = state.ships[config.shipType] || 0;
              const bonus = Math.floor(count / 10) * effect.value;
              // Add to multiplier (1 + bonus)
              const currentMult = multipliers.production[effect.target] || 1.0;
              multipliers.production[effect.target] = currentMult * (1 + bonus);
           }
           break;
      }
    }
  }

  return multipliers;
}
