import { TECH_TREE, arePrerequisitesMet } from '@/config/tech';
import { getTechMultipliers } from '@/engine/getTechMultipliers';
import type { GameSlice, TechSlice } from './types';

export const createTechSlice: GameSlice<TechSlice> = (set, get) => ({
  techTree: { purchased: [], available: [] },

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
        techsPurchased: (state.stats?.techsPurchased || 0) + 1,
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
  }
});
