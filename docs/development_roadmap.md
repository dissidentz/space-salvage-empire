# Space Salvage Empire - Development Roadmap

Based on the comprehensive documentation review, here's the prioritized development plan for Space Salvage Empire.

## Next Development Phases

### Phase 1: Orbit Progression System (Foundation)
**Priority: High** - This unlocks the entire game world and is required for all other systems.

**Features to Implement:**
- Orbit travel mechanics (LEO → GEO → Lunar → Mars → Asteroid Belt → Jovian → Kuiper → Deep Space)
- Fuel costs and travel times for each orbit
- Orbit-specific resource multipliers and discovery rates
- Travel UI with orbit selection and progress indicators
- Unlock requirements (resources/tech/colonies)

**Why Start Here:** Every other mechanic depends on orbit progression - derelicts spawn in orbits, ship production scales with orbit multipliers, and the entire game world opens up through orbit travel.

### Phase 2: Complete Ship Production & Purchasing
**Priority: High** - Core resource generation loop.

**Features to Implement:**
- All 11 ship types with proper production formulas
- Exponential cost scaling (baseCost × growthRate^n)
- Bulk purchase buttons (Buy 1/10/100/1000)
- Production calculations per tick (10 ticks/second)
- Ship upgrade system (efficiency, capacity, etc.)

### Phase 3: Mission System
**Priority: High** - Active gameplay content.

**Features to Implement:**
- Scout probe missions (discover derelicts)
- Salvage frigate missions (loot derelicts)
- Mission queues, durations, fuel costs
- Success rates, risk levels, rewards
- Real-time mission progress and completion handling

### Phase 4: Derelict System
**Priority: High** - Primary content driver.

**Features to Implement:**
- Passive derelict spawning based on orbit rates
- 5 rarity tiers (Common → Legendary) with different loot tables
- Salvage choices: SALVAGE/HACK/DISMANTLE/ABANDON
- 13 derelict types with unique rewards and risks
- Ark component discovery (8 legendary derelicts)
- Derelict expiration (24 hours) and despawn mechanics

### Phase 5: Tech Tree
**Priority: Medium** - Long-term progression.

**Features to Implement:**
- 45-node tech tree across 3 branches (Efficiency/Exploration/Economy)
- Prerequisites and unlock requirements
- Data Fragment costs and purchasing
- Multiplier effects on production, costs, discovery rates

### Phase 6: Prestige & Dark Matter System
**Priority: Medium** - Endgame content.

**Features to Implement:**
- Quantum Reset calculations (sqrt(dataFragments/100) × bonuses)
- 35 DM perks across 5 tiers
- Ark component assembly (8 components, massive costs, real-time construction)
- Victory condition (assemble full Ark)

## Implementation Strategy

**Start with Orbit Progression** as it enables testing all other systems. Each orbit provides new challenges and rewards, making the game feel progressively more engaging.

**Incremental Development:** Build one orbit at a time, ensuring each new orbit feels like a meaningful advancement. Test production scaling, derelict spawn rates, and fuel economy at each level.

**State Management:** The existing Zustand store is well-structured - extend it with orbit configs, mission arrays, derelict spawning logic, and tech tree state.

**UI Components:** Leverage the current sidebar layout for orbit selection, mission queues, and derelict salvage interfaces.

## Current Prototype Status
- ✅ Functional left/right sidebar layout
- ✅ Resource display with rates
- ✅ Basic ship counts and buying (incomplete)
- ✅ Game loop ticking at 10 ticks/second
- ✅ Basic production for some ships
- ✅ Error-free build and clean code

## Next Action
Begin implementing the orbit progression system as the foundation for all other mechanics.