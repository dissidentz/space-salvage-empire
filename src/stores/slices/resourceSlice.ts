import { BASE_STORAGE_LIMITS } from '@/config/storage';
import { getTechEffects } from '@/engine/getTechMultipliers';
import { calculateProductionRates } from '@/engine/production';
import type { ResourceType } from '@/types';
import type { GameSlice, ResourceSlice } from './types';

export const createResourceSlice: GameSlice<ResourceSlice> = (set, get) => ({
  resources: {
    debris: 0,
    metal: 0,
    electronics: 0,
    fuel: 500, // Starting fuel
    rareMaterials: 0,
    exoticAlloys: 0,
    aiCores: 0,
    dataFragments: 0,
    darkMatter: 0,
  },

  addResource: (type: ResourceType, amount: number) => {
    const state = get();
    const maxStorage = state.getMaxStorage(type);
    const currentAmount = state.resources[type];
    
    // Calculate new total
    let newAmount = currentAmount + amount;
    
    // Enforce caps (except Dark Matter)
    if (type !== 'darkMatter') {
       newAmount = Math.min(newAmount, maxStorage);
    }
    
    // Determine actual delta
    const actualDelta = newAmount - currentAmount;
    
    // If we tried to add but are full (and amount > 0), do nothing
    if (actualDelta <= 0 && amount > 0) return;
    
    set((state) => ({
      resources: {
        ...state.resources,
        [type]: newAmount,
      },
    }));

    // Contract Hook: Resource Rush
    // We check if updateContractProgress exists to avoid errors during initialization if slices are merged partially
    if (type === 'metal' && actualDelta > 0 && state.updateContractProgress) {
        state.updateContractProgress('resourceRush', actualDelta);
    }
  },

  subtractResource: (type: ResourceType, amount: number) => {
    const state = get();
    if (state.resources[type] < amount) return false;
    
    set((state) => ({
      resources: {
        ...state.resources,
        [type]: state.resources[type] - amount,
      },
    }));
    return true;
  },

  getMaxStorage: (resource: ResourceType) => {
    const state = get();
    const base = BASE_STORAGE_LIMITS[resource] || 999999;
    
    let multiplier = 1.0;
    // We assume techTree exists on state (it will in the composite store)
    const techEffects = getTechEffects(state.techTree?.purchased || []);
    
    if (techEffects.multipliers.storage_capacity) {
        multiplier *= techEffects.multipliers.storage_capacity;
    }
    
    return Math.floor(base * multiplier);
  },

  getProductionRates: () => {
    const state = get();
    return calculateProductionRates(state);
  },

  updateComputedRates: (rates) => {
    set({ computedRates: rates } as any); // Type assertion needed until full composition or moving computedRates to slice
    // Actually computedRates is likely strictly part of `GameStore` logic or UI props, 
    // but originally it was in `GameStore` interface. 
    // I should check if I defined `computedRates` in ResourceSlice type. I didn't. 
    // It probably belongs in the ResourceSlice state or just GameStore.
  },

  clickDebris: () => {
    const state = get();
    let clickValue = 1;

    // Apply tech multipliers
    const techEffects = getTechEffects(state.techTree?.purchased || []);
    if (techEffects.multipliers.click_power) {
      clickValue *= techEffects.multipliers.click_power;
    }

    // Apply upgrades
    const clickUpgrade = state.upgrades?.debris_click_power; // Legacy/Basic upgrades
    if (clickUpgrade && clickUpgrade.currentLevel > 0) {
       clickValue *= Math.pow(1.15, clickUpgrade.currentLevel);
    }

    state.addResource('debris', clickValue);

    set((state) => ({
      stats: {
        ...state.stats,
        totalClicks: (state.stats?.totalClicks || 0) + 1,
        totalDebrisCollected: (state.stats?.totalDebrisCollected || 0) + clickValue,
      },
    }));
  },
});
