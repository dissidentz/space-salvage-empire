import { FORMATION_CONFIGS } from '@/config/formations';
import { calculateProductionRates } from '@/engine/production';
import type { FormationType, ShipType } from '@/types';
import type { FormationSlice, GameSlice } from './types';

export const createFormationSlice: GameSlice<FormationSlice> = (set, get) => ({
  activeFormation: null, // Initial State
  formationCooldownEnd: 0, // Initial State

  setFormation: (type: FormationType | null) => {
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
    // Assuming techTree is available on state (composed)
    if (!state.techTree?.purchased.includes('fleet_management')) return false;

    // Check cooldown
    if (Date.now() < state.formationCooldownEnd) return false;

    const config = FORMATION_CONFIGS[type];
    if (!config) return false;

    // Check requirements
    for (const [ship, count] of Object.entries(config.requirements)) {
        if (state.ships[ship as ShipType] < (count as number)) return false;
    }
    
    // Special case for Production Fleet "Total Ships" logic
    if (type === 'productionFleet') {
         const totalShips = Object.values(state.ships).reduce((a, b) => a + b, 0);
         if (totalShips < 100) return false;
    }
    
    // Special case for Expedition Fleet "Total Ships" logic
    if (type === 'expeditionFleet') {
         const totalShips = Object.values(state.ships).reduce((a, b) => a + b, 0);
         if (totalShips < 30) return false;
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
  }
});
