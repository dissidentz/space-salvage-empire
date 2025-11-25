// Ship configuration data for Space Salvage Empire
// Based on docs/complete-system.md

import type { OrbitType, ResourceType, ShipType } from '@/types';
import { GROWTH_RATES } from './constants';

export interface ShipConfig {
  id: ShipType;
  name: string;
  description: string;
  category: 'production' | 'active';
  tier: 1 | 2 | 3 | 4 | 5;

  // Costs
  baseCost: Partial<Record<ResourceType, number>>;
  costGrowth: number;

  // Production (for production ships)
  baseProduction?: number; // per second
  producesResource?: ResourceType;
  consumesResource?: ResourceType;
  conversionRatio?: number; // output per input

  // Mission (for active ships)
  baseMissionDuration?: number; // ms
  baseSuccessRate?: number; // 0-1

  // Unlock requirements
  unlockRequirements: {
    orbit?: OrbitType;
    ships?: Partial<Record<ShipType, number>>;
    resources?: Partial<Record<ResourceType, number>>;
    tech?: string[];
    prestige?: string[];
    milestone?: string;
  };

  // Available upgrades
  availableUpgrades: string[];
}

export const SHIP_CONFIGS: Record<ShipType, ShipConfig> = {
  // ===== PRODUCTION SHIPS =====

  salvageDrone: {
    id: 'salvageDrone',
    name: 'Salvage Drone',
    description: 'Basic autonomous salvage unit that collects debris from orbit',
    category: 'production',
    tier: 1,
    baseCost: { debris: 10 },
    costGrowth: GROWTH_RATES.COMMON,
    baseProduction: 1, // 1 debris/sec
    producesResource: 'debris',
    unlockRequirements: {},
    availableUpgrades: ['efficiency1', 'efficiency2', 'efficiency3', 'efficiency4', 'efficiency5', 'swarmProtocol'],
  },

  refineryBarge: {
    id: 'refineryBarge',
    name: 'Refinery Barge',
    description: 'Processes raw debris into refined metal',
    category: 'production',
    tier: 1,
    baseCost: { metal: 100 },
    costGrowth: GROWTH_RATES.UNCOMMON,
    baseProduction: 10, // consumes 10 debris/sec
    producesResource: 'metal',
    consumesResource: 'debris',
    conversionRatio: 0.2, // 10 debris → 2 metal (base)
    unlockRequirements: {
      ships: { salvageDrone: 5 },
    },
    availableUpgrades: ['smelting1', 'smelting2', 'smelting3', 'throughputBoost'],
  },

  electronicsExtractor: {
    id: 'electronicsExtractor',
    name: 'Electronics Extractor',
    description: 'Salvages functional circuits from wreckage',
    category: 'production',
    tier: 2,
    baseCost: { metal: 500, electronics: 50 },
    costGrowth: GROWTH_RATES.UNCOMMON,
    baseProduction: 0.5, // 0.5 electronics/sec
    producesResource: 'electronics',
    unlockRequirements: {
      orbit: 'geo',
    },
    availableUpgrades: ['componentRecovery', 'precisionExtraction'],
  },

  fuelSynthesizer: {
    id: 'fuelSynthesizer',
    name: 'Fuel Synthesizer',
    description: 'Synthesizes reaction mass from refined materials',
    category: 'production',
    tier: 2,
    baseCost: { metal: 1000, electronics: 100 },
    costGrowth: GROWTH_RATES.RARE,
    baseProduction: 20, // consumes 20 metal/sec
    producesResource: 'fuel',
    consumesResource: 'metal',
    conversionRatio: 0.05, // 20 metal → 1 fuel (base)
    unlockRequirements: {
      orbit: 'mars',
    },
    availableUpgrades: ['efficientSynthesis', 'quantumCatalysis'],
  },

  matterExtractor: {
    id: 'matterExtractor',
    name: 'Matter Extractor',
    description: 'Extracts exotic matter from gas giant atmosphere',
    category: 'production',
    tier: 3,
    baseCost: { metal: 50000, electronics: 5000, fuel: 500 },
    costGrowth: GROWTH_RATES.RARE,
    baseProduction: 1, // 1 rare material/sec
    producesResource: 'rareMaterials',
    unlockRequirements: {
      orbit: 'jovian',
    },
    availableUpgrades: ['deepDiveProtocol', 'atmosphericFiltration'],
  },

  quantumMiner: {
    id: 'quantumMiner',
    name: 'Quantum Miner',
    description: 'Mines exotic matter from quantum fluctuations',
    category: 'production',
    tier: 4,
    baseCost: { metal: 1000000, rareMaterials: 50000, fuel: 10000 },
    costGrowth: GROWTH_RATES.EPIC,
    baseProduction: 0.1, // 0.1 exotic alloys/sec
    producesResource: 'exoticAlloys',
    unlockRequirements: {
      prestige: ['quantumMinerUnlock'], // Run 7 prestige reward
    },
    availableUpgrades: ['quantumResonance', 'zeroPointExtraction'],
  },

  // ===== ACTIVE SHIPS =====

  scoutProbe: {
    id: 'scoutProbe',
    name: 'Scout Probe',
    description: 'Discovers derelicts in orbit',
    category: 'active',
    tier: 1,
    baseCost: { metal: 500, electronics: 100 },
    costGrowth: GROWTH_RATES.UNCOMMON,
    baseMissionDuration: 10 * 60 * 1000, // 10 minutes
    baseSuccessRate: 0.15, // 15% discovery chance per mission
    unlockRequirements: {
      orbit: 'geo',
    },
    availableUpgrades: ['advancedSensors', 'quickSurvey', 'longRangeComms'],
  },

  salvageFrigate: {
    id: 'salvageFrigate',
    name: 'Salvage Frigate',
    description: 'Salvages discovered derelicts',
    category: 'active',
    tier: 2,
    baseCost: { metal: 5000, electronics: 1000, fuel: 200 },
    costGrowth: GROWTH_RATES.RARE,
    baseMissionDuration: 20 * 60 * 1000, // 20 minutes
    baseSuccessRate: 0.9, // 90% success rate
    unlockRequirements: {
      milestone: 'firstDerelictDiscovered',
    },
    availableUpgrades: ['reinforcedHull', 'salvageEfficiency', 'rapidDeployment'],
  },

  heavySalvageFrigate: {
    id: 'heavySalvageFrigate',
    name: 'Heavy Salvage Frigate',
    description: 'Salvages dangerous/rare derelicts at 2x speed',
    category: 'active',
    tier: 3,
    baseCost: { metal: 100000, electronics: 20000, fuel: 5000 },
    costGrowth: GROWTH_RATES.EPIC,
    baseMissionDuration: 15 * 60 * 1000, // 15 minutes (faster than normal)
    baseSuccessRate: 0.95, // 95% success rate
    unlockRequirements: {
      prestige: ['heavySalvageFrigateUnlock'], // Run 3 prestige reward
    },
    availableUpgrades: ['militaryGradeShielding', 'cargoExpansion', 'emergencyWarp'],
  },

  deepSpaceScanner: {
    id: 'deepSpaceScanner',
    name: 'Deep Space Scanner',
    description: 'Passively increases derelict spawn rate',
    category: 'active',
    tier: 3,
    baseCost: { metal: 500000, electronics: 100000, rareMaterials: 20000 },
    costGrowth: GROWTH_RATES.EPIC,
    // Passive effect: +2% derelict spawn chance per scanner
    unlockRequirements: {
      prestige: ['deepSpaceScannerUnlock'], // Run 5 prestige reward
    },
    availableUpgrades: ['quantumEntanglementArray', 'predictiveAlgorithms'],
  },

  colonyShip: {
    id: 'colonyShip',
    name: 'Colony Ship',
    description: 'Establishes permanent colonies in orbits (+25% production)',
    category: 'active',
    tier: 4,
    baseCost: { metal: 1000000, electronics: 200000, fuel: 50000, rareMaterials: 10000 },
    costGrowth: GROWTH_RATES.LEGENDARY,
    baseMissionDuration: 60 * 60 * 1000, // 1 hour construction time
    baseSuccessRate: 1.0, // Always succeeds
    unlockRequirements: {
      orbit: 'lunar',
      tech: ['colonyTechnology'],
    },
    availableUpgrades: ['colonyEfficiency', 'autoSalvageBay'],
  },
};

