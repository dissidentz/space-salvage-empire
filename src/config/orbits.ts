// Orbit configuration data for Space Salvage Empire
// Based on docs/complete-system.md

import type { OrbitType, ResourceType } from '@/types';

export interface OrbitConfig {
  id: OrbitType;
  name: string;
  index: number; // 0-7 for progression order

  // Production multipliers
  metalMultiplier: number;
  electronicsMultiplier: number;
  rareMultiplier: number;

  // Travel costs
  fuelCost: number;
  travelTime: number; // ms

  // Unlock requirements
  unlockRequirements: {
    resources?: Partial<Record<ResourceType, number>>;
    tech?: string[];
    colonies?: OrbitType[];
  };

  // Derelict spawn table (percentages, must sum to 100)
  spawnRates: {
    common: number;
    uncommon: number;
    rare: number;
    epic: number;
    legendary: number;
  };

  // Spawn and discovery modifiers
  spawnMultiplier: number; // affects base spawn rate
  discoveryMultiplier: number; // affects scout success
}

export const ORBIT_CONFIGS: Record<OrbitType, OrbitConfig> = {
  leo: {
    id: 'leo',
    name: 'Low Earth Orbit',
    index: 0,
    metalMultiplier: 1,
    electronicsMultiplier: 1,
    rareMultiplier: 1,
    fuelCost: 0,
    travelTime: 0,
    unlockRequirements: {},
    spawnRates: {
      common: 70,
      uncommon: 25,
      rare: 4,
      epic: 0.9,
      legendary: 0.1,
    },
    spawnMultiplier: 1.0,
    discoveryMultiplier: 1.0,
  },

  geo: {
    id: 'geo',
    name: 'Geosynchronous Orbit',
    index: 1,
    metalMultiplier: 2,
    electronicsMultiplier: 1.5,
    rareMultiplier: 1,
    fuelCost: 0,
    travelTime: 1 * 60 * 1000, // 1 minute
    unlockRequirements: {
      resources: { debris: 100 }, // Simplified: just need some drones
    },
    spawnRates: {
      common: 60,
      uncommon: 30,
      rare: 8,
      epic: 1.8,
      legendary: 0.2,
    },
    spawnMultiplier: 1.2,
    discoveryMultiplier: 1.1,
  },

  lunar: {
    id: 'lunar',
    name: 'Lunar Orbit',
    index: 2,
    metalMultiplier: 5,
    electronicsMultiplier: 2,
    rareMultiplier: 1,
    fuelCost: 300,
    travelTime: 3 * 60 * 1000, // 3 minutes
    unlockRequirements: {
      resources: { metal: 1000 },
    },
    spawnRates: {
      common: 50,
      uncommon: 35,
      rare: 12,
      epic: 2.7,
      legendary: 0.3,
    },
    spawnMultiplier: 1.5,
    discoveryMultiplier: 1.2,
  },

  mars: {
    id: 'mars',
    name: 'Mars Orbit',
    index: 3,
    metalMultiplier: 10,
    electronicsMultiplier: 3,
    rareMultiplier: 1.5,
    fuelCost: 2500,
    travelTime: 12 * 60 * 1000, // 12 minutes
    unlockRequirements: {
      resources: { metal: 10000 },
    },
    spawnRates: {
      common: 40,
      uncommon: 35,
      rare: 18,
      epic: 5.4,
      legendary: 1.6,
    },
    spawnMultiplier: 2.0,
    discoveryMultiplier: 1.3,
  },

  asteroidBelt: {
    id: 'asteroidBelt',
    name: 'Asteroid Belt',
    index: 4,
    metalMultiplier: 25,
    electronicsMultiplier: 5,
    rareMultiplier: 3,
    fuelCost: 12000,
    travelTime: 30 * 60 * 1000, // 30 minutes
    unlockRequirements: {
      resources: { metal: 100000 },
      tech: ['asteroidBeltAccess'],
    },
    spawnRates: {
      common: 30,
      uncommon: 35,
      rare: 25,
      epic: 8,
      legendary: 2,
    },
    spawnMultiplier: 3.0,
    discoveryMultiplier: 1.5,
  },

  jovian: {
    id: 'jovian',
    name: 'Jovian System',
    index: 5,
    metalMultiplier: 50,
    electronicsMultiplier: 8,
    rareMultiplier: 5,
    fuelCost: 60000,
    travelTime: 60 * 60 * 1000, // 1 hour
    unlockRequirements: {
      resources: { metal: 1000000 },
      colonies: ['asteroidBelt'],
    },
    spawnRates: {
      common: 20,
      uncommon: 30,
      rare: 30,
      epic: 15,
      legendary: 5,
    },
    spawnMultiplier: 4.0,
    discoveryMultiplier: 1.8,
  },

  kuiper: {
    id: 'kuiper',
    name: 'Kuiper Belt',
    index: 6,
    metalMultiplier: 100,
    electronicsMultiplier: 12,
    rareMultiplier: 10,
    fuelCost: 250000,
    travelTime: 3 * 60 * 60 * 1000, // 3 hours
    unlockRequirements: {
      resources: { metal: 10000000 },
      colonies: ['jovian'],
    },
    spawnRates: {
      common: 10,
      uncommon: 25,
      rare: 35,
      epic: 20,
      legendary: 10,
    },
    spawnMultiplier: 5.0,
    discoveryMultiplier: 2.0,
  },

  deepSpace: {
    id: 'deepSpace',
    name: 'Deep Space',
    index: 7,
    metalMultiplier: 200,
    electronicsMultiplier: 20,
    rareMultiplier: 20,
    fuelCost: 1000000,
    travelTime: 6 * 60 * 60 * 1000, // 6 hours
    unlockRequirements: {
      tech: ['void_dimensions'],
    },
    spawnRates: {
      common: 5,
      uncommon: 15,
      rare: 25,
      epic: 30,
      legendary: 25,
    },
    spawnMultiplier: 6.0,
    discoveryMultiplier: 2.5,
  },
};

