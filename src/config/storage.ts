import type { ResourceType } from '@/types';

export const BASE_STORAGE_LIMITS: Partial<Record<ResourceType, number>> = {
  debris: 1000000,
  metal: 2000000,      // Need 2,000,000 for Ark Hull, 10,000,000 for Kuiper Belt
  electronics: 50000, // Need 100,000 for Ark Computing Core
  fuel: 1000000,       // Need 1,000,000 for Deep Space
  // Advanced resources have much higher base limits or no limits initially
  rareMaterials: 5000,// Need 10,000 for Ark Life Support
  exoticAlloys: 2000, // Need 5,000 for Ark Propulsion
  aiCores: 100,
  dataFragments: 5000,
};