/**
 * Get ships available for purchase based on current game state
 */
export function getAvailableShips(state: {
  currentOrbit: OrbitType;
  ships: Record<ShipType, number>;
  resources: Record<ResourceType, number>;
  techTree: { purchased: string[] };
  prestige: { purchasedPerks: string[] };
  milestones: Record<string, boolean>;
}): ShipType[] {
  const available: ShipType[] = [];

  for (const [shipType, config] of Object.entries(SHIP_CONFIGS)) {
    const req = config.unlockRequirements;

    // Check orbit requirement
    if (req.orbit && !isOrbitUnlocked(state.currentOrbit, req.orbit)) {
      continue;
    }

    // Check ship requirements
    if (req.ships) {
      let hasShips = true;
      for (const [requiredShip, count] of Object.entries(req.ships)) {
        if (state.ships[requiredShip as ShipType] < count) {
          hasShips = false;
          break;
        }
      }
      if (!hasShips) continue;
    }

    // Check resource requirements (one-time unlock)
    if (req.resources) {
      let hasResources = true;
      for (const [resource, amount] of Object.entries(req.resources)) {
        if (state.resources[resource as ResourceType] < amount) {
          hasResources = false;
          break;
        }
      }
      if (!hasResources) continue;
    }

    // Check tech requirements
    if (req.tech) {
      const hasTech = req.tech.every(tech => state.techTree.purchased.includes(tech));
      if (!hasTech) continue;
    }

    // Check prestige requirements
    if (req.prestige) {
      const hasPerks = req.prestige.every(perk => state.prestige.purchasedPerks.includes(perk));
      if (!hasPerks) continue;
    }

    // Check milestone requirements
    if (req.milestone && !state.milestones[req.milestone]) {
      continue;
    }

    available.push(shipType as ShipType);
  }

  return available;
}

/**
 * Helper to check if an orbit is unlocked
 */
function isOrbitUnlocked(currentOrbit: OrbitType, requiredOrbit: OrbitType): boolean {
  const orbitOrder: OrbitType[] = ['leo', 'geo', 'lunar', 'mars', 'asteroidBelt', 'jovian', 'kuiper', 'deepSpace'];
  const currentIndex = orbitOrder.indexOf(currentOrbit);
  const requiredIndex = orbitOrder.indexOf(requiredOrbit);
  return currentIndex >= requiredIndex;
}
