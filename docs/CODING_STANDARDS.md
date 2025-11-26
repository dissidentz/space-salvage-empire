# Space Salvage Empire - Coding Standards

## File Organization

### Directory Structure

```
src/
├── components/        # React components
│   ├── ui/           # Reusable UI components (buttons, modals, etc.)
│   ├── fleet/        # Fleet-related components
│   ├── tech/         # Tech tree components
│   └── solar/        # Solar system view components
├── stores/           # Zustand stores
├── engine/           # Game logic (tick, production, missions)
├── config/           # Static game data (ships, orbits, techs)
├── utils/            # Utility functions
├── hooks/            # Custom React hooks
├── types/            # TypeScript type definitions
└── assets/           # Images, sounds, etc.
```

### File Naming

- Components: `PascalCase.tsx` (e.g., `ResourceBar.tsx`)
- Hooks: `camelCase.ts` with 'use' prefix (e.g., `useGameLoop.ts`)
- Utils: `camelCase.ts` (e.g., `formatNumber.ts`)
- Types: `PascalCase.ts` or `types.ts` (e.g., `GameState.ts`)
- Config: `camelCase.ts` (e.g., `shipConfigs.ts`)

## TypeScript Standards

### Strict Mode

Always use TypeScript strict mode:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  }
}
```

### Type Definitions

```typescript
// ✅ Good: Explicit types
function calculateCost(shipType: ShipType, count: number): number {
  return baseCost * Math.pow(growth, count);
}

// ❌ Bad: Implicit any
function calculateCost(shipType, count) {
  return baseCost * Math.pow(growth, count);
}

// ✅ Good: Interface for object shapes
interface Mission {
  id: string;
  type: MissionType;
  startTime: number;
}

// ❌ Bad: Inline type
const mission: {id: string, type: string, startTime: number} = {...};

// ✅ Good: Enum for constants
enum ResourceType {
  DEBRIS = 'debris',
  METAL = 'metal',
}

// ❌ Bad: String literals everywhere
const resource: 'debris' | 'metal' = 'debris';
```

### Type Imports

```typescript
// ✅ Good: Type-only imports
import type { GameState, Mission } from '@/types';
import { useGameStore } from '@/stores/gameStore';

// ❌ Bad: Mixed imports when only type is needed
import { GameState, Mission } from '@/types';
```

## React Standards

### Component Structure

```typescript
// ✅ Good: Clear, organized structure
import React, { useState, useEffect, useCallback } from 'react';
import type { ShipType } from '@/types';
import { useGameStore } from '@/stores/gameStore';
import { calculateCost } from '@/utils/formulas';
import { Button } from '@/components/ui/Button';

interface FleetPanelProps {
  shipType: ShipType;
  onPurchase?: (amount: number) => void;
}

export const FleetPanel: React.FC<FleetPanelProps> = ({
  shipType,
  onPurchase
}) => {
  // 1. Zustand selectors
  const shipCount = useGameStore(state => state.ships[shipType]);
  const resources = useGameStore(state => state.resources);
  const buyShip = useGameStore(state => state.buyShip);

  // 2. Local state
  const [buyAmount, setBuyAmount] = useState(1);

  // 3. Derived state / memoized values
  const cost = useMemo(
    () => calculateCost(shipType, shipCount),
    [shipType, shipCount]
  );

  // 4. Callbacks
  const handlePurchase = useCallback(() => {
    buyShip(shipType, buyAmount);
    onPurchase?.(buyAmount);
  }, [shipType, buyAmount, buyShip, onPurchase]);

  // 5. Effects
  useEffect(() => {
    // Component mount/unmount logic
  }, []);

  // 6. Render
  return (
    <div className="fleet-panel">
      {/* JSX */}
    </div>
  );
};

// 7. Display name for debugging
FleetPanel.displayName = 'FleetPanel';
```

### Hooks Rules

```typescript
// ✅ Good: Custom hooks for reusable logic
function useProduction(shipType: ShipType) {
  const shipCount = useGameStore(state => state.ships[shipType]);
  const multipliers = useGameStore(state => state.multipliers);

  return useMemo(() => {
    return calculateProduction(shipType, shipCount, multipliers);
  }, [shipType, shipCount, multipliers]);
}

// ✅ Good: Use selectors to prevent unnecessary renders
const debris = useGameStore(state => state.resources.debris);

// ❌ Bad: Subscribing to entire state
const state = useGameStore();
const debris = state.resources.debris; // Re-renders on ANY state change
```

### Performance Optimization

```typescript
// ✅ Good: React.memo for expensive components
export const SolarSystemView = React.memo(() => {
  // Only re-renders when props/state actually change
});

// ✅ Good: useMemo for expensive calculations
const totalProduction = useMemo(() => {
  return ships.reduce((sum, ship) => sum + ship.production, 0);
}, [ships]);

// ✅ Good: useCallback for stable function references
const handleClick = useCallback(() => {
  addResource('debris', 1);
}, [addResource]);

// ❌ Bad: Creating new functions in render
<button onClick={() => addResource('debris', 1)}>
  // New function created every render
