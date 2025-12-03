import type { FormationType, Ships } from '@/types';

export interface FormationConfig {
  id: FormationType;
  name: string;
  description: string;
  requirements: Partial<Ships>;
  effects: {
    type: 'multiplier' | 'flat_bonus';
    target: string;
    value: number;
    description: string;
  }[];
  cooldown: number; // ms
}

export const FORMATION_CONFIGS: Record<FormationType, FormationConfig> = {
  miningFleet: {
    id: 'miningFleet',
    name: 'Mining Fleet',
    description: 'Optimized for resource extraction.',
    requirements: {
      refineryBarge: 10,
    },
    effects: [
      {
        type: 'multiplier',
        target: 'metal_production',
        value: 1.25,
        description: '+25% Metal Production',
      },
      {
        type: 'multiplier',
        target: 'rareMaterials_production',
        value: 1.25,
        description: '+25% Rare Materials Production',
      },
    ],
    cooldown: 5 * 60 * 1000, // 5 minutes
  },
  scoutFleet: {
    id: 'scoutFleet',
    name: 'Scout Fleet',
    description: 'Rapid reconnaissance formation.',
    requirements: {
      scoutProbe: 5,
    },
    effects: [
      {
        type: 'multiplier',
        target: 'scout_discovery_rate',
        value: 1.2,
        description: '+20% Discovery Chance',
      },
      {
        type: 'multiplier',
        target: 'scout_mission_time',
        value: 0.9,
        description: '-10% Scout Mission Time',
      },
    ],
    cooldown: 5 * 60 * 1000,
  },
  salvageFleet: {
    id: 'salvageFleet',
    name: 'Salvage Fleet',
    description: 'Coordinated salvage operations.',
    requirements: {
      salvageDrone: 20,
      salvageFrigate: 2,
    },
    effects: [
      {
        type: 'multiplier',
        target: 'debris_collection',
        value: 1.3,
        description: '+30% Debris Collection',
      },
      {
        type: 'multiplier',
        target: 'salvage_rewards',
        value: 1.15,
        description: '+15% Salvage Rewards',
      },
    ],
    cooldown: 5 * 60 * 1000,
  },
  expeditionFleet: {
    id: 'expeditionFleet',
    name: 'Expedition Fleet',
    description: 'Long-range travel configuration.',
    requirements: {
      fuelSynthesizer: 1,
      deepSpaceScanner: 1, // Using deepSpaceScanner as a high-tier requirement placeholder
    },
    effects: [
      {
        type: 'multiplier',
        target: 'fuel_cost',
        value: 0.8,
        description: '-20% Fuel Costs',
      },
      {
        type: 'multiplier',
        target: 'travel_time',
        value: 0.85,
        description: '-15% Travel Time',
      },
    ],
    cooldown: 10 * 60 * 1000, // 10 minutes
  },
  productionFleet: {
    id: 'productionFleet',
    name: 'Industrial Fleet',
    description: 'General purpose production boost.',
    requirements: {
        // Special requirement logic needed for "Total Ships"
        // For now, let's just require a mix
        refineryBarge: 5,
        fuelSynthesizer: 5,
    },
    effects: [
      {
        type: 'multiplier',
        target: 'all_production',
        value: 1.15,
        description: '+15% All Production',
      },
    ],
    cooldown: 5 * 60 * 1000,
  },
};
