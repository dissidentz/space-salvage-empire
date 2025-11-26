// src/stores/gameStore.ts
import { calculateProductionRates } from '@/engine/production';
import { ORBIT_CONFIGS, isOrbitUnlocked } from '@/config/orbits';
import type { GameState, OrbitType, ResourceType, ShipType } from '@/types';
import {
    calculateBulkShipCost,
    calculateShipCost,
    canAffordCost,
} from '@/utils/formulas';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GameStore extends GameState {
  // Actions
  addResource: (type: ResourceType, amount: number) => void;
  subtractResource: (type: ResourceType, amount: number) => boolean;
  buyShip: (type: ShipType, amount?: number) => boolean;
  clickDebris: () => void;
  canAffordShip: (type: ShipType, amount?: number) => boolean;
  getShipCost: (
    type: ShipType,
    amount?: number
  ) => Partial<Record<ResourceType, number>>;
  getProductionRates: () => Partial<Record<ResourceType, number>>;
  updateLastSaveTime: (time: number) => void;
  updateComputedRates: (rates: Partial<Record<ResourceType, number>>) => void;
  
  // Ship toggle actions
  toggleShip: (type: ShipType) => void;
  setShipEnabled: (type: ShipType, enabled: boolean) => void;
  
  // Save/Load/Reset actions
  exportSave: () => string;
  importSave: (saveData: string) => boolean;
  hardReset: () => void;
  
  // Orbit travel actions
  canTravelToOrbit: (targetOrbit: OrbitType) => boolean;
  travelToOrbit: (targetOrbit: OrbitType) => boolean;
  getOrbitTravelCost: (targetOrbit: OrbitType) => number;
  getOrbitTravelTime: (targetOrbit: OrbitType) => number;
  
  // Milestone helpers
  evaluateMilestone: (milestoneId: string) => boolean;
  claimMilestone: (milestoneId: string) => boolean;
  checkAndClaimMilestones: () => void;
  // Notifications for external systems to call when events happen
  onMissionComplete: (
    missionId: string,
    success: boolean,
    rewards?: Partial<Record<ResourceType, number>>
  ) => void;
  onDerelictSalvaged: (
    derelictId: string,
    rewards?: Partial<Record<ResourceType, number>>
  ) => void;
  
  // UI actions
  setActiveView: (view: 'dashboard' | 'settings') => void;
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
      },

      shipUpgrades: {},
      techTree: { purchased: [], available: [] },
      // Canonical upgrades seeded to give the game basic progression
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
      } as const,

      // Basic milestone goals to guide early progression
      milestones: {
        reach_geo: {
          id: 'reach_geo',
          name: 'Reach GEO Orbit',
          description:
            'Travel to GEO orbit to unlock new resources and derelicts.',
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
      } as const,

      derelicts: [],
      missions: [],
      colonies: [],
      contracts: [],

      prestige: {
        darkMatter: 0,
        totalDarkMatter: 0,
        purchasedPerks: [],
        arkComponents: {},
        arkUnlocked: false,
        arkComplete: false,
        totalRuns: 0,
        fastestRun: 0,
        highestOrbit: 'leo',
      },

      stats: {
        totalDebrisCollected: 0,
        totalMetalProduced: 0,
        totalElectronicsGained: 0,
        totalFuelSynthesized: 0,

        totalClicks: 0,
        totalShipsPurchased: 0,
        totalMissionsLaunched: 0,
        totalMissionsSucceeded: 0,
        totalMissionsFailed: 0,

        totalDerelictsDiscovered: 0,
        totalDerelictsSalvaged: 0,
        derelictsByRarity: {},

        orbitsUnlocked: ['leo'],
        coloniesEstablished: 0,
        techsPurchased: 0,
        prestigeCount: 0,

        totalPlayTime: 0,
        totalIdleTime: 0,
        currentRunTime: 0,
      },

      ui: {
        activeTab: 'fleet',
        activeView: 'dashboard',
        openModal: null,
        modalData: undefined,
        notifications: [],
        settings: {
          soundEnabled: true,
          musicEnabled: true,
          soundVolume: 0.7,
          musicVolume: 0.4,
          autoSave: true,
          autoSaveInterval: 20000,
          showAnimations: true,
          compactMode: false,
        },
        activeTooltip: null,
      },

      activeFormation: null,
      formationCooldownEnd: 0,
      computedRates: {},

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
        const cost =
          amount === 1
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
        // After clicking, evaluate milestones
        get().checkAndClaimMilestones();
      },

      // Evaluate a single milestone by id
      evaluateMilestone: (milestoneId: string) => {
        const state = get();
        const ms =
          state.milestones[milestoneId as keyof typeof state.milestones];
        if (!ms) return false;
        if (ms.achieved) return false;

        const cond = ms.condition;
        switch (cond.type) {
          case 'reach_orbit': {
            const orbitKey = cond.key as OrbitType | undefined;
            if (!orbitKey) return false;
            return (
              (state.stats.orbitsUnlocked ?? []).includes(orbitKey) ||
              state.currentOrbit === orbitKey
            );
          }
          case 'collect_resource': {
            const resKey = cond.key as keyof typeof state.resources | undefined;
            if (!resKey) return false;
            if (resKey === 'debris')
              return state.stats.totalDebrisCollected >= cond.value;
            if (resKey === 'metal')
              return state.stats.totalMetalProduced >= cond.value;
            if (resKey === 'electronics')
              return state.stats.totalElectronicsGained >= cond.value;
            if (resKey === 'fuel')
              return state.stats.totalFuelSynthesized >= cond.value;
            return (state.resources[resKey as ResourceType] ?? 0) >= cond.value;
          }
          case 'purchase_ships': {
            const shipKey = cond.key as ShipType | undefined;
            if (!shipKey) return false;
            return (state.ships[shipKey] ?? 0) >= cond.value;
          }
          case 'time_played': {
            return state.stats.totalPlayTime >= cond.value;
          }
          case 'derelicts_salvaged': {
            return (state.stats.totalDerelictsSalvaged ?? 0) >= cond.value;
          }
          default:
            return false;
        }
      },

      // Claim a milestone and apply rewards; returns true if claimed
      claimMilestone: (milestoneId: string) => {
        const state = get();
        const ms =
          state.milestones[milestoneId as keyof typeof state.milestones];
        if (!ms || ms.achieved) return false;

        // Mark achieved
        set(s => ({
          milestones: {
            ...s.milestones,
            [milestoneId]: { ...ms, achieved: true },
          },
        }));

        const rewards = ms.rewards;
        if (!rewards) return true;

        // Resource rewards (if any resource keys are present)
        const resourceKeys = [
          'debris',
          'metal',
          'electronics',
          'fuel',
          'rareMaterials',
          'exoticAlloys',
          'aiCores',
          'dataFragments',
          'darkMatter',
        ];

        const rewardKeys = Object.keys(rewards || {});
        const hasResourceRewards = rewardKeys.some(k =>
          resourceKeys.includes(k)
        );
        if (hasResourceRewards) {
          const res = rewards as Partial<Record<ResourceType, number>>;
          set(s => {
            const newResources = { ...s.resources };
            for (const k of Object.keys(res)) {
              const key = k as ResourceType;
              const addVal = (res[key] ?? 0) as number;
              newResources[key] = (s.resources[key] ?? 0) + addVal;
            }
            return { resources: newResources };
          });
        }

        // unlockTech reward
        if (
          typeof rewards === 'object' &&
          rewards !== null &&
          'unlockTech' in rewards
        ) {
          const techId = (rewards as { unlockTech?: string }).unlockTech;
          if (techId) {
            set(s => ({
              techTree: {
                ...s.techTree,
                available: Array.from(
                  new Set([...(s.techTree.available || []), techId])
                ),
              },
            }));
          }
        }

        // addUpgrade reward
        if (
          typeof rewards === 'object' &&
          rewards !== null &&
          'addUpgrade' in rewards
        ) {
          const upId = (rewards as { addUpgrade?: string }).addUpgrade;
          if (upId) {
            set(s => ({
              upgrades: {
                ...s.upgrades,
                [upId]: s.upgrades[upId]
                  ? { ...s.upgrades[upId], unlocked: true }
                  : { id: upId, name: upId, currentLevel: 0, unlocked: true },
              },
            }));
          }
        }

        return true;
      },

      // Iterate through milestones and claim those whose conditions are met
      checkAndClaimMilestones: () => {
        const state = get();
        for (const id of Object.keys(state.milestones)) {
          try {
            if (get().evaluateMilestone(id)) {
              get().claimMilestone(id);
            }
          } catch (err) {
            console.warn('Milestone eval error', id, err);
          }
        }
      },

      canAffordShip: (type, amount = 1) => {
        const state = get();
        const cost =
          amount === 1
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

      updateLastSaveTime: time => {
        set({ lastSaveTime: time });
      },

      updateComputedRates: rates => {
        set({ computedRates: rates });
      },

      // Ship toggle actions
      toggleShip: (type: ShipType) => {
        set(state => ({
          shipEnabled: {
            ...state.shipEnabled,
            [type]: !state.shipEnabled[type],
          },
        }));
      },

      setShipEnabled: (type: ShipType, enabled: boolean) => {
        set(state => ({
          shipEnabled: {
            ...state.shipEnabled,
            [type]: enabled,
          },
        }));
      },

      // External event handlers
      onMissionComplete: (
        missionId: string,
        success: boolean,
        rewards?: Partial<Record<ResourceType, number>>
      ) => {
        // mark mission status if present
        const mission = get().missions.find(m => m.id === missionId);
        if (mission) {
          set(s => ({
            missions: s.missions.map(m =>
              m.id === missionId
                ? { ...m, status: success ? 'completed' : 'failed', success }
                : m
            ),
          }));
        }

        // update stats
        set(s => ({
          stats: {
            ...s.stats,
            totalMissionsLaunched: s.stats.totalMissionsLaunched, // unchanged
            totalMissionsSucceeded:
              s.stats.totalMissionsSucceeded + (success ? 1 : 0),
            totalMissionsFailed:
              s.stats.totalMissionsFailed + (success ? 0 : 1),
          },
        }));

        // apply rewards (if any)
        if (rewards) {
          set(s => {
            const newResources = { ...s.resources };
            for (const k of Object.keys(rewards)) {
              const key = k as ResourceType;
              const addVal =
                (rewards as Partial<Record<ResourceType, number>>)[key] ?? 0;
              newResources[key] = (s.resources[key] ?? 0) + addVal;
            }
            return { resources: newResources };
          });
        }

        // check milestones
        get().checkAndClaimMilestones();
      },

      onDerelictSalvaged: (
        derelictId: string,
        rewards?: Partial<Record<ResourceType, number>>
      ) => {
        // increment derelict count
        set(s => ({
          stats: {
            ...s.stats,
            totalDerelictsSalvaged: (s.stats.totalDerelictsSalvaged ?? 0) + 1,
          },
        }));

        // apply rewards
        if (rewards) {
          set(s => {
            const newResources = { ...s.resources };
            for (const k of Object.keys(rewards)) {
              const key = k as ResourceType;
              const addVal =
                (rewards as Partial<Record<ResourceType, number>>)[key] ?? 0;
              newResources[key] = (s.resources[key] ?? 0) + addVal;
            }
            return { resources: newResources };
          });
        }

        // remove derelict from list if present
        set(s => ({ derelicts: s.derelicts.filter(d => d.id !== derelictId) }));

        // check milestones
        get().checkAndClaimMilestones();
      },

      // Save/Load/Reset functions
      exportSave: () => {
        const state = get();
        const saveData = {
          version: state.version,
          lastSaveTime: Date.now(),
          totalPlayTime: state.totalPlayTime,
          currentRun: state.currentRun,
          currentOrbit: state.currentOrbit,
          resources: state.resources,
          ships: state.ships,
          shipEnabled: state.shipEnabled,
          shipUpgrades: state.shipUpgrades,
          techTree: state.techTree,
          upgrades: state.upgrades,
          milestones: state.milestones,
          prestige: state.prestige,
          stats: state.stats,
          ui: state.ui,
          activeFormation: state.activeFormation,
          formationCooldownEnd: state.formationCooldownEnd,
        };
        return JSON.stringify(saveData, null, 2);
      },

      importSave: (saveData: string) => {
        try {
          const parsed = JSON.parse(saveData);
          
          // Basic validation
          if (!parsed.version || !parsed.resources || !parsed.ships) {
            console.error('Invalid save data format');
            return false;
          }

          // Merge with current state to ensure all fields exist
          set({
            ...get(),
            ...parsed,
            lastSaveTime: Date.now(),
            computedRates: {}, // Recalculate on next tick
          });

          return true;
        } catch (error) {
          console.error('Failed to import save:', error);
          return false;
        }
      },

      hardReset: () => {
        // Clear localStorage first
        localStorage.removeItem('space-salvage-save');
        
        // Reload the page to get a fresh state
        window.location.reload();
      },

      // UI actions
      setActiveView: (view: 'dashboard' | 'settings') => {
        set(state => ({
          ui: {
            ...state.ui,
            activeView: view,
          },
        }));
      },

      // Orbit travel actions
      canTravelToOrbit: (targetOrbit: OrbitType) => {
        const state = get();
        if (targetOrbit === state.currentOrbit) return false; // Already there
        
        return isOrbitUnlocked(targetOrbit, {
          resources: state.resources,
          techTree: state.techTree,
          colonies: state.colonies,
          prestige: state.prestige,
        });
      },

      travelToOrbit: (targetOrbit: OrbitType) => {
        const state = get();
        if (!get().canTravelToOrbit(targetOrbit)) return false;

        const config = ORBIT_CONFIGS[targetOrbit];
        const fuelCost = config.fuelCost;

        // Check fuel
        if (state.resources.fuel < fuelCost) return false;

        // Deduct fuel
        set(s => ({
          resources: {
            ...s.resources,
            fuel: s.resources.fuel - fuelCost,
          },
          currentOrbit: targetOrbit,
        }));

        // Update stats
        const isNewOrbit = !state.stats.orbitsUnlocked.includes(targetOrbit);
        if (isNewOrbit) {
          set(s => ({
            stats: {
              ...s.stats,
              orbitsUnlocked: [...s.stats.orbitsUnlocked, targetOrbit],
            },
          }));
        }

        // Check milestones
        get().checkAndClaimMilestones();

        return true;
      },

      getOrbitTravelCost: (targetOrbit: OrbitType) => {
        return ORBIT_CONFIGS[targetOrbit].fuelCost;
      },

      getOrbitTravelTime: (targetOrbit: OrbitType) => {
        return ORBIT_CONFIGS[targetOrbit].travelTime;
      },
    }),
    {
      name: 'space-salvage-save',
      version: 1,
    }
  )
);
