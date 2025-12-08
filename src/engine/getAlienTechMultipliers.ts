// Get multipliers from purchased alien tech upgrades
import { ALIEN_TECH } from '@/config/alienTech';

export interface AlienTechMultipliers {
  all_production: number;
  travel_time: number;
  salvage_rewards: number;
  click_power: number;
  mission_time: number;
  alienArtifact_drop_rate: number;
}

/**
 * Calculate multipliers from purchased alien tech
 */
export function getAlienTechMultipliers(
  purchasedTech: Record<string, boolean>
): AlienTechMultipliers {
  const multipliers: AlienTechMultipliers = {
    all_production: 1.0,
    travel_time: 1.0,
    salvage_rewards: 1.0,
    click_power: 1.0,
    mission_time: 1.0,
    alienArtifact_drop_rate: 1.0,
  };

  // Apply each purchased tech's effects
  Object.keys(purchasedTech).forEach(techId => {
    if (!purchasedTech[techId]) return; // Skip unpurchased

    const tech = ALIEN_TECH[techId];
    if (!tech) return;

    tech.effects.forEach(effect => {
      if (effect.type === 'multiplier') {
        const target = effect.target as keyof AlienTechMultipliers;
        if (multipliers[target] !== undefined) {
          multipliers[target] *= effect.value;
        }
      }
    });
  });

  return multipliers;
}
