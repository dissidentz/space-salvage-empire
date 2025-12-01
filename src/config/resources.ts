import type { ResourceType } from '@/types';

export interface ResourceDefinition {
  name: string;
  description: string;
}

export const RESOURCE_DEFINITIONS: Record<ResourceType, ResourceDefinition> = {
  debris: { name: 'Debris', description: 'Raw salvage material' },
  metal: { name: 'Metal', description: 'Refined construction material' },
  electronics: { name: 'Electronics', description: 'Advanced circuitry' },
  fuel: { name: 'Fuel', description: 'Propulsion fuel' },
  rareMaterials: { name: 'Rare Materials', description: 'Valuable elements' },
  exoticAlloys: { name: 'Exotic Alloys', description: 'Super-strong alloys' },
  aiCores: { name: 'AI Cores', description: 'Advanced artificial intelligence' },
  dataFragments: { name: 'Data Fragments', description: 'Recovered data' },
  darkMatter: { name: 'Dark Matter', description: 'Exotic matter for prestige' },
};
