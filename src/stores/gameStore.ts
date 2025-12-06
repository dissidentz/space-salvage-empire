import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { OrbitType } from '@/types';
import { createEconomySlice } from './slices/economySlice';
import { createFormationSlice } from './slices/formationSlice';
import { createMissionSlice } from './slices/missionSlice';
import { createOrbitSlice } from './slices/orbitSlice';
import { createPrestigeSlice } from './slices/prestigeSlice';
import { createResourceSlice } from './slices/resourceSlice';
import { createShipSlice } from './slices/shipSlice';
import { createTechSlice } from './slices/techSlice';
import type { GameStore } from './slices/types';
import { createUiSlice } from './slices/uiSlice';

// Initial State for Hard Reset
const RESET_STATE = {
    version: '1.0.0',
    lastSaveTime: Date.now(),
    totalPlayTime: 0,
    currentRun: 1,
    currentOrbit: 'leo' as OrbitType,
    instantWarpAvailable: false,
    resources: {
        debris: 0,
        metal: 0,
        electronics: 0,
        fuel: 500,
        rareMaterials: 0,
        exoticAlloys: 0,
        aiCores: 0,
        dataFragments: 0,
        darkMatter: 0,
    },
    ships: {
        salvageDrone: 0,
        refineryBarge: 0,
        electronicsExtractor: 0,
        fuelSynthesizer: 0,
        matterExtractor: 0,
        quantumMiner: 0,
        scoutProbe: 0,
        salvageFrigate: 0,
        heavySalvageFrigate: 0,
        deepSpaceScanner: 0,
        colonyShip: 0,
        aiCoreFabricator: 0,
    },
    shipEnabled: {
        salvageDrone: true,
        refineryBarge: true,
        electronicsExtractor: true,
        fuelSynthesizer: true,
        matterExtractor: true,
        quantumMiner: true,
        scoutProbe: true,
        salvageFrigate: true,
        heavySalvageFrigate: true,
        deepSpaceScanner: true,
        colonyShip: true,
        aiCoreFabricator: true,
    },
    techTree: { purchased: [], available: [] },
    shipUpgrades: {},
    // Legacy/Default upgrades
    upgrades: {
      debris_click_power: {
        id: 'debris_click_power',
        name: 'Improved Salvage Hands',
        description: 'Increase debris gained per manual salvage click.',
        cost: { debris: 100 },
        currentLevel: 0,
        maxLevel: 10,
        effects: [{ type: 'multiplier', target: 'debris', value: 1.15 }],
        unlocked: true,
      },
      salvage_drone_efficiency: {
        id: 'salvage_drone_efficiency',
        name: 'Drone Efficiency',
        description: 'Each Salvage Drone gains bonus production.',
        cost: { metal: 50 },
        currentLevel: 0,
        maxLevel: 20,
        effects: [{ type: 'multiplier', target: 'debris', value: 1.05 }],
        unlocked: false,
      },
      refinery_efficiency: {
        id: 'refinery_efficiency',
        name: 'Refinery Optimization',
        description: 'Refineries convert debris to metal more efficiently.',
        cost: { electronics: 25, metal: 25 },
        currentLevel: 0,
        maxLevel: 15,
        effects: [{ type: 'multiplier', target: 'metal', value: 1.08 }],
        unlocked: false,
      },
    },
    milestones: {
        reach_geo: {
          id: 'reach_geo',
          name: 'Reach GEO Orbit',
          description: 'Travel to GEO orbit to unlock new resources and derelicts.',
          condition: { type: 'reach_orbit', key: 'geo', value: 1 },
          achieved: false,
          rewards: { unlockTech: 'orbit_navigation' },
        },
        collect_1000_debris: {
          id: 'collect_1000_debris',
          name: 'Collector',
          description: 'Collect 1,000 debris to prove your salvaging skills.',
          condition: { type: 'collect_resource', key: 'debris', value: 1000 },
          achieved: false,
          rewards: { metal: 50 },
        },
        buy_10_drones: {
          id: 'buy_10_drones',
          name: 'Drone Fleet',
          description: 'Purchase 10 Salvage Drones to scale production.',
          condition: { type: 'purchase_ships', key: 'salvageDrone', value: 10 },
          achieved: false,
          rewards: { rareMaterials: 10 },
        },
        first_travel: {
          id: 'first_travel',
          name: 'First Journey',
          description: 'Complete your first orbit travel.',
          condition: { type: 'travels_completed', value: 1 },
          achieved: false,
          rewards: { fuel: 50 },
        },
        orbit_hopper: {
            id: 'orbit_hopper',
            name: 'Orbit Hopper',
            description: 'Unlock 3 Orbits.',
            condition: { type: 'unique_orbits_visited', value: 3 },
            achieved: false,
            rewards: { electronics: 100 }
        }
    },
    prestige: {
        darkMatter: 0,
        totalDarkMatter: 0,
        totalRuns: 0,
        fastestRun: 0, 
        purchasedPerks: {},
        arkUnlocked: false,
        arkComponents: {},
        arkComplete: false,
        endlessMode: false,
        highestOrbit: 'leo' as OrbitType,
    },
    
    // Arrays
    derelicts: [],
    missions: [],
    contracts: [],
    colonies: [],
    
    // Formations
    activeFormation: null,
    formationCooldownEnd: 0,

    // UI
    ui: {
        activeView: 'dashboard',
        activeTab: 'fleet',
        notifications: [],
        automationSettings: {
            autoScoutEnabled: false,
            autoSalvageEnabled: false,
            autoScoutTargetLimit: 5,
        },
        openModal: null,
        eventLog: [],
        settings: {
            soundEnabled: true,
            musicEnabled: true,
            soundVolume: 0.5,
            musicVolume: 0.5,
            autoSave: true,
            autoSaveInterval: 60,
            showAnimations: true,
            compactMode: false,
        },
        activeTooltip: null,
        afkSummary: null,
    },
    
    stats: {
        startTime: Date.now(),
        totalPlayTime: 0,
        currentRunTime: 0,
        resourcesMined: {},
        totalClicks: 0,
        totalDebrisCollected: 0,
        totalShipsPurchased: 0,
        totalMissionsLaunched: 0,
        totalMissionsSucceeded: 0,
        totalMissionsFailed: 0,
        totalDerelictsDiscovered: 0,
        totalDerelictsSalvaged: 0,
        totalFuelSpent: 0,
        totalTravels: 0,
        orbitsUnlocked: ['leo'],
        farthestOrbit: 'leo',
        techsPurchased: 0,
        enemiesDefeated: 0,
        derelictsByRarity: {},
        travelHistory: [],
        missionHistory: [],
        coloniesEstablished: 0,
        prestigeCount: 0,
        totalMetalProduced: 0,
        totalElectronicsGained: 0,
        totalFuelSynthesized: 0,
        totalIdleTime: 0,
        totalTravelTime: 0,
        instantWarpUsed: false
    }
} as any; 

