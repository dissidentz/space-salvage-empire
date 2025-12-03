import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGameStore } from './gameStore';

// Mock zustand persist
vi.mock('zustand/middleware', () => ({
  persist: vi.fn(config => config),
}));

describe('Game Limits', () => {
  beforeEach(() => {
    useGameStore.setState({
      resources: {
        debris: 0,
        metal: 1000,
        electronics: 1000,
        fuel: 1000,
        rareMaterials: 0,
        exoticAlloys: 0,
        aiCores: 0,
        dataFragments: 0,
        darkMatter: 0,
      },
      ships: {
        salvageDrone: 0,
        refineryBarge: 0,
        electronicsExtractor: 0,
        fuelSynthesizer: 0,
        matterExtractor: 0,
        quantumMiner: 0,
        scoutProbe: 10, // Give plenty of probes
        salvageFrigate: 0,
        heavySalvageFrigate: 0,
        deepSpaceScanner: 0,
        colonyShip: 0,
        aiCoreFabricator: 0,
      },
      missions: [],
      derelicts: [],
      stats: {
        totalDebrisCollected: 0,
        totalMetalProduced: 0,
        totalElectronicsGained: 0,
        totalFuelSynthesized: 0,
        totalClicks: 0,
        totalShipsPurchased: 0,
        totalMissionsLaunched: 0,
        totalMissionsSucceeded: 0,
        totalMissionsFailed: 0,
        totalDerelictsDiscovered: 0,
        totalDerelictsSalvaged: 0,
        derelictsByRarity: {},
        orbitsUnlocked: ['leo'],
        coloniesEstablished: 0,
        techsPurchased: 0,
        prestigeCount: 0,
        totalPlayTime: 0,
        totalIdleTime: 0,
        currentRunTime: 0,
        totalTravels: 0,
        totalFuelSpent: 0,
        totalTravelTime: 0,
        farthestOrbit: 'leo',
        travelHistory: [],
        missionHistory: [],
      },
      ui: {
        activeTab: 'fleet',
        activeView: 'dashboard',
        openModal: null,
        notifications: [],
        eventLog: [],
        settings: {
            soundEnabled: true,
            musicEnabled: true,
            soundVolume: 0.7,
            musicVolume: 0.4,
            autoSave: true,
            autoSaveInterval: 20000,
            showAnimations: true,
            compactMode: false,
        },
        activeTooltip: null,
      }
    });
  });

  it('should limit concurrent scout missions to 3', () => {
    const store = useGameStore.getState();
    
    // Start 3 missions
    expect(store.startScoutMission('scoutProbe', 'leo')).toBe(true);
    expect(store.startScoutMission('scoutProbe', 'leo')).toBe(true);
    expect(store.startScoutMission('scoutProbe', 'leo')).toBe(true);
    
    expect(useGameStore.getState().missions.length).toBe(3);

    // Try 4th
    expect(store.startScoutMission('scoutProbe', 'leo')).toBe(false);
    expect(useGameStore.getState().missions.length).toBe(3);
  });

  it('should limit active derelicts to 6', () => {
    const store = useGameStore.getState();
    
    // Mock random to ensure we always roll 'common' (0) which guarantees a spawn in LEO
    // LEO has 70% common, so 0 is safe.
    // Also used for drop chance (0 < 1.0)
    vi.spyOn(Math, 'random').mockReturnValue(0);

    // Spawn 6 derelicts
    for (let i = 0; i < 6; i++) {
        const d = store.spawnDerelict('leo');
        if (!d) console.log(`Failed to spawn derelict ${i+1}`);
    }
    const countAfter6 = useGameStore.getState().derelicts.length;
    console.log(`Derelicts after 6 spawns: ${countAfter6}`);
    expect(countAfter6).toBe(6);

    // Try 7th
    const d7 = store.spawnDerelict('leo');
    console.log(`7th spawn result: ${d7 ? 'success' : 'null'}`);
    
    const countAfter7 = useGameStore.getState().derelicts.length;
    console.log(`Derelicts after 7th spawn: ${countAfter7}`);
    expect(countAfter7).toBe(6);
  });
});
