# Space Salvage Empire - Complete State Schema

This document defines the entire game state structure for TypeScript and Zustand.

## Main State Interface
```typescript
interface GameState {
  // Meta
  version: string;
  lastSaveTime: number; // ms timestamp
  totalPlayTime: number; //
  ms
currentRun: number; // 1-10
// Current Position
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
// UI State (optional: could be separate store)
ui: UIState;
}
## Resource Definitions
```typescript
enum ResourceType {
  DEBRIS = 'debris',
  METAL = 'metal',
  ELECTRONICS = 'electronics',
  FUEL = 'fuel',
  RARE_MATERIALS = 'rareMaterials',
  EXOTIC_ALLOYS = 'exoticAlloys',
  AI_CORES = 'aiCores',
  DATA_FRAGMENTS = 'dataFragments',
  DARK_MATTER = 'darkMatter',
}

interface Resources {
  debris: number;
  metal: number;
  electronics: number;
  fuel: number;
  rareMaterials: number;
  exoticAlloys: number;
  aiCores: number;
  dataFragments: number;
  darkMatter: number; // current spendable DM
}
```

## Ship Definitions
```typescript
enum ShipType {
  SALVAGE_DRONE = 'salvageDrone',
  REFINERY_BARGE = 'refineryBarge',
  ELECTRONICS_EXTRACTOR = 'electronicsExtractor',
  FUEL_SYNTHESIZER = 'fuelSynthesizer',
  MATTER_EXTRACTOR = 'matterExtractor',
  QUANTUM_MINER = 'quantumMiner',
  SCOUT_PROBE = 'scoutProbe',
  SALVAGE_FRIGATE = 'salvageFrigate',
  HEAVY_SALVAGE_FRIGATE = 'heavySalvageFrigate',
  DEEP_SPACE_SCANNER = 'deepSpaceScanner',
  COLONY_SHIP = 'colonyShip',
}

interface Ships {
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

interface ShipUpgrades {
  [shipType: string]: {
    [upgradeId: string]: number; // upgrade level
  };
}

// Example:
// shipUpgrades: {
//   salvageDrone: {
//     efficiency: 3, // level 3
//     swarmProtocol: 1 // purchased
//   }
// }
```

## Orbit Definitions
```typescript
enum OrbitType {
  LEO = 'leo',
  GEO = 'geo',
  LUNAR = 'lunar',
  MARS = 'mars',
  ASTEROID_BELT = 'asteroidBelt',
  JOVIAN = 'jovian',
  KUIPER = 'kuiper',
  DEEP_SPACE = 'deepSpace',
}

interface OrbitConfig {
  id: OrbitType;
  name: string;
  index: number; // 0-7
  
  // Production multipliers
  metalMultiplier: number;
  electronicsMultiplier: number;
  rareMultiplier: number;
  
  // Travel costs
  fuelCost: number;
  travelTime: number; // ms
  
  // Unlock requirements
  unlockRequirements: {
    resources?: Partial<Resources>;
    tech?: string[];
    colonies?: OrbitType[];
  };
  
  // Derelict spawn table
  spawnRates: {
    common: number;
    uncommon: number;
    rare: number;
    epic: number;
    legendary: number;
  };
  
  spawnMultiplier: number; // affects base spawn rate
  discoveryMultiplier: number; // affects scout success
}
```

## Derelict System
```typescript
enum DerelictRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

enum DerelictType {
  WEATHER_SATELLITE = 'weatherSatellite',
  CARGO_CONTAINER = 'cargoContainer',
  COMMUNICATION_RELAY = 'communicationRelay',
  MINING_HAULER = 'miningHauler',
  RESEARCH_PROBE = 'researchProbe',
  MILITARY_FRIGATE = 'militaryFrigate',
  COLONY_SHIP_FRAGMENT = 'colonyShipFragment',
  REFINERY_STATION = 'refineryStation',
  ANCIENT_PROBE = 'ancientProbe',
  EXODUS_DESTROYER = 'exodusDestroyer',
  RESEARCH_MEGASTATION = 'researchMegastation',
  ALIEN_RELAY = 'alienRelay',
  ARK_COMPONENT = 'arkComponent',
}

interface Derelict {
  id: string;
  type: DerelictType;
  rarity: DerelictRarity;
  orbit: OrbitType;
  discoveredAt: number; // timestamp
  expiresAt: number; // timestamp (24 hours after discovery)
  
  // Salvage requirements
  requiredShip: ShipType; // minimum ship type needed
  fuelCost: number;
  baseMissionTime: number; // ms
  
  // Risk
  isHazardous: boolean;
  riskLevel: number; // 0-1, affects success rate
  
