import {
  DERELICT_CONFIGS,
  calculateDerelictRewards
} from '@/config/derelicts';
import { ORBIT_CONFIGS, getAdjacentOrbits } from '@/config/orbits';
import { SHIP_CONFIGS } from '@/config/ships';
import { getAlienTechMultipliers } from '@/engine/getAlienTechMultipliers';
import { getTechEffects } from '@/engine/getTechMultipliers';
import { getUpgradeMultipliers } from '@/engine/getUpgradeMultipliers';
import type {
  DerelictAction,
  Mission,
  OrbitType,
  ResourceType,
  ShipType
} from '@/types';
import type { GameSlice, MissionSlice } from './types';

export const createMissionSlice: GameSlice<MissionSlice> = (set, get) => ({
  startScoutMission: (shipType: ShipType, targetOrbit: OrbitType) => {
    const state = get();
    const config = SHIP_CONFIGS[shipType];
    
    // Validation
    if (state.ships[shipType] <= 0) return false;
    
    // Check if dual missions are enabled
    const hasDualMissions = 
      state.techTree?.purchased.includes('fleet_coordination') || 
      state.techTree?.purchased.includes('total_automation');
    const maxMissionsPerShip = hasDualMissions ? 2 : 1;
    
    // Missions state might be on GameStore composite
    const missions = state.missions || [];
    const busyShips = missions.filter(m => m.shipType === shipType).length;
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
    const techEffects = getTechEffects(state.techTree?.purchased || []);
    if (techEffects.multipliers.scout_mission_time) {
      duration *= techEffects.multipliers.scout_mission_time;
    }
    if (techEffects.multipliers.mission_time) {
      duration *= techEffects.multipliers.mission_time;
    }
    
    // Apply alien tech mission time multiplier (Temporal Shift)
    const alienTechMults = getAlienTechMultipliers(state.alienTech || {});
    duration *= alienTechMults.mission_time;
    
    // Apply upgrade multipliers
    const upgradeMultipliers = getUpgradeMultipliers(state);
    if (upgradeMultipliers.production.scoutProbe_missionTime) {
      duration *= upgradeMultipliers.production.scoutProbe_missionTime;
    }
  
    // Apply formation bonus
    // Assuming activeFormation is on stats or root state. It's on GameState.
    // We need to check types.ts if activeFormation is in GameState. Yes it is.
    // However, TypeScript might complain if we don't cast state to GameStore or extend types properly.
    // For now we assume state has it.
    // For now we assume state has it.
    // const activeFormation = (state as any).activeFormation; // Logic moved to MissionSlice checks below 
    // duration *= (activeFormation === 'scoutFleet' ? 0.9 : 1.0); // REMOVED: New design is pure discovery bonus
  
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
  
    set((s) => ({
      missions: [...(s.missions || []), mission],
      stats: {
        ...s.stats,
        totalMissionsLaunched: (s.stats?.totalMissionsLaunched || 0) + 1,
      },
    }));
  
    return true;
  },

  startSalvageMission: (derelictId: string, shipType: ShipType, action: DerelictAction, isAutomated = false) => {
    const state = get();
    const derelict = state.derelicts.find(d => d.id === derelictId);
    if (!derelict) return false;
  
    // Validation
    if (state.ships[shipType] <= 0) return false;
    
    // Check if dual missions are enabled
    const hasDualMissions = 
      state.techTree?.purchased.includes('fleet_coordination') || 
      state.techTree?.purchased.includes('total_automation');
    const maxMissionsPerShip = hasDualMissions ? 2 : 1;
    
    const missions = state.missions || [];
    const busyShips = missions.filter(m => m.shipType === shipType).length;
    if (busyShips >= state.ships[shipType] * maxMissionsPerShip) return false;
  
    // Only charge fuel if derelict is in a different orbit, and not in LEO or GEO
    let fuelCost = 0;
    if (derelict.orbit !== state.currentOrbit && derelict.orbit !== 'leo' && derelict.orbit !== 'geo') {
      fuelCost = derelict.fuelCost;
    }
    
    // DISMANTLE costs 2x fuel
    if (action === 'dismantle') {
      fuelCost *= 2;
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
    
    // Calculate duration with upgrades
    let duration = derelict.baseMissionTime;
    const upgradeMultipliers = getUpgradeMultipliers(state);
    
    if (shipType === 'salvageFrigate' && upgradeMultipliers.production.salvageFrigate_missionTime) {
        duration *= upgradeMultipliers.production.salvageFrigate_missionTime;
    }
    
    // Apply alien tech mission time multiplier (Temporal Shift)
    const alienTechMults = getAlienTechMultipliers(state.alienTech || {});
    duration *= alienTechMults.mission_time;
    
    if (action === 'dismantle') {
      duration *= 3;
    }

    // Apply Formation Bonus (Salvage Fleet: -50% Time)
    const activeFormation = (state as any).activeFormation;
    if (activeFormation === 'salvageFleet') {
        duration *= 0.5;
    }
  
    const mission: Mission = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'salvage',
      status: 'inProgress',
      shipType,
      startTime: now,
      endTime: now + duration,
      targetOrbit: derelict.orbit,
      targetDerelict: derelictId,
      fuelCost: fuelCost,
      action,
      isAutomated,
    };
  
    set((s) => ({
      missions: [...(s.missions || []), mission],
      stats: {
        ...s.stats,
        totalMissionsLaunched: (s.stats?.totalMissionsLaunched || 0) + 1,
      },
    }));
  
    return true;
  },

  startColonyMission: (targetOrbit: OrbitType) => {
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
    
    set((s) => ({
        resources: {
            ...s.resources,
            fuel: s.resources.fuel - travelCost
        },
        missions: [...(s.missions || []), mission],
        stats: {
            ...s.stats,
            totalMissionsLaunched: (s.stats?.totalMissionsLaunched || 0) + 1
        }
    }));
    
    return true;
  },

  completeMissionIfReady: (missionId: string) => {
    const state = get();
    const mission = state.missions.find(m => m.id === missionId);
    if (!mission || mission.status !== 'inProgress') return;
  
    const now = Date.now();
    if (now < mission.endTime) return;
  
    let success = false;
    let rewards: Partial<Record<ResourceType, number>> | undefined;

    try {
        const shipConfig = SHIP_CONFIGS[mission.shipType];
        let successRate = shipConfig.baseSuccessRate || 0.5;
        
        // Apply tech bonuses to success rate
        const techEffects = getTechEffects(state.techTree?.purchased || []);
        const upgradeMultipliers = getUpgradeMultipliers(state);

        if (mission.action === 'hack') {
            successRate = 0.85; // Base hacking success rate
            
            // Apply Risk Assessment tech bonus
            if (techEffects.flatBonuses.hack_success_rate) {
                successRate += techEffects.flatBonuses.hack_success_rate;
            }
        }
      
        // Scout discovery rate bonus
        if (mission.type === 'scout') {
             if (techEffects.multipliers.scout_discovery_rate) {
                successRate *= techEffects.multipliers.scout_discovery_rate;
             }
             if (upgradeMultipliers.production.scoutProbe_discoveryChance) {
                 successRate *= upgradeMultipliers.production.scoutProbe_discoveryChance;
             }
             
             // Scout Fleet Formation: +100% Discovery Chance
             const activeFormation = (state as any).activeFormation;
             if (activeFormation === 'scoutFleet') {
                 successRate *= 2.0;
             }
        }
        // Salvage success rate bonus
        if (mission.type === 'salvage') {
             if (techEffects.flatBonuses.salvage_success_rate) {
                successRate += techEffects.flatBonuses.salvage_success_rate;
             }
             if (upgradeMultipliers.flatBonus.salvageFrigate_successRate) {
                 successRate += upgradeMultipliers.flatBonus.salvageFrigate_successRate;
             }
             if (upgradeMultipliers.flatBonus.heavySalvageFrigate_successRate) {
                 successRate += upgradeMultipliers.flatBonus.heavySalvageFrigate_successRate;
             }
             
             // Hazardous derelict penalty for non-Heavy Salvage Frigates
             if (mission.targetDerelict) {
                 const targetDerelict = state.derelicts.find(d => d.id === mission.targetDerelict);
                 if (targetDerelict?.isHazardous && mission.shipType !== 'heavySalvageFrigate') {
                     successRate -= 0.2; // -20% penalty for hazardous derelicts
                 }
             }
        }
        // Global mission success rate bonus
        if (techEffects.flatBonuses.mission_success_rate) {
          successRate += techEffects.flatBonuses.mission_success_rate;
        }
        successRate = Math.min(successRate, 1.0); // Cap at 100%
        
        // DISMANTLE has 100% success rate
        if (mission.action === 'dismantle') {
          successRate = 1.0;
        }
        
        success = true;
        if (Math.random() > successRate) {
          success = false;
        }
      
        if (success) {
          if (mission.type === 'scout') {
             // Determine which orbit to spawn derelict in
             let spawnOrbit = mission.targetOrbit;
             
             const hasAdjacentScouting = state.techTree?.purchased.includes('quantum_entanglement_comms');
             
             if (hasAdjacentScouting) {
               const adjacentOrbits = getAdjacentOrbits(mission.targetOrbit);
               const possibleOrbits = [mission.targetOrbit, ...adjacentOrbits];
               spawnOrbit = possibleOrbits[Math.floor(Math.random() * possibleOrbits.length)];
             }
             
             const derelict = state.spawnDerelict(spawnOrbit);
             if (derelict) {
    
                 const orbitName = ORBIT_CONFIGS[spawnOrbit].name;
                 const derelictName = DERELICT_CONFIGS[derelict.type].name;
                 
                 if (hasAdjacentScouting && spawnOrbit !== mission.targetOrbit) {
                   state.addNotification('success', `Scout found ${derelictName} in adjacent ${orbitName}!`);
                 } else {
                   state.addNotification('success', `Scout discovered ${derelictName} in ${orbitName}`);
                 }
    
                 // Contract hook: Discovery
                 if (['rare', 'epic', 'legendary'].includes(derelict.rarity) && state.updateContractProgress) {
                    state.updateContractProgress('discoveryMission', 1, mission.targetOrbit);
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
                    for (const key of Object.keys(rewards)) {
                        rewards[key as ResourceType]! *= 1.5;
                    }
                    if (rewards.dataFragments) rewards.dataFragments *= 2;

                    // Contract Hook: Risky Business
                    if (state.updateContractProgress) {
                        state.updateContractProgress('riskyBusiness', 1);
                    }
                } else if (mission.action === 'dismantle') {
                    // DISMANTLE gives 200% of all rewards
                    for (const key of Object.keys(rewards)) {
                        rewards[key as ResourceType]! *= 2;
                    }
                }
                
                // Apply Formation Bonus
                // Assuming activeFormation is on stats or root state.
                const activeFormation = (state as any).activeFormation;
                if (activeFormation === 'salvageFleet') {
                    if (rewards.metal) rewards.metal *= 1.75;
                    if (rewards.electronics) rewards.electronics *= 1.75;
                    if (rewards.rareMaterials) rewards.rareMaterials *= 1.75;
                    if (rewards.exoticAlloys) rewards.exoticAlloys *= 1.75;
                }
    
                // Ship Upgrade Loot Bonus
                if (mission.shipType === 'salvageFrigate' && upgradeMultipliers.production.salvageFrigate_loot) {
                    // Apply multiplier to all except DF/DM if specific or general?
                    // The task was "salvageFrigate_loot multiplier was applied to increase rewards".
                    // I should apply it to main resources.
                     for (const key of Object.keys(rewards)) {
                        if (key !== 'darkMatter') { // Usually DM excluded from basic mults unless specified
                            rewards[key as ResourceType]! *= upgradeMultipliers.production.salvageFrigate_loot;
                        }
                    }
                }
                
                // Heavy Salvage Frigate Cargo Expansion
                if (mission.shipType === 'heavySalvageFrigate' && upgradeMultipliers.production.heavySalvageFrigate_reward) {
                     for (const key of Object.keys(rewards)) {
                        if (key !== 'darkMatter') {
                            rewards[key as ResourceType]! *= upgradeMultipliers.production.heavySalvageFrigate_reward;
                        }
                    }
                }

                // Apply Alien Tech salvage rewards multiplier (Matter Conversion)
                const alienTechMults = getAlienTechMultipliers(state.alienTech || {});
                for (const key of Object.keys(rewards)) {
                    rewards[key as ResourceType]! *= alienTechMults.salvage_rewards;
                }
                
                // Apply Alien Tech artifact drop rate multiplier (Artifact Resonance)
                if (rewards.alienArtifacts) {
                    rewards.alienArtifacts *= alienTechMults.alienArtifact_drop_rate;
                }
    
                // Grant rewards
                for (const [res, amount] of Object.entries(rewards)) {
                    state.addResource(res as ResourceType, amount as number);
                }
                
                state.removeDerelict(derelict.id);
                state.onDerelictSalvaged(derelict.id, rewards, mission.isAutomated);

                // Ark Discovery Hook
                if (derelict.isArkComponent && derelict.arkComponentType) {
                    state.discoverArkComponent(derelict.arkComponentType);
                }
    
                // Contract hook: Salvage
                // Note: need contract hooks for 'salvageMission', 'clearDebris' (maybe?), 'collectResource' logic handled in addResource
                 if (state.updateContractProgress) {
                     state.updateContractProgress('salvageQuota', 1, derelict.orbit);
                 }
             }
          } else if (mission.type === 'colony') {
              state.deployColony(mission.targetOrbit);
          }
        } else {
            // Mission failed
            if (mission.type === 'salvage' && mission.action === 'hack') {
                state.addNotification('warning', 'Hacking Failed! Security systems blocked access.');
            } else {
                state.addNotification('warning', `${SHIP_CONFIGS[mission.shipType].name} mission failed.`);
                
                // Emergency Warp: Recover 50% fuel if unlocked
                if (mission.shipType === 'heavySalvageFrigate' && upgradeMultipliers.unlocks['emergency_warp']) {
                     const recoveredFuel = Math.floor(mission.fuelCost * 0.5);
                     if (recoveredFuel > 0) {
                         state.addResource('fuel', recoveredFuel);
                         // Use strict notification to ensure user sees it
                         setTimeout(() => state.addNotification('info', `Emergency Warp activated! Recovered ${recoveredFuel} Fuel.`), 100);
                     }
                }
            }
        }
    } catch (error) {
        console.error(`Mission ${missionId} processing failed:`, error);
        success = false;
        state.addNotification('error', `Mission system error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  
    set((s) => ({
      missions: s.missions.filter(m => m.id !== missionId),
      stats: {
          ...s.stats,
          totalMissionsSucceeded: success ? (s.stats?.totalMissionsSucceeded || 0) + 1 : (s.stats?.totalMissionsSucceeded || 0),
          totalMissionsFailed: !success ? (s.stats?.totalMissionsFailed || 0) + 1 : (s.stats?.totalMissionsFailed || 0),
          missionHistory: [...(s.stats?.missionHistory || []), {
              ...mission,
              timestamp: Date.now(),
              success,
              rewards
          }]
      }
    }));
  
    state.onMissionComplete(missionId, success, rewards);
  },

  completeAllReadyMissions: (missionIds) => {
    const state = get();
    // Re-implementation calling individual complete logic or loop
    // To safe code duplication, we can just call completeMissionIfReady for each
    missionIds.forEach(id => state.completeMissionIfReady(id));
  },

  cancelMission: (missionId: string) => {
    const state = get();
    const mission = state.missions.find(m => m.id === missionId);
    if (!mission) return false;
  
    // Refund 50% fuel
    const refund = Math.floor(mission.fuelCost * 0.5);
    state.addResource('fuel', refund);
  
    set((s) => ({
      missions: s.missions.filter(m => m.id !== missionId),
    }));
  
    return true;
  },

  getMissionProgress: (missionId: string) => {
    const state = get();
    const mission = state.missions.find(m => m.id === missionId);
    if (!mission) return 0;
  
    const now = Date.now();
    const total = mission.endTime - mission.startTime;
    const elapsed = now - mission.startTime;
    return Math.min(1, Math.max(0, elapsed / total));
  },

  onMissionComplete: (_missionId, _success, _rewards) => {
     // Placeholder
     // console.log(`Mission ${missionId} complete. Success: ${success}`);
  }
});
