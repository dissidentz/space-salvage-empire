import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGameStore } from '../stores/gameStore';

// Mock zustand persist to avoid localStorage issues in tests
vi.mock('zustand/middleware', () => ({
  persist: vi.fn(config => config),
}));

describe('Travel State Persistence', () => {
  beforeEach(() => {
    // Reset store state
    useGameStore.setState({
      travelState: null,
      currentOrbit: 'leo',
      resources: {
        debris: 0,
        metal: 0,
        electronics: 0,
        fuel: 1000,
        rareMaterials: 0,
        exoticAlloys: 0,
        aiCores: 0,
        dataFragments: 0,
        darkMatter: 0,
      },
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
    });
  });

  it('should persist travel state in exportSave', () => {
    // Manually set travel state
    useGameStore.setState({
      travelState: {
        traveling: true,
        destination: 'geo',
        startTime: Date.now(),
        endTime: Date.now() + 30000,
        progress: 0,
      },
    });

    const saveData = useGameStore.getState().exportSave();
    const parsed = JSON.parse(saveData);

    expect(parsed.travelState).toBeDefined();
    expect(parsed.travelState.traveling).toBe(true);
    expect(parsed.travelState.destination).toBe('geo');
  });

  it('should handle offline travel completion', () => {
    // Set up initial state with travel in progress
    const now = Date.now();
    useGameStore.setState({
      travelState: {
        traveling: true,
        destination: 'geo',
        startTime: now,
        endTime: now + 30000, // 30 seconds travel time
        progress: 0,
      },
      currentOrbit: 'leo',
      stats: {
        ...useGameStore.getState().stats,
        orbitsUnlocked: ['leo'],
        travelHistory: [
          {
            id: 'test_travel',
            origin: 'leo',
            destination: 'geo',
            startTime: now,
            endTime: now + 30000,
            fuelCost: 10,
            actualTravelTime: 0,
            completed: false,
            cancelled: false,
          },
        ],
      },
    });

    // Simulate offline time (travel time + some buffer)
    const offlineTime = 60000; // 1 minute
    const saveData = useGameStore.getState().exportSave();
    const parsedSave = JSON.parse(saveData);
    const mockSaveData = {
      ...parsedSave,
      lastSaveTime: Date.now() - offlineTime,
    };

    // Import save (simulating loading after offline period)
    const success = useGameStore
      .getState()
      .importSave(JSON.stringify(mockSaveData));

    expect(success).toBe(true);

    // Travel should be completed
    const newState = useGameStore.getState();
    expect(newState.travelState).toBeNull();
    expect(newState.currentOrbit).toBe('geo');
    expect(newState.stats.totalTravels).toBe(1);
  });

  it('should handle partial offline travel progress', () => {
    // Set up initial state with travel in progress
    const now = Date.now();
    useGameStore.setState({
      travelState: {
        traveling: true,
        destination: 'geo',
        startTime: now,
        endTime: now + 30000, // 30 seconds travel time
        progress: 0,
      },
    });

    // Simulate partial offline time (half the travel time)
    const offlineTime = 15000; // 15 seconds
    const saveData = useGameStore.getState().exportSave();
    const parsedSave = JSON.parse(saveData);
    const mockSaveData = {
      ...parsedSave,
      lastSaveTime: Date.now() - offlineTime,
    };

    // Import save
    const success = useGameStore
      .getState()
      .importSave(JSON.stringify(mockSaveData));

    expect(success).toBe(true);

    // Travel should still be in progress
    const newState = useGameStore.getState();
    expect(newState.travelState).toBeDefined();
    expect(newState.travelState?.traveling).toBe(true);
    expect(newState.travelState?.progress).toBeGreaterThan(0);
    expect(newState.travelState?.progress).toBeLessThan(1);
  });

  it('should cap offline time at 4 hours', () => {
    // Set up initial state with travel in progress
    const now = Date.now();
    useGameStore.setState({
      travelState: {
        traveling: true,
        destination: 'geo',
        startTime: now,
        endTime: now + 30000, // 30 seconds travel time
        progress: 0,
      },
      currentOrbit: 'leo',
      stats: {
        ...useGameStore.getState().stats,
        orbitsUnlocked: ['leo'],
        travelHistory: [
          {
            id: 'test_travel',
            origin: 'leo',
            destination: 'geo',
            startTime: now,
            endTime: now + 30000,
            fuelCost: 10,
            actualTravelTime: 0,
            completed: false,
            cancelled: false,
          },
        ],
      },
    });

    // Simulate very long offline time (5 hours)
    const offlineTime = 5 * 60 * 60 * 1000; // 5 hours
    const saveData = useGameStore.getState().exportSave();
    const parsedSave = JSON.parse(saveData);
    const mockSaveData = {
      ...parsedSave,
      lastSaveTime: Date.now() - offlineTime,
    };

    // Import save
    const success = useGameStore
      .getState()
      .importSave(JSON.stringify(mockSaveData));

    expect(success).toBe(true);

    // Travel should be completed (since 4 hours > travel time)
    const newState = useGameStore.getState();
    expect(newState.travelState).toBeNull();
    expect(newState.currentOrbit).toBe('geo');
  });

  it('should migrate saves without travelState', () => {
    const store = useGameStore.getState();

    // Create a save without travelState (old format)
    const oldSaveData = {
      version: '1.0.0',
      lastSaveTime: Date.now(),
      totalPlayTime: 0,
      currentRun: 1,
      currentOrbit: 'leo',
      resources: {
        debris: 1000,
        metal: 500,
        electronics: 100,
        fuel: 1000,
        rareMaterials: 0,
        exoticAlloys: 0,
        aiCores: 0,
        dataFragments: 0,
        darkMatter: 0,
      },
      ships: {
        salvageDrone: 10,
        refineryBarge: 3,
        electronicsExtractor: 0,
        fuelSynthesizer: 0,
        matterExtractor: 0,
        quantumMiner: 0,
        scoutProbe: 0,
        salvageFrigate: 0,
        heavySalvageFrigate: 0,
        deepSpaceScanner: 0,
        colonyShip: 0,
      },
      shipEnabled: {
        salvageDrone: true,
        refineryBarge: true,
        electronicsExtractor: true,
        fuelSynthesizer: true,
        matterExtractor: true,
        quantumMiner: true,
        scoutProbe: true,
        salvageFrigate: true,
        heavySalvageFrigate: true,
        deepSpaceScanner: true,
        colonyShip: true,
      },
      shipUpgrades: {},
      techTree: { purchased: [], available: [] },
      upgrades: {},
      milestones: {},
      prestige: {
        darkMatter: 0,
        totalDarkMatter: 0,
        purchasedPerks: [],
        arkComponents: {},
        arkUnlocked: false,
        arkComplete: false,
        totalRuns: 0,
        fastestRun: 0,
        highestOrbit: 'leo',
      },
      stats: {
        totalDebrisCollected: 1000,
        totalMetalProduced: 500,
        totalElectronicsGained: 100,
        totalFuelSynthesized: 0,
        totalClicks: 0,
        totalShipsPurchased: 13,
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
      },
      ui: {
        activeTab: 'fleet',
        activeView: 'dashboard',
        openModal: null,
        modalData: undefined,
        notifications: [],
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
      },
      activeFormation: null,
      formationCooldownEnd: 0,
      // Note: No travelState field - this is the old format
    };

    // Import the old save
    const success = store.importSave(JSON.stringify(oldSaveData));

    expect(success).toBe(true);

    // Check that travelState was added and set to null
    const newState = useGameStore.getState();
    expect(newState.travelState).toBeNull();
  });
});
