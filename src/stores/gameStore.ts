// src/stores/gameStore.ts
import {
    DERELICT_CONFIGS,
    calculateDerelictRewards,
    getRandomDerelictType,
    rollDerelictRarity,
} from '@/config/derelicts';
import { ORBIT_CONFIGS, isOrbitUnlocked } from '@/config/orbits';
import {
    ARK_COMPONENTS,
    PRESTIGE_PERKS,
    calculateDarkMatterGain,
} from '@/config/prestige';
import { SHIP_CONFIGS } from '@/config/ships';
import { getUpgrade } from '@/config/shipUpgrades';
import { TECH_TREE, arePrerequisitesMet } from '@/config/tech';
import { getTechMultipliers } from '@/engine/getTechMultipliers';
import { calculateProductionRates } from '@/engine/production';
import type {
    ArkComponentType,
    Derelict,
    DerelictAction,
    GameState,
    Mission,
    OrbitType,
    ResourceType,
    ShipType
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

  // Ship Upgrade Actions
  canAffordUpgrade: (upgradeId: string) => boolean;
  purchaseUpgrade: (upgradeId: string) => boolean;
  getUpgradeLevel: (upgradeId: string) => number;
  isUpgradeUnlocked: (upgradeId: string) => boolean;

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
  setActiveView: (view: 'dashboard' | 'galaxyMap' | 'settings' | 'techTree' | 'prestige' | 'changelog' | 'missionLog') => void;
  openModal: (modal: string, data?: any) => void;
  closeModal: () => void;
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
  startColonyMission: (targetOrbit: OrbitType) => boolean;
  completeMissionIfReady: (missionId: string) => void;
  cancelMission: (missionId: string) => boolean;
  getMissionProgress: (missionId: string) => number;

  // Derelict actions
  spawnDerelict: (orbit: OrbitType) => Derelict | null;
  removeDerelict: (derelictId: string) => void;
  getAvailableDerelicts: (orbit: OrbitType) => Derelict[];

  // Colony actions
  canDeployColony: (orbit: OrbitType) => boolean;
  deployColony: (orbit: OrbitType) => boolean;

  // Tech Tree actions
  canAffordTech: (techId: string) => boolean;
  purchaseTech: (techId: string) => boolean;
  getTechMultiplier: (target: string) => number;
  // Prestige actions
  prestigeReset: () => void;
  buyPerk: (perkId: string) => boolean;
  unlockArk: () => boolean;
  buildArkComponent: (componentId: string) => boolean;
  getPrestigeMultipliers: () => Record<string, number>;
  isTechUnlocked: (techId: string) => boolean;
}

