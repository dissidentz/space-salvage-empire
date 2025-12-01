// src/config/tech.ts
import type { TechBranch, TechNode } from '@/types';

export type TechTier = 1 | 2 | 3 | 4 | 5;

// ============================================================================
// EFFICIENCY BRANCH - Production & Conversion
// ============================================================================

const EFFICIENCY_TECHS: TechNode[] = [
  // Tier 1
  {
    id: 'drone_optimization_1',
    name: 'Drone Optimization I',
    description: '+20% Salvage Drone production',
    branch: 'efficiency',
    tier: 1,
    dataFragmentCost: 4,
    prerequisites: [],

    effects: [
      { type: 'multiplier', target: 'salvageDrone_production', value: 1.25 },
    ],
  },
  {
    id: 'refinery_throughput_1',
    name: 'Refinery Throughput I',
    description: '+25% Refinery Barge efficiency',
    branch: 'efficiency',
    tier: 1,
    dataFragmentCost: 8,
    prerequisites: [],

    effects: [
      { type: 'multiplier', target: 'refineryBarge_production', value: 1.25 },
    ],
  },
  {
    id: 'click_amplification',
    name: 'Click Amplification',
    description: 'Manual clicks give 2 Debris instead of 1',
    branch: 'efficiency',
    tier: 1,
    dataFragmentCost: 6,
    prerequisites: [],

    effects: [{ type: 'multiplier', target: 'click_power', value: 2 }],
  },
  {
    id: 'bulk_processing',
    name: 'Bulk Processing',
    description: 'All production ships produce +10%',
    branch: 'efficiency',
    tier: 1,
    dataFragmentCost: 12,
    prerequisites: [],

    effects: [{ type: 'multiplier', target: 'all_production', value: 1.1 }],
  },

  // Tier 2
  {
    id: 'drone_optimization_2',
    name: 'Drone Optimization II',
    description: '+20% Salvage Drone production (stacks)',
    branch: 'efficiency',
    tier: 2,
    dataFragmentCost: 20,
    prerequisites: ['drone_optimization_1'],

    effects: [
      { type: 'multiplier', target: 'salvageDrone_production', value: 1.25 },
    ],
  },
  {
    id: 'refinery_throughput_2',
    name: 'Refinery Throughput II',
    description: '+25% Refinery Barge efficiency (stacks)',
    branch: 'efficiency',
    tier: 2,
    dataFragmentCost: 40,
    prerequisites: ['refinery_throughput_1'],

    effects: [
      { type: 'multiplier', target: 'refineryBarge_production', value: 1.25 },
    ],
  },
  {
    id: 'fuel_synthesis',
    name: 'Fuel Synthesis',
    description: 'Unlock Fuel Synthesizers',
    branch: 'efficiency',
    tier: 2,
    dataFragmentCost: 30,
    prerequisites: [],

    effects: [{ type: 'unlock', target: 'fuelSynthesizer', value: 1 }],
  },
  {
    id: 'advanced_smelting',
    name: 'Advanced Smelting',
    description: 'Refineries convert at 10→3 Metal ratio',
    branch: 'efficiency',
    tier: 2,
    dataFragmentCost: 50,
    prerequisites: ['refinery_throughput_1'],

    effects: [
      { type: 'multiplier', target: 'refineryBarge_efficiency', value: 1.5 },
    ],
  },
  {
    id: 'material_science_1',
    name: 'Material Science I',
    description: '+15% all resource generation',
    branch: 'efficiency',
    tier: 2,
    dataFragmentCost: 75,
    prerequisites: [],

    effects: [{ type: 'multiplier', target: 'all_production', value: 1.15 }],
  },

  // Tier 3
  {
    id: 'drone_optimization_3',
    name: 'Drone Optimization III',
    description: '+30% Salvage Drone production',
    branch: 'efficiency',
    tier: 3,
    dataFragmentCost: 100,
    prerequisites: ['drone_optimization_2'],

    effects: [
      { type: 'multiplier', target: 'salvageDrone_production', value: 1.3 },
    ],
  },
  {
    id: 'quantum_catalysis',
    name: 'Quantum Catalysis',
    description: 'Fuel Synthesizers use 10→1 ratio',
    branch: 'efficiency',
    tier: 3,
    dataFragmentCost: 150,
    prerequisites: ['fuel_synthesis'],

    effects: [
      { type: 'multiplier', target: 'fuelSynthesizer_efficiency', value: 5 },
    ],
  },
  {
    id: 'exotic_refinement',
    name: 'Exotic Refinement',
    description: 'Unlock Exotic Alloy production from Rare Materials',
    branch: 'efficiency',
    tier: 3,
    dataFragmentCost: 200,
    prerequisites: [],

    effects: [{ type: 'unlock', target: 'exoticAlloy_production', value: 1 }],
  },
  {
    id: 'material_science_2',
    name: 'Material Science II',
    description: '+25% all resource generation',
    branch: 'efficiency',
    tier: 3,
    dataFragmentCost: 250,
    prerequisites: ['material_science_1'],

    effects: [{ type: 'multiplier', target: 'all_production', value: 1.25 }],
  },
  {
    id: 'zero_point_energy',
    name: 'Zero-Point Energy',
    description: 'All ships cost -15% resources',
    branch: 'efficiency',
    tier: 3,
    dataFragmentCost: 300,
    prerequisites: [],

    effects: [{ type: 'multiplier', target: 'ship_cost', value: 0.85 }],
  },

  // Tier 4
  {
    id: 'drone_optimization_4',
    name: 'Drone Optimization IV',
    description: '+50% Salvage Drone production',
    branch: 'efficiency',
    tier: 4,
    dataFragmentCost: 500,
    prerequisites: ['drone_optimization_3'],

    effects: [
      { type: 'multiplier', target: 'salvageDrone_production', value: 1.5 },
    ],
  },
  {
    id: 'matter_replication',
    name: 'Matter Replication',
    description: 'Production ships produce +50%',
    branch: 'efficiency',
    tier: 4,
    dataFragmentCost: 750,
    prerequisites: [],

    effects: [{ type: 'multiplier', target: 'all_production', value: 1.5 }],
  },
  {
    id: 'fusion_mastery',
    name: 'Fusion Mastery',
    description: 'Fuel Synthesizers also generate 0.5 Exotic Alloys/sec',
    branch: 'efficiency',
    tier: 4,
    dataFragmentCost: 1000,
    prerequisites: ['quantum_catalysis'],

    effects: [
      {
        type: 'flat_bonus',
        target: 'fuelSynthesizer_exoticAlloy',
        value: 0.5,
      },
    ],
  },
  {
    id: 'material_science_3',
    name: 'Material Science III',
    description: '+50% all resource generation',
    branch: 'efficiency',
    tier: 4,
    dataFragmentCost: 1500,
    prerequisites: ['material_science_2'],

    effects: [{ type: 'multiplier', target: 'all_production', value: 1.5 }],
  },

  // Tier 5
  {
    id: 'drone_optimization_5',
    name: 'Drone Optimization V',
    description: '+100% Salvage Drone production',
    branch: 'efficiency',
    tier: 5,
    dataFragmentCost: 2500,
    prerequisites: ['drone_optimization_4'],

    effects: [
      { type: 'multiplier', target: 'salvageDrone_production', value: 2 },
    ],
  },
  {
    id: 'quantum_manufacturing',
    name: 'Quantum Manufacturing',
    description: 'All production ×2',
    branch: 'efficiency',
    tier: 5,
    dataFragmentCost: 5000,
    prerequisites: [],

    effects: [{ type: 'multiplier', target: 'all_production', value: 2 }],
  },
  {
    id: 'arkwright_protocol',
    name: 'Arkwright Protocol',
    description: 'Production buildings cost -50%',
    branch: 'efficiency',
    tier: 5,
    dataFragmentCost: 10000,
    prerequisites: [],

    effects: [{ type: 'multiplier', target: 'ship_cost', value: 0.5 }],
  },
  {
    id: 'advancedAI',
    name: 'Advanced AI Research',
    description: 'Unlock AI Core Fabricator for late-game AI Core production',
    branch: 'efficiency',
    tier: 4,
    dataFragmentCost: 1000,
    prerequisites: ['material_science_3'],

    effects: [{ type: 'unlock', target: 'aiCoreFabricator', value: 1 }],
  },
];

