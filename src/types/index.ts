// TypeScript interfaces and types for Space Salvage Empire

// Orbit and formation as string unions to keep runtime assignments simple
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

// Resources
export interface Resources {
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

export type ResourceType = keyof Resources;

// Ships
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
  aiCoreFabricator: number;
}

export type ShipType = keyof Ships;

// Ship enabled/disabled state
export type ShipEnabled = Record<ShipType, boolean>;

// Upgrade identifiers
export type UpgradeId = string;

// Ship upgrades map: upgrade ID to upgrade state
export type ShipUpgrades = Record<string, {
  currentLevel: number;
  unlocked: boolean;
}>;

// Enums / string unions for other schema items
export type DerelictRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary';
export type DerelictType =
  | 'weatherSatellite'
  | 'cargoContainer'
  | 'communicationRelay'
  | 'miningHauler'
  | 'researchProbe'
  | 'militaryFrigate'
  | 'colonyShipFragment'
  | 'refineryStation'
  | 'ancientProbe'
  | 'exodusDestroyer'
  | 'researchMegastation'
  | 'alienRelay'
  | 'arkComponent';

export type DerelictAction = 'salvage' | 'hack' | 'dismantle' | 'abandon';

export type MissionType = 'scout' | 'salvage' | 'travel' | 'colony';
export type MissionStatus = 'inProgress' | 'completed' | 'failed';

export type TechBranch = 'efficiency' | 'exploration' | 'economy';

export type ArkComponentType =
  | 'propulsionCore'
  | 'lifeSupportGrid'
  | 'powerDistribution'
  | 'hullPlating'
  | 'weaponsArray'
  | 'computingCore'
  | 'cryoBay'
  | 'navigationArray';

export type ContractType =
  | 'salvageQuota'
  | 'resourceRush'
  | 'discoveryMission'
  | 'speedRun'
  | 'riskyBusiness';

// Derelict structures
export interface DerelictReward {
  resource: ResourceType;
  min: number;
  max: number;
  dropChance: number; // 0-1
}

export interface Derelict {
  id: string;
  type: DerelictType;
  rarity: DerelictRarity;
  orbit: OrbitType;
  discoveredAt: number;
  expiresAt: number;

  requiredShip: ShipType;
  fuelCost: number;
  baseMissionTime: number;

  isHazardous: boolean;
  riskLevel: number; // 0-1

  rewards: DerelictReward[];

  isArkComponent?: boolean;
  arkComponentType?: ArkComponentType;
}

// Missions
export interface Mission {
  id: string;
  type: MissionType;
  status: MissionStatus;

  shipType: ShipType;
  shipId?: string;

  startTime: number;
  endTime: number;

  targetOrbit: OrbitType;
  targetDerelict?: string;

  fuelCost: number;
  action?: DerelictAction;

  success?: boolean;
  rewards?: Partial<Resources>;
  discoveredDerelict?: string;
}

// Tech tree types
export interface TechEffect {
  type: 'multiplier' | 'unlock' | 'flat_bonus';
  target: string;
  value: number;
}

export interface TechNode {
  id: string;
  name: string;
  description: string;
  branch: TechBranch;
  tier: number;
  dataFragmentCost: number;
  prerequisites: string[];
  effects: TechEffect[];
}

export interface TechTree {
  purchased: string[];
  available: string[];
}

// Ark / prestige
export interface ArkComponent {
  type: ArkComponentType;
  discovered: boolean;
  assembled: boolean;
  assemblyStartTime?: number;
  assemblyEndTime?: number;
  assemblyCost: Partial<Resources>;
  assemblyDuration: number;
}

export interface PrestigePerk {
  id: string;
  name: string;
  description: string;
  tier: number;
  cost: number; // Dark Matter cost
  maxLevel: number;
  effects: TechEffect[];
  prerequisites: string[];
}

export interface PrestigeData {
  darkMatter: number;
  totalDarkMatter: number;
  purchasedPerks: Record<string, number>; // id -> level
  arkComponents: Partial<Record<ArkComponentType, ArkComponent>>;
  arkUnlocked: boolean;
  arkComplete: boolean;
  totalRuns: number;
  fastestRun: number;
  highestOrbit: OrbitType;
}

// Travel History
export interface TravelRecord {
  id: string;
  origin: OrbitType;
  destination: OrbitType;
  startTime: number;
  endTime: number;
  fuelCost: number;
  actualTravelTime: number; // in case of early cancellation
  completed: boolean;
  cancelled: boolean;
  fuelRefunded?: number;
}

// Mission History
export interface MissionLog {
  id: string;
  type: MissionType;
  shipType: ShipType;
  targetOrbit: OrbitType;
  startTime: number;
  endTime: number;
  success: boolean;
  rewards?: Partial<Resources>;
  discoveredDerelict?: string;
  derelictType?: DerelictType;
}

// Stats
export interface Statistics {
  totalDebrisCollected: number;
  totalMetalProduced: number;
  totalElectronicsGained: number;
  totalFuelSynthesized: number;

  totalClicks: number;
  totalShipsPurchased: number;
  totalMissionsLaunched: number;
  totalMissionsSucceeded: number;
  totalMissionsFailed: number;

  totalDerelictsDiscovered: number;
  totalDerelictsSalvaged: number;
  derelictsByRarity: Partial<Record<DerelictRarity, number>>;

