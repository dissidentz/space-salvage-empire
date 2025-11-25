# Space Salvage Empire - Game Design Document

## High-Level Vision
A 6-7 week incremental game where players rebuild the destroyed Exodus Ark colony fleet through 10 prestige runs. Each run introduces new mechanics and ships, culminating in an epic 8-10 day final assembly phase.

## Progression Timeline

### Run 1: The Learning Curve (7 days)
- Manual clicking → automation
- Reach Asteroid Belt
- Earn ~20 DM
- **Unlock:** Auto-clicker

### Run 2: Getting Stronger (6 days)
- Faster progression with DM perks
- Reach Jovian System
- Earn ~35 DM
- **Unlock:** Buy10/Buy100 buttons + Efficient Drones I

### Run 3: New Tools (5 days)
- First Ark component found
- **Unlock:** Heavy Salvage Frigate (new ship type)

### Run 4: Systems Online (4 days)
- Reach Kuiper Belt
- 2nd Ark component
- **Unlock:** Trading Post (resource conversion)

### Run 5: Acceleration (3 days)
- Start in GEO perk available
- 3rd Ark component
- **Unlock:** Deep Space Scanner (new ship)

### Run 6: Optimization (2 days)
- Scout auto-deploy
- 4th Ark component
- **Unlock:** Contracts System (optional missions)

### Run 7: Power Surge (2 days)
- Production multipliers stacking
- 5th Ark component
- **Unlock:** Quantum Miner (generates exotic alloys)

### Run 8: The Push (2 days)
- All systems optimized
- 6th Ark component
- **Unlock:** Fleet Formations (strategic ship grouping)

### Run 9: Almost There (2 days)
- 7th Ark component found
- Deep Space zone reveals
- **Unlock:** Deep Space Access + Ark Assembly UI

### Run 10: The Final Assembly (8-10 days)
**Phase 1 (Days 1-2):** Build massive production infrastructure
**Phase 2 (Days 3-5):** Deep Space expeditions, hunt final component
**Phase 3 (Days 6-7):** Gather assembly resources
**Phase 4 (Days 8-10):** Assemble 8 Ark components (206 hours total construction)
**Victory:** Launch the Exodus Ark!

## Resource Economy

### Tier 1: Foundation
- **Debris:** Manual click (1 per click) + Salvage Drones (1/sec base)
- **Metal:** Refineries convert Debris (10:2 ratio base)

### Tier 2: Advanced
- **Electronics:** Extractors (0.5/sec) + Derelicts
- **Fuel:** Synthesizers convert Metal (20:1 ratio base)
- **Rare Materials:** Matter Extractors (1/sec) + Derelicts

### Tier 3: Elite
- **Exotic Alloys:** Quantum Miners (0.1/sec) + Legendary derelicts
- **AI Cores:** Epic/Legendary derelicts only
- **Data Fragments:** Derelicts + Anomalies (tech tree currency)

### Tier 4: Prestige
- **Dark Matter:** Earned on quantum reset (permanent upgrades)

## Ship Types

### Production Ships (10 types)
1. **Salvage Drone** - Base debris generation
2. **Refinery Barge** - Converts debris → metal
3. **Electronics Extractor** - Generates electronics
4. **Fuel Synthesizer** - Converts metal → fuel
5. **Matter Extractor** - Generates rare materials
6. **Quantum Miner** - Generates exotic alloys (Run 7+)

### Active Ships (4 types)
7. **Scout Probe** - Discover derelicts (15% base chance per mission)
8. **Salvage Frigate** - Salvage derelicts (90% success base)
9. **Heavy Salvage Frigate** - Salvage hazardous derelicts (95% success, 2x speed) (Run 3+)
10. **Deep Space Scanner** - Passive derelict spawn boost (Run 5+)
11. **Colony Ship** - Establish orbit colonies (+25% production in orbit)

## Orbit Progression

