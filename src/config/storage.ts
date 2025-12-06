import type { ResourceType } from '@/types';

export const BASE_STORAGE_LIMITS: Partial<Record<ResourceType, number>> = {
  debris: 2000,
  metal: 1000,
  electronics: 500,
  fuel: 500,
  // Advanced resources have much higher base limits or no limits initially
  rareMaterials: 1000,
  exoticAlloys: 500,
  aiCores: 100,
  dataFragments: 500,
};
