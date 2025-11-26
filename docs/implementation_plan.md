Orbit Progression System - Implementation Plan
Overview
Implement the orbit progression system to enable travel between 8 orbital zones (LEO ΓåÆ GEO ΓåÆ Lunar ΓåÆ Mars ΓåÆ Asteroid Belt ΓåÆ Jovian ΓåÆ Kuiper ΓåÆ Deep Space), with fuel costs, travel times, production multipliers, and unlock requirements.

Current State Analysis
Γ£à Already Implemented:
Orbit configs with all 8 orbits defined
Production multipliers (metal, electronics, rare materials)
Unlock requirements (resources, tech, colonies)
Helper functions (
getNextOrbit
, 
isOrbitUnlocked
, 
getOrbitColor
)
Current orbit tracked in game state
Γ¥î Not Yet Implemented:
Travel UI/interface
Travel mechanics (fuel consumption, time delays)
Orbit-based ship unlocking
Visual orbit map
Travel history/stats
Proposed Changes
Phase 1: Core Travel Mechanics
[MODIFY] 
gameStore.ts
Add travel state:

interface GameStore extends GameState {
  // Existing...
  
  // New travel actions
  canTravelTo: (orbit: OrbitType) => boolean;
  startTravel: (orbit: OrbitType) => boolean;
  completeTravelIfReady: () => void;
  
  // Travel state
  travelState: {
    traveling: boolean;
    destination: OrbitType | null;
    startTime: number;
    endTime: number;
  } | null;
}
Implementation:

canTravelTo() - Check fuel, unlock requirements, not currently traveling
startTravel() - Deduct fuel, set travel state, update stats
completeTravelIfReady() - Called by game loop, updates orbit when travel completes
[MODIFY] 
useGameLoop.ts
Add travel completion check:

// In game loop interval
if (state.travelState?.traveling) {
  state.completeTravelIfReady();
}
Phase 2: Orbit Selection UI
[NEW] 
OrbitSelector.tsx
Purpose: Dropdown/modal to select and travel to orbits

Features:

