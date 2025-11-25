// TypeScript interfaces and types for Space Salvage Empire

export interface GameState {
  // Meta
  version: string;
  lastSaveTime: number;
  totalPlayTime: number;
  currentRun: number;
  currentOrbit: OrbitType;
  // Resources
  resources: Resources;
  // Ships & Buildings
  ships: Ships;
  shipUpgrades: ShipUpgrades;
  // Progression
  techTree: TechTree;
  upgrades: Upgrades;
  milestones: Milestones;
  // Active Systems
  derelicts: Derelict[];
  missions: Mission[];
  colonies: Colony[];
  contracts: Contract[];
  // Prestige
  prestige: PrestigeData;
  // Statistics
  stats: Statistics;
  // UI State
  ui: UIState;
  // Additional fields for game logic
  activeFormation: FormationType | null;
  formationCooldownEnd: number;
}

export type ResourceType = keyof Resources;
export type ShipType = keyof Ships;

// Basic enums
export type OrbitType =
  | 'leo'
  | 'geo'
  | 'lunar'
  | 'mars'
  | 'asteroidBelt'
  | 'jovian'
  | 'kuiper'
  | 'deepSpace';
export type FormationType =
  | 'miningFleet'
  | 'scoutFleet'
  | 'salvageFleet'
  | 'expeditionFleet'
  | 'productionFleet';

// Resources interface
export interface Resources {
  debris: number;
  metal: number;
  electronics: number;
  fuel: number;
  rareMaterials: number;
  exoticAlloys: number;
  aiCores: number;
  dataFragments: number;
  darkMatter: number;
}

// Ships interface
export interface Ships {
  salvageDrone: number;
  refineryBarge: number;
  electronicsExtractor: number;
  fuelSynthesizer: number;
  matterExtractor: number;
  quantumMiner: number;
  scoutProbe: number;
  salvageFrigate: number;
  heavySalvageFrigate: number;
  deepSpaceScanner: number;
  colonyShip: number;
}

// Ship upgrades
export interface ShipUpgrades {
  [shipType: string]: {
    [upgradeId: string]: number;
  };
}

// Tech tree
export interface TechTree {
  purchased: string[];
  available: string[];
}

// Placeholder types (to be expanded from STATE_SCHEMA.md)
export type Upgrades = Record<string, unknown>; // TODO: define upgrade system

export type Milestones = Record<string, unknown>; // TODO: define milestone system

export type Derelict = Record<string, unknown>; // TODO: define derelict system

export type Mission = Record<string, unknown>; // TODO: define mission system

export type Colony = Record<string, unknown>; // TODO: define colony system

export type Contract = Record<string, unknown>; // TODO: define contract system

export type PrestigeData = Record<string, unknown>; // TODO: define prestige system

export type Statistics = Record<string, unknown>; // TODO: define statistics system

export type UIState = Record<string, unknown>; // TODO: define UI state system
