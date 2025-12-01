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
      const state = useGameStore.getState();

      // Calculate production for this tick
      const deltas = calculateTickProduction(state);

      // Apply resource changes
      for (const [resource, delta] of Object.entries(deltas)) {
        if (delta !== 0) {
          const resourceType = resource as ResourceType;
          const currentAmount = state.resources[resourceType];

          // Prevent resources from going negative
          const newAmount = Math.max(0, currentAmount + delta);
          const actualDelta = newAmount - currentAmount;

          // Only apply if there's an actual change
          if (actualDelta !== 0) {
            state.addResource(resourceType, actualDelta);
          }

          // Track stats for positive production
          if (delta > 0) {
            // Update stats based on resource type
            if (resourceType === 'debris') {
              useGameStore.setState(s => ({
                stats: {
                  ...s.stats,
                  totalDebrisCollected: s.stats.totalDebrisCollected + delta,
                },
              }));
            } else if (resourceType === 'metal') {
              useGameStore.setState(s => ({
                stats: {
                  ...s.stats,
                  totalMetalProduced: s.stats.totalMetalProduced + delta,
                },
              }));
            } else if (resourceType === 'electronics') {
              useGameStore.setState(s => ({
                stats: {
                  ...s.stats,
                  totalElectronicsGained:
                    s.stats.totalElectronicsGained + delta,
                },
              }));
            } else if (resourceType === 'fuel') {
              useGameStore.setState(s => ({
                stats: {
                  ...s.stats,
                  totalFuelSynthesized: s.stats.totalFuelSynthesized + delta,
                },
              }));
            }
          }
        }
      }

      // Check for completed travel
      state.completeTravelIfReady();

      // Check for completed missions
      state.missions.forEach(mission => {
        if (mission.status === 'inProgress' && Date.now() >= mission.endTime) {
          state.completeMissionIfReady(mission.id);
        }
      });

      // Check for expired derelicts
      const now = Date.now();
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
