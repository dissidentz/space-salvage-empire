import { SHIP_UPGRADES } from '@/config/shipUpgrades';
import { getTechMultipliers } from '@/engine/getTechMultipliers';
import { calculateProductionRates } from '@/engine/production';
import type { ResourceType, ShipType } from '@/types';
import {
    calculateBulkShipCost,
    calculateShipCost,
    canAffordCost
} from '@/utils/formulas';
import type { GameSlice, ShipSlice } from './types';

const getUpgrade = (id: string) => SHIP_UPGRADES[id];

export const createShipSlice: GameSlice<ShipSlice> = (set, get) => ({
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
  // Legacy upgrades state structure - keeping for compatibility with existing save/logic
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

  buyShip: (type: ShipType, amount = 1) => {
    const state = get();
    const cost = state.getShipCost(type, amount);

    if (!state.canAffordShip(type, amount)) return false;

    // Deduct resources
    for (const [resource, value] of Object.entries(cost)) {
      state.subtractResource(resource as ResourceType, value as number);
    }

    // Add ship
    set((state) => ({
      ships: {
        ...state.ships,
        [type]: state.ships[type] + amount,
      },
      stats: {
        ...state.stats,
        totalShipsPurchased: (state.stats?.totalShipsPurchased || 0) + amount,
      },
    }));

    // Recalculate rates immediately
    const newState = get();
    const newRates = calculateProductionRates(newState);
    newState.updateComputedRates(newRates);

    return true;
  },

  canAffordShip: (type: ShipType, amount = 1) => {
    const state = get();
    const cost = state.getShipCost(type, amount);
    return canAffordCost(cost, state.resources);
  },

  getShipCost: (type: ShipType, amount = 1) => {
    const state = get();
    const currentCount = state.ships[type];
    const techMultipliers = getTechMultipliers(state.techTree?.purchased || []);
    
    // Also apply Prestige perks if any affect ship cost (e.g. ship_cost_1)
    // Note: getTechMultipliers only looks at techs. 
    // Formulas.ts might need prestige multipliers but calculateShipCost usually takes an 'modifiers' object.
    // gameStore passed { tech: techMultipliers }.
    // Looking at gameStore.ts 'getShipCost' again: 
    // const techMultipliers = getTechMultipliers(state.techTree.purchased);
    // return calculateShipCost(..., { tech: techMultipliers });
    // If prestige affects it, it should be in techMultipliers or passed separately. 
    // Checking PRESTIGE_PERKS, 'ship_cost_1' targets 'shipCost'. 
    // getTechMultipliers DOES NOT include prestige. 
    // But `getTechMultipliers` implementation usually ONLY checks TECH_TREE.
    // However, logic in gameStore might have been incomplete or prestige effect is applied elsewhere?
    // Wait, `getTechEffects` function name is specific to techs.
    // If prestige provides multipliers, they need to be aggregated.
    // I'll stick to exact gameStore implementation for now.
    
    if (amount === 1) {
        return calculateShipCost(type, currentCount, { tech: techMultipliers });
    } else {
        return calculateBulkShipCost(type, currentCount, amount, { tech: techMultipliers });
    }
  },

  toggleShip: (type: ShipType) => {
    set((state) => ({
      shipEnabled: {
        ...state.shipEnabled,
        [type]: !state.shipEnabled[type],
      },
    }));

    const state = get();
    const newRates = calculateProductionRates(state);
    state.updateComputedRates(newRates);
  },

  setShipEnabled: (type: ShipType, enabled: boolean) => {
    set((state) => ({
      shipEnabled: {
        ...state.shipEnabled,
        [type]: enabled,
      },
    }));
    
    const state = get();
    const newRates = calculateProductionRates(state);
    state.updateComputedRates(newRates);
  },

  // Ship Upgrades
  
  canAffordUpgrade: (upgradeId: string) => {
    const state = get();
    const upgrade = getUpgrade(upgradeId);
    if (!upgrade) return false;
    
    const currentLevel = state.shipUpgrades[upgradeId]?.currentLevel || 0;
    if (currentLevel >= upgrade.maxLevel) return false;
    
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
    set((s) => ({
      shipUpgrades: {
        ...s.shipUpgrades,
        [upgradeId]: {
          currentLevel: currentLevel + 1,
          unlocked: true,
        },
      },
    }));

    state.addNotification('success', `Purchased ${upgrade.name}`);
    
    // Recalculate rates if needed (upgrades might affect production)
    const newState = get();
    const newRates = calculateProductionRates(newState);
    newState.updateComputedRates(newRates);
    
    return true;
  },
  
  getUpgradeLevel: (upgradeId: string) => {
    const state = get();
    return state.shipUpgrades[upgradeId]?.currentLevel || 0;
  },
  
  isUpgradeUnlocked: (upgradeId: string) => {
    const state = get();
    return state.shipUpgrades[upgradeId]?.unlocked || false;
  }
});
