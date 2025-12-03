// Game loop hook - handles production calculations and resource updates

import { checkPassiveSpawning } from '@/engine/derelictSpawning';
import { calculateTickProduction } from '@/engine/production';
import { useGameStore } from '@/stores/gameStore';
import type { ResourceType } from '@/types';
import { useEffect } from 'react';

/**
 * Game loop that runs every 100ms (10 ticks/sec)
 * Handles all production, conversion, and resource updates
 */
export function useGameLoop() {
  useEffect(() => {
    console.log('Game loop starting...');

    const interval = setInterval(() => {
      const tickStart = performance.now();
      const state = useGameStore.getState();

      // Calculate production for this tick
      const deltas = calculateTickProduction(state);

      // Apply resource changes
      // Apply resource changes
      const resourceUpdates: Partial<Record<ResourceType, number>> = {};
      const statUpdates: Partial<typeof state.stats> = {};
      let hasUpdates = false;

      for (const [resource, delta] of Object.entries(deltas)) {
        if (delta !== 0) {
          const resourceType = resource as ResourceType;
          const currentAmount = state.resources[resourceType];

          // Prevent resources from going negative
          const newAmount = Math.max(0, currentAmount + delta);
          const actualDelta = newAmount - currentAmount;

          // Only apply if there's an actual change
          if (actualDelta !== 0) {
            resourceUpdates[resourceType] = (resourceUpdates[resourceType] || 0) + actualDelta;
            hasUpdates = true;
          }

          // Track stats for positive production
          if (delta > 0) {
             if (resourceType === 'debris') {
                statUpdates.totalDebrisCollected = (statUpdates.totalDebrisCollected || state.stats.totalDebrisCollected) + delta;
             } else if (resourceType === 'metal') {
                statUpdates.totalMetalProduced = (statUpdates.totalMetalProduced || state.stats.totalMetalProduced) + delta;
             } else if (resourceType === 'electronics') {
                statUpdates.totalElectronicsGained = (statUpdates.totalElectronicsGained || state.stats.totalElectronicsGained) + delta;
             } else if (resourceType === 'fuel') {
                statUpdates.totalFuelSynthesized = (statUpdates.totalFuelSynthesized || state.stats.totalFuelSynthesized) + delta;
             }
             hasUpdates = true;
          }
        }
      }

      if (hasUpdates) {
          useGameStore.setState(s => {
              const newResources = { ...s.resources };
              for (const [res, amount] of Object.entries(resourceUpdates)) {
                  newResources[res as ResourceType] = (newResources[res as ResourceType] || 0) + amount;
              }
              
              // Merge stats
              const newStats = { ...s.stats, ...statUpdates };
              
              return {
                  resources: newResources,
                  stats: newStats
              };
          });
      }

      // Check for completed travel
      state.completeTravelIfReady();

      // Check for completed missions
      // Create a snapshot of mission IDs to avoid race conditions
      const now = Date.now();
      const completedMissionIds = state.missions
        .filter(m => m.status === 'inProgress' && now >= m.endTime)
        .map(m => m.id);

      // Process all completed missions in a single batch update
      if (completedMissionIds.length > 0) {
        state.completeAllReadyMissions(completedMissionIds);
      }

      // Check for expired derelicts
      state.derelicts.forEach(derelict => {
        // Only expire if no mission is currently targeting this derelict
        const isTargeted = state.missions.some(
          m => m.targetDerelict === derelict.id && m.status === 'inProgress'
        );
        
        if (!isTargeted && now >= derelict.expiresAt) {
          state.removeDerelict(derelict.id);
        }
      });

      // Check milestones after production
      state.checkAndClaimMilestones();

      // Check passive spawning
      checkPassiveSpawning();

      const tickDuration = performance.now() - tickStart;
      if (tickDuration > 16) { // Warn if tick takes longer than 1 frame (16ms)
         console.warn(`Game loop tick took ${tickDuration.toFixed(2)}ms`);
      }
    }, 100); // 10 ticks per second

    // Update production rates every second for display
    let rateUpdateCounter = 0;
    const rateUpdateInterval = setInterval(() => {
      rateUpdateCounter++;
      if (rateUpdateCounter >= 10) {
        const rates = useGameStore.getState().getProductionRates();
        useGameStore.getState().updateComputedRates(rates);
        rateUpdateCounter = 0;
      }
    }, 100);

    return () => {
      console.log('Game loop stopping...');
      clearInterval(interval);
      clearInterval(rateUpdateInterval);
    };
  }, []); // Empty deps - only run once
}
