// Simplified game loop hook - only updates debris for now

import { useGameStore } from '@/stores/gameStore';
import { useEffect } from 'react';

/**
 * Simple game loop that runs every 100ms (10 ticks/sec)
 * Only handles debris production from salvage drones
 */
export function useGameLoop() {
  useEffect(() => {
    console.log('Game loop starting...');
    
    const interval = setInterval(() => {
      const state = useGameStore.getState();
      const droneCount = state.ships.salvageDrone;
      
      if (droneCount > 0) {
        // Each drone produces 1 debris/sec = 0.1 debris per tick
        const debrisPerTick = droneCount * 0.1;
        state.addResource('debris', debrisPerTick);
      }
    }, 100); // 10 ticks per second

    return () => {
      console.log('Game loop stopping...');
      clearInterval(interval);
    };
  }, []); // Empty deps - only run once
}
