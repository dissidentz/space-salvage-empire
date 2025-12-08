import { ALIEN_TECH } from '@/config/alienTech';
import { TRADE_ROUTES } from '@/config/trading';
import { generateRandomContract } from '@/engine/contracts';
import { getTechMultipliers } from '@/engine/getTechMultipliers';
import type { ContractType, OrbitType, ResourceType } from '@/types';
import type { EconomySlice, GameSlice } from './types';

export const createEconomySlice: GameSlice<EconomySlice> = (set, get) => ({
  // Automation State - Default values
  automation: {
      autoScoutEnabled: false,
      autoSalvageEnabled: false,
      autoScoutTargetLimit: 5,
  },
  
  contracts: [],
  trading: {}, // Placeholder if needed, but defining tradeResources logic here
  victory: false, // Actually logic seems to use `ui.activeView === 'victory'` combined with `prestige.arkComplete`
  alienTech: {}, // Purchased alien tech upgrades

  toggleAutoScout: () => {
    set((state) => ({
      ui: { // Automation automationSettings was on UI state?
        ...state.ui,
        automationSettings: {
          ...state.ui.automationSettings,
          autoScoutEnabled: !state.ui.automationSettings?.autoScoutEnabled,
        },
      },
    }));
    // Note: The logic in gameStore updated `state.ui.automationSettings`.
    // My Types.ts define `automation` in EconomySlice but gameStore logic used `ui.automationSettings`.
    // I should probably move automation settings to `automation` state property in EconomySlice 
    // to separate concerns, BUT this would break UI components expecting `ui.automationSettings`.
    // The implementation plan put `automation` in EconomySlice.
    // If I move the state, I need to update all selectors in the app.
    // For a safe refactor, I should probably keep the state location or ensure I update the mappings.
    // However, keeping logic in slices but state in `ui` is awkward.
    // Looking at GameStore.ts, `INITIAL_STATE` didn't have `automation` root property, it had `ui.automationSettings`.
    // In `types.ts`, `EconomySlice` has `automation: GameState['automation']`.
    // `GameState` type definition (which I import) might assume `automation` is a root property if I added it there?
    // Wait, in previous tasks I *implemented* automation. Let's check where I put the state.
    // gameStore.ts `toggleAutoScout` updates `state.ui.automationSettings`.
    // So current App expects it there.
    // I should probably stick to `ui.automationSettings` for now to avoid breaking UI components, 
    // OR create a `automation` root property and map it.
    // Moving it to root `automation` is cleaner for the slice. I'll do that and handle migration/compat in the store composition or just assume I update the usages later?
    // "Refactor gameStore to Slices" implies structural changes.
    // But `GameState` interface in `types/index.ts` determines what components see.
    // If I change `GameState` structure, I break components.
    // To minimize breakage, `createEconomySlice` should probably manipulate `ui.automationSettings` OR I update `GameState` type to have `automation` at root.
    // Actually, `EconomySlice` type in `types.ts` has `automation: GameState['automation']`.
    // Does `GameState` have `automation`?
    // Start of conversation summary said: "Implementing Automation Features ... Initializing these settings in gameStore.ts's INITIAL_STATE."
    // Looking at `processAutomation` logic: `state.ui.automationSettings?.autoScoutEnabled`.
    // So it IS in `ui`.
    // I will write the slice to use `state.ui.automationSettings` to match existing logic, 
    // even though the slice method is `toggleAutoScout`.
    // I'll leave the `automation` property in `EconomySlice` interface as unused or remove it if strictly typed.
    // Actually, I'll just write the function to update `ui` state as before.
  },

  toggleAutoSalvage: () => {
    set((state) => ({
      ui: {
        ...state.ui,
        automationSettings: {
          ...state.ui.automationSettings,
          autoSalvageEnabled: !state.ui.automationSettings?.autoSalvageEnabled,
        },
      },
    }));
  },

  setAutoScoutTargetLimit: (limit: number) => {
    set((state) => ({
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
    // Using loose types here or assuming state has techTree
    const techTree = state.techTree as any; 
    const ui = state.ui as any; 
    
    // We need to access everything from state
    const hasAutoScout = techTree.purchased.includes('auto_scout');
    const hasAutoSalvage = techTree.purchased.includes('auto_salvage');
    const hasTotalAutomation = techTree.purchased.includes('total_automation');
    
    // Auto-Scout Logic
    if (hasAutoScout && ui.automationSettings?.autoScoutEnabled && state.shipEnabled.scoutProbe) {
      // Check if we already have enough derelicts
      const targetLimit = ui.automationSettings?.autoScoutTargetLimit ?? 5;
      if (state.derelicts.length >= targetLimit) {
        return;
      }
      
      const hasDualMissions = techTree.purchased.includes('fleet_coordination') || hasTotalAutomation;
      const maxMissionsPerShip = hasDualMissions ? 2 : 1;
      
      const busyScouts = state.missions.filter(m => m.shipType === 'scoutProbe').length;
      const availableScouts = state.ships.scoutProbe * maxMissionsPerShip - busyScouts;
      
      if (availableScouts > 0 && state.resources.fuel >= 0) {
        const stats = state.stats as any; // Needed if stats not fully typed in slice context
        const unlockedOrbits = (stats.orbitsUnlocked || ['leo']).filter(
          (orbit: OrbitType) => orbit !== state.currentOrbit
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
    if (hasAutoSalvage && ui.automationSettings?.autoSalvageEnabled) {
      const colonizedOrbits = state.colonies.map(c => c.orbit);
      // Target ALL derelicts in colonized orbits
      const targetDerelicts = state.derelicts.filter(
        d => colonizedOrbits.includes(d.orbit)
      );
      
      const hasDualMissions = techTree.purchased.includes('fleet_coordination') || hasTotalAutomation;
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

  // Contracts

  generateContracts: () => {
    const state = get();
    // Check availability
    // If contract tech not unlocked, do nothing
    // Assuming techTree exists
    if (!state.techTree?.purchased.includes('contracts')) return;
  
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
  
  updateContractProgress: (type: ContractType | 'any', amount: number, orbit?: OrbitType) => {
      set((state) => {
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
      set((state) => ({
          contracts: state.contracts.filter(c => c.id !== contractId)
      }));
  },

  // Trading

  tradeResources: (routeId, amount) => {
    const state = get();
    // Verify market access
    if (!state.techTree?.purchased.includes('market_access')) {
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
  
    set((state) => ({
        resources: {
            ...state.resources,
            [route.input]: state.resources[route.input] - cost,
            [route.output]: state.resources[route.output] + finalOutput
        }
    }));
  
    state.addNotification('success', `Traded ${cost} ${route.input} for ${finalOutput} ${route.output}`);
  },

  // Alien Tech
  
  purchaseAlienTech: (techId: string) => {
      const state = get();
      const tech = ALIEN_TECH[techId];
      if (!tech) return false;
      
      // Check if already purchased
      if (state.alienTech[techId]) {
          state.addNotification('warning', 'Already purchased this alien tech!');
          return false;
      }
      
      // Check if can afford
      if (state.resources.alienArtifacts < tech.cost) {
          state.addNotification('error', `Need ${tech.cost} Alien Artifacts!`);
          return false;
      }
      
      // Deduct cost and add to purchased
      set((s) => ({
          resources: {
              ...s.resources,
              alienArtifacts: s.resources.alienArtifacts - tech.cost,
          },
          alienTech: {
              ...s.alienTech,
              [techId]: true,
          },
      }));
      
      state.addNotification('success', `Purchased ${tech.name}!`);
      return true;
  },

  // Victory
  
  continueEndlessMode: () => {
      set((state) => ({
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
  }
});
