// Mission helper utilities for UI components
import { SHIP_CONFIGS } from '@/config/ships';
import type { DerelictRarity, DerelictReward, Mission, MissionType, ShipType } from '@/types';

/**
 * Format mission duration in human-readable format
 */
export function formatMissionDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Calculate mission progress (0-1)
 */
export function getMissionProgress(mission: Mission): number {
  const now = Date.now();
  const total = mission.endTime - mission.startTime;
  const elapsed = now - mission.startTime;
  return Math.min(1, Math.max(0, elapsed / total));
}

/**
 * Get time remaining for a mission
 */
export function getMissionTimeRemaining(mission: Mission): number {
  const now = Date.now();
  return Math.max(0, mission.endTime - now);
}

/**
 * Get available ships for a specific mission type
 */
export function getAvailableShipsForMission(type: MissionType): ShipType[] {
  if (type === 'scout') {
    return ['scoutProbe', 'deepSpaceScanner'];
  } else if (type === 'salvage') {
    return ['salvageFrigate', 'heavySalvageFrigate'];
  } else if (type === 'colony') {
    return ['colonyShip'];
  }
  return [];
}

/**
 * Get rarity color class for derelicts
 */
export function getRarityColor(rarity: DerelictRarity): string {
  switch (rarity) {
    case 'common':
      return 'text-slate-400';
    case 'uncommon':
      return 'text-green-400';
    case 'rare':
      return 'text-blue-400';
    case 'epic':
      return 'text-purple-400';
    case 'legendary':
      return 'text-orange-400';
    default:
      return 'text-slate-400';
  }
}

/**
 * Get rarity background color class for badges
 */
export function getRarityBgColor(rarity: DerelictRarity): string {
  switch (rarity) {
    case 'common':
      return 'bg-slate-500/20 border-slate-500/50';
    case 'uncommon':
      return 'bg-green-500/20 border-green-500/50';
    case 'rare':
      return 'bg-blue-500/20 border-blue-500/50';
    case 'epic':
      return 'bg-purple-500/20 border-purple-500/50';
    case 'legendary':
      return 'bg-orange-500/20 border-orange-500/50';
    default:
      return 'bg-slate-500/20 border-slate-500/50';
  }
}

/**
 * Format rewards for display
 */
export function formatRewards(rewards: DerelictReward[]): string {
  return rewards
    .filter(r => r.dropChance > 0.5) // Only show likely rewards
    .map(r => {
      const avg = Math.floor((r.min + r.max) / 2);
      return `${avg} ${r.resource}`;
    })
    .join(', ');
}

/**
 * Get mission type color
 */
export function getMissionTypeColor(type: MissionType): string {
  switch (type) {
    case 'scout':
      return 'text-blue-400';
    case 'salvage':
      return 'text-purple-400';
    case 'travel':
      return 'text-cyan-400';
    case 'colony':
      return 'text-green-400';
    default:
      return 'text-slate-400';
  }
}

/**
 * Get mission type background color
 */
export function getMissionTypeBgColor(type: MissionType): string {
  switch (type) {
    case 'scout':
      return 'bg-blue-500/20 border-blue-500/50';
    case 'salvage':
      return 'bg-purple-500/20 border-purple-500/50';
    case 'travel':
      return 'bg-cyan-500/20 border-cyan-500/50';
    case 'colony':
      return 'bg-green-500/20 border-green-500/50';
    default:
      return 'bg-slate-500/20 border-slate-500/50';
  }
}

/**
 * Get ship display name
 */
export function getShipDisplayName(shipType: ShipType): string {
  return SHIP_CONFIGS[shipType]?.name || shipType;
}

/**
 * Format large numbers
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toFixed(0);
}
