# Space Salvage Empire - Development Notes

*Last Updated: December 7, 2025*

---

## Feature Implementation Status

### ✅ Fully Implemented
| Feature | Version | Notes |
|---------|---------|-------|
| Orbit Progression (8 orbits) | 0.2.0 | LEO → Deep Space with fuel costs & travel times |
| 11 Ship Types | 0.2.0 | All production & active ships functional |
| Mission System | 0.2.0 | Scout, Salvage, Colony missions |
| Derelict System | 0.2.0 | 5 rarities, passive spawning, expiration |
| Tech Tree | 0.2.0 | 45+ nodes across 3 branches |
| Prestige & Dark Matter | 0.2.0 | 12 perks, 5 tiers |
| Adjacent Orbit Scouting | 0.1.5 | Quantum Entanglement Comms tech |
| Fleet Page | 0.1.5 | Dedicated ship management view |
| AI Core Fabricator | 0.1.4 | Consumes Exotic Alloys → AI Cores |
| Event Log | 0.1.3 | Persistent game event tracking |
| Changelog View | 0.1.1 | In-game update history |
| Offline Earnings | 0.2.12 | Welcome back modal, 4hr cap |
| 8 Ark Components | 0.2.13 | Unique types, Deep Space exclusive Navigation Array |
| Contracts System | 0.2.14 | 4 contract types: Salvage Quota, Resource Rush, Discovery, Risky Business |
| Trading Post | 0.2.15 | 5 trade routes, Market Mastery tech bonus |
| Victory Screen | 0.2.16 | Ark completion celebration + stats |
| Endless Mode | 0.2.16 | Post-victory continued play |
| Hacking System | 0.2.17 | 50 Electronics cost, 2x Data Fragments, 1.5x resources |
| Storage Limits | 0.2.19 | Resource capacity caps with UI indicators |
| Deep Space Zone | 0.2.20 | Void Dimensions tech unlock |
| Auto-Scout | 0.2.1 | Tier 3 Economy, 200 DF |
| Auto-Salvage | 0.2.1 | Tier 4 Economy, 1500 DF, colonized orbits |
| Total Automation | 0.2.1 | Tier 5 Economy, 5000 DF, dual missions |
| Instant Warp | 0.2.2 | 1 free instant travel per run |
| Fleet Formations | 0.2.3 | 5 types: Mining, Scout, Salvage, Expedition, Production |
| Dual Missions | 0.2.4 | Fleet Coordination & Total Automation techs |
| Economy Techs | 0.2.8 | Buy 10/100/Max, Offline Production, Passive Clicks |
| DISMANTLE Action | 0.3.1 | 2x fuel, 3x duration, 100% success, 2x rewards |
| Deep Space Scanner Bonus | 0.3.1 | +2% passive derelict spawn per scanner |
| Scaled Offline Efficiency | 0.3.1 | 50% base → 100% with Economy techs |
| Speed Run Contracts | 0.3.2 | Time-limited contracts to reach distant orbits |
| Alien Artifacts System | 0.3.2 | Drops from Ancient Probe (40%) & Alien Relay (80%) |
| Alien Tech Shop | 0.3.2 | 6 unique upgrades: production, click power, etc. |

---

## ✅ Verified Systems (Dec 8, 2025)

### Ship Upgrades
- Full end-to-end verification: Config → Multipliers → Production → UI → Purchase
- **Heavy Salvage Frigate**: Shielding, Cargo Expansion, Emergency Warp ✅
- **Deep Space Scanner**: Spawn Rate per scanner, Rarity Bonus ✅
- **Colony Ship**: Efficiency (1.4x), Auto-Salvage Bay ✅
- **Electronics Extractor**: Precision Extraction (Rare Materials) ✅
- **Matter Extractor**: Atmospheric Filtration (Electronics) ✅
- **Quantum Miner**: Zero-Point Extraction (Rare Materials) ✅
- **Scout Probe**: Long-Range Comms (Adjacent Scouting) ✅

### Colony System
- Colony production bonus (1.25x) applied in `formulas.ts`

### Hazardous Derelicts
- -20% success rate penalty for non-Heavy Salvage Frigates
- Heavy Salvage Frigate immune to hazardous penalty
### Prestige/Progression
- **Tech Carry-Over** - Keep % of Data Fragments on prestige (prestige perk)
- **Skip Orbit Perks** - Start in GEO/Mars/Belt (prestige perks)

### Miscellaneous
- **Blueprint Fragments** - Mentioned in loot tables, unclear system
- **Tech Unlock Hints** - Research Probe reward
- **Tech Breakthrough** - Research Megastation reward
- **Alien Relay Special Mechanics** - "Unknown risk" derelict

---

## 🟡 Needs Verification (Resolved)

- **Ark Component Mission Time** - Verified: Code uses 2 hours base, consistent with game pacing.
- **Fleet Formation Requirements** - Verified: Aligned with Late Game design in v0.3.3.
  - Mining Fleet: 50 Drones, 20 Barges
  - Salvage Fleet: 20 Frigates, 10 Heavy Frigates
  - Scout Fleet: 10 Probes, 5 Deep Scanners
  - Expedition Fleet: 5 Colony Ships, 30 Total Ships
  - Production Fleet: 100 Total Production Ships

---

## 📋 Future Features (Optional)

1. **New Game+ Challenges** - Post-victory alternative gameplay modes
2. **Achievement System** - Listed as optional in GAME_DESIGN.md

---

## Recent Fixes (v0.3.2)

### Mission Log System
- Mission History now shows "No missions completed yet" instead of blank display
- Recent Events now populates from all notifications (was blank before)
- Mission logs show specific action: "Hack Mission", "Salvage Mission", "Dismantle Mission"

### Asteroid Belt Unlock
- Fixed: Removed non-existent `asteroidBeltAccess` tech requirement
- Now unlocks properly with 100,000 Metal

### Alien Tech Shop
- 6 unique upgrades - **ALL NOW FULLY IMPLEMENTED**:
  - Xenotech Efficiency: +50% all production ✓
  - Void Navigation: -50% travel time ✓
  - Matter Conversion: +100% salvage rewards ✓
  - Neural Link: +100% click power ✓
  - Temporal Shift: -50% mission times ✓
  - Artifact Resonance: +100% artifact drops ✓

### Galaxy Map
- Fixed orbit visibility - all 8 orbits now display correctly (Lunar, Mars, Kuiper, Deep Space)
- Adjusted spacing and positioning to fit within viewport

---

## Balance Notes

### Early Game (Run 1)
- LEO/GEO fuel costs = 0 (bootstrap friendly)
- Guaranteed fuel drops from LEO/GEO derelicts
- Starting fuel bootstrap implemented

### Mid Game (Runs 3-6)
- Heavy Salvage Frigate unlocked via game progression
- Trading Post and Contracts provide resource flexibility

### Late Game (Runs 7-10)
- Deep Space requires Tier 5 tech "Void Dimensions"
- Navigation Array is Deep Space exclusive (0.5% spawn)
- 206+ hours of Ark construction time ensures lengthy finale

---

## Technical Notes

### State Management
- Zustand store decomposed into modular slices (v0.3.0)
- Slices: Resource, Ship, Mission, Tech, Orbit, Prestige, Economy, UI, Formation

### Game Loop
- 10 ticks/second for production
- Offline efficiency scales with tech (50% base → 100% max)
- Max offline time: 4 hours

### Testing
- Comprehensive test suite in `src/stores/*.test.ts`
- Mission system, automation, and dual missions covered