</button>
```

## Zustand Store Patterns

### Store Structure

```typescript
// ✅ Good: Sliced store with actions
interface GameStore {
  // State
  resources: Resources;
  ships: Ships;

  // Actions
  addResource: (type: ResourceType, amount: number) => void;
  buyShip: (type: ShipType, amount?: number) => void;

  // Computed
  canAfford: (cost: Partial<Resources>) => boolean;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Initial state
      resources: { debris: 0, metal: 0 /* ... */ },
      ships: { salvageDrone: 0 /* ... */ },

      // Actions
      addResource: (type, amount) =>
        set(state => ({
          resources: {
            ...state.resources,
            [type]: state.resources[type] + amount,
          },
        })),

      buyShip: (type, amount = 1) => {
        const state = get();
        for (let i = 0; i < amount; i++) {
          const cost = calculateCost(type, state.ships[type]);
          if (!state.canAfford(cost)) break;

          // Deduct cost
          Object.entries(cost).forEach(([resource, value]) => {
            state.addResource(resource as ResourceType, -value);
          });

          // Add ship
          set(state => ({
            ships: {
              ...state.ships,
              [type]: state.ships[type] + 1,
            },
          }));
        }
      },

      canAfford: cost => {
        const { resources } = get();
        return Object.entries(cost).every(
          ([resource, value]) => resources[resource] >= value
        );
      },
    }),
    {
      name: 'space-salvage-save',
      version: 1,
    }
  )
);
```

## Naming Conventions

### Variables & Functions

```typescript
// ✅ Good: Descriptive camelCase
const totalProduction = calculateTotalProduction();
const canAffordShip = checkIfCanAfford(cost);
const hasPurchasedTech = techTree.purchased.includes(techId);

// ❌ Bad: Unclear or abbreviated
const tp = calc();
const caf = check(c);
const hpt = tt.p.includes(id);
```

### Constants

```typescript
// ✅ Good: SCREAMING_SNAKE_CASE for true constants
const MAX_OFFLINE_TIME = 14_400_000; // 4 hours in ms
const TICKS_PER_SECOND = 10;
const DEFAULT_SAVE_INTERVAL = 20_000; // 20 seconds

// ✅ Good: Config objects in camelCase
const shipConfigs: Record<ShipType, ShipConfig> = {
  salvageDrone: {
    /* ... */
  },
};
```

### Booleans

```typescript
// ✅ Good: is/has/can prefix
const isUnlocked = checkUnlock(shipType);
const hasCompletedMission = mission.status === 'completed';
const canAfford = resources.metal >= cost.metal;

// ❌ Bad: No clear boolean indicator
const unlocked = checkUnlock(shipType);
const completedMission = mission.status === 'completed';
```

## Comment Standards

### JSDoc for Functions

```typescript
/**
 * Calculates the cost of purchasing a ship based on current count
 * Uses exponential scaling: cost(n) = baseCost * (growth^n)
 *
 * @param shipType - Type of ship to calculate cost for
 * @param currentCount - Number of ships already owned
 * @returns Cost as a Resources object
 *
 * @example
 * const cost = calculateShipCost('salvageDrone', 10);
 * // Returns { debris: 40 }
 */
export function calculateShipCost(
  shipType: ShipType,
  currentCount: number
): Partial<Resources> {
  // Implementation
}
```

### Inline Comments

```typescript
// ✅ Good: Explain "why", not "what"
// Cap offline time to prevent exploit where players can leave game running for weeks
const cappedOfflineTime = Math.min(offlineTime, MAX_OFFLINE_TIME);

// ❌ Bad: Stating the obvious
// Set offline time to minimum of offline time and max offline time
const cappedOfflineTime = Math.min(offlineTime, MAX_OFFLINE_TIME);

// ✅ Good: Explain complex formulas
// Dark Matter gain uses diminishing returns on time to discourage
// extremely long runs. Formula: 1 + min(hours/10, 3.0)
const timeBonus = 1 + Math.min(hoursPlayed / 10, 3.0);
```

### TODO Comments

```typescript
// TODO(username): Add animation when ship is purchased
// TODO: Implement contract system (see docs/GAME_DESIGN.md section 8)
// FIXME: Mission completion check fails if game closes during mission
// HACK: Temporary workaround until break_infinity.js is integrated
```

## Error Handling

### Validation

```typescript
// ✅ Good: Validate inputs
function buyShip(shipType: ShipType, amount: number = 1) {
  if (amount <= 0) {
    console.warn('Cannot buy 0 or negative ships');
    return;
  }

  if (!shipConfigs[shipType]) {
    console.error(`Invalid ship type: ${shipType}`);
    return;
  }

  // Continue with purchase
}