List all 8 orbits with status (current, unlocked, locked)
Show unlock requirements for locked orbits
Display fuel cost and travel time
Show production multipliers
"Travel" button (disabled if can't afford or locked)
Current orbit highlighted
Layout:

ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ
Γöé Current Orbit: LEO              Γöé
Γö£ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöñ
Γöé Γ£ô LEO (Current)                 Γöé
Γöé Γ£ô GEO - 100 Fuel, 2min          Γöé
Γöé   2x Metal, 1.5x Electronics    Γöé
Γöé   [Travel]                      Γöé
Γö£ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöñ
Γöé ≡ƒöÆ Lunar - Requires 1K Metal    Γöé
Γöé ≡ƒöÆ Mars - Requires 10K Metal    Γöé
Γöé ≡ƒöÆ Asteroid Belt - Locked       Γöé
ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ
[NEW] 
OrbitCard.tsx
Purpose: Individual orbit display in selector

Props:

interface OrbitCardProps {
  orbit: OrbitType;
  isCurrent: boolean;
  isUnlocked: boolean;
  canAfford: boolean;
  onTravel: () => void;
}
Features:

Orbit name and icon
Lock/unlock status
Multiplier badges
Fuel cost display
Travel time estimate
Travel button
Phase 3: Travel Progress UI
[NEW] 
TravelProgress.tsx
Purpose: Show active travel progress

Features:

Progress bar with time remaining
Destination orbit
ETA countdown
"Cancel" button (refund 50% fuel?)
Animated ship icon
Display:

ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ
Γöé ≡ƒÜÇ Traveling to GEO...          Γöé
Γöé ΓûêΓûêΓûêΓûêΓûêΓûêΓûêΓûêΓûæΓûæΓûæΓûæΓûæΓûæΓûæΓûæΓûæΓûæΓûæΓûæ 40%        Γöé
Γöé ETA: 1m 12s                     Γöé
ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ
Phase 4: Integration with Existing Systems
[MODIFY] 
DashboardView.tsx
Add orbit display:

Current orbit badge at top
"Change Orbit" button ΓåÆ opens OrbitSelector
Travel progress banner (if traveling)
[MODIFY] 
sidebar-left.tsx
Add Galaxy Map navigation:

{
  title: 'Operations',
  items: [
    { title: 'Galaxy Map', url: '#', action: 'openGalaxyMap' },
    // ...
  ]
}
[MODIFY] 
ShipCard.tsx
Update unlock requirements display:

Show orbit requirement if ship is locked
Example: "Requires GEO Orbit" for Electronics Extractor
Phase 5: Production Multipliers
[MODIFY] 
production.ts
Update 
calculateMultipliers()
:

function calculateMultipliers(state: GameState) {
  const orbitConfig = ORBIT_CONFIGS[state.currentOrbit];
  
  return {
    orbit: orbitConfig.metalMultiplier, // Apply to all production
    orbitMetal: orbitConfig.metalMultiplier,
    orbitElectronics: orbitConfig.electronicsMultiplier,
    orbitRare: orbitConfig.rareMultiplier,
    // ... existing multipliers
  };
}
Apply resource-specific multipliers:

Metal production: baseProduction * orbitMetal * tech * prestige
Electronics: baseProduction * orbitElectronics * tech * prestige
Rare materials: baseProduction * orbitRare * tech * prestige
Phase 6: Visual Enhancements
[NEW] 
GalaxyMap.tsx
Purpose: Visual representation of solar system

Features:

SVG or Canvas-based orbit visualization
Planets/zones as clickable nodes
Lines connecting orbits
Current position highlighted
Locked orbits grayed out
Travel paths animated
Layout:

ΓÿÇ∩╕Å Sun
         Γöé
    ΓöîΓöÇΓöÇΓöÇΓöÇΓö╝ΓöÇΓöÇΓöÇΓöÇΓöÉ
   LEO  GEO  Lunar
         Γöé
    ΓöîΓöÇΓöÇΓöÇΓöÇΓö╝ΓöÇΓöÇΓöÇΓöÇΓöÉ
   Mars  Belt Jovian
         Γöé
    ΓöîΓöÇΓöÇΓöÇΓöÇΓö┤ΓöÇΓöÇΓöÇΓöÇΓöÉ
  Kuiper  Deep Space
State Schema Changes
Add to GameState:
interface GameState {
  // Existing...
  
  travelState: {
    traveling: boolean;
    destination: OrbitType | null;
    startTime: number;
    endTime: number;
  } | null;
}
Add to Statistics:
interface Statistics {
  // Existing...
  
  totalTravels: number;
  totalFuelSpent: number;
  totalTravelTime: number; // ms
  farthestOrbit: OrbitType;
}
Unlock Requirements Summary
Orbit	Fuel Cost	Travel Time	Requirements
LEO	0	0	Starting orbit
GEO	100	2 min	100 debris
Lunar	500	5 min	1K metal
Mars	2.5K	12 min	10K metal
Asteroid Belt	12K	30 min	100K metal + tech
Jovian	60K	1 hour	1M metal + colony
Kuiper	250K	3 hours	10M metal + colony
Deep Space	1M	6 hours	7 Ark components
User Flow
First Travel (LEO ΓåÆ GEO):
Player accumulates 100 debris
Clicks "Change Orbit" or "Galaxy Map"
Sees GEO is unlocked (green checkmark)
Clicks "Travel to GEO"
Confirmation: "Travel to GEO? Cost: 100 Fuel, Time: 2 minutes"
Clicks "Confirm"
Fuel deducted (if available)
Travel progress bar appears
After 2 minutes, orbit changes to GEO
Production multipliers update (2x metal!)
Electronics Extractor unlocks
Edge Cases & Validation
Travel Validation:
Γ£à Can't travel while already traveling
Γ£à Can't travel to current orbit
Γ£à Can't travel to locked orbit
Γ£à Can't travel without enough fuel
Γ£à Can't travel if requirements not met
Travel Interruption:
Γ¥ô What happens if player closes browser during travel?
Solution: Save travel state, resume on load
Γ¥ô Can player cancel travel?
Solution: Yes, refund 50% of fuel cost
Offline Travel:
Γ¥ô Does travel complete while offline?
Solution: Yes, check on load and complete if time passed
Implementation Order
Day 1: Core Mechanics
Γ£à Add travel state to gameStore
Γ£à Implement canTravelTo(), startTravel(), completeTravelIfReady()
Γ£à Update game loop to check travel completion
Γ£à Test travel mechanics in console
Day 2: Basic UI
Γ£à Create OrbitSelector component
Γ£à Create OrbitCard component
Γ£à Add "Change Orbit" button to Dashboard
Γ£à Test orbit selection and travel
Day 3: Travel Progress
Γ£à Create TravelProgress component
Γ£à Add travel progress to Dashboard
Γ£à Implement countdown timer
Γ£à Test travel completion
Day 4: Production Integration
Γ£à Update production multipliers
Γ£à Test metal/electronics/rare multipliers
Γ£à Verify ship unlocking by orbit
Γ£à Test full production chain in GEO
Day 5: Visual Polish
Γ£à Create GalaxyMap view
Γ£à Add orbit visualization
Γ£à Add animations and transitions
Γ£à Final testing and bug fixes
Verification Plan
Manual Testing:
Basic Travel:

 Travel from LEO to GEO
 Fuel deducted correctly
 Travel time accurate
 Orbit changes after completion
Unlock Requirements:

 GEO unlocks at 100 debris
 Lunar requires 1K metal
 Locked orbits show requirements
Production Multipliers:

 Metal production 2x in GEO
 Electronics Extractor unlocks in GEO
 Rates update in UI
Edge Cases:

 Can't travel without fuel
 Can't travel while traveling
 Travel completes offline
 Cancel travel refunds fuel
Automated Tests:
describe('Orbit Travel', () => {
  it('should deduct fuel when traveling', () => {
    // Test fuel deduction
  });
  
  it('should apply production multipliers', () => {
    // Test multipliers
  });
  
  it('should unlock ships in new orbit', () => {
    // Test ship unlocking
  });
});
Risk Assessment
Technical Risks:
Medium: Travel state persistence across sessions
Low: Production multiplier calculations
Low: UI complexity
Design Risks:
Medium: Travel times might feel too long/short
Low: Fuel costs might need balancing
Mitigation:
Save travel state to localStorage
Make travel times configurable
Add "skip travel" debug option for testing
Success Criteria
Γ£à Core Functionality:

Player can travel between unlocked orbits
Fuel costs deducted correctly
Travel times enforced
Production multipliers applied
Γ£à User Experience:

Clear visual feedback for travel progress
Intuitive orbit selection UI
Helpful unlock requirement messages
Smooth transitions
Γ£à Integration:

Ships unlock based on orbit
Production rates update correctly
Stats tracked properly
No bugs or edge case issues
Next Steps After Completion
Mission System - Scout and salvage missions in each orbit
Derelict Spawning - Orbit-specific derelict types
Tech Tree - Unlock advanced orbits and bonuses
Colonies - Establish permanent bases in orbits
Notes
Keep travel times short for initial testing (use debug multiplier)
Consider adding "instant travel" prestige perk for later runs
Orbit visuals can be simple initially, enhanced later
Focus on functionality first, polish second