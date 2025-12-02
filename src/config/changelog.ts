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
    version: '0.1.3',
    date: '2025-12-01',
    changes: [
      {
        category: 'feature',
        description: 'Moved Mission Log to a dedicated page accessible via the top navigation',
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
        category: 'bugfix',
        description: 'Fixed duplicate close button in Orbit Selector modal',
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
