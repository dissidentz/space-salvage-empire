// Game constants for Space Salvage Empire

/** Number of game ticks per second (100ms per tick) */
export const TICKS_PER_SECOND = 10;

/** Milliseconds between ticks */
export const TICK_INTERVAL = 1000 / TICKS_PER_SECOND;

/** Auto-save interval in milliseconds (20 seconds) */
export const AUTO_SAVE_INTERVAL = 20_000;

/** Maximum offline time to calculate in milliseconds (4 hours) */
export const MAX_OFFLINE_TIME = 4 * 60 * 60 * 1000; // 14,400,000 ms

/** Base offline efficiency (50%, increased by tech/perks) */
export const BASE_OFFLINE_EFFICIENCY = 0.5;

/** Cost growth rates by ship tier */
export const GROWTH_RATES = {
  COMMON: 1.15, // Tier 1 ships
  UNCOMMON: 1.18, // Tier 2 ships
  RARE: 1.2, // Tier 3 ships
  EPIC: 1.22, // Tier 4 ships
  LEGENDARY: 1.25, // Tier 5 ships
} as const;

/** Derelict spawn check interval in milliseconds (5 seconds) */
export const DERELICT_SPAWN_CHECK_INTERVAL = 5_000;

/** Derelict despawn time in milliseconds (24 hours) */
export const DERELICT_DESPAWN_TIME = 24 * 60 * 60 * 1000;

/** Base derelict spawn chance per check (1%) */
export const BASE_DERELICT_SPAWN_CHANCE = 0.01;

/** Mission duration multipliers */
export const MISSION_DURATIONS = {
  SCOUT: 10 * 60 * 1000, // 10 minutes
  SALVAGE: 20 * 60 * 1000, // 20 minutes
  TRAVEL: 0, // Varies by orbit
} as const;

/** Resource conversion ratios (base values, improved by tech) */
export const CONVERSION_RATIOS = {
  DEBRIS_TO_METAL: 0.2, // 10 debris → 2 metal
  METAL_TO_FUEL: 0.05, // 20 metal → 1 fuel
} as const;

/** Save data version for migration handling */
export const SAVE_VERSION = 1;

/** LocalStorage key for game save */
export const SAVE_KEY = 'space-salvage-save';

/** LocalStorage key for settings */
export const SETTINGS_KEY = 'space-salvage-settings';
