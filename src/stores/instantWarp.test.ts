import { beforeEach, describe, expect, it } from 'vitest';
import { useGameStore } from './gameStore';

// Mock config if needed, but we can rely on the store's initial state and actions
// We might need to mock ORBIT_CONFIGS if they are not available in test environment,
// but usually they are imported fine.

describe('Instant Warp Feature', () => {
  beforeEach(() => {
    const store = useGameStore.getState();
    store.hardReset();
    // Reset specific state for testing
    useGameStore.setState({
      resources: {
        ...store.resources,
        dataFragments: 10000, // Enough for tech
        fuel: 0, // Ensure no fuel for normal travel
      },
      currentOrbit: 'leo',
      instantWarpAvailable: false,
      stats: {
        ...store.stats,
        instantWarpUsed: false,
        orbitsUnlocked: ['leo', 'geo', 'lunar', 'mars'], // Unlock some orbits
      }
    });
  });

  it('should unlock instant warp when tech is purchased', () => {
    const store = useGameStore.getState();
    expect(store.instantWarpAvailable).toBe(false);

    // Purchase the tech
    // We need to make sure prerequisites are met or bypass them for this test
    // 'instant_warp' has no prerequisites in the config I saw earlier
    const techId = 'instant_warp';
    
    // Ensure we can afford it
    useGameStore.setState(state => ({
        resources: { ...state.resources, dataFragments: 2000 }
    }));

    const success = store.purchaseTech(techId);
    expect(success).toBe(true);
    
    const updatedStore = useGameStore.getState();
    expect(updatedStore.instantWarpAvailable).toBe(true);
  });

  it('should allow travel without fuel when using instant warp', () => {
    const store = useGameStore.getState();
    
    // Grant ability manually
    useGameStore.setState({ instantWarpAvailable: true });
    
    const targetOrbit = 'mars';
    // Ensure we have 0 fuel
    useGameStore.setState(state => ({
        resources: { ...state.resources, fuel: 0 }
    }));

    // Attempt normal travel (should fail)
    const normalResult = store.travelToOrbit(targetOrbit, false);
    expect(normalResult).toBe(false);

    // Attempt instant warp travel
    const instantResult = store.travelToOrbit(targetOrbit, true);
    expect(instantResult).toBe(true);

    const updatedStore = useGameStore.getState();
    expect(updatedStore.currentOrbit).toBe(targetOrbit);
    expect(updatedStore.instantWarpAvailable).toBe(false);
    expect(updatedStore.stats.instantWarpUsed).toBe(true);
    expect(updatedStore.travelState).toBeNull(); // Should be instant, no travel state
  });

  it('should consume the ability after use', () => {
    const store = useGameStore.getState();
    useGameStore.setState({ instantWarpAvailable: true });

    store.travelToOrbit('mars', true);
    
    const afterFirstUse = useGameStore.getState();
    expect(afterFirstUse.instantWarpAvailable).toBe(false);

    // Try to use it again
    const secondResult = store.travelToOrbit('geo', true);
    expect(secondResult).toBe(false);
  });

  it('should not allow instant warp if not unlocked', () => {
    const store = useGameStore.getState();
    expect(store.instantWarpAvailable).toBe(false);

    const result = store.travelToOrbit('mars', true);
    expect(result).toBe(false);
  });
});