/**
 * Get the next orbit in progression
 */
export function getNextOrbit(currentOrbit: OrbitType): OrbitType | null {
  const current = ORBIT_CONFIGS[currentOrbit];
  const orbitOrder: OrbitType[] = ['leo', 'geo', 'lunar', 'mars', 'asteroidBelt', 'jovian', 'kuiper', 'deepSpace'];
  
  if (current.index >= 7) return null; // Already at max
  return orbitOrder[current.index + 1];
}

/**
 * Get adjacent orbits (previous and next in progression)
 * Used for quantum_entanglement_comms tech feature
 */
export function getAdjacentOrbits(currentOrbit: OrbitType): OrbitType[] {
  const current = ORBIT_CONFIGS[currentOrbit];
  const orbitOrder: OrbitType[] = ['leo', 'geo', 'lunar', 'mars', 'asteroidBelt', 'jovian', 'kuiper', 'deepSpace'];
  const adjacentOrbits: OrbitType[] = [];
  
  // Add previous orbit if not at the start
  if (current.index > 0) {
    adjacentOrbits.push(orbitOrder[current.index - 1]);
  }
  
  // Add next orbit if not at the end
  if (current.index < 7) {
    adjacentOrbits.push(orbitOrder[current.index + 1]);
  }
  
  return adjacentOrbits;
}


/**
 * Check if an orbit is unlocked
 */
export function isOrbitUnlocked(
  targetOrbit: OrbitType,
  state: {
    resources: Record<ResourceType, number>;
    techTree: { purchased: string[] };
    colonies: Array<{ orbit: OrbitType }>;
    prestige: { arkComponents: Record<string, { discovered: boolean }> };
  }
): boolean {
  const config = ORBIT_CONFIGS[targetOrbit];
  const req = config.unlockRequirements;

  // Check resource requirements
  if (req.resources) {
    for (const [resource, amount] of Object.entries(req.resources)) {
      if (state.resources[resource as ResourceType] < amount) {
        return false;
      }
    }
  }

  // Check tech requirements
  if (req.tech) {
    const hasTech = req.tech.every(tech => state.techTree.purchased.includes(tech));
    if (!hasTech) return false;
  }

  // Check colony requirements
  if (req.colonies) {
    const hasColonies = req.colonies.every(orbit =>
      state.colonies.some(colony => colony.orbit === orbit)
    );
    if (!hasColonies) return false;
  }

  // Deep Space special requirement: Void Dimensions Tech (Already checked by generic tech check above, but keep logic clean)
  // If we wanted to keep the Ark Component check as an ALTERNATIVE, we could add it back here, but plan said replace.
  // So we just rely on generic req.tech above.

  return true;
}

/**
 * Get orbit display color
 */
export function getOrbitColor(orbit: OrbitType): string {
  const colors: Record<OrbitType, string> = {
    leo: 'text-blue-300',
    geo: 'text-blue-400',
    lunar: 'text-gray-300',
    mars: 'text-red-400',
    asteroidBelt: 'text-yellow-600',
    jovian: 'text-orange-400',
    kuiper: 'text-purple-400',
    deepSpace: 'text-violet-500',
  };
  return colors[orbit] || 'text-white';
}