// ============================================================================
// EXPLORATION BRANCH - Discovery & Missions
// ============================================================================

const EXPLORATION_TECHS: TechNode[] = [
  // Tier 1
  {
    id: 'basic_sensors',
    name: 'Basic Sensors',
    description: 'Scout Probes +10% discovery chance',
    branch: 'exploration',
    tier: 1,
    dataFragmentCost: 8,
    prerequisites: [],

    effects: [
      { type: 'multiplier', target: 'scout_discovery_rate', value: 1.1 },
    ],
  },
  {
    id: 'fast_survey',
    name: 'Fast Survey',
    description: 'Scout mission time -25%',
    branch: 'exploration',
    tier: 1,
    dataFragmentCost: 12,
    prerequisites: [],

    effects: [{ type: 'multiplier', target: 'scout_mission_time', value: 0.75 }],
  },
  {
    id: 'salvage_training',
    name: 'Salvage Training',
    description: 'Salvage Frigate success rate +5%',
    branch: 'exploration',
    tier: 1,
    dataFragmentCost: 10,
    prerequisites: [],

    effects: [
      { type: 'flat_bonus', target: 'salvage_success_rate', value: 0.05 },
    ],
  },
  {
    id: 'orbital_mechanics_1',
    name: 'Orbital Mechanics I',
    description: 'Travel time between orbits -20%',
    branch: 'exploration',
    tier: 1,
    dataFragmentCost: 20,
    prerequisites: [],

    effects: [{ type: 'multiplier', target: 'travel_time', value: 0.8 }],
  },

  // Tier 2
  {
    id: 'advanced_sensors',
    name: 'Advanced Sensors',
    description: 'Scout Probes +15% discovery chance (stacks)',
    branch: 'exploration',
    tier: 2,
    dataFragmentCost: 30,
    prerequisites: ['basic_sensors'],

    effects: [
      { type: 'multiplier', target: 'scout_discovery_rate', value: 1.15 },
    ],
  },
  {
    id: 'rapid_deployment',
    name: 'Rapid Deployment',
    description: 'All mission times -30%',
    branch: 'exploration',
    tier: 2,
    dataFragmentCost: 50,
    prerequisites: [],

    effects: [{ type: 'multiplier', target: 'mission_time', value: 0.7 }],
  },
  {
    id: 'reinforced_hulls',
    name: 'Reinforced Hulls',
    description: 'All ships +5% mission success rate',
    branch: 'exploration',
    tier: 2,
    dataFragmentCost: 40,
    prerequisites: [],

    effects: [{ type: 'flat_bonus', target: 'mission_success_rate', value: 0.05 }],
  },
  {
    id: 'derelict_analysis',
    name: 'Derelict Analysis',
    description: 'Can see derelict rarity before salvaging',
    branch: 'exploration',
    tier: 2,
    dataFragmentCost: 60,
    prerequisites: ['basic_sensors'],

    effects: [{ type: 'unlock', target: 'derelict_rarity_preview', value: 1 }],
  },
  {
    id: 'fuel_efficiency_1',
    name: 'Fuel Efficiency I',
    description: 'All fuel costs -15%',
    branch: 'exploration',
    tier: 2,
    dataFragmentCost: 80,
    prerequisites: [],

    effects: [{ type: 'multiplier', target: 'fuel_cost', value: 0.85 }],
  },

  // Tier 3
  {
    id: 'colonyTechnology',
    name: 'Colony Technology',
    description: 'Unlock Colony Ships to establish permanent bases',
    branch: 'exploration',
    tier: 3,
    dataFragmentCost: 500,
    prerequisites: [],
    effects: [{ type: 'unlock', target: 'colonyShip', value: 1 }],
  },
  {
    id: 'quantum_entanglement_comms',
    name: 'Quantum Entanglement Comms',
    description: 'Scouts can find derelicts in adjacent orbits',
    branch: 'exploration',
    tier: 3,
    dataFragmentCost: 150,
    prerequisites: ['advanced_sensors'],

    effects: [{ type: 'unlock', target: 'adjacent_orbit_scouting', value: 1 }],
  },
  {
    id: 'deep_space_sensors',
    name: 'Deep Space Sensors',
    description: 'Base derelict spawn rate +25%',
    branch: 'exploration',
    tier: 3,
    dataFragmentCost: 200,
    prerequisites: [],

    effects: [{ type: 'multiplier', target: 'derelict_spawn_rate', value: 1.25 }],
  },
  {
    id: 'salvage_mastery',
    name: 'Salvage Mastery',
    description: 'Salvage rewards +25%',
    branch: 'exploration',
    tier: 3,
    dataFragmentCost: 250,
    prerequisites: [],

    effects: [{ type: 'multiplier', target: 'salvage_rewards', value: 1.25 }],
  },
  {
    id: 'orbital_mechanics_2',
    name: 'Orbital Mechanics II',
    description: 'Travel time -30% (stacks)',
    branch: 'exploration',
    tier: 3,
    dataFragmentCost: 300,
    prerequisites: ['orbital_mechanics_1'],

    effects: [{ type: 'multiplier', target: 'travel_time', value: 0.7 }],
  },
  {
    id: 'risk_assessment',
    name: 'Risk Assessment',
    description: 'HACK action success rate +10%',
    branch: 'exploration',
    tier: 3,
    dataFragmentCost: 400,
    prerequisites: [],

    effects: [{ type: 'flat_bonus', target: 'hack_success_rate', value: 0.1 }],
  },

  // Tier 4
  {
    id: 'predictive_algorithms',
    name: 'Predictive Algorithms',
    description: 'Rare+ derelict spawn chance +15%',
    branch: 'exploration',
    tier: 4,
    dataFragmentCost: 800,
    prerequisites: [],

    effects: [
      { type: 'multiplier', target: 'rare_derelict_spawn_rate', value: 1.15 },
    ],
  },
  {
    id: 'instant_warp',
    name: 'Instant Warp',
    description: '1 free instant travel per run (resets on prestige)',
    branch: 'exploration',
    tier: 4,
    dataFragmentCost: 1200,
    prerequisites: [],

    effects: [{ type: 'unlock', target: 'instant_warp_ability', value: 1 }],
  },
  {
    id: 'master_salvager',
    name: 'Master Salvager',
    description: 'All salvage rewards +50%',
    branch: 'exploration',
    tier: 4,
    dataFragmentCost: 1500,
    prerequisites: ['salvage_mastery'],

    effects: [{ type: 'multiplier', target: 'salvage_rewards', value: 1.5 }],
  },
  {
    id: 'fuel_efficiency_2',
    name: 'Fuel Efficiency II',
    description: 'All fuel costs -30% (stacks)',
    branch: 'exploration',
    tier: 4,
    dataFragmentCost: 2000,
    prerequisites: ['fuel_efficiency_1'],

    effects: [{ type: 'multiplier', target: 'fuel_cost', value: 0.7 }],
  },

  // Tier 5
  {
    id: 'xenoarchaeology',
    name: 'Xenoarchaeology',
    description: 'Legendary derelict spawn chance +5%',
    branch: 'exploration',
    tier: 5,
    dataFragmentCost: 3000,
    prerequisites: [],

    effects: [
      {
        type: 'multiplier',
        target: 'legendary_derelict_spawn_rate',
        value: 1.05,
      },
    ],
  },
  {
    id: 'fleet_coordination',
    name: 'Fleet Coordination',
    description: 'Can run 2 missions simultaneously per ship type',
    branch: 'exploration',
    tier: 5,
    dataFragmentCost: 5000,
    prerequisites: [],

    effects: [{ type: 'unlock', target: 'dual_missions', value: 1 }],
  },
  {
    id: 'ark_tech_integration',
    name: 'Ark-Tech Integration',
    description: 'Ark component drop chance +10%',
    branch: 'exploration',
    tier: 5,
    dataFragmentCost: 8000,
    prerequisites: [],

    effects: [{ type: 'multiplier', target: 'ark_component_drop_rate', value: 1.1 }],
  },
];

