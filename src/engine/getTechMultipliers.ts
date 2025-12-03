import { TECH_TREE } from '@/config/tech';

export interface TechEffects {
  multipliers: Record<string, number>;
  flatBonuses: Record<string, number>;
}

/**
 * Calculate all active tech effects from purchased technologies
 * Multipliers stack multiplicatively (e.g., 1.1 * 1.15 = 1.265)
 * Flat bonuses stack additively
 */
export function getTechMultipliers(purchasedTechIds: string[]): Record<string, number> {
  const effects = getTechEffects(purchasedTechIds);
  return effects.multipliers;
}

/**
 * Calculate all tech effects (multipliers and flat bonuses)
 */
export function getTechEffects(purchasedTechIds: string[]): TechEffects {
  const multipliers: Record<string, number> = {};
  const flatBonuses: Record<string, number> = {};

  // Apply each purchased tech's effects
  for (const techId of purchasedTechIds) {
    const tech = TECH_TREE[techId];
    if (!tech) continue;

    for (const effect of tech.effects) {
      if (effect.type === 'multiplier') {
        const target = effect.target;
        multipliers[target] = (multipliers[target] || 1.0) * effect.value;
      } else if (effect.type === 'flat_bonus') {
        const target = effect.target;
        flatBonuses[target] = (flatBonuses[target] || 0) + effect.value;
      }
    }
  }

  return { multipliers, flatBonuses };
}

