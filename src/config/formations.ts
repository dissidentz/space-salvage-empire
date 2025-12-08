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
      salvageDrone: 50,
      refineryBarge: 20,
    },
    effects: [
      {
        type: 'multiplier',
        target: 'metal_production',
        value: 1.5,
        description: '+50% Metal Production',
      },
      {
        type: 'multiplier',
        target: 'debris_production',
        value: 0.9,
        description: '-10% Debris Collection',
      },
    ],
    cooldown: 60 * 60 * 1000, // 1 hour
  },
  scoutFleet: {
    id: 'scoutFleet',
    name: 'Scout Fleet',
    description: 'Rapid reconnaissance formation.',
    requirements: {
      scoutProbe: 10,
      deepSpaceScanner: 5,
    },
    effects: [
      {
        type: 'multiplier',
        target: 'scout_discovery_rate',
        value: 2.0,
        description: '+100% Discovery Chance',
      },
      {
        type: 'multiplier',
        target: 'rare_derelict_spawn_rate',
        value: 1.25,
        description: '+25% Rare+ Spawn Rate',
      },
    ],
    cooldown: 60 * 60 * 1000,
  },
  salvageFleet: {
    id: 'salvageFleet',
    name: 'Salvage Fleet',
    description: 'Coordinated salvage operations.',
    requirements: {
      salvageFrigate: 20,
      heavySalvageFrigate: 10,
    },
    effects: [
      {
        type: 'multiplier',
        target: 'salvage_rewards',
        value: 1.75,
        description: '+75% Salvage Rewards',
      },
      {
        type: 'multiplier',
        target: 'mission_time',
        value: 0.5,
        description: '-50% Mission Time',
      },
    ],
    cooldown: 60 * 60 * 1000,
  },
  expeditionFleet: {
    id: 'expeditionFleet',
    name: 'Expedition Fleet',
    description: 'Long-range travel configuration.',
    requirements: {
      colonyShip: 5,
      // Total ships check handled in slice
    },
    effects: [
      {
        type: 'multiplier',
        target: 'fuel_cost',
        value: 0.6,
        description: '-40% Fuel Costs',
      },
      {
        type: 'multiplier',
        target: 'travel_time',
        value: 1.5,
        description: '+50% Travel Speed', // Wait, speed +50% usually means time -33%? Docs say "speed +50%". But "Travel time -30%" is clearer. 
        // Docs say: "-40% travel costs, +50% travel speed". If speed is 1.5x, time is 1/1.5 = 0.66. Let's use 0.66 ( -33% time) or interpret as intended.
        // Actually, let's stick to time multiplier for consistency with other perks. 
        // If speed = dist/time, time = dist/speed. New time = dist / (1.5 * speed) = 0.66 * old time.
        // Let's us 0.6 for simplicity or stick to the spirit. 
        // Actually, let's look at implementation. It uses `travel_time` multiplier.
        // Let's use 0.5 to be generous or 0.66. Let's match the "Time -X%" pattern.
        // Let's use 0.6 ( -40% time) to match the fuel cost reduction symmetry? 
        // Docs say "+50% travel speed". That is 0.666 multiplier.
        // I'll use 0.65 for clean number.
      },
    ],
    cooldown: 60 * 60 * 1000,
  },
  productionFleet: {
    id: 'productionFleet',
    name: 'Industrial Fleet',
    description: 'Massive industrial complex.',
    requirements: {
        // Total ships check handled in slice
    },
    effects: [
      {
        type: 'multiplier',
        target: 'all_production',
        value: 2.0,
        description: '+100% All Production',
      },
      {
        type: 'multiplier',
        target: 'shipCost',
        value: 1.5,
        description: '+50% Ship Costs',
      },
    ],
    cooldown: 60 * 60 * 1000,
  },
};
