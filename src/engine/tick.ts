// Game tick engine for Space Salvage Empire
// Runs at 10 ticks per second using requestAnimationFrame

import { AUTO_SAVE_INTERVAL, TICK_INTERVAL } from '@/config/constants';
import type { GameState } from '@/types';
import { calculateTickProduction } from './production';

export class TickEngine {
  private rafId: number | null = null;
  private lastTickTime = 0;
  private lastSaveTime = 0;
  private tickCount = 0;
  private isRunning = false;

  private readonly onTick: (deltas: Partial<Record<string, number>>) => void;
  private readonly onSave: () => void;
  private readonly getState: () => GameState;

  constructor(
    onTick: (deltas: Partial<Record<string, number>>) => void,
    onSave: () => void,
    getState: () => GameState
  ) {
    this.onTick = onTick;
    this.onSave = onSave;
    this.getState = getState;
  }

  /**
   * Start the game loop
   */
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastTickTime = performance.now();
    this.lastSaveTime = Date.now();
    this.tick();
  }

  /**
   * Stop the game loop
   */
  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * Main tick function - called by requestAnimationFrame
   */
  private tick = (): void => {
    if (!this.isRunning) return;

    const now = performance.now();
    const elapsed = now - this.lastTickTime;

    // Only tick if enough time has passed (100ms = 10 ticks/sec)
    if (elapsed >= TICK_INTERVAL) {
      this.lastTickTime = now;
      this.tickCount++;

      // Calculate production for this tick
      const state = this.getState();
      const deltas = calculateTickProduction(state);

      // Apply deltas to resources
      this.onTick(deltas);

      // Auto-save check (every 20 seconds)
      const timeSinceLastSave = Date.now() - this.lastSaveTime;
      if (timeSinceLastSave >= AUTO_SAVE_INTERVAL) {
        this.onSave();
        this.lastSaveTime = Date.now();
      }
    }

    // Schedule next tick
    this.rafId = requestAnimationFrame(this.tick);
  };

  /**
   * Get current tick count (for debugging)
   */
  getTickCount(): number {
    return this.tickCount;
  }

  /**
   * Check if engine is running
   */
  isActive(): boolean {
    return this.isRunning;
  }
}