export const useGameStore = create<GameStore>()(
  persist(
    (...a) => ({
      ...createResourceSlice(...a),
      ...createShipSlice(...a),
      ...createMissionSlice(...a),
      ...createTechSlice(...a),
      ...createOrbitSlice(...a),
      ...createPrestigeSlice(...a),
      ...createEconomySlice(...a),
      ...createUiSlice(...a),
      ...createFormationSlice(...a),

      // Root store state
      version: '1.0.0',
      lastSaveTime: Date.now(),
      totalPlayTime: 0,
      currentRun: 1,

      // Initial root state
      stats: RESET_STATE.stats,
      derelicts: RESET_STATE.derelicts,
      missions: RESET_STATE.missions,
      contracts: RESET_STATE.contracts,
      computedRates: {},
      travelState: null,

      updateLastSaveTime: (time: number) => {
          const [set] = a;
          set({ lastSaveTime: time });
      },
      
      exportSave: () => {
          const [, get] = a;
          return JSON.stringify(get());
      },

      importSave: (saveData: string) => {
          const [set] = a;
          try {
              const parsed = JSON.parse(saveData);
              if (!parsed.resources || !parsed.ships) return false;
              set(parsed);
              return true;
          } catch (e) {
              console.error("Failed to import save:", e);
              return false;
          }
      },

      hardReset: () => {
          const [set] = a;
          set(RESET_STATE);
      }
    }),
    {
      name: 'space-salvage-save',
    }
  )
);
