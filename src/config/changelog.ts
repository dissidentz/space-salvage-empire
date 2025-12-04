// Changelog data for Space Salvage Empire

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: {
    category: 'feature' | 'improvement' | 'bugfix' | 'balance';
    description: string;
  }[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '0.2.9',
    date: '2025-12-04',
    changes: [
      {
        category: 'bugfix',
        description: 'Fixed "Long-Range Comms" upgrade to correctly allow scouting of adjacent orbits',
      },
    ],
  },
  {
    version: '0.2.8',
    date: '2025-12-04',
    changes: [
      {
        category: 'feature',
        description: 'Implemented Economy tech features: Bulk Buy buttons (Buy 10/100/Max), Offline Production, and Passive Clicks',
      },
      {
        category: 'balance',
        description: 'Implemented "Corporate Empire" tech effects: -30% all costs, +30% all production',
      },
      {
        category: 'bugfix',
        description: 'Fixed "Basic Automation" tech to correctly apply +10% production to Salvage Drones',
      },
    ],
  },
  {
    version: '0.2.7',
    date: '2025-12-04',
    changes: [
      {
        category: 'bugfix',
        description: 'Exploration techs now apply correctly: scout discovery rate, mission times, travel time, fuel costs, salvage rewards, and success rate bonuses',
      },
    ],
  },
  {
    version: '0.2.6',
    date: '2025-12-04',
    changes: [
      {
        category: 'balance',
        description: 'Scout missions to LEO, GEO, Lunar Orbit, and your current orbit are now free (0 fuel cost)',
      },
      {
        category: 'bugfix',
        description: 'Fixed ship cost reduction techs (Zero-Point Energy, Arkwright Protocol, Smart Manufacturing) not applying their discounts',
      },
    ],
  },
  {
    version: '0.2.5',
    date: '2025-12-04',
    changes: [
      {
        category: 'bugfix',
        description: 'Fixed "Instant Warp" button disappearing after use - now correctly shows as disabled with tooltip',
      },
      {
        category: 'bugfix',
        description: 'Fixed Auto-Salvage logic to respect "Ship Enabled" settings and correctly track available fleet slots',
      },
      {
        category: 'improvement',
        description: 'Added "[AUTO]" prefix to notifications for automated salvage missions for better visibility',
      },
      {
        category: 'improvement',
        description: 'Refactored "Fleet Formations" list to use a horizontal layout to reduce vertical scrolling',
      },
      {
        category: 'bugfix',
        description: 'Fixed "Location: Unknown" display for Colony Missions in the mission queue',
      },
    ],
  },
  {
    version: '0.2.4',
    date: '2025-12-03',
    changes: [
      {
        category: 'bugfix',
        description: 'Fixed Dual Missions bug - Fleet Coordination and Total Automation now properly allow 2 missions per ship',
      },
      {
        category: 'bugfix',
        description: 'Fixed Auto-Salvage to launch multiple missions when ship slots are available',
      },
      {
        category: 'improvement',
        description: 'Added comprehensive automated tests for Auto-Salvage and Dual Missions features',
      },
    ],
  },
  {
    version: '0.2.3',
    date: '2025-12-03',
    changes: [
      {
        category: 'feature',
        description: 'Implemented Fleet Formations System - Organize ships for specialized bonuses',
      },
      {
        category: 'feature',
        description: 'Added 5 unique formations: Mining, Scout, Salvage, Expedition, and Production',
      },
      {
        category: 'improvement',
        description: 'Added Fleet Formations UI to Fleet View',
      },
    ],
  },
  {
    version: '0.2.2',
    date: '2025-12-03',
    changes: [
      {
        category: 'feature',
        description: 'Implemented "Instant Warp" ability - One free instant travel per run (Tier 4 Exploration)',
      },
      {
        category: 'feature',
        description: 'Verified "Adjacent Orbit Scouting" - Scouts can discover derelicts in neighboring orbits (Tier 3 Exploration)',
      },
      {
        category: 'improvement',
        description: 'Added automated tests for Instant Warp and Adjacent Orbit Scouting mechanics',
      },
    ],
  },
  {
    version: '0.2.1',
    date: '2025-12-03',
    changes: [
      {
        category: 'feature',
        description: 'Auto-Scout automation - Automatically deploys scout ships to unlocked orbits when tech is unlocked (Tier 3 Economy, 200 DF)',
      },
      {
        category: 'feature',
        description: 'Auto-Salvage automation - Automatically salvages common derelicts in colonized orbits (Tier 4 Economy, 1500 DF)',
      },
      {
        category: 'feature',
        description: 'Total Automation tech - Enables dual mission support for automation (Tier 5 Economy, 5000 DF)',
      },
      {
        category: 'improvement',
        description: 'Added automation settings panel to Mission Control with toggles for each automation type',
      },
      {
        category: 'improvement',
        description: 'Automation respects dual missions tech (fleet_coordination) for increased mission capacity',
      },
    ],
  },
  {
    version: '0.2.0',
    date: '2025-12-02',
    changes: [
      {
        category: 'feature',
        description: '✅ PHASE 1: Orbit Progression System - Complete travel mechanics with fuel costs, travel times, and progress tracking',
      },
      {
        category: 'feature',
        description: '✅ PHASE 2: Ship Production & Purchasing - All 11 ship types fully implemented with exponential cost scaling',
      },
      {
        category: 'feature',
        description: '✅ PHASE 3: Mission System - Scout and Salvage missions with proper completion, rewards, and notifications',
      },
      {
        category: 'feature',
        description: '✅ PHASE 4: Derelict System - Passive spawning, 5 rarity tiers, loot tables, and 15-minute expiration',
      },
      {
        category: 'feature',
        description: '✅ PHASE 5: Tech Tree - 45+ technologies across 3 branches (Efficiency, Exploration, Economy) with prerequisites',
      },
      {
        category: 'feature',
        description: '✅ PHASE 6: Prestige & Dark Matter - Quantum Reset system with 5 tiers of perks and 8 Ark components',
      },
      {
        category: 'improvement',
        description: 'Added travel progress bar and time remaining display to Galaxy Map',
      },
      {
        category: 'improvement',
        description: 'Added "Traveling to..." status indicator on Dashboard during orbit travel',
      },
      {
        category: 'improvement',
        description: 'Removed redundant "Change Orbit" button from Dashboard (available in sidebar)',
      },
      {
        category: 'bugfix',
        description: 'Fixed farthest orbit tracking to only update when progressing to numerically higher orbits',
      },
      {
        category: 'bugfix',
        description: 'Fixed test file missing darkMatter property in Resources type',
      },
    ],
  },
  {
    version: '0.1.5',
    date: '2025-12-02',
    changes: [
      {
        category: 'feature',
        description: 'Implemented "Adjacent Orbit Scouting" - scouts can now discover derelicts in neighboring orbits when "Quantum Entanglement Comms" tech is unlocked',
      },
      {
        category: 'feature',
        description: 'Added dedicated Fleet page for better ship management and cleaner Dashboard',
      },
      {
        category: 'improvement',
        description: 'Removed limit of 3 concurrent scout missions - launch as many as you have probes for!',
      },
      {
        category: 'improvement',
        description: 'Added orbit location badge to Derelict Cards to clearly show where discoveries are located',
      },
      {
        category: 'improvement',
        description: 'Added "Change Orbit" button to Dashboard header for quick navigation',
      },
      {
        category: 'improvement',
        description: 'Simplified Scout Probe availability UI (removed "Limit: 3" text)',
      },
    ],
  },
  {
    version: '0.1.4',
    date: '2025-12-02',
    changes: [
      {
        category: 'bugfix',
        description: 'Fixed Tech Tree effects not being applied - flat_bonus effects like "Click Amplification" now work correctly',
      },
      {
        category: 'bugfix',
        description: 'Fixed manual debris clicking not applying tech multipliers (e.g., click_power)',
      },
      {
        category: 'bugfix',
        description: 'Fixed production logic allowing negative resources when input materials were insufficient',
      },
      {
        category: 'bugfix',
        description: 'Fixed Scout Probe availability UI to show effective availability considering mission limit (now shows "3/10 Available (Limit: 3)" instead of "10/10")',
      },
      {
        category: 'improvement',
        description: 'Added visual indicator on Mission Launcher when scout mission limit (3) is reached',
      },
      {
        category: 'improvement',
        description: 'Production now scales down gracefully when input resources run out instead of stopping completely',
      },
      {
        category: 'feature',
        description: 'Completed AI Core Fabricator ship - now correctly consumes Exotic Alloys to produce AI Cores',
      },
      {
        category: 'improvement',
        description: 'Replaced all browser alert() dialogs with in-game notifications for better UX',
      },
    ],
  },
  {
    version: '0.1.3',
    date: '2025-12-01',
    changes: [
      {
        category: 'feature',
        description: 'Added persistent Event Log to Mission Log page showing all game events and notifications',
      },
      {
        category: 'feature',
        description: 'Moved Mission Log to a dedicated page accessible via the top navigation',
      },
      {
        category: 'improvement',
        description: 'Added ship availability counter badges to derelict cards (e.g., "5/6 Salvage Frigate")',
      },
      {
        category: 'improvement',
        description: 'Ship counters are color-coded: green when available, red when no ships available',
      },
      {
        category: 'improvement',
        description: 'Removed redundant error messages from derelict cards - ship availability now clearly shown in badge',
      },
      {
        category: 'improvement',
        description: 'Redesigned Sidebar Location UI with a new "Current Location" card and "Change Orbit" button',
      },
      {
        category: 'improvement',
        description: 'Removed "Available Destinations" list from Sidebar to reduce clutter',
      },
      {
        category: 'improvement',
        description: 'Implemented global Orbit Selector modal for easier navigation',
      },
      {
        category: 'improvement',
        description: 'Removed redundant "Current Orbit" section from Dashboard',
      },
      {
        category: 'improvement',
        description: 'Moved "Collect Debris" button to Sidebar Resources section for better accessibility',
      },
      {
        category: 'improvement',
        description: 'Removed Resources Display from Dashboard (now in Sidebar)',
      },
      {
        category: 'improvement',
        description: 'Resource production rates now always visible and update immediately when toggling ships',
      },
      {
        category: 'improvement',
        description: 'Removed Mission History from Dashboard (now on dedicated Mission Log page)',
      },
      {
        category: 'improvement',
        description: 'Removed status message section from Dashboard for cleaner layout',
      },
      {
        category: 'improvement',
        description: 'Integrated scout mission progress directly into Scout Probe card instead of separate section',
      },
      {
        category: 'improvement',
        description: 'Added scrollable container to mission list with max height to prevent page overflow',
      },
      {
        category: 'improvement',
        description: 'Added progress bars and time remaining to derelict salvage missions',
      },
      {
        category: 'improvement',
        description: 'Added cancel button to active missions for easy mission management',
      },
      {
        category: 'improvement',
        description: 'Improved Salvage button text contrast for better readability',
      },
      {
        category: 'improvement',
        description: 'Added custom thin scrollbar styling across the entire app for consistent appearance',
      },
      {
        category: 'bugfix',
        description: 'Fixed duplicate close button in Orbit Selector modal',
      },
      {
        category: 'bugfix',
        description: 'Fixed infinite loop issue in Mission Log page event display',
      },
    ],
  },
  {
    version: '0.1.2',
    date: '2025-12-01',
    changes: [
      {
        category: 'bugfix',
        description: 'Fixed sidebar layout to ensure it stays visible while scrolling (sticky positioning)',
      },
    ],
  },
  {
    version: '0.1.1',
    date: '2025-11-30',
    changes: [
      {
        category: 'balance',
        description: 'LEO and GEO travel now costs 0 fuel (previously GEO cost 50 fuel)',
      },
      {
        category: 'balance',
        description: 'Scout missions to LEO and GEO now cost 0 fuel (previously cost 50 fuel)',
      },
      {
        category: 'balance',
        description: 'Salvage missions for derelicts in LEO and GEO now cost 0 fuel regardless of player location',
      },
      {
        category: 'balance',
        description: 'Colony missions to LEO and GEO now cost 0 fuel',
      },
      {
        category: 'balance',
        description: 'ALL derelicts in LEO and GEO now guarantee fuel drops (100% drop rate) with significantly increased amounts to help bootstrap progression to Mars',
      },
      {
        category: 'balance',
        description: 'Improved data fragment drops from LEO and GEO derelicts',
      },
      {
        category: 'bugfix',
        description: 'Fixed issue where deleting derelict missions was not working',
      },
      {
        category: 'bugfix',
        description: 'Prevented launching multiple missions for the same derelict',
      },
      {
        category: 'improvement',
        description: 'Derelicts no longer expire if a mission is currently in progress targeting them',
      },
      {
        category: 'feature',
        description: 'Added Changelog view to track game updates',
      },
    ],
  },
  {
    version: '0.1.0',
    date: '2025-11-30',
    changes: [
      {
        category: 'feature',
        description: 'Initial game release with 8 orbital regions (LEO through Deep Space)',
      },
      {
        category: 'feature',
        description: 'Mission system with Scout, Salvage, and Colony missions',
      },
      {
        category: 'feature',
        description: 'Derelict discovery and salvage mechanics',
      },
      {
        category: 'feature',
        description: 'Ship production and fleet management',
      },
      {
        category: 'feature',
        description: 'Tech tree with multiple research branches',
      },
      {
        category: 'feature',
        description: 'Prestige system with Dark Matter currency',
      },
    ],
  },
];
