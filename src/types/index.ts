// TypeScript interfaces and types for Space Salvage Empire

export interface GameState {
  resources: {
    debris: number;
    metal: number;
    electronics: number;
    fuel: number;
    rareMaterials: number;
    exoticAlloys: number;
    aiCores: number;
    dataFragments: number;
    darkMatter: number;
  };
  ships: Record<string, number>; // shipType -> count
  // Add more as needed
}

export type ResourceType = keyof GameState['resources'];
export type ShipType = string; // Define specific types later