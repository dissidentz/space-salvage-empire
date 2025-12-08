// Ship upgrade configurations for Space Salvage Empire
// Based on docs/complete-system.md

import type { ResourceType, ShipType } from '@/types';

export interface UpgradeEffect {
  type: 'multiplier' | 'flat_bonus' | 'conversion_ratio' | 'unlock' | 'conditional';
  target: string;
  value: number;
  condition?: string; // For conditional effects like "per 10 ships owned"
}

export interface ShipUpgrade {
  id: string;
  shipType: ShipType;
  name: string;
  description: string;
  maxLevel: number;
  baseCost: Partial<Record<ResourceType, number>>;
  costGrowth: number;
  effects: UpgradeEffect[];
}

export const SHIP_UPGRADES: Record<string, ShipUpgrade> = {
  // ===== SALVAGE DRONE UPGRADES =====
  
  drone_efficiency_1: {
    id: 'drone_efficiency_1',
    shipType: 'salvageDrone',
    name: 'Drone Efficiency I',
    description: '+20% Salvage Drone production',
    maxLevel: 1,
    baseCost: { metal: 50 },
    costGrowth: 1.0,
    effects: [
      { type: 'multiplier', target: 'salvageDrone_production', value: 1.2 },
    ],
  },

  drone_efficiency_2: {
    id: 'drone_efficiency_2',
    shipType: 'salvageDrone',
    name: 'Drone Efficiency II',
    description: '+20% Salvage Drone production',
    maxLevel: 1,
    baseCost: { metal: 150 },
    costGrowth: 1.0,
    effects: [
      { type: 'multiplier', target: 'salvageDrone_production', value: 1.2 },
    ],
  },

  drone_efficiency_3: {
    id: 'drone_efficiency_3',
    shipType: 'salvageDrone',
    name: 'Drone Efficiency III',
    description: '+20% Salvage Drone production',
    maxLevel: 1,
    baseCost: { metal: 400 },
    costGrowth: 1.0,
    effects: [
      { type: 'multiplier', target: 'salvageDrone_production', value: 1.2 },
    ],
  },

  drone_efficiency_4: {
    id: 'drone_efficiency_4',
    shipType: 'salvageDrone',
    name: 'Drone Efficiency IV',
    description: '+20% Salvage Drone production',
    maxLevel: 1,
    baseCost: { metal: 1000 },
    costGrowth: 1.0,
    effects: [
      { type: 'multiplier', target: 'salvageDrone_production', value: 1.2 },
    ],
  },

  drone_efficiency_5: {
    id: 'drone_efficiency_5',
    shipType: 'salvageDrone',
    name: 'Drone Efficiency V',
    description: '+20% Salvage Drone production',
    maxLevel: 1,
    baseCost: { metal: 3000 },
    costGrowth: 1.0,
    effects: [
      { type: 'multiplier', target: 'salvageDrone_production', value: 1.2 },
    ],
  },

  swarm_protocol: {
    id: 'swarm_protocol',
    shipType: 'salvageDrone',
    name: 'Swarm Protocol',
    description: '+5% production per 10 Salvage Drones owned',
    maxLevel: 1,
    baseCost: { electronics: 500 },
    costGrowth: 1.0,
    effects: [
      { type: 'conditional', target: 'salvageDrone_production', value: 0.05, condition: 'per_10_ships' },
    ],
  },

  // ===== REFINERY BARGE UPGRADES =====

  smelting_1: {
    id: 'smelting_1',
    shipType: 'refineryBarge',
    name: 'Smelting I',
    description: 'Improves conversion ratio to 10 Debris → 3 Metal',
    maxLevel: 1,
    baseCost: { metal: 500 },
    costGrowth: 1.0,
    effects: [
      { type: 'conversion_ratio', target: 'refineryBarge_ratio', value: 0.3 },
    ],
  },

  smelting_2: {
    id: 'smelting_2',
    shipType: 'refineryBarge',
    name: 'Smelting II',
    description: 'Improves conversion ratio to 10 Debris → 4 Metal',
    maxLevel: 1,
    baseCost: { metal: 2000 },
    costGrowth: 1.0,
    effects: [
      { type: 'conversion_ratio', target: 'refineryBarge_ratio', value: 0.4 },
    ],
  },

  smelting_3: {
    id: 'smelting_3',
    shipType: 'refineryBarge',
    name: 'Smelting III',
    description: 'Improves conversion ratio to 10 Debris → 5 Metal',
    maxLevel: 1,
    baseCost: { metal: 8000 },
    costGrowth: 1.0,
    effects: [
      { type: 'conversion_ratio', target: 'refineryBarge_ratio', value: 0.5 },
    ],
  },

  throughput_boost: {
    id: 'throughput_boost',
    shipType: 'refineryBarge',
    name: 'Throughput Boost',
    description: '+50% processing speed',
    maxLevel: 1,
    baseCost: { electronics: 1000 },
    costGrowth: 1.0,
    effects: [
      { type: 'multiplier', target: 'refineryBarge_production', value: 1.5 },
    ],
  },

  // ===== ELECTRONICS EXTRACTOR UPGRADES =====

  component_recovery: {
    id: 'component_recovery',
    shipType: 'electronicsExtractor',
    name: 'Component Recovery',
    description: '+0.3 Electronics/sec',
    maxLevel: 1,
    baseCost: { electronics: 300 },
    costGrowth: 1.0,
    effects: [
      { type: 'flat_bonus', target: 'electronicsExtractor_production', value: 0.3 },
    ],
  },

  precision_extraction: {
    id: 'precision_extraction',
    shipType: 'electronicsExtractor',
    name: 'Precision Extraction',
    description: 'Also generates 0.1 Rare Materials/sec',
    maxLevel: 1,
    baseCost: { metal: 2000, electronics: 500 },
    costGrowth: 1.0,
    effects: [
      { type: 'unlock', target: 'electronicsExtractor_rareMaterials', value: 0.1 },
    ],
  },

  // ===== FUEL SYNTHESIZER UPGRADES =====

  efficient_synthesis: {
    id: 'efficient_synthesis',
    shipType: 'fuelSynthesizer',
    name: 'Efficient Synthesis',
    description: 'Improves ratio to 15 Metal → 1 Fuel',
    maxLevel: 1,
    baseCost: { metal: 5000 },
    costGrowth: 1.0,
    effects: [
      { type: 'conversion_ratio', target: 'fuelSynthesizer_ratio', value: 0.0667 }, // 1/15
    ],
  },

  quantum_catalysis_upgrade: {
    id: 'quantum_catalysis_upgrade',
    shipType: 'fuelSynthesizer',
    name: 'Quantum Catalysis',
    description: 'Improves ratio to 10 Metal → 1 Fuel',
    maxLevel: 1,
    baseCost: { rareMaterials: 50 },
    costGrowth: 1.0,
    effects: [
      { type: 'conversion_ratio', target: 'fuelSynthesizer_ratio', value: 0.1 }, // 1/10
    ],
  },

  // ===== MATTER EXTRACTOR UPGRADES =====

  deep_dive_protocol: {
    id: 'deep_dive_protocol',
    shipType: 'matterExtractor',
    name: 'Deep Dive Protocol',
    description: '+0.5 Rare Materials/sec',
    maxLevel: 1,
    baseCost: { rareMaterials: 100 },
    costGrowth: 1.0,
    effects: [
      { type: 'flat_bonus', target: 'matterExtractor_production', value: 0.5 },
    ],
  },

  atmospheric_filtration: {
    id: 'atmospheric_filtration',
    shipType: 'matterExtractor',
    name: 'Atmospheric Filtration',
    description: 'Also generates 5 Electronics/sec',
    maxLevel: 1,
    baseCost: { electronics: 10000 },
    costGrowth: 1.0,
    effects: [
      { type: 'unlock', target: 'matterExtractor_electronics', value: 5 },
    ],
  },

  // ===== QUANTUM MINER UPGRADES =====

  quantum_resonance: {
    id: 'quantum_resonance',
    shipType: 'quantumMiner',
    name: 'Quantum Resonance',
    description: '+0.05 Exotic Alloys/sec',
    maxLevel: 1,
    baseCost: { exoticAlloys: 500 },
    costGrowth: 1.0,
    effects: [
      { type: 'flat_bonus', target: 'quantumMiner_production', value: 0.05 },
    ],
  },

  zero_point_extraction: {
    id: 'zero_point_extraction',
    shipType: 'quantumMiner',
    name: 'Zero-Point Extraction',
    description: 'Also generates 2 Rare Materials/sec',
    maxLevel: 1,
    baseCost: { exoticAlloys: 1000 },
    costGrowth: 1.0,
    effects: [
      { type: 'unlock', target: 'quantumMiner_rareMaterials', value: 2 },
    ],
  },

  // ===== SCOUT PROBE UPGRADES =====

  advanced_sensors: {
    id: 'advanced_sensors',
    shipType: 'scoutProbe',
    name: 'Advanced Sensors',
    description: '+10% discovery chance',
    maxLevel: 1,
    baseCost: { electronics: 2000 },
    costGrowth: 1.0,
    effects: [
      { type: 'multiplier', target: 'scoutProbe_discoveryChance', value: 1.1 },
    ],
  },

  quick_survey: {
    id: 'quick_survey',
    shipType: 'scoutProbe',
    name: 'Quick Survey',
    description: '-30% mission time',
    maxLevel: 1,
    baseCost: { metal: 5000 },
    costGrowth: 1.0,
    effects: [
      { type: 'multiplier', target: 'scoutProbe_missionTime', value: 0.7 },
    ],
  },

  long_range_comms: {
    id: 'long_range_comms',
    shipType: 'scoutProbe',
    name: 'Long-Range Comms',
    description: 'Can scout adjacent orbits',
    maxLevel: 1,
    baseCost: { rareMaterials: 500 },
    costGrowth: 1.0,
    effects: [
      { type: 'unlock', target: 'scoutProbe_adjacentOrbits', value: 1 },
    ],
  },

  // ===== SALVAGE FRIGATE UPGRADES =====

  reinforced_hull: {
    id: 'reinforced_hull',
    shipType: 'salvageFrigate',
    name: 'Reinforced Hull',
    description: '+5% success rate',
    maxLevel: 1,
    baseCost: { metal: 10000 },
    costGrowth: 1.0,
    effects: [
      { type: 'flat_bonus', target: 'salvageFrigate_successRate', value: 0.05 },
    ],
  },

  salvage_efficiency: {
    id: 'salvage_efficiency',
    shipType: 'salvageFrigate',
    name: 'Salvage Efficiency',
    description: '+25% loot from successful salvages',
    maxLevel: 1,
    baseCost: { electronics: 5000 },
    costGrowth: 1.0,
    effects: [
      { type: 'multiplier', target: 'salvageFrigate_loot', value: 1.25 },
    ],
  },

  rapid_deployment: {
    id: 'rapid_deployment',
    shipType: 'salvageFrigate',
    name: 'Rapid Deployment',
    description: '-40% mission time',
    maxLevel: 1,
    baseCost: { rareMaterials: 1000 },
    costGrowth: 1.0,
    effects: [
      { type: 'multiplier', target: 'salvageFrigate_missionTime', value: 0.6 },
    ],
  },

  // ===== HEAVY SALVAGE FRIGATE UPGRADES =====

  military_grade_shielding: {
    id: 'military_grade_shielding',
    shipType: 'heavySalvageFrigate',
    name: 'Military-Grade Shielding',
    description: 'Increases mission success rate to 98%.',
    maxLevel: 1,
    baseCost: { metal: 50000, rareMaterials: 10000 },
    costGrowth: 1.0,
    effects: [
      { type: 'flat_bonus', target: 'heavySalvageFrigate_successRate', value: 0.03 }, // Base 95% -> 98%
    ],
  },
  
  cargo_expansion: {
    id: 'cargo_expansion',
    shipType: 'heavySalvageFrigate',
    name: 'Cargo Expansion',
    description: '+50% loot capacity for Heavy Salvage Frigates.',
    maxLevel: 1,
    baseCost: { electronics: 20000 },
    costGrowth: 1.0,
    effects: [
      { type: 'multiplier', target: 'heavySalvageFrigate_reward', value: 1.5 },
    ],
  },
  
  emergency_warp: {
    id: 'emergency_warp',
    shipType: 'heavySalvageFrigate',
    name: 'Emergency Warp',
    description: 'Abort failed missions to recover 50% fuel.',
    maxLevel: 1,
    baseCost: { rareMaterials: 5000 },
    costGrowth: 1.0,
    effects: [
      { type: 'unlock', target: 'emergency_warp', value: 1 },
    ],
  },

  // ===== DEEP SPACE SCANNER UPGRADES =====

  quantum_entanglement_array: {
    id: 'quantum_entanglement_array',
    shipType: 'deepSpaceScanner',
    name: 'Quantum Entanglement Array',
    description: '+3% derelict spawn rate per scanner.',
    maxLevel: 1,
    baseCost: { rareMaterials: 50000 },
    costGrowth: 1.0,
    effects: [
      { type: 'flat_bonus', target: 'deepSpaceScanner_spawnRate', value: 0.03 },
    ],
  },

  predictive_algorithms: {
    id: 'predictive_algorithms',
    shipType: 'deepSpaceScanner',
    name: 'Predictive Algorithms',
    description: '+10% chance for rare+ derelicts.',
    maxLevel: 1,
    baseCost: { aiCores: 100 },
    costGrowth: 1.0,
    effects: [
      { type: 'flat_bonus', target: 'rare_derelict_chance', value: 0.1 },
    ],
  },

  // ===== COLONY SHIP UPGRADES =====

  colony_efficiency: {
    id: 'colony_efficiency',
    shipType: 'colonyShip',
    name: 'Colony Efficiency',
    description: 'Colonies provide +40% production boost.',
    maxLevel: 1,
    baseCost: { metal: 500000, rareMaterials: 100000 },
    costGrowth: 1.0,
    effects: [
      { type: 'unlock', target: 'colony_efficiency', value: 1 },
    ],
  },

  auto_salvage_bay: {
    id: 'auto_salvage_bay',
    shipType: 'colonyShip',
    name: 'Auto-Salvage Bay',
    description: 'Colonies automatically salvage common derelicts.',
    maxLevel: 1,
    baseCost: { metal: 1000000, electronics: 50000 },
    costGrowth: 1.0,
    effects: [
      { type: 'unlock', target: 'auto_salvage_bay', value: 1 },
    ],
  },
};

/**
 * Get all upgrades for a specific ship type
 */
export function getUpgradesForShip(shipType: ShipType): ShipUpgrade[] {
  return Object.values(SHIP_UPGRADES).filter(upgrade => upgrade.shipType === shipType);
}

/**
 * Get upgrade by ID
 */
export function getUpgrade(upgradeId: string): ShipUpgrade | undefined {
  return SHIP_UPGRADES[upgradeId];
}
