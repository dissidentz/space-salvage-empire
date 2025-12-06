// src/stores/gameStore.ts
import {
    DERELICT_CONFIGS,
    calculateDerelictRewards,
    getArkComponentTypeForOrbit,
    getRandomDerelictType,
    rollDerelictRarity,
} from '@/config/derelicts';
import { FORMATION_CONFIGS } from '@/config/formations';
import { ORBIT_CONFIGS, getAdjacentOrbits, isOrbitUnlocked } from '@/config/orbits';
import {
    ARK_COMPONENTS,
    PRESTIGE_PERKS,
    calculateDarkMatterGain,
} from '@/config/prestige';
import { SHIP_CONFIGS } from '@/config/ships';
import { getUpgrade } from '@/config/shipUpgrades';
import { TECH_TREE, arePrerequisitesMet } from '@/config/tech';
import { TRADE_ROUTES } from '@/config/trading';
import { generateRandomContract } from '@/engine/contracts';
import { getTechEffects, getTechMultipliers } from '@/engine/getTechMultipliers';
import { calculateOfflineProduction, calculateProductionRates } from '@/engine/production';
import type {
    ArkComponentType,
    ContractType,
    Derelict,
    DerelictAction,
    FormationType,
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
  travelToOrbit: (targetOrbit: OrbitType, useInstantWarp?: boolean) => boolean;
  
  // Instant Warp
  instantWarpAvailable: boolean;
  
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
    rewards?: Partial<Record<ResourceType, number>>,
    isAutomated?: boolean
  ) => void;

  // UI actions
  // UI actions
  setActiveView: (view: 'dashboard' | 'fleet' | 'galaxyMap' | 'settings' | 'techTree' | 'prestige' | 'changelog' | 'missionLog' | 'contracts' | 'trading' | 'victory') => void;
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
    action: DerelictAction,
    isAutomated?: boolean
  ) => boolean;
  startColonyMission: (targetOrbit: OrbitType) => boolean;
  completeMissionIfReady: (missionId: string) => void;
  completeAllReadyMissions: (missionIds: string[]) => void;
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
  
  // Automation actions
  toggleAutoScout: () => void;
  toggleAutoSalvage: () => void;
  setAutoScoutTargetLimit: (limit: number) => void;
  processAutomation: () => void;
  
  isTechUnlocked: (techId: string) => boolean;

  // Fleet Formations
  setFormation: (type: FormationType | null) => boolean;

  // Contracts
  generateContracts: () => void;
  acceptContract: (contractId: string) => void;

  updateContractProgress: (type: ContractType | 'any', amount: number, orbit?: OrbitType) => void;
  claimContractReward: (contractId: string) => void;
  abandonContract: (contractId: string) => void;

  // Trading
  tradeResources: (routeId: string, amount: number) => void;

  // Victory
  continueEndlessMode: () => void;
}

