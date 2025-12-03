import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGameStore } from './gameStore';

// Mock zustand persist
vi.mock('zustand/middleware', () => ({
  persist: vi.fn(config => config),
}));

describe('Mission System', () => {
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

  it('should start a scout mission', () => {
    const store = useGameStore.getState();
    const success = store.startScoutMission('scoutProbe', 'leo');

    const updatedStore = useGameStore.getState();
    expect(success).toBe(true);
    expect(updatedStore.missions.length).toBe(1);
    expect(updatedStore.missions[0].type).toBe('scout');
    expect(updatedStore.resources.fuel).toBe(1000); // LEO missions cost 0 fuel
  });

  it('should fail to start scout mission without fuel', () => {
    useGameStore.setState({ resources: { ...useGameStore.getState().resources, fuel: 0 } });
    const store = useGameStore.getState();
    const success = store.startScoutMission('scoutProbe', 'lunar'); // lunar requires fuel, LEO doesn't

    const updatedStore = useGameStore.getState();
    expect(success).toBe(false);
    expect(updatedStore.missions.length).toBe(0);
  });

  it('should complete a scout mission and discover a derelict', () => {
    const store = useGameStore.getState();
    store.startScoutMission('scoutProbe', 'leo');
    
    const midStore = useGameStore.getState();
    const mission = midStore.missions[0];

    // Fast forward time
    vi.setSystemTime(mission.endTime + 1000);
    
    // Force success for testing
    vi.spyOn(Math, 'random').mockReturnValue(0.1); // Low value < successRate (0.15)

    store.completeMissionIfReady(mission.id);

    const finalStore = useGameStore.getState();
    expect(finalStore.missions.length).toBe(0);
    expect(finalStore.derelicts.length).toBe(1);
    expect(finalStore.stats.totalMissionsSucceeded).toBe(1);
  });

  it('should start a salvage mission', () => {
    const store = useGameStore.getState();
    // Add a dummy derelict
    const derelict = {
        id: 'test-derelict',
        type: 'weatherSatellite',
        rarity: 'common',
        orbit: 'leo',
        discoveredAt: Date.now(),
        expiresAt: Date.now() + 100000,
        requiredShip: 'salvageFrigate',
        fuelCost: 100,
        baseMissionTime: 1000,
        isHazardous: false,
        riskLevel: 0,
        rewards: [],
    };
    useGameStore.setState({ derelicts: [derelict as any] });

    const success = store.startSalvageMission('test-derelict', 'salvageFrigate', 'salvage');

    const updatedStore = useGameStore.getState();
    expect(success).toBe(true);
    expect(updatedStore.missions.length).toBe(1);
    expect(updatedStore.missions[0].type).toBe('salvage');
    expect(updatedStore.resources.fuel).toBe(1000); // LEO salvage missions cost 0 fuel
  });

  it('should cancel a mission and refund fuel', () => {
    const store = useGameStore.getState();
    store.startScoutMission('scoutProbe', 'leo');
    
    const midStore = useGameStore.getState();
    const missionId = midStore.missions[0].id;

    const success = store.cancelMission(missionId);

    const finalStore = useGameStore.getState();
    expect(success).toBe(true);
    expect(finalStore.missions.length).toBe(0);
    expect(finalStore.resources.fuel).toBe(1000); // 1000 + 0 (50% refund of 0)
  });
  it('should complete multiple missions in a single batch', () => {
    const now = Date.now();
    const mission1 = {
      id: 'm1',
      type: 'scout',
      shipType: 'scoutProbe',
      targetOrbit: 'leo',
      startTime: now - 10000,
      endTime: now - 1000, // Completed
      status: 'inProgress',
      action: 'scout',
    };
    const mission2 = {
      id: 'm2',
      type: 'scout',
      shipType: 'scoutProbe',
      targetOrbit: 'leo',
      startTime: now - 10000,
      endTime: now - 1000, // Completed
      status: 'inProgress',
      action: 'scout',
    };
    const mission3 = {
      id: 'm3',
      type: 'scout',
      shipType: 'scoutProbe',
      targetOrbit: 'leo',
      startTime: now,
      endTime: now + 10000, // Not completed
      status: 'inProgress',
      action: 'scout',
    };

    useGameStore.setState({
      missions: [mission1, mission2, mission3] as any,
    });

    const store = useGameStore.getState();
    store.completeAllReadyMissions(['m1', 'm2']);

    const updatedState = useGameStore.getState();
    
    // m1 and m2 should be removed
    expect(updatedState.missions.find(m => m.id === 'm1')).toBeUndefined();
    expect(updatedState.missions.find(m => m.id === 'm2')).toBeUndefined();
    
    // m3 should remain
    expect(updatedState.missions.find(m => m.id === 'm3')).toBeDefined();

    // Stats should update
    expect(updatedState.stats.totalMissionsSucceeded + updatedState.stats.totalMissionsFailed).toBe(2);
  });
});