| Orbit | Metal Mult | Fuel Cost | Travel Time | Unlock |
|-------|-----------|-----------|-------------|--------|
| LEO | 1x | 0 | 0 | Start |
| GEO | 2x | 100 | 2 min | 10 Drones |
| Lunar | 5x | 500 | 5 min | 1K Metal |
| Mars | 10x | 2.5K | 12 min | 10K Metal |
| Asteroid Belt | 25x | 12K | 30 min | 100K Metal + Research |
| Jovian System | 50x | 60K | 1 hour | 1M Metal + Colony |
| Kuiper Belt | 100x | 250K | 3 hours | 10M Metal + Colony |
| Deep Space | 200x | 1M | 6 hours | Run 9 + 7 components |

## Derelict System

### Rarities & Spawn Rates
- **Common (70% in LEO → 5% in Deep Space):** Small rewards
- **Uncommon (25% → 15%):** Medium rewards
- **Rare (4% → 25%):** Good rewards, blueprint fragments
- **Epic (0.9% → 30%):** Great rewards, AI Cores, possible Ark components
- **Legendary (0.1% → 25%):** Massive rewards, Ark components (guaranteed in Kuiper/Deep Space)

### Player Choices
**SALVAGE:** 100% loot, guaranteed success
**HACK:** 150% loot + bonus DF, 85% success, costs electronics
**DISMANTLE:** 200% loot, 3x time, 100% success, 2x fuel cost
**ABANDON:** Keep derelict for later

### 8 Legendary Ark Components
1-7: Found in Kuiper Belt (1% spawn each)
8: Navigation Array in Deep Space only (0.5% spawn)

## Tech Tree (45 nodes, 3 branches)

### Efficiency Branch
- Drone/Refinery/Production optimizations
- Unlock advanced conversion ratios
- Cost reductions
- Material science bonuses

### Exploration Branch
- Scout improvements
- Derelict spawn rate increases
- Travel time reductions
- Salvage reward bonuses
- Rare derelict chance boosts

### Economy Branch
- UI improvements (Buy10, Buy100, BuyMax)
- Auto-click, auto-scout, auto-salvage
- Offline efficiency boosts (50% → 100%)
- Trading Post unlocks
- Contracts system
- Fleet Formations

## Dark Matter Prestige Tree (35 perks, 5 tiers)

### Tier 1 (1-3 DM): Foundation
- Starting resources/ships
- Basic production boosts (+25%)
- Auto-clicker
- Quality of life

### Tier 2 (5-10 DM): Acceleration
- Skip LEO (start in GEO)
- Larger starting fleets
- Production boosts (+10%)
- Scout improvements
- Offline efficiency (50% → 65%)

### Tier 3 (15-25 DM): Mastery
- Start in Lunar orbit
- Production boosts (+20%)
- Auto-deploy scouts
- Salvage rewards (+50%)
- Offline efficiency (65% → 80%)
- Tech carry-over (25% → 50% DF kept)

### Tier 4 (30-50 DM): Excellence
- Start in Mars orbit
- Production boosts (+50%)
- Legendary spawn chance (+5%)
- Salvage rewards (+100%)
- Offline efficiency (80% → 95%)
- Tech cost reduction (-50%)

### Tier 5 (75-150 DM): Transcendence
- Start in Asteroid Belt
- Production boosts (+100%)
- Ark component drop chance (+10%)
- Perfect offline (100% efficiency)
- Full automation
- God mode (2x production multiplicative)

## Victory: Exodus Ark Assembly

### 8 Components, Each Requires:
- Legendary derelict salvage (expensive fuel, time)
- Massive resource investment (millions of metal, hundreds of thousands of exotic alloys)
- Real-time construction (16-36 hours per component)
- Total: 206 hours of construction time

### Total Assembly Cost:
- 66M Metal
- 4.2M Electronics
- 3M Exotic Alloys
- 700K Rare Materials
- 300K Fuel
- 9K AI Cores
- 250K Data Fragments

Even with maximum DM bonuses, this ensures Run 10 takes 8-10 days.

## Post-Victory
- Victory screen with stats
- Unlock Endless Mode
- Optional New Game+ with challenges
- Achievement system (optional)

## Pacing Philosophy
- Run 1: Slow, learning, challenging (7 days)
- Runs 2-5: Accelerating (6→5→4→3 days)
- Runs 6-9: Fast optimization loops (2 days each)
- Run 10: Epic finale, as long as Run 1 (8-10 days)

**Total:** 43-51 days calendar time, 65-80 active hours