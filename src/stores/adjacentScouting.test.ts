import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGameStore } from './gameStore';

describe('Adjacent Orbit Scouting', () => {
  beforeEach(() => {
    const store = useGameStore.getState();
    store.hardReset();
    useGameStore.setState({
      resources: {
        ...store.resources,
        dataFragments: 10000,
        fuel: 10000,
      },
      currentOrbit: 'leo',
      stats: {
        ...store.stats,
        orbitsUnlocked: ['leo', 'geo', 'lunar'],
      },
      ships: {
        ...store.ships,
        scoutProbe: 1,
      }
    });
  });

  it('should discover derelicts in adjacent orbits when tech is unlocked', () => {
    const store = useGameStore.getState();
    
    // Unlock tech
    useGameStore.setState(state => ({
        techTree: {
            ...state.techTree,
            purchased: [...state.techTree.purchased, 'quantum_entanglement_comms']
        }
    }));

    // Start scout mission to GEO
    const targetOrbit = 'geo';
    store.startScoutMission('scoutProbe', targetOrbit);
    
    const mission = useGameStore.getState().missions[0];
    expect(mission).toBeDefined();

    // We need to mock Math.random() specifically for the selection logic
    // 1. First call is for success check: if (Math.random() > successRate)
    //    We want this to be 0 so it's NOT > successRate (success = true)
    // 2. Second call is for orbit selection: possibleOrbits[Math.floor(Math.random() * length)]
    //    possibleOrbits for GEO are ['geo', 'leo', 'lunar']
    //    We want index 1 (LEO) -> 0.4 * 3 = 1.2 -> floor = 1
    
    const randomSpy = vi.spyOn(Math, 'random');
    randomSpy
        .mockReturnValueOnce(0.0) // Success check
        .mockReturnValueOnce(0.4) // Orbit selection (LEO)
        .mockReturnValue(0.5);    // Subsequent calls (spawn logic)
    
    // Fast forward time
    useGameStore.setState(state => ({
        missions: state.missions.map(m => ({ ...m, endTime: Date.now() - 1000 }))
    }));
    
    store.completeMissionIfReady(mission.id);
    
    randomSpy.mockRestore();
    
    const state = useGameStore.getState();
    const derelict = state.derelicts[0];
    
    expect(derelict).toBeDefined();
    expect(derelict.orbit).toBe('leo');
  });

  it('should only scout target orbit when tech is NOT unlocked', () => {
    const store = useGameStore.getState();
    
    // Ensure tech is NOT unlocked
    expect(store.techTree.purchased.includes('quantum_entanglement_comms')).toBe(false);

    // Start scout mission to GEO
    store.startScoutMission('scoutProbe', 'geo');
    const mission = useGameStore.getState().missions[0];
    
    // Mock random for success check only
    const randomSpy = vi.spyOn(Math, 'random');
    randomSpy.mockReturnValue(0.0); // Always succeed
    
    useGameStore.setState(state => ({
        missions: state.missions.map(m => ({ ...m, endTime: Date.now() - 1000 }))
    }));
    
    store.completeMissionIfReady(mission.id);
    
    randomSpy.mockRestore();
    
    const state = useGameStore.getState();
    const derelict = state.derelicts[0];
    
    // Should strictly be GEO
    expect(derelict.orbit).toBe('geo');
  });
});
