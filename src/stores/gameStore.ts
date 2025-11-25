// src/stores/gameStore.ts
import { calculateProductionRates } from '@/engine/production';
import type { GameState, ResourceType, ShipType } from '@/types';
import { calculateBulkShipCost, calculateShipCost, canAffordCost } from '@/utils/formulas';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GameStore extends GameState {
  // Actions
  addResource: (type: ResourceType, amount: number) => void;
  subtractResource: (type: ResourceType, amount: number) => boolean;
  buyShip: (type: ShipType, amount?: number) => boolean;
  clickDebris: () => void;
  canAffordShip: (type: ShipType, amount?: number) => boolean;
  getShipCost: (type: ShipType, amount?: number) => Partial<Record<ResourceType, number>>;
  getProductionRates: () => Partial<Record<ResourceType, number>>;
  updateLastSaveTime: (time: number) => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Initial state (minimal for now)
      version: '1.0.0',
      lastSaveTime: Date.now(),
      totalPlayTime: 0,
      currentRun: 1,
      currentOrbit: 'leo',

      resources: {
        debris: 0,
        metal: 0,
        electronics: 0,
        fuel: 0,
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
      },

      shipUpgrades: {},
      techTree: { purchased: [], available: [] },
      upgrades: {}, // TODO: fill in upgrade data
      milestones: {}, // TODO: fill in milestone data
      derelicts: [],
      missions: [],
      colonies: [],
      contracts: [],
      prestige: {}, // TODO: fill in prestige data
      stats: {}, // TODO: fill in statistics data
      ui: {}, // TODO: fill in UI state data
      activeFormation: null,
      formationCooldownEnd: 0,

      // Actions
      addResource: (type, amount) =>
        set(state => ({
          resources: {
            ...state.resources,
            [type]: state.resources[type] + amount,
          },
        })),

      subtractResource: (type, amount) => {
        const state = get();
        if (state.resources[type] < amount) return false;

        set(state => ({
          resources: {
            ...state.resources,
            [type]: state.resources[type] - amount,
          },
        }));
        return true;
      },

      buyShip: (type, amount = 1) => {
        const state = get();
        const cost = amount === 1 
          ? calculateShipCost(type, state.ships[type])
          : calculateBulkShipCost(type, state.ships[type], amount);

        // Check if can afford
        if (!canAffordCost(cost, state.resources)) {
          return false;
        }

        // Deduct resources
        const newResources = { ...state.resources };
        for (const [resource, amount] of Object.entries(cost)) {
          newResources[resource as ResourceType] -= amount;
        }

        // Add ships
        set(state => ({
          resources: newResources,
          ships: {
            ...state.ships,
            [type]: state.ships[type] + amount,
          },
        }));

        return true;
      },

      clickDebris: () => {
        const state = get();
        state.addResource('debris', 1);
      },

      canAffordShip: (type, amount = 1) => {
        const state = get();
        const cost = amount === 1
          ? calculateShipCost(type, state.ships[type])
          : calculateBulkShipCost(type, state.ships[type], amount);
        return canAffordCost(cost, state.resources);
      },

      getShipCost: (type, amount = 1) => {
        const state = get();
        return amount === 1
          ? calculateShipCost(type, state.ships[type])
          : calculateBulkShipCost(type, state.ships[type], amount);
      },

      getProductionRates: () => {
        const state = get();
        return calculateProductionRates(state);
      },

      updateLastSaveTime: (time) => {
        set({ lastSaveTime: time });
      },
    }),
    {
      name: 'space-salvage-save',
      version: 1,
    }
  )
);