  // Rewards
  rewards: DerelictReward[];
  
  // Special flags
  isArkComponent?: boolean;
  arkComponentType?: ArkComponentType;
}

interface DerelictReward {
  resource: ResourceType;
  min: number;
  max: number;
  dropChance: number; // 0-1
}

enum DerelictAction {
  SALVAGE = 'salvage',
  HACK = 'hack',
  DISMANTLE = 'dismantle',
  ABANDON = 'abandon',
}
```

## Mission System
```typescript
enum MissionType {
  SCOUT = 'scout',
  SALVAGE = 'salvage',
  TRAVEL = 'travel',
  COLONY = 'colony',
}

enum MissionStatus {
  IN_PROGRESS = 'inProgress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

interface Mission {
  id: string;
  type: MissionType;
  status: MissionStatus;
  
  // Ship assignment
  shipType: ShipType;
  shipId?: string; // if specific ship instance
  
  // Timing
  startTime: number; // ms timestamp
  endTime: number; // ms timestamp
  
  // Target
  targetOrbit: OrbitType;
  targetDerelict?: string; // derelict ID for salvage missions
  
  // Costs
  fuelCost: number;
  
  // Action
  action?: DerelictAction; // for salvage missions
  
  // Results (populated on completion)
  success?: boolean;
  rewards?: Partial<Resources>;
  discoveredDerelict?: string; // derelict ID for scout missions
}
```

## Tech Tree
```typescript
enum TechBranch {
  EFFICIENCY = 'efficiency',
  EXPLORATION = 'exploration',
  ECONOMY = 'economy',
}

interface TechNode {
  id: string;
  name: string;
  description: string;
  branch: TechBranch;
  tier: number; // 1-5
  
  // Costs
  dataFragmentCost: number;
  
  // Requirements
  prerequisites: string[]; // other tech IDs
  
  // Effects
  effects: TechEffect[];
}

interface TechEffect {
  type: 'multiplier' | 'unlock' | 'flat_bonus';
  target: string; // what it affects
  value: number;
}

interface TechTree {
  purchased: string[]; // array of purchased tech IDs
  available: string[]; // array of currently available tech IDs
}

// Example:
// techTree: {
//   purchased: ['droneOptimization1', 'basicSensors', 'bulkPurchasing1'],
//   available: ['droneOptimization2', 'advancedSensors', 'fastSurvey']
// }
```

## Prestige System
```typescript
enum ArkComponentType {
  PROPULSION_CORE = 'propulsionCore',
  LIFE_SUPPORT_GRID = 'lifeSupportGrid',
  POWER_DISTRIBUTION = 'powerDistribution',
  HULL_PLATING = 'hullPlating',
  WEAPONS_ARRAY = 'weaponsArray',
  COMPUTING_CORE = 'computingCore',
  CRYO_BAY = 'cryoBay',
  NAVIGATION_ARRAY = 'navigationArray',
}

interface ArkComponent {
  type: ArkComponentType;
  discovered: boolean;
  assembled: boolean;
  assemblyStartTime?: number; // ms timestamp
  assemblyEndTime?: number; // ms timestamp
  
  // Assembly requirements
  assemblyCost: Partial<Resources>;
  assemblyDuration: number; // ms
}

interface PrestigeData {
  // Currency
  darkMatter: number; // current spendable
  totalDarkMatter: number; // lifetime earned
  
  // Perks
  purchasedPerks: string[]; // perk IDs
  
  // Ark progress
  arkComponents: {
    [key in ArkComponentType]: ArkComponent;
  };
  arkUnlocked: boolean; // can see Ark UI
  arkComplete: boolean; // all 8 assembled
  
  // Meta
  totalRuns: number;
  fastestRun: number; // ms
  highestOrbit: OrbitType;
}
```

## Statistics
```typescript
interface Statistics {
  // Resources
  totalDebrisCollected: number;
  totalMetalProduced: number;
  totalElectronicsGained: number;
  totalFuelSynthesized: number;
  // ... for each resource
  
  // Actions
  totalClicks: number;
  totalShipsPurchased: number;
  totalMissionsLaunched: number;
  totalMissionsSucceeded: number;
  totalMissionsFailed: number;
  
  // Derelicts
  totalDerelictsDiscovered: number;
  totalDerelictsSalvaged: number;
  derelictsByRarity: {
    [key in DerelictRarity]: number;
  };
  
  // Progression
  orbitsUnlocked: OrbitType[];
  coloniesEstablished: number;
  techsPurchased: number;
  prestigeCount: number;
  