const INITIAL_STATE = {
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
    endlessMode: false,
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
    instantWarpUsed: false,
  },

  ui: {
    activeTab: 'fleet' as 'fleet' | 'tech' | 'prestige' | 'ark' | 'solar',
    activeView: 'dashboard' as 'dashboard' | 'fleet' | 'galaxyMap' | 'settings' | 'techTree' | 'prestige' | 'changelog' | 'missionLog',
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
    automationSettings: {
      autoScoutEnabled: true,
      autoSalvageEnabled: true,
      autoScoutTargetLimit: 5,
    },
    afkSummary: null,
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
      instantWarpAvailable: INITIAL_STATE.instantWarpAvailable,

      // Actions
      addResource: (type, amount) => {
        set(state => ({
          resources: {
            ...state.resources,
            [type]: state.resources[type] + amount,
          },
        }));

        // Contract Hook: Resource Rush
        if (type === 'metal' && amount > 0) {
            get().updateContractProgress('resourceRush', amount);
        }
      },

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
        // Base click value + upgrades + tech
        let clickValue = 1;
        
        // Apply tech multipliers
        const techEffects = getTechEffects(state.techTree.purchased);
        if (techEffects.multipliers.click_power) {
          clickValue *= techEffects.multipliers.click_power;
        }
        
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

      travelToOrbit: (targetOrbit, useInstantWarp = false) => {
        const state = get();
        
        if (useInstantWarp) {
            if (!state.instantWarpAvailable) return false;
            if (state.currentOrbit === targetOrbit) return false;
            // Instant travel!
            set(s => ({
                instantWarpAvailable: false,
                currentOrbit: targetOrbit,
                stats: {
                    ...s.stats,
                    instantWarpUsed: true,
                    totalTravels: s.stats.totalTravels + 1,
                    farthestOrbit: ORBIT_CONFIGS[targetOrbit].index > ORBIT_CONFIGS[s.stats.farthestOrbit].index ? targetOrbit : s.stats.farthestOrbit,
                    travelHistory: [
                        ...(s.stats.travelHistory || []),
                        {
                            id: Math.random().toString(36).substr(2, 9),
                            origin: s.currentOrbit,
                            destination: targetOrbit,
                            startTime: Date.now(),
                            endTime: Date.now(),
                            fuelCost: 0,
                            actualTravelTime: 0,
                            completed: true,
                            cancelled: false,
                        }
                    ]
                }
            }));
            state.addNotification('success', `Instant Warp to ${ORBIT_CONFIGS[targetOrbit].name} successful!`);
            return true;
        }

        if (!state.canTravelToOrbit(targetOrbit)) return false;

        const config = ORBIT_CONFIGS[targetOrbit];
        
        // Apply tech fuel cost multipliers
        const techEffects = getTechEffects(state.techTree.purchased);
        let fuelMultiplier = state.activeFormation === 'expeditionFleet' ? 0.8 : 1.0;
        if (techEffects.multipliers.fuel_cost) {
          fuelMultiplier *= techEffects.multipliers.fuel_cost;
        }
        
        // Deduct fuel
        const actualFuelCost = Math.floor(config.fuelCost * fuelMultiplier);
        state.subtractResource('fuel', actualFuelCost);

        // Apply tech travel time multipliers
        let travelMultiplier = state.activeFormation === 'expeditionFleet' ? 0.85 : 1.0;
        if (techEffects.multipliers.travel_time) {
          travelMultiplier *= techEffects.multipliers.travel_time;
        }

        // Start travel
        const now = Date.now();
        set({
          travelState: {
            traveling: true,
            destination: targetOrbit,
            startTime: now,
            endTime: now + config.travelTime * travelMultiplier,
            progress: 0,
          },
          stats: {
            ...state.stats,
            totalFuelSpent: state.stats.totalFuelSpent + actualFuelCost,
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
          
          set(s => {
            const currentFarthest = ORBIT_CONFIGS[s.stats.farthestOrbit || 'leo'];
            const newDest = ORBIT_CONFIGS[destination];
            const newFarthest = newDest.index > currentFarthest.index ? destination : s.stats.farthestOrbit;

            return {
              currentOrbit: destination,
              travelState: null,
              stats: {
                ...s.stats,
                totalTravels: s.stats.totalTravels + 1,
                farthestOrbit: newFarthest,
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
          };
        });

          // Contract Hook: Speed Run
          get().updateContractProgress('speedRun', 1, destination);

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
            eventLog: [eventLog, ...(state.ui.eventLog || [])].slice(0, 100),
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
        // Check if ship is already busy
        // Check if dual missions are enabled
        const hasDualMissions = 
          state.techTree.purchased.includes('fleet_coordination') || 
          state.techTree.purchased.includes('total_automation');
        const maxMissionsPerShip = hasDualMissions ? 2 : 1;
        
        const busyShips = state.missions.filter(m => m.shipType === shipType).length;
        if (busyShips >= state.ships[shipType] * maxMissionsPerShip) return false;

        // Fuel cost check - LEO, GEO, Lunar, and current orbit missions cost no fuel
        const freeOrbits: OrbitType[] = ['leo', 'geo', 'lunar', state.currentOrbit];
        const fuelCost = freeOrbits.includes(targetOrbit) ? 0 : 50; 
        if (state.resources.fuel < fuelCost) return false;

        if (fuelCost > 0) {
          state.subtractResource('fuel', fuelCost);
        }

        const now = Date.now();
        let duration = config.baseMissionDuration || 600000;
        
        // Apply tech mission time multipliers
        const techEffects = getTechEffects(state.techTree.purchased);
        if (techEffects.multipliers.scout_mission_time) {
          duration *= techEffects.multipliers.scout_mission_time;
        }
        if (techEffects.multipliers.mission_time) {
          duration *= techEffects.multipliers.mission_time;
        }
        // Apply formation bonus
        duration *= (state.activeFormation === 'scoutFleet' ? 0.9 : 1.0);

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

      startSalvageMission: (derelictId, shipType, action, isAutomated = false) => {
        const state = get();
        const derelict = state.derelicts.find(d => d.id === derelictId);
        if (!derelict) return false;

        // Validation
        if (state.ships[shipType] <= 0) return false;
        
        // Check if dual missions are enabled
        const hasDualMissions = 
          state.techTree.purchased.includes('fleet_coordination') || 
          state.techTree.purchased.includes('total_automation');
        const maxMissionsPerShip = hasDualMissions ? 2 : 1;
        
        const busyShips = state.missions.filter(m => m.shipType === shipType).length;
        if (busyShips >= state.ships[shipType] * maxMissionsPerShip) return false;

        // Only charge fuel if derelict is in a different orbit, and not in LEO or GEO
        let fuelCost = 0;
        if (derelict.orbit !== state.currentOrbit && derelict.orbit !== 'leo' && derelict.orbit !== 'geo') {
          fuelCost = derelict.fuelCost;
        }
        
        // Cost checks
        if (state.resources.fuel < fuelCost) return false;
        
        // Hacking Cost
        if (action === 'hack') {
             if (state.resources.electronics < 50) {
                 state.addNotification('error', 'Insufficient Electronics for Hacking (Need 50)');
                 return false;
             }
             state.subtractResource('electronics', 50);
        }
        
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
          isAutomated,
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
        let successRate = shipConfig.baseSuccessRate || 0.5;
        
        if (mission.action === 'hack') {
            successRate = 0.85; // Fixed 85% success rate for hacking
        }
        
        // Apply tech bonuses to success rate
        const techEffects = getTechEffects(state.techTree.purchased);
        // Scout discovery rate bonus
        if (mission.type === 'scout' && techEffects.multipliers.scout_discovery_rate) {
          successRate *= techEffects.multipliers.scout_discovery_rate;
        }
        // Salvage success rate bonus
        if (mission.type === 'salvage' && techEffects.flatBonuses.salvage_success_rate) {
          successRate += techEffects.flatBonuses.salvage_success_rate;
        }
        // Global mission success rate bonus
        if (techEffects.flatBonuses.mission_success_rate) {
          successRate += techEffects.flatBonuses.mission_success_rate;
        }
        successRate = Math.min(successRate, 1.0); // Cap at 100%
        
        if (Math.random() > successRate) {
          success = false;
        }

        let rewards: Partial<Record<ResourceType, number>> | undefined;
        let discoveredDerelict: Derelict | undefined;

        if (success) {
          if (mission.type === 'scout') {
             // Determine which orbit to spawn derelict in
             let spawnOrbit = mission.targetOrbit;
             
             // Check if quantum_entanglement_comms tech is unlocked
             const hasAdjacentScouting = state.techTree.purchased.includes('quantum_entanglement_comms');
             
             if (hasAdjacentScouting) {
               // Get adjacent orbits and add target orbit to the pool
               const adjacentOrbits = getAdjacentOrbits(mission.targetOrbit);
               const possibleOrbits = [mission.targetOrbit, ...adjacentOrbits];
               
               // Randomly select one orbit from the pool
               spawnOrbit = possibleOrbits[Math.floor(Math.random() * possibleOrbits.length)];
             }
             
             // Generate derelict in the selected orbit
             // Discovery bonus from scoutFleet is currently not used for spawn chance, 
             // but we could use it to increase rarity chance in the future.
             
             const derelict = state.spawnDerelict(spawnOrbit);
             if (derelict) {
                 discoveredDerelict = derelict;
                 const orbitName = ORBIT_CONFIGS[spawnOrbit].name;
                 const derelictName = DERELICT_CONFIGS[derelict.type].name;
                 
                 // Show which orbit the derelict was found in
                 if (hasAdjacentScouting && spawnOrbit !== mission.targetOrbit) {
                   state.addNotification('success', `Scout found ${derelictName} in adjacent ${orbitName}!`);
                 } else {
                   state.addNotification('success', `Scout discovered ${derelictName} in ${orbitName}`);
                 }
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
                    // 150% base multiplier for all resources
                    for (const key of Object.keys(rewards)) {
                        rewards[key as ResourceType]! *= 1.5;
                    }
                    // Double Data Fragments on top (3x total)
                    if (rewards.dataFragments) rewards.dataFragments *= 2;
                } else if (mission.action === 'dismantle') {
                    if (rewards.metal) rewards.metal *= 1.5;
                    if (rewards.electronics) rewards.electronics *= 1.2;
                    if (rewards.dataFragments) rewards.dataFragments *= 0.1;
                    if (rewards.rareMaterials) rewards.rareMaterials *= 0.5;
                }
                
                // Apply Formation Bonus
                if (state.activeFormation === 'salvageFleet') {
                    if (rewards.metal) rewards.metal *= 1.15;
                    if (rewards.electronics) rewards.electronics *= 1.15;
                    if (rewards.rareMaterials) rewards.rareMaterials *= 1.15;
                    if (rewards.exoticAlloys) rewards.exoticAlloys *= 1.15;
                    if (rewards.aiCores) rewards.aiCores *= 1.15;
                    if (rewards.dataFragments) rewards.dataFragments *= 1.15;
                }
                
                // Apply tech salvage rewards multiplier
                if (techEffects.multipliers.salvage_rewards) {
                    const salvageMultiplier = techEffects.multipliers.salvage_rewards;
                    if (rewards.metal) rewards.metal *= salvageMultiplier;
                    if (rewards.electronics) rewards.electronics *= salvageMultiplier;
                    if (rewards.rareMaterials) rewards.rareMaterials *= salvageMultiplier;
                    if (rewards.exoticAlloys) rewards.exoticAlloys *= salvageMultiplier;
                    if (rewards.aiCores) rewards.aiCores *= salvageMultiplier;
                    if (rewards.dataFragments) rewards.dataFragments *= salvageMultiplier;
                    if (rewards.fuel) rewards.fuel *= salvageMultiplier;
                }
                
                // Round values
                for (const key in rewards) {
                    rewards[key as ResourceType] = Math.floor(rewards[key as ResourceType]!);
                }
                for (const [res, amount] of Object.entries(rewards)) {
                    state.addResource(res as ResourceType, amount);
                }
                state.removeDerelict(derelict.id);
                state.onDerelictSalvaged(derelict.id, rewards, mission.isAutomated);
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

      completeAllReadyMissions: (missionIds) => {
        const state = get();
        const now = Date.now();
        // Filter missions that are actually ready and in progress
        const missionsToComplete = state.missions.filter(m => 
            missionIds.includes(m.id) && 
            m.status === 'inProgress' && 
            now >= m.endTime
        );

        if (missionsToComplete.length === 0) return;

        const results: { 
            missionId: string; 
            success: boolean; 
            rewards?: Partial<Record<ResourceType, number>>; 
            discoveredDerelict?: Derelict 
        }[] = [];
        
        const newDerelicts: Derelict[] = [];
        const resourceChanges: Partial<Record<ResourceType, number>> = {};
        const salvagedDerelictIds: string[] = [];
        const newColonies: any[] = [];
        
        let succeededCount = 0;
        let failedCount = 0;
        const historyEntries: any[] = [];

        missionsToComplete.forEach(mission => {
            try {
                let success = true;
                const shipConfig = SHIP_CONFIGS[mission.shipType];
                let successRate = shipConfig.baseSuccessRate || 0.5;
                
                // Apply tech bonuses to success rate
                const techEffects = getTechEffects(state.techTree.purchased);
                if (mission.type === 'scout' && techEffects.multipliers.scout_discovery_rate) {
                  successRate *= techEffects.multipliers.scout_discovery_rate;
                }
                if (mission.type === 'salvage' && techEffects.flatBonuses.salvage_success_rate) {
                  successRate += techEffects.flatBonuses.salvage_success_rate;
                }
                if (techEffects.flatBonuses.mission_success_rate) {
                  successRate += techEffects.flatBonuses.mission_success_rate;
                }
                
                // Risk/Reward Logic for Hacking
                // Hacking is riskier: -10% success rate
                if (mission.action === 'hack') {
                    successRate -= 0.1;
                } else if (mission.action === 'dismantle') {
                     // Dismantling is safer but destructive? Or standard? 
                     // Leaving standard for now as per design doc prioritization.
                }

                successRate = Math.min(successRate, 1.0);
    
                if (Math.random() > successRate) {
                    success = false;
                }
    
                let rewards: Partial<Record<ResourceType, number>> | undefined;
                let discoveredDerelict: Derelict | undefined;
    
                if (success) {
                    if (mission.type === 'scout') {
                        const orbitConfig = ORBIT_CONFIGS[mission.targetOrbit];
                        const rarity = rollDerelictRarity(orbitConfig.spawnRates);
                        const type = getRandomDerelictType(mission.targetOrbit, rarity);
                        
                        if (type) {
                            const config = DERELICT_CONFIGS[type];
                            
                            // Ark Component Uniqueness Logic
                            const selectedArkType = type === 'arkComponent' 
                                ? getArkComponentTypeForOrbit(mission.targetOrbit)
                                : undefined;

                            discoveredDerelict = {
                                id: Math.random().toString(36).substr(2, 9),
                                type,
                                rarity,
                                orbit: mission.targetOrbit,
                                discoveredAt: now,
                                expiresAt: now + 15 * 60 * 1000,
                                requiredShip: config.requiredShip,
                                fuelCost: config.fuelCost,
                                baseMissionTime: config.baseMissionTime,
                                riskLevel: config.riskLevel || 0,
                                isHazardous: config.isHazardous || false,
                                rewards: config.rewards,
                                isArkComponent: config.isArkComponent,
                                arkComponentType: selectedArkType,
                            };
                            newDerelicts.push(discoveredDerelict);

                            // Contract hook: Discovery
                            if (['rare', 'epic', 'legendary'].includes(rarity)) {
                                get().updateContractProgress('discoveryMission', 1, mission.targetOrbit);
                            }
                        }
                    } else if (mission.type === 'salvage' && mission.targetDerelict) {
                        const derelict = state.derelicts.find(d => d.id === mission.targetDerelict);
                        if (derelict && !salvagedDerelictIds.includes(derelict.id)) {
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
                            
                            // Accumulate
                            for (const [res, amount] of Object.entries(rewards)) {
                                resourceChanges[res as ResourceType] = (resourceChanges[res as ResourceType] || 0) + amount;
                            }
                            
                            salvagedDerelictIds.push(derelict.id);

                            // Contract hook: Salvage Quota
                            get().updateContractProgress('salvageQuota', 1, derelict.orbit);
                            
                            // Contract hook: Risky Business
                            if (mission.action === 'hack') {
                                get().updateContractProgress('riskyBusiness', 1);
                            }
                        }
                    } else if (mission.type === 'colony') {
                         newColonies.push({
                            id: Math.random().toString(36).substr(2, 9),
                            orbit: mission.targetOrbit,
                            establishedAt: now,
                            level: 1,
                            productionBonus: 0.25,
                            autoSalvage: false,
                         });
                    }
                }
    
                if (success) succeededCount++;
                else failedCount++;
    
                results.push({ missionId: mission.id, success, rewards, discoveredDerelict });
                
                historyEntries.push({
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
                });
            } catch (error) {
                console.error(`Error processing mission ${mission.id}:`, error);
                // Still mark as failed so it gets removed
                failedCount++;
                results.push({ missionId: mission.id, success: false });
                historyEntries.push({
                    id: mission.id,
                    type: mission.type,
                    shipType: mission.shipType,
                    targetOrbit: mission.targetOrbit,
                    startTime: mission.startTime,
                    endTime: now,
                    success: false,
                    error: 'Processing Error'
                });
            }
        });

        // Contract hook: Resource Rush (from missions)
        if ((resourceChanges.metal || 0) > 0) {
             get().updateContractProgress('resourceRush', resourceChanges.metal!);
        }

        // Apply State Updates
        set(s => {
            // Resources
            const newResources = { ...s.resources };
            for (const [res, amount] of Object.entries(resourceChanges)) {
                newResources[res as ResourceType] = (newResources[res as ResourceType] || 0) + amount;
            }

            // Missions
            const completedIds = results.map(r => r.missionId);
            const remainingMissions = s.missions.filter(m => !completedIds.includes(m.id));

            // Derelicts
            const remainingDerelicts = s.derelicts.filter(d => !salvagedDerelictIds.includes(d.id));
            const finalDerelicts = [...remainingDerelicts, ...newDerelicts];

            // Colonies
            const finalColonies = [...s.colonies, ...newColonies];
            
            // Ships (Colony ships are consumed)
            const newShips = { ...s.ships };
            if (newColonies.length > 0) {
                newShips.colonyShip = Math.max(0, newShips.colonyShip - newColonies.length);
            }

            // Stats
            const newStats = {
                ...s.stats,
                totalMissionsSucceeded: s.stats.totalMissionsSucceeded + succeededCount,
                totalMissionsFailed: s.stats.totalMissionsFailed + failedCount,
                missionHistory: [
                    ...historyEntries,
                    ...(s.stats.missionHistory || [])
                ].slice(0, 50),
                totalDerelictsDiscovered: s.stats.totalDerelictsDiscovered + newDerelicts.length,
                totalDerelictsSalvaged: s.stats.totalDerelictsSalvaged + salvagedDerelictIds.length,
                coloniesEstablished: s.stats.coloniesEstablished + newColonies.length,
            };
            
            // Update derelictsByRarity
            newDerelicts.forEach(d => {
                newStats.derelictsByRarity[d.rarity] = (newStats.derelictsByRarity[d.rarity] || 0) + 1;
            });

            return {
                resources: newResources,
                missions: remainingMissions,
                derelicts: finalDerelicts,
                colonies: finalColonies,
                ships: newShips,
                stats: newStats
            };
        });

        // Side effects (Notifications)
        results.forEach(r => {
             state.onMissionComplete(r.missionId, r.success, r.rewards);
             if (r.success) {
                 if (r.discoveredDerelict) {
                     state.addNotification('success', `Scout mission successful! Discovered: ${DERELICT_CONFIGS[r.discoveredDerelict.type].name}`);
                 }
             } else {
                 state.addNotification('warning', `Mission failed.`);
             }
        });
        
        // Colony notifications
        newColonies.forEach(c => {
            state.addNotification('success', `Colony established in ${ORBIT_CONFIGS[c.orbit as OrbitType].name}! Production +25%`);
        });
        
        // Salvage notifications
        salvagedDerelictIds.forEach(id => {
             const result = results.find(r => r.success && r.rewards && missionsToComplete.find(m => m.id === r.missionId)?.targetDerelict === id);
             if (result) {
                 state.onDerelictSalvaged(id, result.rewards);
             }
        });
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

        // Limit max active derelicts to 6
        if (get().derelicts.length >= 6) {
            // Optional: Notification? Might be spammy if triggered by passive spawn
            return null;
        }
        
        const config = DERELICT_CONFIGS[type];
        
        // Ark Component Uniqueness Logic
        const selectedArkType = type === 'arkComponent' 
            ? getArkComponentTypeForOrbit(orbit)
            : undefined;
        
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
          arkComponentType: selectedArkType,
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
        
        // Handle unlock effects immediately
        let instantWarpUnlocked = false;
        if (tech.effects) {
            tech.effects.forEach(effect => {
                if (effect.type === 'unlock' && effect.target === 'instant_warp_ability') {
                    instantWarpUnlocked = true;
                }
            });
        }

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
          },
          instantWarpAvailable: instantWarpUnlocked ? true : state.instantWarpAvailable,
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
                  },
                  ui: {
                      ...state.ui,
                      activeView: 'victory'
                  }
              }));
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

      onDerelictSalvaged: (_derelictId, rewards, isAutomated = false) => {
           const state = get();
           if (rewards) {
              const rewardText = Object.entries(rewards)
                  .map(([res, amount]) => `${amount.toFixed(1)} ${res}`)
                  .join(', ');
              const prefix = isAutomated ? '[AUTO] ' : '';
              state.addNotification('success', `${prefix}Salvage Complete! Recovered: ${rewardText}`);
           }
      },
      
      // Automation actions
      toggleAutoScout: () => {
        set(state => ({
          ui: {
            ...state.ui,
            automationSettings: {
              ...state.ui.automationSettings,
              autoScoutEnabled: !state.ui.automationSettings.autoScoutEnabled,
            },
          },
        }));
      },
      
      toggleAutoSalvage: () => {
        set(state => ({
          ui: {
            ...state.ui,
            automationSettings: {
              ...state.ui.automationSettings,
              autoSalvageEnabled: !state.ui.automationSettings.autoSalvageEnabled,
            },
          },
        }));
      },
      
      setAutoScoutTargetLimit: (limit: number) => {
        set(state => ({
          ui: {
            ...state.ui,
            automationSettings: {
              ...state.ui.automationSettings,
              autoScoutTargetLimit: Math.max(1, Math.min(20, limit)),
            },
          },
        }));
      },
      
      processAutomation: () => {
        const state = get();
        const hasAutoScout = state.techTree.purchased.includes('auto_scout');
        const hasAutoSalvage = state.techTree.purchased.includes('auto_salvage');
        const hasTotalAutomation = state.techTree.purchased.includes('total_automation');
        
        // Auto-Scout Logic
        if (hasAutoScout && state.ui.automationSettings?.autoScoutEnabled && state.shipEnabled.scoutProbe) {
          // Check if we already have enough derelicts
          const targetLimit = state.ui.automationSettings?.autoScoutTargetLimit ?? 5;
          if (state.derelicts.length >= targetLimit) {
            // Skip scouting - we have enough targets
            return;
          }
          
          const hasDualMissions = state.techTree.purchased.includes('fleet_coordination') || hasTotalAutomation;
          const maxMissionsPerShip = hasDualMissions ? 2 : 1;
          
          const busyScouts = state.missions.filter(m => m.shipType === 'scoutProbe').length;
          const availableScouts = state.ships.scoutProbe * maxMissionsPerShip - busyScouts;
          
          if (availableScouts > 0 && state.resources.fuel >= 0) {
            const unlockedOrbits = state.stats.orbitsUnlocked.filter(
              orbit => orbit !== state.currentOrbit
            );
            
            if (unlockedOrbits.length > 0) {
              const targetOrbit = unlockedOrbits[
                Math.floor(Math.random() * unlockedOrbits.length)
              ];
              state.startScoutMission('scoutProbe', targetOrbit);
            }
          }
        }
        
        // Auto-Salvage Logic
        if (hasAutoSalvage && state.ui.automationSettings?.autoSalvageEnabled) {
          const colonizedOrbits = state.colonies.map(c => c.orbit);
          // Target ALL derelicts in colonized orbits
          const targetDerelicts = state.derelicts.filter(
            d => colonizedOrbits.includes(d.orbit)
          );
          
          const hasDualMissions = state.techTree.purchased.includes('fleet_coordination') || hasTotalAutomation;
          const maxMissionsPerShip = hasDualMissions ? 2 : 1;
          
          // Calculate available ships
          const busySalvage = state.missions.filter(m => m.shipType === 'salvageFrigate').length;
          let availableSalvage = (state.ships.salvageFrigate || 0) * maxMissionsPerShip - busySalvage;

          const busyHeavy = state.missions.filter(m => m.shipType === 'heavySalvageFrigate').length;
          let availableHeavy = (state.ships.heavySalvageFrigate || 0) * maxMissionsPerShip - busyHeavy;
          
          for (const derelict of targetDerelicts) {
            // Determine which ship to use
            let shipToUse: 'salvageFrigate' | 'heavySalvageFrigate' | null = null;
            
            if (derelict.requiredShip === 'salvageFrigate' && availableSalvage > 0 && state.shipEnabled.salvageFrigate) {
                shipToUse = 'salvageFrigate';
            } else if (derelict.requiredShip === 'heavySalvageFrigate' && availableHeavy > 0 && state.shipEnabled.heavySalvageFrigate) {
                shipToUse = 'heavySalvageFrigate';
            }

            if (shipToUse) {
              // Check if already targeted
              const isTargeted = state.missions.some(m => m.targetDerelict === derelict.id);
              if (!isTargeted) {
                 const success = state.startSalvageMission(derelict.id, shipToUse, 'salvage', true);
                 if (success) {
                     if (shipToUse === 'salvageFrigate') availableSalvage--;
                     if (shipToUse === 'heavySalvageFrigate') availableHeavy--;
                 }
              }
            }
            
            // Break if no ships left at all
            if (availableSalvage <= 0 && availableHeavy <= 0) break;
          }
        }
      },
      
      setFormation: (type) => {
        const state = get();
        
        // Deactivate
        if (type === null) {
            set({ activeFormation: null });
            // Recalculate rates
            const newState = get();
            const newRates = calculateProductionRates(newState);
            newState.updateComputedRates(newRates);
            return true;
        }

        // Check tech
        if (!state.techTree.purchased.includes('fleet_management')) return false;

        // Check cooldown
        if (Date.now() < state.formationCooldownEnd) return false;

        const config = FORMATION_CONFIGS[type];
        if (!config) return false;

        // Check requirements
        for (const [ship, count] of Object.entries(config.requirements)) {
            if (state.ships[ship as ShipType] < (count as number)) return false;
        }
        
        // Special case for Production Fleet "Total Ships" requirement if we implemented it that way
        // But for now we used specific ships in the config, so the loop above handles it.
        // If we want "Total Ships" logic:
        if (type === 'productionFleet') {
             const totalShips = Object.values(state.ships).reduce((a, b) => a + b, 0);
             if (totalShips < 50) return false;
        }

        set({ 
            activeFormation: type,
            formationCooldownEnd: Date.now() + config.cooldown
        });
        
        state.addNotification('success', `Fleet formation set to ${config.name}`);

        // Recalculate rates
        const newState = get();
        const newRates = calculateProductionRates(newState);
        newState.updateComputedRates(newRates);

        return true;
      },

      // Contracts
      generateContracts: () => {
        const state = get();
        // Check availability
        // If contract tech not unlocked, do nothing
        if (!state.techTree.purchased.includes('contracts')) return;

        const available = state.contracts.filter(c => c.status === 'available');
        if (available.length >= 3) return;

        const newContracts = [...state.contracts];
        let added = false;
        // Fill up to 3 available
        while (newContracts.filter(c => c.status === 'available').length < 3) {
             const contract = generateRandomContract(state.currentOrbit);
             newContracts.push(contract);
             added = true;
        }
        
        if (added) {
            set({ contracts: newContracts });
        }
      },

      acceptContract: (id: string) => {
        const state = get();
        const contract = state.contracts.find(c => c.id === id);
        if(!contract || contract.status !== 'available') return;

        // Limit active contracts to 3
        const active = state.contracts.filter(c => c.status === 'active');
        if (active.length >= 3) {
            state.addNotification('warning', 'Max 3 active contracts allowed.');
            return;
        }

        const updatedContracts = state.contracts.map(c => 
            c.id === id 
            ? { ...c, status: 'active' as const, startTime: Date.now(), expiresAt: Date.now() + c.duration } 
            : c
        );

        set({ contracts: updatedContracts });
        state.addNotification('success', `Contract Accepted`); 
      },

      updateContractProgress: (type, amount, orbit) => {
          set(state => {
              let updated = false;
              let completedAny = false;

              const newContracts = state.contracts.map(c => {
                  if (c.status !== 'active') return c;
                  
                  let match = false;
                  if (type === 'any') { 
                      match = true; 
                  } else if (c.type === type) {
                      match = true;
                  }
                  
                  // For salvage/discovery, check orbit if specified and if contract has targetOrbit
                  if (match && c.targetOrbit && orbit && c.targetOrbit !== orbit) {
                      match = false;
                  }
                  
                  if (match) {
                      updated = true;
                      const newProgress = Math.min(c.targetAmount, c.progress + amount);
                      
                      // Check for completion
                      if (newProgress >= c.targetAmount && c.status === 'active') {
                           completedAny = true;
                           return { ...c, progress: newProgress, status: 'completed' as const };
                      }
                      return { ...c, progress: newProgress };
                  }
                  return c;
              });

              if (completedAny) {
                  state.addNotification('success', 'Contract Objectives Met!');
              }

              return updated ? { contracts: newContracts } : {};
          });
      },

      claimContractReward: (id: string) => {
          const state = get();
          const contract = state.contracts.find(c => c.id === id);
          if (!contract || contract.status !== 'completed') return;
          
          Object.entries(contract.rewards).forEach(([res, amt]) => {
              state.addResource(res as ResourceType, amt as number);
          });
          
          // Remove contract from list
          const newContracts = state.contracts.filter(c => c.id !== id);
          set({ contracts: newContracts });
          state.addNotification('success', 'Contract Reward Claimed!');
      },

      abandonContract: (contractId: string) => {
          set(state => ({
              contracts: state.contracts.filter(c => c.id !== contractId)
          }));
      },

      tradeResources: (routeId, amount) => {
        const state = get();
        // Verify market access
        if (!state.techTree.purchased.includes('market_access')) {
            state.addNotification('error', 'Trading Post not unlocked!');
            return;
        }

        const route = TRADE_ROUTES.find(r => r.id === routeId);
        if (!route) return;

        // Calculate costs
        const cost = route.inputAmount * amount;
        
        if (state.resources[route.input] < cost) {
            state.addNotification('error', `Insufficient ${route.input} for trade!`);
            return;
        }

        // Calculate output with multipliers
        const baseOutput = route.outputAmount * amount;
        const multipliers = getTechMultipliers(state.techTree.purchased);
        // Apply market_mastery (target: 'trading_post_rates')
        const tradeMultiplier = multipliers['trading_post_rates'] || 1;
        
        const finalOutput = Math.floor(baseOutput * tradeMultiplier);

        set(state => ({
            resources: {
                ...state.resources,
                [route.input]: state.resources[route.input] - cost,
                [route.output]: state.resources[route.output] + finalOutput
            }
        }));

        state.addNotification('success', `Traded ${cost} ${route.input} for ${finalOutput} ${route.output}`);
      },

      continueEndlessMode: () => {
          set(state => ({
              prestige: {
                  ...state.prestige,
                  endlessMode: true
              },
              ui: {
                  ...state.ui,
                  activeView: 'dashboard'
              }
          }));
          get().addNotification('info', 'Entering Endless Mode. The journey continues!');
      },
    }),
    {
      name: 'space-salvage-storage',
      version: 1,
      migrate: (persistedState: any, _version: number) => {
        // Ensure automationSettings exists in ui
        if (persistedState && persistedState.ui && !persistedState.ui.automationSettings) {
          persistedState.ui.automationSettings = {
            autoScoutEnabled: true,
            autoSalvageEnabled: true,
          };
        }
        return persistedState;
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        // Calculate offline time (capped at 4 hours)
        const MAX_OFFLINE_TIME = 4 * 60 * 60 * 1000; // 4 hours in ms
        const now = Date.now();
        const lastSave = state.lastSaveTime || now;
        const rawOfflineTime = now - lastSave;
        const offlineTime = Math.min(rawOfflineTime, MAX_OFFLINE_TIME);
        
        // Only process if offline for more than 30 seconds (show modal for meaningful time away)
        if (offlineTime > 30000) {
            // Calculate efficiency based on techs
            const techEffects = getTechEffects(state.techTree.purchased);
            const baseEfficiency = 0.5; // Base 50%
            const techBonus = techEffects.flatBonuses.offline_efficiency || 0;
            const efficiency = Math.min(1.0, baseEfficiency + techBonus);
            
            // Calculate production
            const gains = calculateOfflineProduction(state, offlineTime, efficiency);
            
            // Apply gains
            let hasGains = false;
            
            for (const [res, amount] of Object.entries(gains)) {
                if ((amount as number) > 0) {
                    state.addResource(res as ResourceType, amount as number);
                    hasGains = true;
                }
            }
            
            // Store AFK summary for modal display
            if (hasGains) {
                // We need to set this after state is rehydrated
                setTimeout(() => {
                    useGameStore.setState(s => ({
                        ui: {
                            ...s.ui,
                            afkSummary: {
                                timeAway: offlineTime,
                                efficiency,
                                gains,
                            }
                        }
                    }));
                }, 100);
            }
        }
        
        // Update last save time
        state.updateLastSaveTime(now);
      }
    }
  )
);
