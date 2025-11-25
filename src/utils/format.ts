// Number formatting utilities for Space Salvage Empire

/**
 * Format a number with short notation (K, M, B, T, etc.)
 * 
 * @param n - Number to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string
 * 
 * @example
 * formatNumber(1500) // "1.5K"
 * formatNumber(2500000) // "2.5M"
 * formatNumber(42) // "42"
 */
export function formatNumber(n: number, decimals: number = 1): string {
  if (!isFinite(n)) return '0';
  if (n < 0) return '-' + formatNumber(-n, decimals);
  
  if (n < 1000) return Math.floor(n).toString();
  if (n < 1_000_000) return (n / 1000).toFixed(decimals) + 'K';
  if (n < 1_000_000_000) return (n / 1_000_000).toFixed(decimals) + 'M';
  if (n < 1_000_000_000_000) return (n / 1_000_000_000).toFixed(decimals) + 'B';
  if (n < 1e15) return (n / 1e12).toFixed(decimals) + 'T';
  
  // For very large numbers, use scientific notation
  return n.toExponential(2);
}

/**
 * Format a number with full precision (commas)
 * 
 * @param n - Number to format
 * @returns Formatted string with commas
 * 
 * @example
 * formatNumberLong(1500) // "1,500"
 * formatNumberLong(2500000) // "2,500,000"
 */
export function formatNumberLong(n: number): string {
  if (!isFinite(n)) return '0';
  return Math.floor(n).toLocaleString('en-US');
}

/**
 * Format time duration in human-readable format
 * 
 * @param ms - Milliseconds
 * @returns Formatted time string
 * 
 * @example
 * formatTime(90000) // "1m 30s"
 * formatTime(3665000) // "1h 1m"
 * formatTime(5000) // "5s"
 */
export function formatTime(ms: number): string {
  if (ms < 0) return '0s';
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    const remainingHours = hours % 24;
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  }
  
  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }
  
  if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }
  
  return `${seconds}s`;
}

/**
 * Format time duration in short format (for compact displays)
 * 
 * @param ms - Milliseconds
 * @returns Formatted time string
 * 
 * @example
 * formatTimeShort(90000) // "1:30"
 * formatTimeShort(3665000) // "1:01:05"
 */
export function formatTimeShort(ms: number): string {
  if (ms < 0) return '0:00';
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  const s = (seconds % 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  
  if (hours > 0) {
    return `${hours}:${m}:${s}`;
  }
  
  return `${minutes}:${s}`;
}

/**
 * Format production rate (per second)
 * 
 * @param rate - Production rate per second
 * @param resourceType - Type of resource (for icon/color)
 * @returns Formatted string
 * 
 * @example
 * formatRate(2.5) // "+2.5/s"
 * formatRate(0) // "0/s"
 */
export function formatRate(rate: number): string {
  if (rate === 0) return '0/s';
  if (rate < 0) return formatNumber(rate, 1) + '/s';
  return '+' + formatNumber(rate, 1) + '/s';
}

/**
 * Format percentage
 * 
 * @param value - Decimal value (0.5 = 50%)
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 * 
 * @example
 * formatPercent(0.5) // "50%"
 * formatPercent(0.125, 1) // "12.5%"
 */
export function formatPercent(value: number, decimals: number = 0): string {
  return (value * 100).toFixed(decimals) + '%';
}

/**
 * Get color class for resource tier
 * 
 * @param resourceType - Type of resource
 * @returns Tailwind color class
 */
export function getResourceColor(resourceType: string): string {
  const colors: Record<string, string> = {
    debris: 'text-gray-400',
    metal: 'text-slate-300',
    electronics: 'text-blue-400',
    fuel: 'text-orange-400',
    rareMaterials: 'text-purple-400',
    exoticAlloys: 'text-pink-400',
    aiCores: 'text-cyan-400',
    dataFragments: 'text-green-400',
    darkMatter: 'text-violet-400',
  };
  
  return colors[resourceType] || 'text-white';
}

/**
 * Get resource display name
 * 
 * @param resourceType - Type of resource
 * @returns Human-readable name
 */
export function getResourceName(resourceType: string): string {
  const names: Record<string, string> = {
    debris: 'Debris',
    metal: 'Metal',
    electronics: 'Electronics',
    fuel: 'Fuel',
    rareMaterials: 'Rare Materials',
    exoticAlloys: 'Exotic Alloys',
    aiCores: 'AI Cores',
    dataFragments: 'Data Fragments',
    darkMatter: 'Dark Matter',
  };
  
  return names[resourceType] || resourceType;
}
