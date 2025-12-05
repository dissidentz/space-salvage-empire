import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGameStore } from './gameStore';

// Mock zustand persist
vi.mock('zustand/middleware', () => ({
  persist: vi.fn(config => config),
}));

describe('Automation Logic', () => {
  beforeEach(() => {
    useGameStore.setState({
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
      ships: {
        salvageDrone: 0,
        refineryBarge: 0,
        electronicsExtractor: 0,
        fuelSynthesizer: 0,
        matterExtractor: 0,
        quantumMiner: 0,
        scoutProbe: 0,
        salvageFrigate: 5,
        heavySalvageFrigate: 2,
        deepSpaceScanner: 0,
        colonyShip: 0,
        aiCoreFabricator: 0,
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
        aiCoreFabricator: true,
      },
      missions: [],
      derelicts: [],
      colonies: [
        {
          id: 'colony1',
          orbit: 'leo',
          establishedAt: Date.now(),
          level: 1,
          productionBonus: 0.25,
          autoSalvage: true,
        },
      ],
      techTree: {
        purchased: ['auto_salvage'],
        available: [],
      },
      ui: {
        activeView: 'dashboard',
        activeTab: 'fleet',
        openModal: null,
        modalData: undefined,
        notifications: [],
        settings: {
          soundEnabled: true,
          musicEnabled: true,
          soundVolume: 0.5,
          musicVolume: 0.5,
          autoSave: true,
          autoSaveInterval: 60000,
          showAnimations: true,
          compactMode: false,
        },
        activeTooltip: null,
        eventLog: [],
        automationSettings: {
          autoScoutEnabled: true,
          autoSalvageEnabled: true,
          autoScoutTargetLimit: 5,
        },
        afkSummary: null,
      },
    });
  });

  it('should auto-salvage common derelicts with Salvage Frigate', () => {
    // Add a common derelict in LEO (colonized)
    useGameStore.setState({
      derelicts: [
        {
          id: 'd1',
          type: 'cargoContainer',
          orbit: 'leo',
          rarity: 'common',
          rewards: [],
          fuelCost: 10,
          baseMissionTime: 1000,
          expiresAt: Date.now() + 10000,
          discoveredAt: Date.now(),
          requiredShip: 'salvageFrigate',
          isHazardous: false,
          riskLevel: 0,
        },
      ],
    });

    useGameStore.getState().processAutomation();

    const state = useGameStore.getState();
    expect(state.missions.length).toBe(1);
    expect(state.missions[0].shipType).toBe('salvageFrigate');
    expect(state.missions[0].targetDerelict).toBe('d1');
  });

  it('should auto-salvage rare derelicts with Heavy Salvage Frigate', () => {
    // Add a rare derelict in LEO (colonized) that requires Heavy Salvage Frigate
    useGameStore.setState({
      derelicts: [
        {
          id: 'd2',
          type: 'ancientProbe',
          orbit: 'leo',
          rarity: 'rare',
          rewards: [],
          fuelCost: 50,
          baseMissionTime: 1000,
          expiresAt: Date.now() + 10000,
          discoveredAt: Date.now(),
          requiredShip: 'heavySalvageFrigate',
          isHazardous: true,
          riskLevel: 0.5,
        },
      ],
    });

    useGameStore.getState().processAutomation();

    const state = useGameStore.getState();
    expect(state.missions.length).toBe(1);
    expect(state.missions[0].shipType).toBe('heavySalvageFrigate');
    expect(state.missions[0].targetDerelict).toBe('d2');
  });

  it('should not auto-salvage if required ship is missing', () => {
    // Set Heavy Salvage Frigates to 0
    useGameStore.setState({
      ships: {
        ...useGameStore.getState().ships,
        heavySalvageFrigate: 0,
      },
      derelicts: [
        {
          id: 'd3',
          type: 'ancientProbe',
          orbit: 'leo',
          rarity: 'rare',
          rewards: [],
          fuelCost: 50,
          baseMissionTime: 1000,
          expiresAt: Date.now() + 10000,
          discoveredAt: Date.now(),
          requiredShip: 'heavySalvageFrigate',
          isHazardous: true,
          riskLevel: 0.5,
        },
      ],
    });

    useGameStore.getState().processAutomation();

    const state = useGameStore.getState();
    expect(state.missions.length).toBe(0);
  });

  it('should not auto-salvage in uncolonized orbits', () => {
    // Add a derelict in GEO (uncolonized)
    useGameStore.setState({
      derelicts: [
        {
          id: 'd4',
          type: 'cargoContainer',
          orbit: 'geo',
          rarity: 'common',
          rewards: [],
          fuelCost: 10,
          baseMissionTime: 1000,
          expiresAt: Date.now() + 10000,
          discoveredAt: Date.now(),
          requiredShip: 'salvageFrigate',
          isHazardous: false,
          riskLevel: 0,
        },
      ],
    });

    useGameStore.getState().processAutomation();

    const state = useGameStore.getState();
    expect(state.missions.length).toBe(0);
  });

  it('should NOT auto-scout when derelict count >= target limit', () => {
    // Setup: auto_scout tech purchased, scout probes available, but already at target limit
    useGameStore.setState({
      techTree: {
        purchased: ['auto_scout'],
        available: [],
      },
      ships: {
        ...useGameStore.getState().ships,
        scoutProbe: 5,
      },
      stats: {
        ...useGameStore.getState().stats,
        orbitsUnlocked: ['leo', 'geo', 'lunar'],
      },
      ui: {
        ...useGameStore.getState().ui,
        automationSettings: {
          autoScoutEnabled: true,
          autoSalvageEnabled: false,
          autoScoutTargetLimit: 3, // Target is 3
        },
      },
      derelicts: [
        // Already have 3 derelicts (at limit)
        { id: 'd1', type: 'cargoContainer', orbit: 'leo', rarity: 'common', rewards: [], fuelCost: 10, baseMissionTime: 1000, expiresAt: Date.now() + 10000, discoveredAt: Date.now(), requiredShip: 'salvageFrigate', isHazardous: false, riskLevel: 0 },
        { id: 'd2', type: 'cargoContainer', orbit: 'geo', rarity: 'common', rewards: [], fuelCost: 10, baseMissionTime: 1000, expiresAt: Date.now() + 10000, discoveredAt: Date.now(), requiredShip: 'salvageFrigate', isHazardous: false, riskLevel: 0 },
        { id: 'd3', type: 'cargoContainer', orbit: 'lunar', rarity: 'common', rewards: [], fuelCost: 10, baseMissionTime: 1000, expiresAt: Date.now() + 10000, discoveredAt: Date.now(), requiredShip: 'salvageFrigate', isHazardous: false, riskLevel: 0 },
      ],
      missions: [],
    });

    useGameStore.getState().processAutomation();

    const state = useGameStore.getState();
    // Should NOT have launched any scout missions
    const scoutMissions = state.missions.filter(m => m.type === 'scout');
    expect(scoutMissions.length).toBe(0);
  });

  it('should auto-scout when derelict count < target limit', () => {
    // Setup: auto_scout tech purchased, scout probes available, below target limit
    useGameStore.setState({
      techTree: {
        purchased: ['auto_scout'],
        available: [],
      },
      ships: {
        ...useGameStore.getState().ships,
        scoutProbe: 5,
      },
      stats: {
        ...useGameStore.getState().stats,
        orbitsUnlocked: ['leo', 'geo', 'lunar'],
      },
      currentOrbit: 'leo',
      ui: {
        ...useGameStore.getState().ui,
        automationSettings: {
          autoScoutEnabled: true,
          autoSalvageEnabled: false,
          autoScoutTargetLimit: 5, // Target is 5
        },
      },
      derelicts: [
        // Only 2 derelicts (below limit of 5)
        { id: 'd1', type: 'cargoContainer', orbit: 'leo', rarity: 'common', rewards: [], fuelCost: 10, baseMissionTime: 1000, expiresAt: Date.now() + 10000, discoveredAt: Date.now(), requiredShip: 'salvageFrigate', isHazardous: false, riskLevel: 0 },
        { id: 'd2', type: 'cargoContainer', orbit: 'geo', rarity: 'common', rewards: [], fuelCost: 10, baseMissionTime: 1000, expiresAt: Date.now() + 10000, discoveredAt: Date.now(), requiredShip: 'salvageFrigate', isHazardous: false, riskLevel: 0 },
      ],
      missions: [],
    });

    useGameStore.getState().processAutomation();

    const state = useGameStore.getState();
    // Should have launched a scout mission
    const scoutMissions = state.missions.filter(m => m.type === 'scout');
    expect(scoutMissions.length).toBe(1);
  });
});