  orbitsUnlocked: OrbitType[];
  coloniesEstablished: number;
  techsPurchased: number;
  prestigeCount: number;

  totalPlayTime: number;
  totalIdleTime: number;
  currentRunTime: number;

  // Travel stats
  totalTravels: number;
  totalFuelSpent: number;
  totalTravelTime: number;
  farthestOrbit: OrbitType;
  travelHistory: TravelRecord[];
  missionHistory: MissionLog[];
}

// Colonies & formations
export interface Colony {
  id: string;
  orbit: OrbitType;
  establishedAt: number;
  level: number;
  productionBonus: number;
  autoSalvage: boolean;
}

export type FormationEffectType =
  | 'production_multiplier'
  | 'cost_reduction'
  | 'speed_bonus';

export interface FormationEffect {
  type: FormationEffectType;
  target: string;
  value: number;
}

export interface Formation {
  type: FormationType;
  active: boolean;
  lastSwitchTime: number;
  requiredShips: Partial<Ships>;
  effects: FormationEffect[];
}

// Contracts
export interface Contract {
  id: string;
  type: ContractType;
  targetOrbit?: OrbitType;
  targetAmount: number;
  startTime: number;
  expiresAt: number;
  duration: number;
  progress: number;
  completed: boolean;
  rewards: Partial<Resources>;
}

// UI
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: number;
  duration: number;
}

export interface EventLog {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: number;
}

export interface UIState {
  activeTab: 'fleet' | 'tech' | 'prestige' | 'ark' | 'solar';
  activeView: 'dashboard' | 'fleet' | 'galaxyMap' | 'settings' | 'techTree' | 'prestige' | 'changelog' | 'missionLog';
  openModal: string | null;
  modalData?: unknown;
  notifications: Notification[];
  eventLog: EventLog[];
  settings: {
    soundEnabled: boolean;
    musicEnabled: boolean;
    soundVolume: number;
    musicVolume: number;
    autoSave: boolean;
    autoSaveInterval: number;
    showAnimations: boolean;
    compactMode: boolean;
  };
  activeTooltip: string | null;
}

// Config types
export interface ShipConfig {
  id: ShipType;
  name: string;
  description: string;
  category: 'production' | 'active';
  baseCost: Partial<Resources>;
  costGrowth: number;
  baseProduction?: number;
  producesResource?: ResourceType;
  consumesResource?: ResourceType;
  conversionRatio?: number;
  baseMissionDuration?: number;
  baseSuccessRate?: number;
  unlockRequirements?: {
    orbit?: OrbitType;
    tech?: string[];
    prestige?: string[];
    milestone?: string;
  };
  availableUpgrades?: UpgradeId[];
}

export interface OrbitConfig {
  id: OrbitType;
  name: string;
  index: number;
  metalMultiplier: number;
  electronicsMultiplier: number;
  rareMultiplier: number;
  fuelCost: number;
  travelTime: number;
  unlockRequirements?: {
    resources?: Partial<Resources>;
    tech?: string[];
    colonies?: OrbitType[];
  };
  spawnRates?: {
    common: number;
    uncommon: number;
    rare: number;
    epic: number;
    legendary: number;
  };
  spawnMultiplier?: number;
  discoveryMultiplier?: number;
}

// Upgrades (general-purpose, non-tech permanent upgrades)
export interface Upgrade {
  id: string;
  name: string;
  description?: string;
  cost?: Partial<Resources>;
  currentLevel: number;
  maxLevel?: number;
  effects?: TechEffect[] | FormationEffect[];
  unlocked?: boolean;
  prerequisites?: string[];
}

export type Upgrades = Record<string, Upgrade>;

// Milestones (one-time progression achievements with rewards)
export interface MilestoneCondition {
  type:
    | 'reach_orbit'
    | 'collect_resource'
    | 'purchase_ships'
    | 'time_played'
    | 'derelicts_salvaged'
    | 'travels_completed'
    | 'unique_orbits_visited';
  key?: string; // e.g., resource key or ship type
  value: number;
}

export interface Milestone {
  id: string;
  name: string;
  description?: string;
  condition: MilestoneCondition;
  achieved: boolean;
  rewards?:
    | Partial<Resources>
    | { unlockTech?: string }
    | { addUpgrade?: string };
}

export type Milestones = Record<string, Milestone>;

// Main GameState
export interface GameState {
  version: string;
  lastSaveTime: number;
  totalPlayTime: number;
  currentRun: number;
  currentOrbit: OrbitType;
  resources: Resources;
  ships: Ships;
  shipEnabled: ShipEnabled; // Track which ships are enabled/disabled
  shipUpgrades: ShipUpgrades;
  techTree: TechTree;
  upgrades: Upgrades;
  milestones: Milestones;
  derelicts: Derelict[];
  missions: Mission[];
  colonies: Colony[];
  contracts: Contract[];
  prestige: PrestigeData;
  stats: Statistics;
  ui: UIState;
  activeFormation: FormationType | null;
  formationCooldownEnd: number;
  computedRates: Partial<Record<ResourceType, number>>;
  // Travel state for orbit progression
  travelState: {
    traveling: boolean;
    destination: OrbitType | null;
    startTime: number;
    endTime: number;
    progress: number; // 0-1 for UI display
  } | null;
}
