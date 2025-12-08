// Alien Tech upgrades - unique upgrades purchasable with Alien Artifacts
// These are powerful one-time purchases from alien technology

import type { TechEffect } from '@/types';

export interface AlienTech {
  id: string;
  name: string;
  description: string;
  cost: number; // Alien Artifacts cost
  effects: TechEffect[];
  icon?: string;
}

export const ALIEN_TECH: Record<string, AlienTech> = {
  xeno_efficiency: {
    id: 'xeno_efficiency',
    name: 'Xenotech Efficiency',
    description: 'Alien manufacturing techniques boost all production by 50%.',
    cost: 3,
    effects: [{ type: 'multiplier', target: 'all_production', value: 1.5 }],
  },
  void_navigation: {
    id: 'void_navigation',
    name: 'Void Navigation',
    description: 'Alien navigation systems reduce all travel time by 50%.',
    cost: 2,
    effects: [{ type: 'multiplier', target: 'travel_time', value: 0.5 }],
  },
  matter_conversion: {
    id: 'matter_conversion',
    name: 'Matter Conversion',
    description: 'Alien matter technology doubles all salvage rewards.',
    cost: 5,
    effects: [{ type: 'multiplier', target: 'salvage_rewards', value: 2.0 }],
  },
  neural_link: {
    id: 'neural_link',
    name: 'Neural Link',
    description: 'Direct neural interface doubles manual click power.',
    cost: 4,
    effects: [{ type: 'multiplier', target: 'click_power', value: 2.0 }],
  },
  temporal_shift: {
    id: 'temporal_shift',
    name: 'Temporal Shift',
    description: 'Time manipulation reduces all mission durations by 50%.',
    cost: 3,
    effects: [{ type: 'multiplier', target: 'mission_time', value: 0.5 }],
  },
  artifact_resonance: {
    id: 'artifact_resonance',
    name: 'Artifact Resonance',
    description: 'Attune to alien signals, doubling artifact drop rates.',
    cost: 10,
    effects: [{ type: 'multiplier', target: 'alienArtifact_drop_rate', value: 2.0 }],
  },
};

/**
 * Get all available alien tech
 */
export function getAlienTechList(): AlienTech[] {
  return Object.values(ALIEN_TECH);
}

/**
 * Get alien tech by ID
 */
export function getAlienTech(id: string): AlienTech | undefined {
  return ALIEN_TECH[id];
}