const INITIAL_STATE = {
  version: '1.0.0',
  lastSaveTime: Date.now(),
  totalPlayTime: 0,
  currentRun: 1,
  currentOrbit: 'leo' as OrbitType,

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
  } as any,

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
  } as any,

  derelicts: [],
  missions: [],
  colonies: [],
  contracts: [],

  prestige: {
    darkMatter: 0,
    totalDarkMatter: 0,
    purchasedPerks: {},
    arkComponents: {},
    arkUnlocked: false,
    arkComplete: false,
    totalRuns: 0,
    fastestRun: 0,
    highestOrbit: 'leo' as OrbitType,
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

    orbitsUnlocked: ['leo'] as OrbitType[],
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
    farthestOrbit: 'leo' as OrbitType,
    travelHistory: [],
    missionHistory: [],
  },

  ui: {
    activeTab: 'fleet' as 'fleet' | 'tech' | 'prestige' | 'ark' | 'solar',
    activeView: 'dashboard' as 'dashboard' | 'galaxyMap' | 'settings' | 'techTree' | 'prestige' | 'missionLog',
    openModal: null,
    modalData: undefined,
    notifications: [],
    eventLog: [],
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
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

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

        // Recalculate rates immediately
        const newState = get();
        const newRates = calculateProductionRates(newState);
        newState.updateComputedRates(newRates);

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

      canAffordShip: (type, amount = 1) => {
        const state = get();
        const cost = state.getShipCost(type, amount);
        return canAffordCost(cost, state.resources);
      },

      getShipCost: (type, amount = 1) => {
        const state = get();
        const currentCount = state.ships[type];
        const techMultipliers = getTechMultipliers(state.techTree.purchased);
        
        if (amount === 1) {
            return calculateShipCost(type, currentCount, { tech: techMultipliers });
        } else {
            return calculateBulkShipCost(type, currentCount, amount, { tech: techMultipliers });
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
        
        // Recalculate rates immediately
        const state = get();
        const newRates = calculateProductionRates(state);
        state.updateComputedRates(newRates);
      },

      setShipEnabled: (type, enabled) => {
        set(state => ({
          shipEnabled: {
            ...state.shipEnabled,
            [type]: enabled,
          },
        }));
        
        // Recalculate rates immediately
        const state = get();
        const newRates = calculateProductionRates(state);
        state.updateComputedRates(newRates);
      },

      // Ship Upgrade Actions
      canAffordUpgrade: (upgradeId: string) => {
        const state = get();
        const upgrade = getUpgrade(upgradeId);
        if (!upgrade) return false;

        // Check if already purchased
        const currentLevel = state.shipUpgrades[upgradeId]?.currentLevel || 0;
        if (currentLevel >= upgrade.maxLevel) return false;

        // Check cost
        return canAffordCost(upgrade.baseCost, state.resources);
      },

      purchaseUpgrade: (upgradeId: string) => {
        const state = get();
        const upgrade = getUpgrade(upgradeId);
        if (!upgrade) return false;

        // Check if can afford
        const currentLevel = state.shipUpgrades[upgradeId]?.currentLevel || 0;
        if (currentLevel >= upgrade.maxLevel) return false;
        if (!canAffordCost(upgrade.baseCost, state.resources)) return false;

        // Deduct cost
        for (const [resource, amount] of Object.entries(upgrade.baseCost)) {
          state.addResource(resource as ResourceType, -(amount as number));
        }

        // Increment upgrade level
        set(s => ({
          shipUpgrades: {
            ...s.shipUpgrades,
            [upgradeId]: {
              currentLevel: currentLevel + 1,
              unlocked: true,
            },
          },
        }));

        state.addNotification('success', `Purchased ${upgrade.name}`);
        return true;
      },

      getUpgradeLevel: (upgradeId: string) => {
        const state = get();
        return state.shipUpgrades[upgradeId]?.currentLevel || 0;
      },

      isUpgradeUnlocked: (upgradeId: string) => {
        const state = get();
        return state.shipUpgrades[upgradeId]?.unlocked || false;
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

      importSave: (saveData) => {
        try {
          const parsed = JSON.parse(saveData);
          // Basic validation
          if (!parsed.version) return false;
          
          set({ ...parsed });
          return true;
        } catch (e) {
          console.error('Failed to import save:', e);
          return false;
        }
      },

      hardReset: () => {
        // Reset state in memory first
        set(INITIAL_STATE);
        
        // Clear all localStorage
        localStorage.clear();
        
        // Force a hard reload
        window.location.reload();
      },

      setActiveView: (view) => {
        set(state => ({
          ui: { ...state.ui, activeView: view },
        }));
      },

      openModal: (modal, data) => {
        set(state => ({
          ui: { ...state.ui, openModal: modal, modalData: data },
        }));
      },

      closeModal: () => {
        set(state => ({
          ui: { ...state.ui, openModal: null, modalData: undefined },
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

        // Refund 50% of fuel
        const config = ORBIT_CONFIGS[state.travelState.destination!];
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

      // Notifications
      addNotification: (type, message, duration = 3000) => {
        const id = Math.random().toString(36).substring(7);
        const notification = { id, type, message, timestamp: Date.now(), duration };
        const eventLog = { id, type, message, timestamp: Date.now() };
        
        set(state => ({
          ui: {
            ...state.ui,
            notifications: [...state.ui.notifications, notification],
            // Keep last 100 events in log
            eventLog: [eventLog, ...state.ui.eventLog].slice(0, 100),
          },
        }));

        // Auto remove notification (but keep in eventLog)
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

      // Mission Actions
      startScoutMission: (shipType, targetOrbit) => {
        const state = get();
        const config = SHIP_CONFIGS[shipType];
        
        // Validation
        if (state.ships[shipType] <= 0) return false;
        // Check if ship is already busy (simplified: assume 1 ship = 1 mission for now, or check count)
        const busyShips = state.missions.filter(m => m.shipType === shipType).length;
        if (busyShips >= state.ships[shipType]) return false;

        // Fuel cost check - LEO and GEO missions cost no fuel
        const fuelCost = targetOrbit === 'leo' || targetOrbit === 'geo' ? 0 : 50; 
        if (state.resources.fuel < fuelCost) return false;

        if (fuelCost > 0) {
          state.subtractResource('fuel', fuelCost);
        }

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

        // Only charge fuel if derelict is in a different orbit, and not in LEO or GEO
        let fuelCost = 0;
        if (derelict.orbit !== state.currentOrbit && derelict.orbit !== 'leo' && derelict.orbit !== 'geo') {
          fuelCost = derelict.fuelCost;
        }
        
        if (state.resources.fuel < fuelCost) return false;

        if (fuelCost > 0) {
          state.subtractResource('fuel', fuelCost);
        }

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
          fuelCost: fuelCost,
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
        let discoveredDerelict: Derelict | undefined;

        if (success) {
          if (mission.type === 'scout') {
             // Generate derelict
             const derelict = state.spawnDerelict(mission.targetOrbit);
             if (derelict) {
                 discoveredDerelict = derelict;
                 state.addNotification('success', `Scout mission successful! Discovered: ${DERELICT_CONFIGS[derelict.type].name}`);
             } else {
                 state.addNotification('warning', `Scout mission completed but found nothing.`);
             }
          } else if (mission.type === 'salvage' && mission.targetDerelict) {
             // Claim rewards
             const derelict = state.derelicts.find(d => d.id === mission.targetDerelict);
             if (derelict) {
                rewards = calculateDerelictRewards(DERELICT_CONFIGS[derelict.type]);
                
                // Apply action modifiers
                if (mission.action === 'hack') {
                    if (rewards.dataFragments) rewards.dataFragments *= 2;
                    if (rewards.electronics) rewards.electronics *= 1.5;
                    if (rewards.metal) rewards.metal *= 0.5;
                } else if (mission.action === 'dismantle') {
                    if (rewards.metal) rewards.metal *= 1.5;
                    if (rewards.electronics) rewards.electronics *= 1.2;
                    if (rewards.dataFragments) rewards.dataFragments *= 0.1;
                    if (rewards.rareMaterials) rewards.rareMaterials *= 0.5;
                }
                
                // Round values
                for (const key in rewards) {
                    rewards[key as ResourceType] = Math.floor(rewards[key as ResourceType]!);
                }
                for (const [res, amount] of Object.entries(rewards)) {
                    state.addResource(res as ResourceType, amount);
                }
                state.removeDerelict(derelict.id);
                state.onDerelictSalvaged(derelict.id, rewards);
             }
          } else if (mission.type === 'colony') {
              // Deploy colony
              state.deployColony(mission.targetOrbit);
              success = true;
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
            missionHistory: [
                {
                    id: mission.id,
                    type: mission.type,
                    shipType: mission.shipType,
                    targetOrbit: mission.targetOrbit,
                    startTime: mission.startTime,
                    endTime: now,
                    success,
                    rewards,
                    discoveredDerelict: discoveredDerelict?.id,
                    derelictType: discoveredDerelict?.type
                },
                ...(s.stats.missionHistory || []).slice(0, 49)
            ]
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

      spawnDerelict: (orbit) => {
        const orbitConfig = ORBIT_CONFIGS[orbit];
        const rarity = rollDerelictRarity(orbitConfig.spawnRates);
        const type = getRandomDerelictType(orbit, rarity);
        
        if (!type) return null;
        
        const config = DERELICT_CONFIGS[type];
        
        const derelict: Derelict = {
          id: Math.random().toString(36).substr(2, 9),
          type,
          rarity,
          orbit,
          discoveredAt: Date.now(),
          expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
          requiredShip: config.requiredShip,
          fuelCost: config.fuelCost,
          baseMissionTime: config.baseMissionTime,
          isHazardous: config.isHazardous,
          riskLevel: config.riskLevel,
          rewards: config.rewards,
          isArkComponent: config.isArkComponent,
          arkComponentType: config.arkComponentType,
        };

        set(state => ({
          derelicts: [...state.derelicts, derelict],
          stats: {
            ...state.stats,
            totalDerelictsDiscovered: state.stats.totalDerelictsDiscovered + 1,
            derelictsByRarity: {
              ...state.stats.derelictsByRarity,
              [rarity]: (state.stats.derelictsByRarity[rarity] || 0) + 1,
            }
          }
        }));
        
        get().addNotification(
          'info',
          `New ${rarity} derelict detected in ${orbitConfig.name}!`,
          3000
        );
        
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

      canDeployColony: (orbit) => {
        const state = get();
        // Check if we have a colony ship
        if (state.ships.colonyShip < 1) return false;
        // Check if orbit already has a colony
        if (state.colonies.some(c => c.orbit === orbit)) return false;
        return true;
      },

      deployColony: (orbit) => {
        const state = get();
        if (!state.canDeployColony(orbit)) return false;

        set(s => ({
          ships: {
            ...s.ships,
            colonyShip: s.ships.colonyShip - 1,
          },
          colonies: [
            ...s.colonies,
            {
              id: Math.random().toString(36).substr(2, 9),
              orbit,
              establishedAt: Date.now(),
              level: 1,
              productionBonus: 0.25, // 25% bonus
              autoSalvage: false,
            },
          ],
        }));

        state.addNotification('success', `Colony established in ${ORBIT_CONFIGS[orbit].name}! Production +25%`);
        return true;
      },

      startColonyMission: (targetOrbit) => {
        const state = get();
        const shipType = 'colonyShip';
        
        // Check availability
        const busyShips = state.missions.filter(m => m.shipType === shipType).length;
        if (state.ships[shipType] <= busyShips) return false;
        
        // Check if colony exists or mission in progress
        if (state.colonies.some(c => c.orbit === targetOrbit)) return false;
        if (state.missions.some(m => m.type === 'colony' && m.targetOrbit === targetOrbit)) return false;

        const config = SHIP_CONFIGS[shipType];
        const duration = config.baseMissionDuration || 3600000;
        
        // Deduct fuel for travel
        const travelCost = ORBIT_CONFIGS[targetOrbit].fuelCost;
        if (state.resources.fuel < travelCost) return false;
        
        const mission: Mission = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'colony',
            status: 'inProgress',
            shipType,
            startTime: Date.now(),
            endTime: Date.now() + duration,
            targetOrbit,
            fuelCost: travelCost,
        };
        
        set(s => ({
            resources: {
                ...s.resources,
                fuel: s.resources.fuel - travelCost
            },
            missions: [...s.missions, mission],
            stats: {
                ...s.stats,
                totalMissionsLaunched: s.stats.totalMissionsLaunched + 1
            }
        }));
        
        return true;
      },

      // Tech Tree actions
      canAffordTech: (techId) => {
        const tech = TECH_TREE[techId];
        if (!tech) return false;
        
        const state = get();
        // Check if already purchased
        if (state.techTree.purchased.includes(techId)) return false;
        
        // Check prerequisites
        if (!arePrerequisitesMet(tech, state.techTree.purchased)) return false;
        
        // Check cost
        return state.resources.dataFragments >= tech.dataFragmentCost;
      },

      purchaseTech: (techId) => {
        const state = get();
        const tech = TECH_TREE[techId];
        
        if (!state.canAffordTech(techId)) return false;
        
        set((state) => ({
          resources: {
            ...state.resources,
            dataFragments: state.resources.dataFragments - tech.dataFragmentCost,
          },
          techTree: {
            ...state.techTree,
            purchased: [...state.techTree.purchased, techId],
          },
          stats: {
            ...state.stats,
            techsPurchased: state.stats.techsPurchased + 1,
          }
        }));
        
        state.addNotification('success', `Researched ${tech.name}`);
        return true;
      },

      getTechMultiplier: (target) => {
        const state = get();
        const multipliers = getTechMultipliers(state.techTree.purchased);
        return multipliers[target] || 1.0;
      },

      isTechUnlocked: (techId: string) => {
        const tech = TECH_TREE[techId];
        if (!tech) return false;
        return arePrerequisitesMet(tech, get().techTree.purchased);
      },

      // Prestige Actions
      prestigeReset: () => {
        const state = get();
        const dmGain = calculateDarkMatterGain(state.resources.dataFragments);
        if (dmGain <= 0) return;

        const newTotalRuns = state.prestige.totalRuns + 1;
        const currentRunTime = state.stats.currentRunTime;
        const fastestRun = state.prestige.fastestRun === 0 
            ? currentRunTime 
            : Math.min(state.prestige.fastestRun, currentRunTime);

        set({
            resources: {
                debris: 0,
                metal: 0,
                electronics: 0,
                fuel: 0,
                rareMaterials: 0,
                exoticAlloys: 0,
                aiCores: 0,
                dataFragments: 0,
                darkMatter: state.prestige.darkMatter + dmGain,
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
            upgrades: Object.fromEntries(
                Object.entries(state.upgrades).map(([key, upgrade]) => [
                    key, 
                    { ...upgrade, currentLevel: 0, unlocked: upgrade.id === 'debris_click_power' }
                ])
            ),
            milestones: Object.fromEntries(
                Object.entries(state.milestones).map(([key, milestone]) => [
                    key,
                    { ...milestone, achieved: false }
                ])
            ),
            derelicts: [],
            missions: [],
            colonies: [],
            contracts: [],
            currentOrbit: 'leo',
            currentRun: state.currentRun + 1,
            prestige: {
                ...state.prestige,
                darkMatter: state.prestige.darkMatter + dmGain,
                totalDarkMatter: state.prestige.totalDarkMatter + dmGain,
                totalRuns: newTotalRuns,
                fastestRun: fastestRun,
            },
            stats: {
                ...state.stats,
                currentRunTime: 0,
            },
            ui: {
                ...state.ui,
                activeView: 'dashboard',
                notifications: [],
            }
        });
        
        get().addNotification('success', `Quantum Reset Complete! Gained ${dmGain} Dark Matter.`);
      },

      buyPerk: (perkId) => {
        const state = get();
        const perk = PRESTIGE_PERKS[perkId];
        if (!perk) return false;

        const currentLevel = state.prestige.purchasedPerks[perkId] || 0;
        if (currentLevel >= perk.maxLevel) return false;

        const actualCost = perk.cost * (currentLevel + 1);

        if (state.prestige.darkMatter < actualCost) return false;

        // Check prerequisites
        for (const prereq of perk.prerequisites) {
            if (!state.prestige.purchasedPerks[prereq]) return false;
        }

        set(state => ({
          prestige: {
              ...state.prestige,
              darkMatter: state.prestige.darkMatter - actualCost,
              purchasedPerks: {
                  ...state.prestige.purchasedPerks,
                  [perkId]: currentLevel + 1,
              }
          }
        }));
        
        get().addNotification('success', `Purchased perk: ${perk.name}`);
        return true;
      },

      unlockArk: () => {
         const state = get();
         if (state.prestige.arkUnlocked) return false;
         set(state => ({
             prestige: {
                 ...state.prestige,
                 arkUnlocked: true
             }
         }));
         return true;
      },

      buildArkComponent: (componentId) => {
          const state = get();
          const component = ARK_COMPONENTS[componentId as ArkComponentType];
          if (!component) return false;
          
          if (state.prestige.arkComponents[componentId as ArkComponentType]?.assembled) return false;
          
          if (!canAffordCost(component.cost, state.resources)) return false;
          
          for (const [res, amount] of Object.entries(component.cost)) {
              state.subtractResource(res as ResourceType, amount);
          }
          
          set(state => ({
              prestige: {
                  ...state.prestige,
                  arkComponents: {
                      ...state.prestige.arkComponents,
                      [componentId]: {
                          type: componentId as ArkComponentType,
                          discovered: true,
                          assembled: true,
                          assemblyCost: component.cost,
                          assemblyDuration: component.duration
                      }
                  }
              }
          }));

          const allBuilt = Object.keys(ARK_COMPONENTS).every(key => 
              get().prestige.arkComponents[key as ArkComponentType]?.assembled
          );
          
          if (allBuilt) {
              set(state => ({
                  prestige: {
                      ...state.prestige,
                      arkComplete: true
                  }
              }));
              get().addNotification('success', 'The Ark is complete! You have won the game!');
          }
          
          return true;
      },

      getPrestigeMultipliers: () => {
          const state = get();
          const multipliers: Record<string, number> = {};
          
          for (const [perkId, level] of Object.entries(state.prestige.purchasedPerks)) {
              const perk = PRESTIGE_PERKS[perkId];
              if (!perk) continue;
              
              for (const effect of perk.effects) {
                  if (effect.type === 'multiplier') {
                      const bonus = (effect.value - 1) * level;
                      multipliers[effect.target] = (multipliers[effect.target] || 1.0) + bonus;
                  }
              }
          }
          return multipliers;
      },

      onMissionComplete: (missionId, success, _rewards) => {
          // Placeholder for external systems (e.g. analytics, achievements)
          // For now, just log or do nothing extra as logic is handled in completeMissionIfReady
          console.log(`Mission ${missionId} complete. Success: ${success}`);
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
    }),
    {
      name: 'space-salvage-storage',
      version: 1,
    }
  )
);