// ============================================================================
// ECONOMY BRANCH - QoL & Optimization
// ============================================================================

const ECONOMY_TECHS: TechNode[] = [
  // Tier 1
  {
    id: 'bulk_purchasing_1',
    name: 'Bulk Purchasing I',
    description: 'Unlock Buy10 button',
    branch: 'economy',
    tier: 1,
    dataFragmentCost: 4,
    prerequisites: [],

    effects: [{ type: 'unlock', target: 'buy10_button', value: 1 }],
  },
  {
    id: 'auto_click',
    name: 'Auto-Click',
    description: 'Gain 1 passive click/sec',
    branch: 'economy',
    tier: 1,
    dataFragmentCost: 8,
    prerequisites: [],

    effects: [{ type: 'flat_bonus', target: 'passive_clicks', value: 1 }],
  },
  {
    id: 'resource_compression',
    name: 'Resource Compression',
    description: 'Storage limits +50%',
    branch: 'economy',
    tier: 1,
    dataFragmentCost: 15,
    prerequisites: [],

    effects: [{ type: 'multiplier', target: 'storage_limit', value: 1.5 }],
  },
  {
    id: 'basic_automation',
    name: 'Basic Automation',
    description: 'Salvage Drones work 10% faster when idle',
    branch: 'economy',
    tier: 1,
    dataFragmentCost: 20,
    prerequisites: [],

    effects: [
      { type: 'multiplier', target: 'salvageDrone_idle_bonus', value: 1.1 },
    ],
  },

  // Tier 2
  {
    id: 'bulk_purchasing_2',
    name: 'Bulk Purchasing II',
    description: 'Unlock Buy100 button',
    branch: 'economy',
    tier: 2,
    dataFragmentCost: 25,
    prerequisites: ['bulk_purchasing_1'],

    effects: [{ type: 'unlock', target: 'buy100_button', value: 1 }],
  },
  {
    id: 'enhanced_auto_click',
    name: 'Enhanced Auto-Click',
    description: 'Passive clicks now give 2 Debris each',
    branch: 'economy',
    tier: 2,
    dataFragmentCost: 40,
    prerequisites: ['auto_click'],

    effects: [{ type: 'multiplier', target: 'passive_click_power', value: 2 }],
  },
  {
    id: 'offline_optimization_1',
    name: 'Offline Optimization I',
    description: 'Offline efficiency 50% → 60%',
    branch: 'economy',
    tier: 2,
    dataFragmentCost: 50,
    prerequisites: [],

    effects: [{ type: 'flat_bonus', target: 'offline_efficiency', value: 0.1 }],
  },
  {
    id: 'market_access',
    name: 'Market Access',
    description: 'Unlock Trading Post (sell excess resources)',
    branch: 'economy',
    tier: 2,
    dataFragmentCost: 75,
    prerequisites: [],

    effects: [{ type: 'unlock', target: 'trading_post', value: 1 }],
  },

  // Tier 3
  {
    id: 'bulk_purchasing_3',
    name: 'Bulk Purchasing III',
    description: 'Unlock BuyMax button',
    branch: 'economy',
    tier: 3,
    dataFragmentCost: 100,
    prerequisites: ['bulk_purchasing_2'],

    effects: [{ type: 'unlock', target: 'buymax_button', value: 1 }],
  },
  {
    id: 'auto_scout',
    name: 'Auto-Scout',
    description: 'Scouts automatically deploy when available',
    branch: 'economy',
    tier: 3,
    dataFragmentCost: 200,
    prerequisites: [],

    effects: [{ type: 'unlock', target: 'auto_scout', value: 1 }],
  },
  {
    id: 'offline_optimization_2',
    name: 'Offline Optimization II',
    description: 'Offline efficiency 60% → 75%',
    branch: 'economy',
    tier: 3,
    dataFragmentCost: 300,
    prerequisites: ['offline_optimization_1'],

    effects: [{ type: 'flat_bonus', target: 'offline_efficiency', value: 0.15 }],
  },
  {
    id: 'contracts',
    name: 'Contracts',
    description: 'Unlock Contracts system (optional missions)',
    branch: 'economy',
    tier: 3,
    dataFragmentCost: 400,
    prerequisites: [],

    effects: [{ type: 'unlock', target: 'contracts_system', value: 1 }],
  },
  {
    id: 'smart_manufacturing',
    name: 'Smart Manufacturing',
    description: 'Ships cost -20%',
    branch: 'economy',
    tier: 3,
    dataFragmentCost: 500,
    prerequisites: [],

    effects: [{ type: 'multiplier', target: 'ship_cost', value: 0.8 }],
  },

  // Tier 4
  {
    id: 'quantum_computing',
    name: 'Quantum Computing',
    description: 'Offline efficiency 75% → 90%',
    branch: 'economy',
    tier: 4,
    dataFragmentCost: 1000,
    prerequisites: ['offline_optimization_2'],

    effects: [{ type: 'flat_bonus', target: 'offline_efficiency', value: 0.15 }],
  },
  {
    id: 'auto_salvage',
    name: 'Auto-Salvage',
    description: 'Common derelicts auto-salvage in colonized orbits',
    branch: 'economy',
    tier: 4,
    dataFragmentCost: 1500,
    prerequisites: [],

    effects: [{ type: 'unlock', target: 'auto_salvage', value: 1 }],
  },
  {
    id: 'market_mastery',
    name: 'Market Mastery',
    description: 'Trading Post rates improved by 50%',
    branch: 'economy',
    tier: 4,
    dataFragmentCost: 2000,
    prerequisites: ['market_access'],

    effects: [{ type: 'multiplier', target: 'trading_post_rates', value: 1.5 }],
  },
  {
    id: 'fleet_management',
    name: 'Fleet Management',
    description: 'Unlock Fleet Formations system',
    branch: 'economy',
    tier: 4,
    dataFragmentCost: 2500,
    prerequisites: [],

    effects: [{ type: 'unlock', target: 'fleet_formations', value: 1 }],
  },

  // Tier 5
  {
    id: 'total_automation',
    name: 'Total Automation',
    description: 'All mission types can auto-deploy',
    branch: 'economy',
    tier: 5,
    dataFragmentCost: 5000,
    prerequisites: [],

    effects: [{ type: 'unlock', target: 'total_automation', value: 1 }],
  },
  {
    id: 'perfect_efficiency',
    name: 'Perfect Efficiency',
    description: 'Offline efficiency 90% → 100%',
    branch: 'economy',
    tier: 5,
    dataFragmentCost: 7500,
    prerequisites: ['quantum_computing'],

    effects: [{ type: 'flat_bonus', target: 'offline_efficiency', value: 0.1 }],
  },
  {
    id: 'corporate_empire',
    name: 'Corporate Empire',
    description: 'All costs -30%, all production +30%',
    branch: 'economy',
    tier: 5,
    dataFragmentCost: 10000,
    prerequisites: [],

    effects: [
      { type: 'multiplier', target: 'all_costs', value: 0.7 },
      { type: 'multiplier', target: 'all_production', value: 1.3 },
    ],
  },
];

