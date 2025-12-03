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
