import { ORBIT_CONFIGS } from '@/config/orbits';
import { useGameStore } from '@/stores/gameStore';

/**
 * Check if a passive derelict spawn should occur
 * Should be called periodically (e.g. every second or every tick)
 */
export function checkPassiveSpawning() {
  const state = useGameStore.getState();
  const currentOrbit = state.currentOrbit;
  const orbitConfig = ORBIT_CONFIGS[currentOrbit];
  
  // Base spawn chance per check
  // Assuming this is called every 100ms (10 times/sec)
  // We want ~1 spawn every 60 seconds for LEO (base)
  // 60 seconds = 600 ticks.
  // Chance = 1/600 = 0.00166
  
  const baseSpawnRate = 0.002; // 0.2% per tick -> ~50 seconds avg
  
  // Multipliers
  const orbitMult = orbitConfig.spawnMultiplier || 1.0;
  
  // Tech multipliers
  const techMult = state.getTechMultiplier('passive_spawn_rate');
  
  const finalChance = baseSpawnRate * orbitMult * techMult;
  
  if (Math.random() < finalChance) {
    // Check max derelicts
    const derelictsInOrbit = state.derelicts.filter(d => d.orbit === currentOrbit).length;
    const maxDerelicts = 5; // Hardcoded limit
    
    if (derelictsInOrbit < maxDerelicts) {
      state.spawnDerelict(currentOrbit);
    }
  }
}
