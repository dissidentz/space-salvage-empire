import {
    DERELICT_CONFIGS,
    getArkComponentTypeForOrbit,
    getRandomDerelictType,
    rollDerelictRarity,
} from '@/config/derelicts';
import { ORBIT_CONFIGS, isOrbitUnlocked } from '@/config/orbits';
import { getTechEffects } from '@/engine/getTechMultipliers';
import type { Derelict } from '@/types';
import type { GameSlice, OrbitSlice } from './types';

export const createOrbitSlice: GameSlice<OrbitSlice> = (set, get) => ({
  currentOrbit: 'leo',
  colonies: [],
  instantWarpAvailable: false,
  
  canTravelToOrbit: (targetOrbit) => {
    const state = get();
    if (state.travelState?.traveling) return false;
    if (state.currentOrbit === targetOrbit) return false;
    if (!isOrbitUnlocked(targetOrbit, state)) return false;
  
    const config = ORBIT_CONFIGS[targetOrbit];
    return state.resources.fuel >= config.fuelCost;
  },

  travelToOrbit: (targetOrbit, useInstantWarp = false) => {
    const state = get();
    
    if (useInstantWarp) {
        if (!state.instantWarpAvailable) return false;
        if (state.currentOrbit === targetOrbit) return false;
        // Instant travel!
        set((s) => ({
            instantWarpAvailable: false,
            currentOrbit: targetOrbit,
            stats: {
                ...s.stats,
                instantWarpUsed: true,
                totalTravels: (s.stats?.totalTravels || 0) + 1,
                farthestOrbit: ORBIT_CONFIGS[targetOrbit].index > ORBIT_CONFIGS[s.stats?.farthestOrbit || 'leo'].index ? targetOrbit : (s.stats?.farthestOrbit || 'leo'),
                travelHistory: [
                    ...(s.stats?.travelHistory || []),
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
    const techEffects = getTechEffects(state.techTree?.purchased || []);
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
    set((s) => ({
      travelState: {
        traveling: true,
        destination: targetOrbit,
        startTime: now,
        endTime: now + config.travelTime * travelMultiplier,
        progress: 0,
      },
      stats: {
        ...s.stats,
        totalFuelSpent: (s.stats?.totalFuelSpent || 0) + actualFuelCost,
      },
    }));
  
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

  completeTravelIfReady: () => {
    const state = get();
    if (!state.travelState?.traveling) return;
  
    const now = Date.now();
    if (now >= state.travelState.endTime) {
      const destination = state.travelState.destination!;
      const origin = state.currentOrbit;
      const startTime = state.travelState.startTime;
      
      set((s) => {
        const currentFarthest = ORBIT_CONFIGS[s.stats?.farthestOrbit || 'leo'];
        const newDest = ORBIT_CONFIGS[destination];
        const newFarthest = newDest.index > currentFarthest.index ? destination : (s.stats?.farthestOrbit || 'leo');
  
        return {
          currentOrbit: destination,
          travelState: null,
          stats: {
            ...s.stats,
            totalTravels: (s.stats?.totalTravels || 0) + 1,
            farthestOrbit: newFarthest,
            travelHistory: [
              ...(s.stats?.travelHistory || []),
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
      if (state.updateContractProgress) {
          state.updateContractProgress('speedRun', 1, destination);
      }
  
      state.addNotification('success', `Arrived at ${ORBIT_CONFIGS[destination].name}`);
    }
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

  // Derelicts

  spawnDerelict: (orbit) => {
    const orbitConfig = ORBIT_CONFIGS[orbit];
    const rarity = rollDerelictRarity(orbitConfig.spawnRates);
    const type = getRandomDerelictType(orbit, rarity);
    
    console.log(`[DEBUG] spawnDerelict orbit=${orbit}, rarity=${rarity}, type=${type}`);

    if (!type) return null;
  
    // Limit max active derelicts to 6
    if (get().derelicts.length >= 6) {
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
  
    set((state) => ({
      derelicts: [...state.derelicts, derelict],
      stats: {
        ...state.stats,
        totalDerelictsDiscovered: (state.stats?.totalDerelictsDiscovered || 0) + 1,
        derelictsByRarity: {
          ...state.stats?.derelictsByRarity,
          [rarity]: (state.stats?.derelictsByRarity?.[rarity] || 0) + 1,
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
    set((s) => ({
      derelicts: s.derelicts.filter(d => d.id !== derelictId),
    }));
  },
  
  getAvailableDerelicts: (orbit) => {
    return get().derelicts.filter(d => d.orbit === orbit);
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

  // Colonies

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
  
    set((s) => ({
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
  }
});
