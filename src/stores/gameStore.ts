// src/stores/gameStore.ts
import {
  DERELICT_CONFIGS,
  calculateDerelictRewards,
  rollDerelictRarity,
} from '@/config/derelicts';
import { ORBIT_CONFIGS, isOrbitUnlocked } from '@/config/orbits';
import { SHIP_CONFIGS } from '@/config/ships';
import { calculateProductionRates } from '@/engine/production';
import type {
  Derelict,
  DerelictAction,
  DerelictRarity, DerelictType, GameState, Mission, OrbitType, ResourceType, ShipType
} from '@/types';
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
  cancelTravel: () => boolean;
  completeTravelIfReady: () => void;
  getTravelProgress: () => number;

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
  setActiveView: (view: 'dashboard' | 'galaxyMap' | 'settings') => void;
  addNotification: (
    type: 'info' | 'success' | 'warning' | 'error',
    message: string,
    duration?: number
  ) => void;
  clearNotification: (id: string) => void;

  // Mission actions
  startScoutMission: (shipType: ShipType, targetOrbit: OrbitType) => boolean;
  startSalvageMission: (
    derelictId: string,
    shipType: ShipType,
    action: DerelictAction
  ) => boolean;
  completeMissionIfReady: (missionId: string) => void;
  cancelMission: (missionId: string) => boolean;
  getMissionProgress: (missionId: string) => number;

  // Derelict actions
  generateDerelict: (orbit: OrbitType, rarity: DerelictRarity) => Derelict;
  removeDerelict: (derelictId: string) => void;
  getAvailableDerelicts: (orbit: OrbitType) => Derelict[];
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
          description: 'Travel to 5 different orbits.',
          condition: { type: 'unique_orbits_visited', value: 5 },
          achieved: false,
          rewards: { electronics: 100 },
        },
        deep_space_pioneer: {
          id: 'deep_space_pioneer',
          name: 'Deep Space Pioneer',
          description: 'Reach Deep Space orbit.',
          condition: { type: 'reach_orbit', key: 'deepSpace', value: 1 },
          achieved: false,
          rewards: { darkMatter: 10 },
        },
        travel_veteran: {
          id: 'travel_veteran',
          name: 'Travel Veteran',
          description: 'Complete 25 successful travels.',
          condition: { type: 'travels_completed', value: 25 },
          achieved: false,
          rewards: { exoticAlloys: 50 },
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

        // Travel stats
        totalTravels: 0,
        totalFuelSpent: 0,
        totalTravelTime: 0,
        farthestOrbit: 'leo',
        travelHistory: [],
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
      travelState: null,

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
        const cost = state.getShipCost(type, amount);

        if (!state.canAffordShip(type, amount)) return false;

        // Deduct resources
        for (const [resource, value] of Object.entries(cost)) {
          state.subtractResource(resource as ResourceType, value);
        }

        // Add ship
        set(state => ({
          ships: {
            ...state.ships,
            [type]: state.ships[type] + amount,
          },
          stats: {
            ...state.stats,
            totalShipsPurchased: state.stats.totalShipsPurchased + amount,
          },
        }));

        return true;
      },

      clickDebris: () => {
        const state = get();
        // Base click value + upgrades
        let clickValue = 1;
        
        // Apply upgrades
        const clickUpgrade = state.upgrades.debris_click_power;
        if (clickUpgrade && clickUpgrade.currentLevel > 0) {
           // Base 1 * 1.15^level
           clickValue *= Math.pow(1.15, clickUpgrade.currentLevel);
        }

        state.addResource('debris', clickValue);
        
        set(state => ({
          stats: {
            ...state.stats,
            totalClicks: state.stats.totalClicks + 1,
            totalDebrisCollected: state.stats.totalDebrisCollected + clickValue,
          },
        }));
      },

      evaluateMilestone: (milestoneId) => {
        const state = get();
        const milestone = state.milestones[milestoneId];
        if (!milestone || milestone.achieved) return true;

        const { type, key, value } = milestone.condition;
        let current = 0;

        switch (type) {
          case 'reach_orbit':
            // Simple check if current orbit index >= target orbit index
            // For now, just check if currentOrbit matches or is "higher"
            // This is simplified; real logic needs orbit order
             const orbitOrder: OrbitType[] = ['leo', 'geo', 'lunar', 'mars', 'asteroidBelt', 'jovian', 'kuiper', 'deepSpace'];
             const currentIndex = orbitOrder.indexOf(state.currentOrbit);
             const targetIndex = orbitOrder.indexOf(key as OrbitType);
             if (currentIndex >= targetIndex) current = 1;
            break;
          case 'collect_resource':
             // We don't track total collected per resource in stats perfectly yet, 
             // but we can check current amount or add stats for it.
             // For 'debris', we have totalDebrisCollected
             if (key === 'debris') current = state.stats.totalDebrisCollected;
             else current = state.resources[key as ResourceType]; // Fallback to current amount
            break;
          case 'purchase_ships':
            current = state.ships[key as ShipType];
            break;
          case 'travels_completed':
            current = state.stats.totalTravels;
            break;
          case 'unique_orbits_visited':
            // We need to track unique orbits. For now, use orbitsUnlocked length
            current = state.stats.orbitsUnlocked.length;
            break;
        }

        return current >= value;
      },

      claimMilestone: (milestoneId) => {
        const state = get();
        const milestone = state.milestones[milestoneId];
        if (!milestone || milestone.achieved) return false;

        if (!state.evaluateMilestone(milestoneId)) return false;

        // Apply rewards
        if (milestone.rewards) {
           // Handle resource rewards
           // Handle tech/upgrade unlocks
           // For now, just resources
           const rewards = milestone.rewards as Partial<Record<ResourceType, number>>;
           for (const [res, amount] of Object.entries(rewards)) {
             if (res !== 'unlockTech' && res !== 'addUpgrade') {
                state.addResource(res as ResourceType, amount);
             }
           }
        }

        set(s => ({
          milestones: {
            ...s.milestones,
            [milestoneId]: { ...milestone, achieved: true },
          },
        }));

        return true;
      },
      
      checkAndClaimMilestones: () => {
        const state = get();
        Object.keys(state.milestones).forEach(id => {
            if (!state.milestones[id].achieved && state.evaluateMilestone(id)) {
                state.claimMilestone(id);
                state.addNotification('success', `Milestone Achieved: ${state.milestones[id].name}!`);
            }
        });
      },

      canAffordShip: (type, amount = 1) => {
        const state = get();
        const cost = state.getShipCost(type, amount);
        return canAffordCost(cost, state.resources);
      },

      getShipCost: (type, amount = 1) => {
        const state = get();
        const currentCount = state.ships[type];
        
        if (amount === 1) {
            return calculateShipCost(type, currentCount);
        } else {
            return calculateBulkShipCost(type, currentCount, amount);
        }
      },

      getProductionRates: () => {
        const state = get();
        return calculateProductionRates(state);
      },

      updateLastSaveTime: (time) => {
        set({ lastSaveTime: time });
      },

      updateComputedRates: (rates) => {
        set({ computedRates: rates });
      },

      toggleShip: (type) => {
        set(state => ({
          shipEnabled: {
            ...state.shipEnabled,
            [type]: !state.shipEnabled[type],
          },
        }));
      },

      setShipEnabled: (type, enabled) => {
        set(state => ({
          shipEnabled: {
            ...state.shipEnabled,
            [type]: enabled,
          },
        }));
      },

      // Notifications
      addNotification: (type, message, duration = 3000) => {
        const id = Math.random().toString(36).substring(7);
        const notification = { id, type, message, timestamp: Date.now(), duration };
        
        set(state => ({
          ui: {
            ...state.ui,
            notifications: [...state.ui.notifications, notification],
          },
        }));

        // Auto remove
        setTimeout(() => {
          get().clearNotification(id);
        }, duration);
      },

      clearNotification: (id) => {
        set(state => ({
          ui: {
            ...state.ui,
            notifications: state.ui.notifications.filter(n => n.id !== id),
          },
        }));
      },

      onMissionComplete: (missionId, success, rewards) => {
        // This is called by completeMissionIfReady, but can be used for external hooks
        // For now, just add a notification
        const state = get();
        const mission = state.missions.find(m => m.id === missionId);
        if (!mission) return;

        if (success) {
            let rewardText = '';
            if (rewards) {
                rewardText = Object.entries(rewards)
                    .map(([res, amount]) => `${amount.toFixed(1)} ${res}`)
                    .join(', ');
            }
            state.addNotification('success', `Mission Successful! Gained: ${rewardText}`);
        } else {
            state.addNotification('warning', 'Mission Failed.');
        }
      },

      onDerelictSalvaged: (_derelictId, rewards) => {
         const state = get();
         if (rewards) {
            const rewardText = Object.entries(rewards)
                .map(([res, amount]) => `${amount.toFixed(1)} ${res}`)
                .join(', ');
            state.addNotification('success', `Salvage Complete! Recovered: ${rewardText}`);
         }
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
          travelState: state.travelState,
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

          // Migration: Add travelState if it doesn't exist (for backward compatibility)
          if (!Object.prototype.hasOwnProperty.call(parsed, 'travelState')) {
            parsed.travelState = null;
          }

          const now = Date.now();
          const offlineTime = now - (parsed.lastSaveTime || now);
          const maxOfflineTime = 4 * 60 * 60 * 1000; // 4 hours
          const effectiveOfflineTime = Math.min(offlineTime, maxOfflineTime);

          // Handle offline travel progress
          let updatedTravelState = parsed.travelState;
          let offlineNotifications: string[] = [];

          if (parsed.travelState?.traveling && effectiveOfflineTime > 0) {
            const travelProgress = Math.min(
              (parsed.travelState.startTime +
                effectiveOfflineTime -
                parsed.travelState.startTime) /
                (parsed.travelState.endTime - parsed.travelState.startTime),
              1
            );

            if (travelProgress >= 1) {
              // Travel completed offline
              const destination = parsed.travelState.destination as OrbitType;
              const isNewOrbit =
                !parsed.stats.orbitsUnlocked.includes(destination);
              const actualTravelTime =
                parsed.travelState.endTime - parsed.travelState.startTime;

              // Update stats for completed travel
              parsed.stats.orbitsUnlocked = isNewOrbit
                ? [...parsed.stats.orbitsUnlocked, destination]
                : parsed.stats.orbitsUnlocked;
              parsed.stats.totalTravels = (parsed.stats.totalTravels ?? 0) + 1;
              parsed.stats.totalFuelSpent =
                (parsed.stats.totalFuelSpent ?? 0) +
                ORBIT_CONFIGS[destination].fuelCost;
              parsed.stats.totalTravelTime =
                (parsed.stats.totalTravelTime ?? 0) +
                ORBIT_CONFIGS[destination].travelTime;
              parsed.stats.farthestOrbit = destination;

              // Update travel history
              const lastTravelIndex = parsed.stats.travelHistory.length - 1;
              if (lastTravelIndex >= 0) {
                parsed.stats.travelHistory[lastTravelIndex] = {
                  ...parsed.stats.travelHistory[lastTravelIndex],
                  actualTravelTime,
                  completed: true,
                };
              }

              // Update current orbit
              parsed.currentOrbit = destination;
              updatedTravelState = null;

              // Add offline travel completion notification
              const orbitName = ORBIT_CONFIGS[destination].name;
              offlineNotifications.push(
                `Travel to ${orbitName} completed while you were away!`
              );
            } else {
              // Travel still in progress
              updatedTravelState = {
                ...parsed.travelState,
                progress: travelProgress,
              };
            }
          }

          // Add general offline time notification if significant time passed
          if (offlineTime > 60000) {
            // More than 1 minute
            const hours = Math.floor(offlineTime / (1000 * 60 * 60));
            const minutes = Math.floor(
              (offlineTime % (1000 * 60 * 60)) / (1000 * 60)
            );

            let timeString = '';
            if (hours > 0) {
              timeString += `${hours}h `;
            }
            if (minutes > 0 || hours === 0) {
              timeString += `${minutes}m`;
            }

            offlineNotifications.push(
              `Welcome back! You were away for ${timeString}.`
            );
          }

          // Merge with current state to ensure all fields exist
          set({
            ...get(),
            ...parsed,
            travelState: updatedTravelState,
            lastSaveTime: now,
            computedRates: {}, // Recalculate on next tick
          });

          // Add offline notifications after state is set
          const store = get();
          offlineNotifications.forEach(message => {
            store.addNotification('info', message, 8000); // 8 second duration for offline notifications
          });

          return true;
        } catch (error) {
          console.error('Failed to import save:', error);
          return false;
        }
      },

      hardReset: () => {
        // Clear all localStorage to prevent persist middleware from saving
        localStorage.clear();
        
        // Force a hard reload to bypass cache
        window.location.href = window.location.href;
      },

      setActiveView: (view) => {
        set(state => ({
          ui: { ...state.ui, activeView: view },
        }));
      },

      // Orbit Travel Actions
      canTravelToOrbit: (targetOrbit) => {
        const state = get();
        if (state.travelState?.traveling) return false;
        if (state.currentOrbit === targetOrbit) return false;
        if (!isOrbitUnlocked(targetOrbit, state)) return false; // Basic check, needs real unlock logic

        const config = ORBIT_CONFIGS[targetOrbit];
        return state.resources.fuel >= config.fuelCost;
      },

      travelToOrbit: (targetOrbit) => {
        const state = get();
        if (!state.canTravelToOrbit(targetOrbit)) return false;

        const config = ORBIT_CONFIGS[targetOrbit];
        
        // Deduct fuel
        state.subtractResource('fuel', config.fuelCost);

        // Start travel
        const now = Date.now();
        set({
          travelState: {
            traveling: true,
            destination: targetOrbit,
            startTime: now,
            endTime: now + config.travelTime,
            progress: 0,
          },
          stats: {
            ...state.stats,
            totalFuelSpent: state.stats.totalFuelSpent + config.fuelCost,
          },
        });

        return true;
      },

      cancelTravel: () => {
        const state = get();
        if (!state.travelState?.traveling) return false;

        const config = ORBIT_CONFIGS[state.travelState.destination!];
        
        // Refund 50% fuel
        const refund = Math.floor(config.fuelCost * 0.5);
        state.addResource('fuel', refund);

        set({ travelState: null });
        return true;
      },

      getTravelProgress: () => {
        const state = get();
        if (!state.travelState?.traveling) return 0;

        const now = Date.now();
        const { startTime, endTime } = state.travelState;
        const total = endTime - startTime;
        const elapsed = now - startTime;

        return Math.min(1, Math.max(0, elapsed / total));
      },

      completeTravelIfReady: () => {
        const state = get();
        if (!state.travelState?.traveling) return;

        const now = Date.now();
        if (now >= state.travelState.endTime) {
          const destination = state.travelState.destination!;
          const origin = state.currentOrbit;
          const startTime = state.travelState.startTime;
          
          set(s => ({
            currentOrbit: destination,
            travelState: null,
            stats: {
              ...s.stats,
              totalTravels: s.stats.totalTravels + 1,
              farthestOrbit: destination, // Simplified, needs logic to compare orbits
              travelHistory: [
                ...(s.stats.travelHistory || []),
                {
                  id: Math.random().toString(36).substr(2, 9),
                  origin: origin,
                  destination: destination,
                  startTime: startTime,
                  endTime: now,
                  fuelCost: ORBIT_CONFIGS[destination].fuelCost,
                  actualTravelTime: now - startTime,
                  completed: true,
                  cancelled: false,
                },
              ],
            },
          }));

          state.addNotification('success', `Arrived at ${ORBIT_CONFIGS[destination].name}`);
        }
      },

      // Mission Actions
      startScoutMission: (shipType, targetOrbit) => {
        const state = get();
        const config = SHIP_CONFIGS[shipType];
        
        // Validation
        if (state.ships[shipType] <= 0) return false;
        // Check if ship is already busy (simplified: assume 1 ship = 1 mission for now, or check count)
        const busyShips = state.missions.filter(m => m.shipType === shipType).length;
        if (busyShips >= state.ships[shipType]) return false;

        // Fuel cost check (hardcoded for now, should be in config)
        const fuelCost = 50; 
        if (state.resources.fuel < fuelCost) return false;

        state.subtractResource('fuel', fuelCost);

        const now = Date.now();
        const duration = config.baseMissionDuration || 600000;

        const mission: Mission = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'scout',
          status: 'inProgress',
          shipType,
          startTime: now,
          endTime: now + duration,
          targetOrbit,
          fuelCost,
        };

        set(s => ({
          missions: [...s.missions, mission],
          stats: {
            ...s.stats,
            totalMissionsLaunched: s.stats.totalMissionsLaunched + 1,
          },
        }));

        return true;
      },

      startSalvageMission: (derelictId, shipType, action) => {
        const state = get();
        const derelict = state.derelicts.find(d => d.id === derelictId);
        if (!derelict) return false;

        // Validation
        if (state.ships[shipType] <= 0) return false;
        const busyShips = state.missions.filter(m => m.shipType === shipType).length;
        if (busyShips >= state.ships[shipType]) return false;

        if (state.resources.fuel < derelict.fuelCost) return false;

        state.subtractResource('fuel', derelict.fuelCost);

        const now = Date.now();
        const mission: Mission = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'salvage',
          status: 'inProgress',
          shipType,
          startTime: now,
          endTime: now + derelict.baseMissionTime,
          targetOrbit: derelict.orbit,
          targetDerelict: derelictId,
          fuelCost: derelict.fuelCost,
          action,
        };

        set(s => ({
          missions: [...s.missions, mission],
          stats: {
            ...s.stats,
            totalMissionsLaunched: s.stats.totalMissionsLaunched + 1,
          },
        }));

        return true;
      },

      completeMissionIfReady: (missionId) => {
        const state = get();
        const mission = state.missions.find(m => m.id === missionId);
        if (!mission || mission.status !== 'inProgress') return;

        const now = Date.now();
        if (now < mission.endTime) return;

        // Determine success
        let success = true;
        const shipConfig = SHIP_CONFIGS[mission.shipType];
        const successRate = shipConfig.baseSuccessRate || 0.5;
        
        if (Math.random() > successRate) {
          success = false;
        }

        let rewards: Partial<Record<ResourceType, number>> | undefined;

        if (success) {
          if (mission.type === 'scout') {
             // Generate derelict
             const derelict = state.generateDerelict(mission.targetOrbit, rollDerelictRarity({ common: 60, uncommon: 25, rare: 10, epic: 4, legendary: 1 }));
             set(s => ({ derelicts: [...s.derelicts, derelict] }));
             state.addNotification('success', `Scout mission successful! Discovered: ${DERELICT_CONFIGS[derelict.type].name}`);
          } else if (mission.type === 'salvage' && mission.targetDerelict) {
             // Claim rewards
             const derelict = state.derelicts.find(d => d.id === mission.targetDerelict);
             if (derelict) {
                rewards = calculateDerelictRewards(DERELICT_CONFIGS[derelict.type]);
                for (const [res, amount] of Object.entries(rewards)) {
                    state.addResource(res as ResourceType, amount);
                }
                state.removeDerelict(derelict.id);
                state.onDerelictSalvaged(derelict.id, rewards);
             }
          }
        } else {
            state.addNotification('warning', `Mission failed.`);
        }

        set(s => ({
          missions: s.missions.filter(m => m.id !== missionId),
          stats: {
            ...s.stats,
            totalMissionsSucceeded: s.stats.totalMissionsSucceeded + (success ? 1 : 0),
            totalMissionsFailed: s.stats.totalMissionsFailed + (success ? 0 : 1),
          },
        }));

        state.onMissionComplete(missionId, success, rewards);
      },

      cancelMission: (missionId) => {
        const state = get();
        const mission = state.missions.find(m => m.id === missionId);
        if (!mission) return false;

        // Refund 50% fuel
        const refund = Math.floor(mission.fuelCost * 0.5);
        state.addResource('fuel', refund);

        set(s => ({
          missions: s.missions.filter(m => m.id !== missionId),
        }));

        return true;
      },

      getMissionProgress: (missionId) => {
        const state = get();
        const mission = state.missions.find(m => m.id === missionId);
        if (!mission) return 0;

        const now = Date.now();
        const total = mission.endTime - mission.startTime;
        const elapsed = now - mission.startTime;
        return Math.min(1, Math.max(0, elapsed / total));
      },

      generateDerelict: (orbit, rarity) => {
        const config = DERELICT_CONFIGS[Object.keys(DERELICT_CONFIGS)[0] as DerelictType]; // Placeholder
        // Real logic needs to pick a type based on rarity and orbit
        // For now, just pick random type
        const types = Object.keys(DERELICT_CONFIGS) as any[];
        const type = types[Math.floor(Math.random() * types.length)];
        
        const derelict: Derelict = {
          id: Math.random().toString(36).substr(2, 9),
          type: type,
          rarity,
          orbit,
          discoveredAt: Date.now(),
          expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
          requiredShip: config.requiredShip,
          fuelCost: config.fuelCost,
          baseMissionTime: config.baseMissionTime,
          isHazardous: config.isHazardous,
          riskLevel: config.riskLevel,
          rewards: config.rewards,
          isArkComponent: config.isArkComponent,
          arkComponentType: config.arkComponentType,
        };

        return derelict;
      },

      removeDerelict: (derelictId) => {
        set(s => ({
          derelicts: s.derelicts.filter(d => d.id !== derelictId),
        }));
      },

      getAvailableDerelicts: (orbit) => {
        return get().derelicts.filter(d => d.orbit === orbit);
      },
    }),
    {
      name: 'space-salvage-save',
      version: 1,
    }
  )
);
