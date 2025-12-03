import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGameStore } from './gameStore';

// Mock zustand persist
vi.mock('zustand/middleware', () => ({
  persist: vi.fn(config => config),
}));

describe('Bug Reproduction: Scout Mission Accumulation', () => {
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
        scoutProbe: 1,
        salvageFrigate: 1,
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

  it('should remove scout mission after completion in game loop simulation', () => {
    const store = useGameStore.getState();
    
    // 1. Start Scout Mission
    store.startScoutMission('scoutProbe', 'leo');
    expect(useGameStore.getState().missions.length).toBe(1);
    const missionId = useGameStore.getState().missions[0].id;

    // 2. Fast forward time past mission end
    const mission = useGameStore.getState().missions[0];
    vi.setSystemTime(mission.endTime + 1000);

    // 3. Simulate Game Loop Tick
    const state = useGameStore.getState();
    const now = Date.now();
    
    // Simulate resource update (like useGameLoop)
    useGameStore.setState(s => ({
        resources: { ...s.resources, debris: s.resources.debris + 1 }
    }));

    // Check for completed missions (logic from useGameLoop)
    const completedMissionIds = state.missions
        .filter(m => m.status === 'inProgress' && now >= m.endTime)
        .map(m => m.id);
    
    expect(completedMissionIds).toContain(missionId);

    // Process completed missions
    if (completedMissionIds.length > 0) {
        state.completeAllReadyMissions(completedMissionIds);
    }

    // 4. Verify Mission is Removed
    const finalState = useGameStore.getState();
    expect(finalState.missions.length).toBe(0);
    expect(finalState.missions.find(m => m.id === missionId)).toBeUndefined();
  });

  it('should remove mission even if processing throws an error', () => {
    const store = useGameStore.getState();
    
    // 1. Start Scout Mission
    store.startScoutMission('scoutProbe', 'leo');
    const missionId = useGameStore.getState().missions[0].id;

    // 2. Fast forward time
    const mission = useGameStore.getState().missions[0];
    vi.setSystemTime(mission.endTime + 1000);

    // 3. Mock SHIP_CONFIGS to throw error
    // We can't easily mock the imported constant directly in this test setup without more complex mocking
    // Instead, we'll rely on the fact that we modified the store to catch errors.
    // We can simulate an error by corrupting the mission data in the store temporarily so it throws when accessed
    
    const state = useGameStore.getState();
    // Corrupt shipType to cause lookup error
    state.missions[0].shipType = 'invalid_ship' as any;

    // 4. Run completion logic
    state.completeAllReadyMissions([missionId]);

    // 5. Verify Mission is Removed
    const finalState = useGameStore.getState();
    expect(finalState.missions.length).toBe(0);
    expect(finalState.missions.find(m => m.id === missionId)).toBeUndefined();
    expect(finalState.stats.totalMissionsFailed).toBe(1); // Should count as failed
  });
});