// ✅ Good: Handle edge cases
function calculateProduction(shipCount: number, multiplier: number): number {
  if (shipCount === 0) return 0;
  if (!isFinite(multiplier)) {
    console.error('Invalid multiplier:', multiplier);
    return 0;
  }

  return shipCount * BASE_PRODUCTION * multiplier;
}
```

### Try-Catch for Risky Operations

```typescript
// ✅ Good: Wrap save/load in try-catch
function saveGame() {
  try {
    const state = useGameStore.getState();
    const compressed = LZString.compressToBase64(JSON.stringify(state));
    localStorage.setItem('space-salvage-save', compressed);
  } catch (error) {
    console.error('Failed to save game:', error);
    // Show error notification to user
  }
}
```

## Formatting

### Prettier Configuration

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "arrowParens": "avoid"
}
```

### Import Order

```typescript
// 1. External libraries
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// 2. Internal absolute imports (types)
import type { GameState, ShipType } from '@/types';

// 3. Internal absolute imports (code)
import { useGameStore } from '@/stores/gameStore';
import { calculateCost } from '@/utils/formulas';
import { Button } from '@/components/ui/Button';

// 4. Relative imports
import { ShipCard } from './ShipCard';

// 5. Styles
import styles from './FleetPanel.module.css';
```

## Testing

### Test File Naming

```
Component.tsx → Component.test.tsx
utils.ts → utils.test.ts
```

### Test Structure

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { calculateCost } from './formulas';

describe('calculateCost', () => {
  it('should return base cost for first purchase', () => {
    const cost = calculateCost('salvageDrone', 0);
    expect(cost.debris).toBe(10);
  });

  it('should scale exponentially', () => {
    const cost1 = calculateCost('salvageDrone', 1);
    const cost10 = calculateCost('salvageDrone', 10);
    expect(cost10.debris).toBeGreaterThan(cost1.debris * 10);
  });

  it('should handle edge case of 0 ships', () => {
    const cost = calculateCost('salvageDrone', 0);
    expect(cost).toBeDefined();
  });
});
```

## Git Commit Messages

feat: Add Heavy Salvage Frigate ship type
fix: Correct offline production calculation
refactor: Extract mission logic into separate module
docs: Update FORMULAS.md with prestige calculations
style: Format code with Prettier
test: Add tests for cost scaling formulas
chore: Update dependencies

## Code Review Checklist

Before submitting code, verify:

- [ ] TypeScript has no errors (`npm run type-check`)
- [ ] ESLint passes (`npm run lint`)
      All tests pass (npm run test)
      Code follows naming conventions
      Complex logic has comments
      No console.logs left in production code
      Performance considered (memo, callbacks, selectors)
      Accessibility considered (ARIA labels, keyboard nav)
      Mobile/touch interactions work
      Save/load tested

Performance Budgets

Component render time: < 16ms (60fps)
Save operation: < 100ms
Load operation: < 500ms
Offline calculation: < 2 seconds for 4 hours
Initial bundle size: < 500KB gzipped
Time to interactive: < 3 seconds

Follow these standards to maintain consistency and quality across the codebase.

---

## 6. `.vscode/settings.json`

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ],
  "github.copilot.enable": {
    "*": true,
    "typescript": true,
    "typescriptreact": true
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

---

## How These Files Help Copilot

### 1. **copilot-instructions.md**

- Copilot reads this first for context
- Understands tech stack and patterns
- Knows formulas and game mechanics
- Follows your coding standards

### 2. **GAME_DESIGN.md**

- Gives Copilot full game context
- Understands progression and balance
- Knows what features exist and when they unlock

### 3. **FORMULAS.md**

- Copilot can generate accurate cost/production calculations
- Understands balance and scaling

### 4. **STATE_SCHEMA.md**

- Copilot knows exact data structures
- Generates type-safe code
- Understands relationships between entities

### 5. **CODING_STANDARDS.md**

- Copilot follows your conventions
- Generates consistent code style
- Uses proper naming and patterns

### 6. **.vscode/settings.json**

- Auto-formats code as you write
- ESLint catches issues immediately
- Copilot suggestions align with formatter

---

## Usage Tips

### When Starting a New Feature:

```typescript
// In your file, add a comment like:
// TODO: Implement scout mission system
// - Check scout availability
// - Calculate discovery chance based on orbit and tech
// - Create mission object and add to missions array
// - Start timer for mission duration
// See docs/GAME_DESIGN.md section on missions

// Copilot will generate code following the design doc
```

### When Implementing Formulas:

```typescript
// Calculate ship cost using exponential scaling
// Formula: cost(n) = baseCost * (growthRate^n)
// See docs/FORMULAS.md for details

// Copilot will generate the exact formula from the docs
```

### When Creating Components:

```typescript
// Create ResourceBar component showing all 9 resources
// Follow component structure from CODING_STANDARDS.md
// Use Zustand selectors for each resource

// Copilot will follow the exact pattern
```

---

## Quick Start After Setup

```bash
# 1. Create project structure
mkdir -p space-salvage-empire/{.github,docs,.vscode}

# 2. Copy all context files into place
# (Copy the content above into the respective files)

# 3. Initialize project
cd space-salvage-empire
npm create vite@latest . -- --template react-ts

# 4. Now when you start coding, Copilot will:
# - Understand the full game design
# - Generate code following your standards
# - Use correct formulas and data structures
# - Follow TypeScript best practices
```

Ready to start building! Copilot now has complete context about your game.
