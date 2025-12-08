import type {
    ContractType,
    Derelict,
    DerelictAction,
    FormationType,
    GameState,
    OrbitType,
    ResourceType,
    ShipType
} from '@/types';
import type { StateCreator } from 'zustand';

// Re-export specific parts of GameState for slices to pick from or extend
// Ideally, we replicate the actions interfaces here so slices are self-contained.

export interface ResourceSlice {
    resources: GameState['resources'];
    addResource: (type: ResourceType, amount: number) => void;
    subtractResource: (type: ResourceType, amount: number) => boolean;
    getProductionRates: () => Partial<Record<ResourceType, number>>;
    updateComputedRates: (rates: Partial<Record<ResourceType, number>>) => void;
    getMaxStorage: (resource: ResourceType) => number;
    clickDebris: () => void;
}

export interface ShipSlice {
    ships: GameState['ships'];
    shipEnabled: GameState['shipEnabled'];
    shipUpgrades: GameState['shipUpgrades'];
    upgrades: GameState['upgrades']; // Legacy upgrade system?
    
    buyShip: (type: ShipType, amount?: number) => boolean;
    canAffordShip: (type: ShipType, amount?: number) => boolean;
    getShipCost: (type: ShipType, amount?: number) => Partial<Record<ResourceType, number>>;
    toggleShip: (type: ShipType) => void;
    setShipEnabled: (type: ShipType, enabled: boolean) => void;
    
    // Upgrade actions
    canAffordUpgrade: (upgradeId: string) => boolean;
    purchaseUpgrade: (upgradeId: string) => boolean;
    getUpgradeLevel: (upgradeId: string) => number;
    isUpgradeUnlocked: (upgradeId: string) => boolean;
}

export interface MissionSlice {
    // Missions are not fully in GameState types in index.ts for some reason? 
    // Wait, looking at gameStore, activeMissions wasn't in INITIAL_STATE?
    // Let's re-check GameState in index.ts later, but for now assuming it handles mission logic.
    // Actually, looking at gameStore.ts, there is no `activeMissions` in INITIAL_STATE??
    // Ah, `GameState` definition likely has it.
    
    startScoutMission: (shipType: ShipType, targetOrbit: OrbitType) => boolean;
    startSalvageMission: (derelictId: string, shipType: ShipType, action: DerelictAction, isAutomated?: boolean) => boolean;
    startColonyMission: (targetOrbit: OrbitType) => boolean;
    completeMissionIfReady: (missionId: string) => void;
    completeAllReadyMissions: (missionIds: string[]) => void;
    cancelMission: (missionId: string) => boolean;
    getMissionProgress: (missionId: string) => number;
    onMissionComplete: (missionId: string, success: boolean, rewards?: Partial<Record<ResourceType, number>>) => void;
}

export interface TechSlice {
    techTree: GameState['techTree'];
    canAffordTech: (techId: string) => boolean;
    purchaseTech: (techId: string) => boolean;
    getTechMultiplier: (target: string) => number;
    isTechUnlocked: (techId: string) => boolean;
}

export interface OrbitSlice {
    currentOrbit: GameState['currentOrbit'];
    colonies: GameState['colonies'];
    // Derelict state is managed here too?
    // GameStore had spawnDerelict etc.
    
    canTravelToOrbit: (targetOrbit: OrbitType) => boolean;
    travelToOrbit: (targetOrbit: OrbitType, useInstantWarp?: boolean) => boolean;
    cancelTravel: () => boolean;
    completeTravelIfReady: () => void;
    getTravelProgress: () => number;
    instantWarpAvailable: boolean;
    
    // Derelicts
    spawnDerelict: (orbit: OrbitType) => Derelict | null;
    removeDerelict: (derelictId: string) => void;
    getAvailableDerelicts: (orbit: OrbitType) => Derelict[];
    onDerelictSalvaged: (derelictId: string, rewards?: Partial<Record<ResourceType, number>>, isAutomated?: boolean) => void;
    
    // Colony
    canDeployColony: (orbit: OrbitType) => boolean;
    deployColony: (orbit: OrbitType) => boolean;
}

export interface PrestigeSlice {
    prestige: GameState['prestige'];
    milestones: GameState['milestones'];
    
    prestigeReset: () => void;
    buyPerk: (perkId: string) => boolean;
    unlockArk: () => boolean;
    discoverArkComponent: (componentId: string) => boolean;
    buildArkComponent: (componentId: string) => boolean;
    getPrestigeMultipliers: () => Record<string, number>;
    
    evaluateMilestone: (milestoneId: string) => boolean;
    claimMilestone: (milestoneId: string) => boolean;
    checkAndClaimMilestones: () => void;
}

export interface EconomySlice {
    // Automation
    automation: any; // GameState['automation'] not in index.ts logic
    toggleAutoScout: () => void;
    toggleAutoSalvage: () => void;
    setAutoScoutTargetLimit: (limit: number) => void;
    processAutomation: () => void;
    
    // Contracts
    contracts: GameState['contracts'];
    generateContracts: () => void;
    acceptContract: (contractId: string) => void;
    updateContractProgress: (type: ContractType | 'any', amount: number, orbit?: OrbitType) => void;
    claimContractReward: (contractId: string) => void;
    abandonContract: (contractId: string) => void;
    
    // Trading
    trading: any; // GameState['trading'] not in index.ts logic
    tradeResources: (routeId: string, amount: number) => void;
    
    // Alien Tech
    alienTech: GameState['alienTech'];
    purchaseAlienTech: (techId: string) => boolean;
    
    // Victory
    victory: boolean; 
    continueEndlessMode: () => void;
}

export interface UiSlice {
    ui: GameState['ui'];
    setActiveView: (view: any) => void; // Using any for now to avoid strict typing issues during migration
    openModal: (modal: string, data?: any) => void;
    closeModal: () => void;
    addNotification: (type: 'info' | 'success' | 'warning' | 'error', message: string, duration?: number) => void;
    clearNotification: (id: string) => void;
}

export interface FormationSlice {
    activeFormation: GameState['activeFormation'];
    formationCooldownEnd: GameState['formationCooldownEnd'];
    setFormation: (type: FormationType | null) => boolean;
}

// Composition of all slices
export interface GameStore extends 
    ResourceSlice, 
    ShipSlice, 
    MissionSlice, 
    TechSlice, 
    OrbitSlice, 
    PrestigeSlice, 
    EconomySlice,
    UiSlice,
    FormationSlice
{
    // State properties not explicitly in slices (or shared)
    stats: GameState['stats'];
    derelicts: GameState['derelicts'];
    missions: GameState['missions'];
    computedRates: GameState['computedRates'];
    travelState: GameState['travelState'];
    contracts: GameState['contracts'];

    // Core store actions
    updateLastSaveTime: (time: number) => void;
    exportSave: () => string;
    importSave: (saveData: string) => boolean;
    hardReset: () => void;
    processOfflineGains: (offlineTime: number) => void;
    
    // Metadata
    version: string;
    lastSaveTime: number;
    totalPlayTime: number;
    currentRun: number;
}


export type GameSlice<T> = StateCreator<GameStore, [], [], T>;
