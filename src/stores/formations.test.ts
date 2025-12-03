import { calculateProductionRates } from '@/engine/production';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGameStore } from './gameStore';

describe('Fleet Formations System', () => {
  beforeEach(() => {
    useGameStore.getState().hardReset();
    // Mock Date.now
    vi.useFakeTimers();
  });

  it('should be locked initially', () => {
    const state = useGameStore.getState();
    expect(state.techTree.purchased).not.toContain('fleet_management');
    
    // Try to set formation without tech
    const success = state.setFormation('miningFleet');
    expect(success).toBe(false);
    expect(state.activeFormation).toBeNull();
  });

  it('should unlock with tech', () => {
    const state = useGameStore.getState();
    
    // Grant tech
    useGameStore.setState(s => ({
        techTree: { ...s.techTree, purchased: [...s.techTree.purchased, 'fleet_management'] }
    }));
    
    // Should now be able to set formation IF requirements met
    // But we have no ships, so it should still fail
    const success = state.setFormation('miningFleet');
    expect(success).toBe(false); // No ships
  });

  it('should activate when requirements are met', () => {
    const state = useGameStore.getState();
    
    // Grant tech
    useGameStore.setState(s => ({
        techTree: { ...s.techTree, purchased: [...s.techTree.purchased, 'fleet_management'] }
    }));
    
    // Grant ships for Mining Fleet (10 Refinery Barges)
    useGameStore.setState(s => ({
        ships: { ...s.ships, refineryBarge: 10 }
    }));
    
    const success = state.setFormation('miningFleet');
    expect(success).toBe(true);
    expect(useGameStore.getState().activeFormation).toBe('miningFleet');
  });

  it('should apply cooldown after activation', () => {
    const state = useGameStore.getState();
    
    // Setup
    useGameStore.setState(s => ({
        techTree: { ...s.techTree, purchased: [...s.techTree.purchased, 'fleet_management'] },
        ships: { ...s.ships, refineryBarge: 10, scoutProbe: 5 }
    }));
    
    // Activate Mining Fleet
    state.setFormation('miningFleet');
    expect(useGameStore.getState().activeFormation).toBe('miningFleet');
    
    // Try to switch immediately
    const success = state.setFormation('scoutFleet');
    expect(success).toBe(false); // Cooldown active
    expect(useGameStore.getState().activeFormation).toBe('miningFleet');
    
    // Advance time past cooldown (5 mins)
    vi.advanceTimersByTime(5 * 60 * 1000 + 100);
    
    // Try switch again
    const success2 = state.setFormation('scoutFleet');
    expect(success2).toBe(true);
    expect(useGameStore.getState().activeFormation).toBe('scoutFleet');
  });

  it('should apply production bonuses', () => {
    // const state = useGameStore.getState();
    
    // Setup Mining Fleet (+25% Metal/Rare)
    useGameStore.setState(s => ({
        techTree: { ...s.techTree, purchased: [...s.techTree.purchased, 'fleet_management'] },
        ships: { ...s.ships, refineryBarge: 10 },
        activeFormation: 'miningFleet'
    }));
    
    // Calculate rates
    // We need some production happening. Refinery Barge produces Metal from Debris.
    // Base production is 2/sec. 10 ships = 20/sec.
    // With +25% bonus = 25/sec.
    // Need debris input.
    useGameStore.setState(s => ({
        resources: { ...s.resources, debris: 1000 }
    }));
    
    const rates = calculateProductionRates(useGameStore.getState());
    
    // Base: 10 * 2 = 20
    // Multiplier: 1.25
    // Expected: 25
    expect(rates.metal).toBe(25);
  });

  it('should apply travel cost reduction (Expedition Fleet)', () => {
    const state = useGameStore.getState();
    
    // Setup Expedition Fleet (-20% Fuel Cost)
    useGameStore.setState(s => ({
        techTree: { ...s.techTree, purchased: [...s.techTree.purchased, 'fleet_management'] },
        ships: { ...s.ships, fuelSynthesizer: 1, deepSpaceScanner: 1 },
        activeFormation: 'expeditionFleet',
        resources: { ...s.resources, fuel: 1000, metal: 1000 },
        currentOrbit: 'leo',
        stats: { ...s.stats, orbitsUnlocked: ['leo', 'geo', 'lunar'] }
    }));
    
    // Travel to Lunar (Cost 300)
    // Expected cost: 300 * 0.8 = 240
    const success = state.travelToOrbit('lunar');
    expect(success).toBe(true);
    
    expect(useGameStore.getState().resources.fuel).toBe(1000 - 240);
  });
});