  // Time
  totalPlayTime: number; // ms
  totalIdleTime: number; // ms
  currentRunTime: number; // ms
}
```

## Colonies & Formations
```typescript
interface Colony {
  id: string;
  orbit: OrbitType;
  establishedAt: number; // timestamp
  level: number; // upgrades
  
  // Benefits
  productionBonus: number; // 0.25 = +25%
  autoSalvage: boolean; // upgraded to auto-salvage common derelicts
}

enum FormationType {
  MINING_FLEET = 'miningFleet',
  SCOUT_FLEET = 'scoutFleet',
  SALVAGE_FLEET = 'salvageFleet',
  EXPEDITION_FLEET = 'expeditionFleet',
  PRODUCTION_FLEET = 'productionFleet',
}

interface Formation {
  type: FormationType;
  active: boolean;
  lastSwitchTime: number; // timestamp for cooldown
  
  // Requirements
  requiredShips: Partial<Ships>;
  
  // Benefits
  effects: FormationEffect[];
}

interface FormationEffect {
  type: 'production_multiplier' | 'cost_reduction' | 'speed_bonus';
  target: string;
  value: number;
}
```

## Contracts
```typescript
enum ContractType {
  SALVAGE_QUOTA = 'salvageQuota',
  RESOURCE_RUSH = 'resourceRush',
  DISCOVERY_MISSION = 'discoveryMission',
  SPEED_RUN = 'speedRun',
  RISKY_BUSINESS = 'riskyBusiness',
}

interface Contract {
  id: string;
  type: ContractType;
  
  // Requirements
  targetOrbit?: OrbitType;
  targetAmount: number; // varies by type
  
  // Timing
  startTime: number; // timestamp
  expiresAt: number; // timestamp
  duration: number; // ms
  
  // Progress
  progress: number;
  completed: boolean;
  
  // Rewards
  rewards: Partial<Resources>;
}
```

## UI State
```typescript
interface UIState {
  // Active views
  activeTab: 'fleet' | 'tech' | 'prestige' | 'ark' | 'solar';
  
  // Modals
  openModal: string | null; // modal ID
  modalData: any; // data for current modal
  
  // Notifications
  notifications: Notification[];
  
  // Settings
  settings: {
    soundEnabled: boolean;
    musicEnabled: boolean;
    soundVolume: number; // 0-1
    musicVolume: number; // 0-1
    autoSave: boolean;
    autoSaveInterval: number; // ms
    showAnimations: boolean;
    compactMode: boolean;
  };
  
  // Tooltips
  activeTooltip: string | null;
}

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: number;
  duration: number; // ms, how long to show
}
```

## Milestones
```typescript
interface Milestones {
  // Progression milestones
  firstDrone: boolean;
  firstRefinery: boolean;
  reachedGEO: boolean;
  reachedLunar: boolean;
  reachedMars: boolean;
  reachedBelt: boolean;
  reachedJovian: boolean;
  reachedKuiper: boolean;
  reachedDeepSpace: boolean;
  
  // Derelict milestones
  firstDerelictDiscovered: boolean;
  firstDerelictSalvaged: boolean;
  firstRareDerelict: boolean;
  firstEpicDerelict: boolean;
  firstLegendaryDerelict: boolean;
  
  // Ark milestones
  firstArkComponent: boolean;
  halfArkComplete: boolean; // 4/8 components
  arkAssemblyStarted: boolean;
  
  // Prestige milestones
  firstPrestige: boolean;
  fifthPrestige: boolean;
  
  // Special milestones
  firstColony: boolean;
  unlockedContracts: boolean;
  unlockedFormations: boolean;
}
```

## Config Types (read-only data)
```typescript
interface ShipConfig {
  id: ShipType;
  name: string;
  description: string;
  category: 'production' | 'active';
  
  // Costs
  baseCost: Partial<Resources>;
  costGrowth: number;
  
  // Production (for production ships)
  baseProduction?: number; // per second
  producesResource?: ResourceType;
  consumesResource?: ResourceType;
  conversionRatio?: number; // input:output
  
  // Mission (for active ships)
  baseMissionDuration?: number; // ms
  baseSuccessRate?: number; // 0-1
  
  // Unlock requirements
  unlockRequirements: {
    orbit?: OrbitType;
    tech?: string[];
    prestige?: string[]; // DM perk IDs
    milestone?: string;
  };
  
  // Upgrades available
  availableUpgrades: string[]; // upgrade IDs
}
```

---

This state schema serves as the single source of truth. Use it to:
1. Generate TypeScript interfaces
2. Initialize default state
3. Validate saved games
4. Design UI components around data structure
5. Plan testing scenarios