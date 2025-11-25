# Space Salvage Empire - GitHub Copilot Instructions

## Project Overview
Space Salvage Empire is an incremental/idle game built with React + TypeScript where players salvage debris from a destroyed interstellar colony fleet to eventually reconstruct the Exodus Ark.

## Tech Stack
- **Framework:** React 18 + TypeScript + Vite
- **State:** Zustand with persist middleware
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion
- **Canvas:** Konva + React-Konva
- **Audio:** Howler.js
- **Numbers:** break_infinity.js (for large numbers)
- **Utils:** date-fns, lodash

## Core Game Loop
- 10 ticks per second (100ms intervals)
- Production ships generate resources per tick
- Missions have real-time durations
- Offline progress calculated on load (capped at 4 hours, 50% efficiency base)
- Auto-save every 20 seconds

## Key Game Concepts

### Resources (Tier order)
1. **Debris** - Base currency, manual clicking + Salvage Drones
2. **Metal** - Refined from Debris via Refinery Barges
3. **Electronics** - From derelicts + Electronics Extractors
4. **Fuel** - Synthesized from Metal, used for travel/missions
5. **Rare Materials** - Advanced production, from Matter Extractors
6. **Exotic Alloys** - Elite tier, from Quantum Miners
7. **AI Cores** - Rare drops from derelicts
8. **Data Fragments** - Tech tree currency
9. **Dark Matter** - Prestige currency

### Ships (Production vs Active)
**Production Ships:** Generate resources passively (Drones, Refineries, Extractors, etc.)
**Active Ships:** Used for missions (Scout Probes, Salvage Frigates, Colony Ships)

### Orbits
LEO → GEO → Lunar → Mars → Asteroid Belt → Jovian → Kuiper → Deep Space

Each orbit has:
- Resource multipliers
- Fuel cost to enter
- Travel time
- Derelict spawn tables

### Prestige System
- Called "Quantum Reset"
- Earn Dark Matter (DM) based on progress
- DM spent on permanent upgrades
- ~10 runs to complete game
- Run 1 takes ~7 days, Runs 6-9 take ~2 days each, Run 10 takes 8-10 days

### Victory Condition
Collect all 8 Ark components from legendary derelicts, then assemble each component (requires massive resources + real-time construction)

## Code Style Preferences

### TypeScript
- Use strict mode
- Prefer interfaces over types for object shapes
- Use enums for constants (ResourceType, ShipType, OrbitType, etc.)
- Always type function parameters and return values

### React
- Functional components only (no class components)
- Use hooks (useState, useEffect, useMemo, useCallback)
- Custom hooks for reusable logic (useGameLoop, useMissions, useSound)
- React.memo for expensive components
- Lazy load heavy components (modals, screens)

### State Management
- Use Zustand selectors to prevent unnecessary re-renders
- Keep related state together in slices
- Use immer middleware for nested state updates
- Persist game state to localStorage

### Naming Conventions
- Components: PascalCase (ResourceBar, FleetPanel)
- Hooks: camelCase with 'use' prefix (useGameLoop, useMissions)
- Utils: camelCase (calculateCost, formatNumber)
- Constants: SCREAMING_SNAKE_CASE (MAX_OFFLINE_TIME, TICKS_PER_SECOND)
- Types/Interfaces: PascalCase (GameState, ShipConfig, DerelictTemplate)

### File Organization
- One component per file
- Co-locate related files (Component.tsx + Component.test.tsx)
- Barrel exports from index.ts files
- Config files in `/src/config/`
- Game logic in `/src/engine/`
- UI components in `/src/components/`

### Comments
- Use JSDoc for functions with complex logic
- Comment formulas with references to game design doc
- Explain "why" not "what" in comments
- Add TODO comments for future improvements

## Important Formulas

### Cost Scaling
```typescript
cost(n) = baseCost * (growthRate ^ n)
// where n = current count of ship type
// Growth rates: 1.15 (common), 1.18 (uncommon), 1.20 (rare), 1.22+ (epic)
```

