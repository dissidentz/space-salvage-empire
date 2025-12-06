✅ What IS Implemented
For context, here's what is working:

✅ All 11 ship types with production/costs
✅ Mission system (Scout & Salvage missions)
✅ Derelict spawning & salvaging
✅ Orbit progression & travel
✅ Tech tree (45 nodes across 3 branches)
✅ Prestige/Dark Matter system
✅ Ark components (discovery & assembly)
✅ Ship upgrades
✅ Colony deployment
✅ Resource production & management
✅ Instant Warp Ability (Tier 4 Exploration)
✅ Adjacent Orbit Scouting (Tier 3 Exploration)
✅ Fleet Formations System (Tier 4 Economy)
✅ Contracts System (Tier 3 Economy)
✅ Trading Post System (Tier 2 Economy)
✅ Victory System & Endless Mode
Ark Component Uniqueness: Properly implemented. Ark components now have specific types assigned upon generation.
Deep Space Exclusivity: Implemented. The 'Navigation Array' component is exclusive to Deep Space orbit spawns.
Hacking Risk/Reward Logic: Implemented. Hacking now applies a -10% penalty to mission success rate, balancing the increased rewards.
Passive Spawn Rate Multipliers: Implemented. Connected `passive_spawn_rate` tech multiplier to the spawning engine.
Automation (Auto-Scout/Auto-Salvage): Fully implemented in store and UI.
Fleet Formations: Logic and UI exist.
Instant Warp: Logic implemented in travelToOrbit.
Dual Missions: Logic implemented (ships have individual states).
Adjacent Orbit Scouting: Helper functions exist in config.


⏳ Deferred (needs architecture change):

Derelict spawn rate multipliers (Deep Space Sensors, Predictive Algorithms, Xenoarchaeology, Ark-Tech Integration)
These would require passing game state to the derelicts module or refactoring how spawn rates work.




Space Salvage Empire - Missing Features Report
Based on a comprehensive review of the /docs folder, here is a summary of features documented but not yet implemented in the codebase.

🚫 Major Missing Features
1. DISMANTLE Action for Derelicts
Status: Not implemented.
Documented in: complete-system.md, GAME_DESIGN.md
Description: A third salvage choice (alongside SALVAGE and HACK) that takes 3x mission time, costs 2x fuel, but guarantees 200% loot and +50% Ark component chance.
Impact: Missing strategic depth in salvage decisions.

2. AI Core Fabricator Ship
Status: Ship type exists in config, but has no production logic.
Documented in: complete-system.md
Description: A production ship that passively generates AI Cores. Currently, AI Cores are ONLY obtainable from Epic/Legendary derelicts.
Impact: Creates a late-game bottleneck for Ark assembly, which requires thousands of AI Cores.

3. Deep Space Scanner Passive Spawn Bonus
Status: Ship exists, but its passive derelict spawn rate bonus (+2% per scanner) is not implemented.
Documented in: complete-system.md, notes.md (deferred)
Description: Owning Deep Space Scanners should increase the base derelict spawn rate.
Impact: The ship has no purpose until this is implemented.

4. Buy1000 / BuyMax Buttons
Status: Only Buy1, Buy10, Buy100 exist.
Documented in: complete-system.md (Tech Tree: Bulk Purchasing III unlocks BuyMax)
Impact: Minor QoL issue, but causes excessive clicking in late game.

5. Offline Efficiency Tech Tiers
Status: Offline production exists, but tech-based efficiency scaling (50% → 60% → 75% → 90% → 100%) is not fully wired up.
Documented in: complete-system.md (Economy Branch Tiers)
Impact: Players can't improve offline gains through the tech tree.

6. Colony Auto-Salvage Bay Upgrade
Status: Colonies exist, but the Auto-Salvage Bay upgrade (auto-salvage common derelicts in colonized orbits) is not implemented.
Documented in: complete-system.md
Impact: Missing automation feature for late-game colony utility.

7. Ark Assembly Real-Time Construction UI
Status: Ark component logic exists, but there's no visual Ark Assembly UI showing construction progress, resource requirements, and component slots.
Documented in: complete-system.md, progression.md (Run 10 Phase 4)
Impact: The endgame victory experience is missing a key visual element. Players just get a toast notification.

8. New Game+ / Challenge Modes
Status: Not implemented.
Documented in: GAME_DESIGN.md, progression.md
Description: Post-victory content that provides replayability with optional challenges.
Impact: No post-victory engagement.
⚠️ Deferred (Architecture Change Needed)
These features are documented but require refactoring spawn logic to accept game state:

Feature	Tech/Perk	Effect
Deep Space Sensors	Tech Tier 3	+25% base derelict spawn rate
Predictive Algorithms	Tech Tier 4	+15% Rare+ derelict spawn chance
Xenoarchaeology	Tech Tier 5	+5% Legendary derelict spawn chance
Ark-Tech Integration	Tech Tier 5	+10% Ark component drop chance
Legendary Hunter	DM Perk Tier 4	+5% Legendary spawn chance
Ark Seeker	DM Perk Tier 5	+10% Ark component drop chance



✅ Already Implemented (For Context)
Orbit Progression & Travel (8 zones)
All 11 Ship Types (production + active missions)
Mission System (Scout, Salvage, Colony)
Derelict System (13 types, 5 rarities, SALVAGE/HACK actions)
Tech Tree (45 nodes, 3 branches)
Prestige System (Dark Matter reset, 35 perks)
Contracts System
Trading Post System
Victory System & Endless Mode
Ark Component Uniqueness
Hacking Risk/Reward Logic
Instant Warp
Fleet Formations
Adjacent Orbit Scouting
Auto-Scout / Auto-Salvage



Recommended Next Steps
High Impact / Low Effort: Implement DISMANTLE action.
High Impact / Medium Effort: Wire up Deep Space Scanner spawn bonus.
QoL: Add BuyMax button, locked behind tech.
Endgame Polish: Create Ark Assembly UI.
Post-Victory: Implement New Game+ mode.