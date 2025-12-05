import { ORBIT_CONFIGS } from '@/config/orbits';
import type { Contract, ContractType, OrbitType, ResourceType, Resources } from '@/types';

interface ContractTemplate {
    type: ContractType;
    name: string;
    description: (target: number, orbit?: string) => string;
    baseDuration: number; // in milliseconds
    baseTarget: number;
    scalingFactor: number; // how much target increases per orbit index
    rewardMultipliers: Partial<Record<ResourceType, number>>; // base reward multipliers
}

const CONTRACT_TEMPLATES: Record<ContractType, ContractTemplate> = {
    salvageQuota: {
        type: 'salvageQuota',
        name: 'Salvage Quota',
        description: (target, orbit) => `Salvage ${target} derelicts in ${orbit || 'any orbit'}`,
        baseDuration: 24 * 60 * 60 * 1000,
        baseTarget: 5,
        scalingFactor: 1.5,
        rewardMultipliers: {
            metal: 5000,
            electronics: 1000
        }
    },
    resourceRush: {
        type: 'resourceRush',
        name: 'Resource Rush',
        description: (target) => `Produce ${target} Metal`,
        baseDuration: 6 * 60 * 60 * 1000,
        baseTarget: 1000,
        scalingFactor: 2.0,
        rewardMultipliers: {
            fuel: 500,
            rareMaterials: 50
        }
    },
    discoveryMission: {
        type: 'discoveryMission',
        name: 'Discovery Mission',
        description: (target, orbit) => `Find ${target} Rare+ derelicts in ${orbit}`,
        baseDuration: 48 * 60 * 60 * 1000,
        baseTarget: 2,
        scalingFactor: 1.2,
        rewardMultipliers: {
            dataFragments: 100
        }
    },
    speedRun: {
        type: 'speedRun',
        name: 'Speed Run',
        description: (_target, orbit) => `Reach ${orbit} within time limit`, 
        baseDuration: 2 * 60 * 60 * 1000,
        baseTarget: 1, // Target is the orbit index ideally, but we track simple progress
        scalingFactor: 1.0,
        rewardMultipliers: {
            metal: 10000,
            electronics: 5000,
            fuel: 1000
        }
    },
    riskyBusiness: {
        type: 'riskyBusiness',
        name: 'Risky Business',
        description: (target) => `Successfully HACK ${target} derelicts`,
        baseDuration: 24 * 60 * 60 * 1000,
        baseTarget: 3,
        scalingFactor: 1.3,
        rewardMultipliers: {
            dataFragments: 300,
            aiCores: 5
        }
    }
};

export function generateRandomContract(currentOrbitId: OrbitType): Contract {
    const orbitConfig = ORBIT_CONFIGS[currentOrbitId];
    const orbitIndex = orbitConfig.index;
    
    // Pick a random type
    // Excluding speedRun for random generation as it's specific to progression
    const types: ContractType[] = ['salvageQuota', 'resourceRush', 'discoveryMission', 'riskyBusiness'];
    const type = types[Math.floor(Math.random() * types.length)];
    const template = CONTRACT_TEMPLATES[type];

    // Scale target based on orbit index
    // e.g. base 5 * (1 + 0.5 * index)
    const scaleMultiplier = 1 + (orbitIndex * 0.5); 
    let target = Math.floor(template.baseTarget * Math.pow(template.scalingFactor, orbitIndex * 0.3));

    // Clamp / Rounding
    target = Math.max(1, Math.round(target));

    // Calculate rewards
    const rewards: Partial<Resources> = {};
    Object.entries(template.rewardMultipliers).forEach(([res, amount]) => {
        const resource = res as ResourceType;
        // Scale rewards heavily based on orbit
        const rewardAmount = amount * scaleMultiplier * (1 + orbitIndex);
        rewards[resource] = Math.floor(rewardAmount);
    });

    // Determine target orbit for location-based contracts
    const targetOrbit = (type === 'salvageQuota' || type === 'discoveryMission') 
        ? currentOrbitId 
        : undefined;

    const startTime = Date.now();
    
    return {
        id: Math.random().toString(36).substr(2, 9),
        type,
        targetOrbit,
        targetAmount: target,
        startTime,
        duration: template.baseDuration,
        expiresAt: startTime + template.baseDuration,
        progress: 0,
        status: 'available',
        rewards
    };
}

export function getContractDescription(contract: Contract): string {
    const template = CONTRACT_TEMPLATES[contract.type];
    const orbitName = contract.targetOrbit ? ORBIT_CONFIGS[contract.targetOrbit].name : undefined;
    return template.description(contract.targetAmount, orbitName);
}
