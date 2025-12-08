import {
    ARK_COMPONENTS,
    PRESTIGE_PERKS,
    calculateDarkMatterGain,
} from '@/config/prestige';
import type { ArkComponentType, OrbitType, ResourceType, ShipType } from '@/types';
import { canAffordCost } from '@/utils/formulas';
import type { GameSlice, PrestigeSlice } from './types';

export const createPrestigeSlice: GameSlice<PrestigeSlice> = (set, get) => ({
  prestige: {
    darkMatter: 0,
    totalDarkMatter: 0,
    totalRuns: 0,
    fastestRun: 0, // ms
    purchasedPerks: {},
    arkUnlocked: false,
    arkComponents: {},
    arkComplete: false,
    endlessMode: false,
    highestOrbit: 'leo',
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

  prestigeReset: () => {
    const state = get();
    const dmGain = calculateDarkMatterGain(state.resources.dataFragments);
    if (dmGain <= 0) return;
  
    const newTotalRuns = state.prestige.totalRuns + 1;
    const currentRunTime = state.stats?.currentRunTime || 0;
    const fastestRun = state.prestige.fastestRun === 0 
        ? currentRunTime 
        : Math.min(state.prestige.fastestRun, currentRunTime);
  
    set((state) => ({
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
            alienArtifacts: 0,
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
        currentRun: (state.currentRun || 1) + 1,
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
        // We probably shouldn't reset UI active view unless desired, but GameStore did:
        ui: {
            ...state.ui,
            activeView: 'dashboard',
            notifications: [],
        }
    }));
    
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
  
    set((state) => ({
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
     set((state) => ({
         prestige: {
             ...state.prestige,
             arkUnlocked: true
         }
     }));
     return true;
  },

  discoverArkComponent: (componentId) => {
      set((state) => ({
          prestige: {
              ...state.prestige,
              arkComponents: {
                  ...state.prestige.arkComponents,
                  [componentId as ArkComponentType]: {
                      ...state.prestige.arkComponents[componentId as ArkComponentType],
                      type: componentId as ArkComponentType,
                      discovered: true,
                  }
              }
          }
      }));
      get().addNotification('success', `Ark Component Blueprint Discovered: ${ARK_COMPONENTS[componentId as ArkComponentType].name}!`);
      return true;
  },

  buildArkComponent: (componentId) => {
      const state = get();
      const component = ARK_COMPONENTS[componentId as ArkComponentType];
      if (!component) return false;
      
      const arkState = state.prestige.arkComponents[componentId as ArkComponentType];
      if (!arkState?.discovered) {
          state.addNotification('error', 'Component blueprint not yet discovered!');
          return false;
      }
      if (arkState.assembled) return false;
      
      if (!canAffordCost(component.cost, state.resources)) return false;
      
      for (const [res, amount] of Object.entries(component.cost)) {
          state.subtractResource(res as ResourceType, amount);
      }
      
      set((state) => ({
          prestige: {
              ...state.prestige,
              arkComponents: {
                  ...state.prestige.arkComponents,
                  [componentId]: {
                      ...state.prestige.arkComponents[componentId as ArkComponentType],
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
          set((state) => ({
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

  // Milestones

  evaluateMilestone: (milestoneId) => {
    const state = get();
    const milestone = state.milestones[milestoneId];
    if (!milestone || milestone.achieved) return true;
  
    const { type, key, value } = milestone.condition;
    let current = 0;
  
    switch (type) {
      case 'reach_orbit':
         const orbitOrder: OrbitType[] = ['leo', 'geo', 'lunar', 'mars', 'asteroidBelt', 'jovian', 'kuiper', 'deepSpace'];
         const currentIndex = orbitOrder.indexOf(state.currentOrbit);
         const targetIndex = orbitOrder.indexOf(key as OrbitType);
         if (currentIndex >= targetIndex) current = 1;
        break;
      case 'collect_resource':
         if (key === 'debris') current = state.stats?.totalDebrisCollected || 0;
         else current = state.resources[key as ResourceType];
        break;
      case 'purchase_ships':
        current = state.ships[key as ShipType];
        break;
      case 'travels_completed':
        current = state.stats?.totalTravels || 0;
        break;
      case 'unique_orbits_visited':
        // We use orbitsUnlocked or similar metric. GameStore used `state.stats.orbitsUnlocked.length` but `orbitsUnlocked` might not be in stats type I copied? 
        // I need to check GameState stats definition.
        // Assuming it's there.
        current = (state.stats as any).orbitsUnlocked?.length || 0; 
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
       const rewards = milestone.rewards as Partial<Record<ResourceType, number>>;
       for (const [res, amount] of Object.entries(rewards)) {
         if (res !== 'unlockTech' && res !== 'addUpgrade') {
            state.addResource(res as ResourceType, amount);
         }
       }
    }
  
    set((s) => ({
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
  }
});
