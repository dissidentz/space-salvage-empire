
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useGameStore } from '../stores/gameStore';
import { useGameLoop } from './useGameLoop';

// Mock zustand persist
vi.mock('zustand/middleware', () => ({
  persist: vi.fn(config => config),
}));

describe('useGameLoop Offline Check', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Reset store minimal state
    useGameStore.setState({
        lastSaveTime: Date.now(),
        processOfflineGains: vi.fn(),
        resources: { debris: 0, metal: 0, electronics: 0, fuel: 0, rareMaterials: 0, exoticAlloys: 0, aiCores: 0, dataFragments: 0, darkMatter: 0, alienArtifacts: 0 },
        stats: { totalDebrisCollected: 0 },
        ships: {},
        shipEnabled: {},
        techTree: { purchased: [] },
        missions: [],
        derelicts: [],
        completeTravelIfReady: vi.fn(),
        completeAllReadyMissions: vi.fn(),
        removeDerelict: vi.fn(),
        checkAndClaimMilestones: vi.fn(),
        getProductionRates: () => ({}),
        updateComputedRates: vi.fn(),
        processAutomation: vi.fn(),
        spawnDerelict: vi.fn(),
    } as any);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should trigger offline gains on mount if offline for > 5s', () => {
    const now = Date.now();
    const tenSecondsAgo = now - 10000;
    
    const processSpy = vi.fn();
    useGameStore.setState({
        lastSaveTime: tenSecondsAgo,
        processOfflineGains: processSpy,
    });

    renderHook(() => useGameLoop());

    expect(processSpy).toHaveBeenCalledWith(10000);
  });

  it('should NOT trigger offline gains if offline for < 5s', () => {
    const now = Date.now();
    const twoSecondsAgo = now - 2000;
    
    const processSpy = vi.fn();
    useGameStore.setState({
        lastSaveTime: twoSecondsAgo,
        processOfflineGains: processSpy,
    });

    renderHook(() => useGameLoop());

    expect(processSpy).not.toHaveBeenCalled();
  });
  
  it('should cap offline time at 4 hours', () => {
    const now = Date.now();
    const fiveHoursAgo = now - (5 * 60 * 60 * 1000);
    
    const processSpy = vi.fn();
    useGameStore.setState({
        lastSaveTime: fiveHoursAgo,
        processOfflineGains: processSpy,
    });

    renderHook(() => useGameLoop());

    const maxOffline = 4 * 60 * 60 * 1000;
    expect(processSpy).toHaveBeenCalledWith(maxOffline);
  });
});
