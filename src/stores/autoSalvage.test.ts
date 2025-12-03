import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGameStore } from './gameStore';

describe('Auto-Salvage Debugging', () => {
  beforeEach(() => {
    useGameStore.getState().hardReset();
    vi.useFakeTimers();
  });

  it('should NOT auto-salvage in uncolonized orbit', () => {
    const state = useGameStore.getState();
    
    // Setup:
    // 1. Unlock Auto-Salvage
    useGameStore.setState(s => ({
        techTree: { ...s.techTree, purchased: [...s.techTree.purchased, 'auto_salvage'] },
        ui: { ...s.ui, automationSettings: { ...s.ui.automationSettings, autoSalvageEnabled: true } },
        ships: { ...s.ships, salvageFrigate: 1 },
        currentOrbit: 'leo'
    }));
    
    // 2. Spawn Common Derelict in LEO
    const derelict = {
        id: 'd1',
        type: 'wreckage',
        rarity: 'common',
        orbit: 'leo',
        discoveredAt: Date.now(),
        expiresAt: Date.now() + 100000,
        requiredShip: 'salvageFrigate',
        fuelCost: 0,
        baseMissionTime: 1000,
        isHazardous: false,
        riskLevel: 0,
        rewards: []
    };
    
    useGameStore.setState(_s => ({
        derelicts: [derelict as any]
    }));
    
    // 3. Run automation
    state.processAutomation();
    
    // 4. Expect NO mission
    expect(useGameStore.getState().missions.length).toBe(0);
  });

  it('should auto-salvage in colonized orbit', () => {
    const state = useGameStore.getState();
    
    // Setup:
    // 1. Unlock Auto-Salvage
    useGameStore.setState(s => ({
        techTree: { ...s.techTree, purchased: [...s.techTree.purchased, 'auto_salvage'] },
        ui: { ...s.ui, automationSettings: { ...s.ui.automationSettings, autoSalvageEnabled: true } },
        ships: { ...s.ships, salvageFrigate: 1 },
        currentOrbit: 'leo'
    }));
    
    // 2. Add Colony to LEO
    useGameStore.setState(_s => ({
        colonies: [{
            id: 'c1',
            orbit: 'leo',
            establishedAt: Date.now(),
            level: 1,
            productionBonus: 0.25,
            autoSalvage: true // Even though logic ignores this currently
        }]
    }));
    
    // 3. Spawn Common Derelict in LEO
    const derelict = {
        id: 'd1',
        type: 'wreckage',
        rarity: 'common',
        orbit: 'leo',
        discoveredAt: Date.now(),
        expiresAt: Date.now() + 100000,
        requiredShip: 'salvageFrigate',
        fuelCost: 0,
        baseMissionTime: 1000,
        isHazardous: false,
        riskLevel: 0,
        rewards: []
    };
    
    useGameStore.setState(_s => ({
        derelicts: [derelict as any]
    }));
    
    // 4. Run automation
    state.processAutomation();
    
    // 5. Expect Mission
    expect(useGameStore.getState().missions.length).toBe(1);
    expect(useGameStore.getState().missions[0].targetDerelict).toBe('d1');
  });

  it('should support dual missions with fleet_coordination', () => {
    const state = useGameStore.getState();
    
    // Setup:
    // 1. Unlock Auto-Salvage AND Fleet Coordination
    useGameStore.setState(s => ({
        techTree: { ...s.techTree, purchased: [...s.techTree.purchased, 'auto_salvage', 'fleet_coordination'] },
        ui: { ...s.ui, automationSettings: { ...s.ui.automationSettings, autoSalvageEnabled: true } },
        ships: { ...s.ships, salvageFrigate: 1 },
        colonies: [{ id: 'c1', orbit: 'leo', establishedAt: 0, level: 1, productionBonus: 0, autoSalvage: true }]
    }));
    
    // 2. Spawn 2 Common Derelicts in LEO
    const d1 = {
        id: 'd1', type: 'wreckage', rarity: 'common', orbit: 'leo',
        discoveredAt: Date.now(), expiresAt: Date.now() + 100000,
        requiredShip: 'salvageFrigate', fuelCost: 0, baseMissionTime: 1000,
        isHazardous: false, riskLevel: 0, rewards: []
    };
    const d2 = { ...d1, id: 'd2' };
    
    useGameStore.setState(_s => ({
        derelicts: [d1 as any, d2 as any]
    }));
    
    // 3. Run automation
    state.processAutomation();
    
    // 4. Expect 2 Missions (1 ship, 2 slots)
    // Currently this should FAIL because startSalvageMission blocks it
    expect(useGameStore.getState().missions.length).toBe(2);
  });
});