### Production Per Tick
```typescript
perTickProduction = (baseProduction * shipCount * globalMultipliers) / TICKS_PER_SECOND
// TICKS_PER_SECOND = 10
```

### Dark Matter Gain
```typescript
baseDM = sqrt(totalDataFragments / 100)
orbitBonus = 1 + (maxOrbitReached * 0.3)
derelictBonus = 1 + (totalDerelictsSalvaged / 50)
timeBonus = 1 + min(hoursPlayed / 10, 3.0) // capped at 3x
darkMatter = floor(baseDM * orbitBonus * derelictBonus * timeBonus)
```

## Common Patterns

### Buying Ships
```typescript
const buyShip = (shipType: ShipType, amount: number = 1) => {
  for (let i = 0; i < amount; i++) {
    const cost = calculateCost(shipType, currentCount);
    if (!canAfford(cost)) break;
    deductResources(cost);
    incrementShipCount(shipType);
  }
};
```

### Mission State
```typescript
interface Mission {
  id: string;
  type: 'scout' | 'salvage';
  shipType: ShipType;
  startTime: number; // ms timestamp
  endTime: number; // ms timestamp
  targetOrbit: OrbitType;
  fuelCost: number;
  payload?: DerelictId; // for salvage missions
}
```

### Derelict Spawning
```typescript
// Check every 5 seconds
const checkDerelictSpawn = () => {
  const baseChance = 0.01; // 1% per check
  const scoutBonus = scoutCount * 0.02;
  const techBonus = getTechMultiplier('discovery');
  const orbitMultiplier = currentOrbit.discoveryRate;
  
  const spawnChance = baseChance * (1 + scoutBonus) * techBonus * orbitMultiplier;
  
  if (Math.random() < spawnChance) {
    spawnDerelict(currentOrbit);
  }
};
```

## Testing Guidelines
- Test all cost formulas with edge cases (0 ships, max ships)
- Test prestige calculations don't lose data
- Test offline progress calculations
- Mock timers for mission/production tests
- Test save/load doesn't corrupt state

## Performance Guidelines
- Use React.memo for components that render frequently
- Debounce expensive calculations (cost preview when dragging sliders)
- Throttle visual updates (ship positions can update at 30fps instead of 60fps)
- Lazy load modals and heavy components
- Use Zustand selectors to minimize re-renders

## Audio Guidelines
- All sound effects should be < 100KB
- Use audio sprites for similar sounds (different pitches for resources)
- Always check if sound is enabled before playing
- Fade music in/out, don't stop abruptly
- Handle mobile audio restrictions (require user interaction)

## Animation Guidelines
- Use Framer Motion for UI animations (buttons, modals, resource popups)
- Use Konva for canvas animations (ships, orbits)
- Keep animations under 500ms for snappy feel
- Use spring animations for natural movement
- Reduce motion for accessibility (prefers-reduced-motion)

## Common Gotchas
- Always use break_infinity.js for resource calculations above 1e15
- Check for divide by zero in production formulas
- Cap offline time at MAX_OFFLINE_TIME (4 hours default)
- Validate save data version before loading
- Handle mission completion when game is closed (check on load)
- Derelicts despawn after 24 hours if not salvaged

## When Generating Code
1. Always check if a similar pattern exists in the codebase first
2. Use TypeScript types from `/src/types/`
3. Import from barrel exports (index.ts files)
4. Follow the established folder structure
5. Add appropriate error handling
6. Consider performance implications
7. Add JSDoc comments for complex functions
8. Use existing utility functions from `/src/utils/`
9. Follow the established naming conventions
10. Consider mobile/touch interactions

## Useful Context Files
- `/docs/GAME_DESIGN.md` - Full game design document
- `/docs/FORMULAS.md` - All mathematical formulas
- `/docs/STATE_SCHEMA.md` - Complete state structure
- `/src/config/*.ts` - All game configuration data