// ============================================================================
// EXPORTS
// ============================================================================

export const TECH_TREE: Record<string, TechNode> = [
  ...EFFICIENCY_TECHS,
  ...EXPLORATION_TECHS,
  ...ECONOMY_TECHS,
].reduce(
  (acc, tech) => {
    acc[tech.id] = tech;
    return acc;
  },
  {} as Record<string, TechNode>
);

export const TECH_BRANCHES: Record<TechBranch, TechNode[]> = {
  efficiency: EFFICIENCY_TECHS,
  exploration: EXPLORATION_TECHS,
  economy: ECONOMY_TECHS,
};

export const getTechsByBranch = (branch: TechBranch): TechNode[] => {
  return TECH_BRANCHES[branch];
};

export const getTechsByTier = (
  branch: TechBranch,
  tier: TechTier
): TechNode[] => {
  return TECH_BRANCHES[branch].filter((tech) => tech.tier === tier);
};

export const getTechById = (id: string): TechNode | undefined => {
  return TECH_TREE[id];
};

// Helper to check if all prerequisites are met
export const arePrerequisitesMet = (
  tech: TechNode,
  purchasedTechs: string[]
): boolean => {
  if (!tech.prerequisites || tech.prerequisites.length === 0) return true;
  return tech.prerequisites.every((prereq) => purchasedTechs.includes(prereq));
};
