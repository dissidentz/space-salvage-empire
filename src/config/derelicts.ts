// Derelict configuration data for Space Salvage Empire
// Based on docs/complete-system.md

import type { ArkComponentType, DerelictRarity, DerelictType, OrbitType, ResourceType, ShipType } from '@/types';

export interface DerelictReward {
  resource: ResourceType;
  min: number;
  max: number;
  dropChance: number; // 0-1
}

export interface DerelictConfig {
  id: DerelictType;
  name: string;
  description: string;
  rarity: DerelictRarity;
  availableOrbits: OrbitType[];
  fuelCost: number;
  baseMissionTime: number; // ms
  requiredShip: ShipType;
  isHazardous: boolean;
  riskLevel: number; // 0-1
  rewards: DerelictReward[];
  isArkComponent?: boolean;
  arkComponentType?: ArkComponentType;
}

export const DERELICT_CONFIGS: Record<DerelictType, DerelictConfig> = {
  // ===== COMMON DERELICTS =====
  
  weatherSatellite: {
    id: 'weatherSatellite',
    name: 'Weather Satellite',
    description: 'Abandoned orbital weather monitoring station',
    rarity: 'common',
    availableOrbits: ['leo', 'geo'],
    fuelCost: 10,
    baseMissionTime: 5 * 60 * 1000, // 5 minutes
    requiredShip: 'salvageFrigate',
    isHazardous: false,
    riskLevel: 0.1,
    rewards: [
      { resource: 'metal', min: 100, max: 300, dropChance: 1.0 },
      { resource: 'electronics', min: 10, max: 30, dropChance: 0.3 },
      { resource: 'dataFragments', min: 1, max: 1, dropChance: 0.05 },
    ],
  },

  cargoContainer: {
    id: 'cargoContainer',
    name: 'Cargo Container',
    description: 'Lost shipping container with salvageable materials',
    rarity: 'common',
    availableOrbits: ['leo', 'geo', 'lunar', 'mars', 'asteroidBelt', 'jovian', 'kuiper', 'deepSpace'],
    fuelCost: 20,
    baseMissionTime: 6 * 60 * 1000,
    requiredShip: 'salvageFrigate',
    isHazardous: false,
    riskLevel: 0.1,
    rewards: [
      { resource: 'metal', min: 500, max: 1500, dropChance: 1.0 },
      { resource: 'electronics', min: 50, max: 150, dropChance: 0.2 },
      { resource: 'fuel', min: 10, max: 50, dropChance: 0.1 },
    ],
  },

  communicationRelay: {
    id: 'communicationRelay',
    name: 'Communication Relay',
    description: 'Defunct communications satellite',
    rarity: 'common',
    availableOrbits: ['leo', 'geo', 'lunar'],
    fuelCost: 15,
    baseMissionTime: 5 * 60 * 1000,
    requiredShip: 'salvageFrigate',
    isHazardous: false,
    riskLevel: 0.1,
    rewards: [
      { resource: 'electronics', min: 100, max: 400, dropChance: 1.0 },
      { resource: 'dataFragments', min: 1, max: 3, dropChance: 0.4 },
      { resource: 'metal', min: 200, max: 500, dropChance: 0.5 },
    ],
  },

  // ===== UNCOMMON DERELICTS =====

  miningHauler: {
    id: 'miningHauler',
    name: 'Mining Hauler',
    description: 'Abandoned mining transport vessel',
    rarity: 'uncommon',
    availableOrbits: ['lunar', 'mars', 'asteroidBelt'],
    fuelCost: 50,
    baseMissionTime: 10 * 60 * 1000,
    requiredShip: 'salvageFrigate',
    isHazardous: false,
    riskLevel: 0.2,
    rewards: [
      { resource: 'metal', min: 2000, max: 8000, dropChance: 1.0 },
      { resource: 'rareMaterials', min: 5, max: 20, dropChance: 0.6 },
      { resource: 'electronics', min: 100, max: 500, dropChance: 0.4 },
    ],
  },

  researchProbe: {
    id: 'researchProbe',
    name: 'Research Probe',
    description: 'Scientific probe with valuable data',
    rarity: 'uncommon',
    availableOrbits: ['mars', 'asteroidBelt', 'jovian'],
    fuelCost: 75,
    baseMissionTime: 12 * 60 * 1000,
    requiredShip: 'salvageFrigate',
    isHazardous: false,
    riskLevel: 0.2,
    rewards: [
      { resource: 'dataFragments', min: 10, max: 30, dropChance: 1.0 },
      { resource: 'electronics', min: 500, max: 2000, dropChance: 0.8 },
      { resource: 'aiCores', min: 1, max: 1, dropChance: 0.05 },
    ],
  },

  militaryFrigate: {
    id: 'militaryFrigate',
    name: 'Military Frigate',
    description: 'Decommissioned military vessel - hazardous',
    rarity: 'uncommon',
    availableOrbits: ['geo', 'lunar', 'mars'],
    fuelCost: 100,
    baseMissionTime: 15 * 60 * 1000,
    requiredShip: 'salvageFrigate',
    isHazardous: true,
    riskLevel: 0.7,
    rewards: [
      { resource: 'metal', min: 5000, max: 15000, dropChance: 1.0 },
      { resource: 'electronics', min: 1000, max: 5000, dropChance: 0.8 },
      { resource: 'rareMaterials', min: 20, max: 100, dropChance: 0.4 },
      { resource: 'aiCores', min: 1, max: 1, dropChance: 0.1 },
    ],
  },

  // ===== RARE DERELICTS =====

  colonyShipFragment: {
    id: 'colonyShipFragment',
    name: 'Colony Ship Fragment',
    description: 'Remnant of a failed colonization attempt',
    rarity: 'rare',
    availableOrbits: ['lunar', 'mars', 'asteroidBelt'],
    fuelCost: 150,
    baseMissionTime: 20 * 60 * 1000,
    requiredShip: 'salvageFrigate',
    isHazardous: false,
    riskLevel: 0.3,
    rewards: [
      { resource: 'metal', min: 20000, max: 50000, dropChance: 1.0 },
      { resource: 'electronics', min: 5000, max: 15000, dropChance: 1.0 },
      { resource: 'rareMaterials', min: 100, max: 500, dropChance: 0.8 },
      { resource: 'aiCores', min: 1, max: 2, dropChance: 0.3 },
    ],
  },

  refineryStation: {
    id: 'refineryStation',
    name: 'Refinery Station',
    description: 'Massive orbital refinery complex',
    rarity: 'rare',
    availableOrbits: ['asteroidBelt', 'jovian'],
    fuelCost: 200,
    baseMissionTime: 25 * 60 * 1000,
    requiredShip: 'salvageFrigate',
    isHazardous: false,
    riskLevel: 0.3,
    rewards: [
      { resource: 'metal', min: 100000, max: 300000, dropChance: 1.0 },
      { resource: 'rareMaterials', min: 500, max: 2000, dropChance: 1.0 },
      { resource: 'exoticAlloys', min: 10, max: 50, dropChance: 0.5 },
      { resource: 'aiCores', min: 1, max: 3, dropChance: 0.6 },
    ],
  },

  ancientProbe: {
    id: 'ancientProbe',
    name: 'Ancient Probe',
    description: 'Mysterious probe of unknown origin',
    rarity: 'rare',
    availableOrbits: ['kuiper', 'deepSpace'],
    fuelCost: 300,
    baseMissionTime: 30 * 60 * 1000,
    requiredShip: 'heavySalvageFrigate',
    isHazardous: true,
    riskLevel: 0.6,
    rewards: [
      { resource: 'dataFragments', min: 100, max: 500, dropChance: 1.0 },
      { resource: 'exoticAlloys', min: 50, max: 200, dropChance: 0.8 },
      { resource: 'aiCores', min: 3, max: 10, dropChance: 0.7 },
    ],
  },

  // ===== EPIC DERELICTS =====

  exodusDestroyer: {
    id: 'exodusDestroyer',
    name: 'Exodus Fleet Destroyer',
    description: 'Massive warship from the Exodus Fleet',
    rarity: 'epic',
    availableOrbits: ['asteroidBelt', 'jovian', 'kuiper'],
    fuelCost: 500,
    baseMissionTime: 45 * 60 * 1000,
    requiredShip: 'heavySalvageFrigate',
    isHazardous: true,
    riskLevel: 0.8,
    rewards: [
      { resource: 'metal', min: 500000, max: 2000000, dropChance: 1.0 },
      { resource: 'electronics', min: 100000, max: 500000, dropChance: 1.0 },
      { resource: 'rareMaterials', min: 5000, max: 20000, dropChance: 1.0 },
      { resource: 'exoticAlloys', min: 100, max: 500, dropChance: 0.8 },
      { resource: 'aiCores', min: 10, max: 50, dropChance: 0.8 },
    ],
  },

  researchMegastation: {
    id: 'researchMegastation',
    name: 'Research Megastation',
    description: 'Enormous research facility',
    rarity: 'epic',
    availableOrbits: ['jovian', 'kuiper'],
    fuelCost: 750,
    baseMissionTime: 60 * 60 * 1000,
    requiredShip: 'heavySalvageFrigate',
    isHazardous: false,
    riskLevel: 0.4,
    rewards: [
      { resource: 'dataFragments', min: 1000, max: 5000, dropChance: 1.0 },
      { resource: 'electronics', min: 200000, max: 1000000, dropChance: 1.0 },
      { resource: 'aiCores', min: 20, max: 100, dropChance: 0.9 },
      { resource: 'exoticAlloys', min: 200, max: 1000, dropChance: 0.7 },
    ],
  },

  alienRelay: {
    id: 'alienRelay',
    name: 'Alien Relay',
    description: 'Unknown alien technology - extreme danger',
    rarity: 'epic',
    availableOrbits: ['kuiper', 'deepSpace'],
    fuelCost: 1000,
    baseMissionTime: 90 * 60 * 1000,
    requiredShip: 'heavySalvageFrigate',
    isHazardous: true,
    riskLevel: 0.9,
    rewards: [
      { resource: 'exoticAlloys', min: 500, max: 2000, dropChance: 1.0 },
      { resource: 'aiCores', min: 50, max: 200, dropChance: 1.0 },
      { resource: 'dataFragments', min: 2000, max: 10000, dropChance: 0.9 },
    ],
  },

  // ===== LEGENDARY DERELICTS (Ark Components) =====

  arkComponent: {
    id: 'arkComponent',
    name: 'Ark Component Fragment',
    description: 'Critical component for the Ark - extremely rare',
    rarity: 'legendary',
    availableOrbits: ['kuiper', 'deepSpace'],
    fuelCost: 2000,
    baseMissionTime: 120 * 60 * 1000, // 2 hours
    requiredShip: 'heavySalvageFrigate',
    isHazardous: true,
    riskLevel: 0.95,
    rewards: [
      { resource: 'metal', min: 1000000, max: 5000000, dropChance: 1.0 },
      { resource: 'electronics', min: 500000, max: 2000000, dropChance: 1.0 },
      { resource: 'rareMaterials', min: 50000, max: 200000, dropChance: 1.0 },
      { resource: 'exoticAlloys', min: 1000, max: 10000, dropChance: 1.0 },
      { resource: 'aiCores', min: 100, max: 500, dropChance: 1.0 },
    ],
    isArkComponent: true,
    // arkComponentType will be randomly assigned when generated
  },
};

