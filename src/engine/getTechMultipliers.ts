import { TECH_TREE } from '@/config/tech';

/**
 * Calculate all active tech multipliers from purchased technologies
 * Multipliers stack multiplicatively (e.g., 1.1 * 1.15 = 1.265)
 */
export function getTechMultipliers(purchasedTechIds: string[]): Record<string, number> {
  const multipliers: Record<string, number> = {};

  // Apply each purchased tech's effects
  for (const techId of purchasedTechIds) {
    const tech = TECH_TREE[techId];
    if (!tech) continue;

    for (const effect of tech.effects) {
      if (effect.type === 'multiplier') {
        const target = effect.target;
        multipliers[target] = (multipliers[target] || 1.0) * effect.value;
      } else if (effect.type === 'flat_bonus') {
         // Handle flat bonuses if needed, or store them separately
         // For now, we'll store them in the same object but they might need distinct handling
         // depending on how they are used.
         // Actually, let's stick to multipliers here as the function name suggests.
      }
    }
  }

  return multipliers;
}

