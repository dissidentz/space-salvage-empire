import type { ArkComponentType, PrestigePerk, Resources } from '@/types';

export const PRESTIGE_PERKS: Record<string, PrestigePerk> = {
  // Tier 1
  'production_boost_1': {
    id: 'production_boost_1',
    name: 'Quantum Efficiency I',
    description: 'Increases global production by 10% per level.',
    tier: 1,
    cost: 1,
    maxLevel: 10,
    effects: [{ type: 'multiplier', target: 'all_production', value: 1.1 }],
    prerequisites: [],
  },
  'click_power_1': {
    id: 'click_power_1',
    name: 'Matter Manipulation I',
    description: 'Increases manual salvage yield by 20% per level.',
    tier: 1,
    cost: 1,
    maxLevel: 10,
    effects: [{ type: 'multiplier', target: 'click_power', value: 1.2 }],
    prerequisites: [],
  },
  'ship_cost_1': {
    id: 'ship_cost_1',
    name: 'Nanobot Construction I',
    description: 'Reduces ship costs by 5% per level.',
    tier: 1,
    cost: 1,
    maxLevel: 5,
    effects: [{ type: 'multiplier', target: 'shipCost', value: 0.95 }],
    prerequisites: [],
  },

  // Tier 2
  'production_boost_2': {
    id: 'production_boost_2',
    name: 'Quantum Efficiency II',
    description: 'Increases global production by 15% per level.',
    tier: 2,
    cost: 5,
    maxLevel: 10,
    effects: [{ type: 'multiplier', target: 'all_production', value: 1.15 }],
    prerequisites: ['production_boost_1'],
  },
  'mission_speed_1': {
    id: 'mission_speed_1',
    name: 'Warp Field Stabilization',
    description: 'Reduces mission duration by 10% per level.',
    tier: 2,
    cost: 5,
    maxLevel: 5,
    effects: [{ type: 'multiplier', target: 'missionDuration', value: 0.9 }],
    prerequisites: [],
  },
  'rare_drop_1': {
    id: 'rare_drop_1',
    name: 'Sensor Calibration',
    description: 'Increases rare resource drop rate from derelicts by 10% per level.',
    tier: 2,
    cost: 10,
    maxLevel: 5,
    effects: [{ type: 'multiplier', target: 'rareDropRate', value: 1.1 }],
    prerequisites: [],
  },

  // Tier 3
  'tech_cost_1': {
    id: 'tech_cost_1',
    name: 'Neural Networking',
    description: 'Reduces technology research costs by 10% per level.',
    tier: 3,
    cost: 25,
    maxLevel: 5,
    effects: [{ type: 'multiplier', target: 'techCost', value: 0.9 }],
    prerequisites: [],
  },
  'fuel_efficiency_1': {
    id: 'fuel_efficiency_1',
    name: 'Dark Matter Injection',
    description: 'Reduces fuel consumption for travel and missions by 10% per level.',
    tier: 3,
    cost: 25,
    maxLevel: 5,
    effects: [{ type: 'multiplier', target: 'fuelCost', value: 0.9 }],
    prerequisites: [],
  },

  // Tier 4
  'production_boost_3': {
    id: 'production_boost_3',
    name: 'Quantum Efficiency III',
    description: 'Increases global production by 25% per level.',
    tier: 4,
    cost: 100,
    maxLevel: 10,
    effects: [{ type: 'multiplier', target: 'all_production', value: 1.25 }],
    prerequisites: ['production_boost_2'],
  },
  'ark_discount': {
    id: 'ark_discount',
    name: 'Ancient Knowledge',
    description: 'Reduces Ark Component assembly costs by 5% per level.',
    tier: 4,
    cost: 200,
    maxLevel: 5,
    effects: [{ type: 'multiplier', target: 'arkCost', value: 0.95 }],
    prerequisites: [],
  },

  // Tier 5
  'ark_speed': {
    id: 'ark_speed',
    name: 'Reality Bending',
    description: 'Increases Ark Component assembly speed by 20% per level.',
    tier: 5,
    cost: 500,
    maxLevel: 5,
    effects: [{ type: 'multiplier', target: 'arkSpeed', value: 1.2 }],
    prerequisites: [],
  },
  'ascension': {
    id: 'ascension',
    name: 'Ascension',
    description: 'Massively increases all production by 100% per level.',
    tier: 5,
    cost: 1000,
    maxLevel: 10,
    effects: [{ type: 'multiplier', target: 'all_production', value: 2.0 }],
    prerequisites: ['production_boost_3'],
  },
};

export const ARK_COMPONENTS: Record<ArkComponentType, { name: string; description: string; cost: Partial<Resources>; duration: number }> = {
  'propulsionCore': {
    name: 'Dark Matter Propulsion Core',
    description: 'The heart of the Ark, capable of FTL travel.',
    cost: { darkMatter: 100, exoticAlloys: 5000, aiCores: 100 },
    duration: 3600000, // 1 hour
  },
  'lifeSupportGrid': {
    name: 'Stasis Life Support Grid',
    description: 'Keeps the crew alive during the long journey.',
    cost: { darkMatter: 50, rareMaterials: 10000, electronics: 20000 },
    duration: 1800000, // 30 mins
  },
  'powerDistribution': {
    name: 'Zero-Point Power Distribution',
    description: 'Distributes infinite energy throughout the ship.',
    cost: { darkMatter: 75, metal: 1000000, electronics: 50000 },
    duration: 2700000, // 45 mins
  },
  'hullPlating': {
    name: 'Neutronium Hull Plating',
    description: 'Indestructible armor plating.',
    cost: { darkMatter: 50, metal: 2000000, exoticAlloys: 2000 },
    duration: 1800000, // 30 mins
  },
  'weaponsArray': {
    name: 'Singularity Weapons Array',
    description: 'Defensive systems to protect against cosmic threats.',
    cost: { darkMatter: 75, exoticAlloys: 3000, aiCores: 50 },
    duration: 2700000, // 45 mins
  },
  'computingCore': {
    name: 'Quantum Computing Core',
    description: 'Manages navigation and ship systems.',
    cost: { darkMatter: 100, electronics: 100000, aiCores: 200 },
    duration: 3600000, // 1 hour
  },
  'cryoBay': {
    name: 'Cryogenic Stasis Bay',
    description: 'Houses the population of the empire.',
    cost: { darkMatter: 50, metal: 500000, rareMaterials: 5000 },
    duration: 1800000, // 30 mins
  },
  'navigationArray': {
    name: 'Multiversal Navigation Array',
    description: 'Maps the path to a new home.',
    cost: { darkMatter: 75, electronics: 50000, dataFragments: 10000 },
    duration: 2700000, // 45 mins
  },
};

export function calculateDarkMatterGain(dataFragments: number): number {
  if (dataFragments < 100) return 0;
  return Math.floor(Math.sqrt(dataFragments / 75)); // More generous: sqrt(df/75) instead of sqrt(df/100)
}