/**
 * Calculate rewards from a derelict based on its reward table
 */
export function calculateDerelictRewards(config: DerelictConfig): Partial<Record<ResourceType, number>> {
  const rewards: Partial<Record<ResourceType, number>> = {};

  for (const reward of config.rewards) {
    // Check if reward drops
    if (Math.random() < reward.dropChance) {
      // Calculate random amount within range
      const amount = Math.floor(Math.random() * (reward.max - reward.min + 1)) + reward.min;
      rewards[reward.resource] = (rewards[reward.resource] || 0) + amount;
    }
  }

  return rewards;
}

/**
 * Roll for derelict rarity based on orbit spawn rates
 */
export function rollDerelictRarity(spawnRates: {
  common: number;
  uncommon: number;
  rare: number;
  epic: number;
  legendary: number;
}): DerelictRarity {
  const roll = Math.random() * 100;
  let cumulative = 0;

  if (roll < (cumulative += spawnRates.common)) return 'common';
  if (roll < (cumulative += spawnRates.uncommon)) return 'uncommon';
  if (roll < (cumulative += spawnRates.rare)) return 'rare';
  if (roll < (cumulative += spawnRates.epic)) return 'epic';
  return 'legendary';
}

/**
 * Get available derelict types for a given orbit and rarity
 */
export function getAvailableDerelictTypes(orbit: OrbitType, rarity: DerelictRarity): DerelictType[] {
  return (Object.values(DERELICT_CONFIGS) as DerelictConfig[])
    .filter(config => config.rarity === rarity && config.availableOrbits.includes(orbit))
    .map(config => config.id);
}

/**
 * Get a random derelict type for an orbit and rarity
 */
export function getRandomDerelictType(orbit: OrbitType, rarity: DerelictRarity): DerelictType | null {
  const available = getAvailableDerelictTypes(orbit, rarity);
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}
