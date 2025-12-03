Based on my review of your project documentation and current codebase, here's what has NOT been implemented yet:

🚫 Not Yet Implemented
1. Trading Post System
Tech unlocked: market_access (exists in tech tree)
Status: Tech unlocks it, but no actual trading functionality or UI to sell/convert resources
Mentioned in: Game Design Doc (Run 4 unlock), Development Roadmap
Based on my review of your project documentation and current codebase, here's what has NOT been implemented yet:

🚫 Not Yet Implemented
1. Trading Post System
Tech unlocked: market_access (exists in tech tree)
Status: Tech unlocks it, but no actual trading functionality or UI to sell/convert resources
Mentioned in: Game Design Doc (Run 4 unlock), Development Roadmap

2. Contracts System
Tech unlocked: contracts (exists in tech tree)
Status: Tech tree has the unlock, but no contract generation, tracking, or rewards system
Mentioned in: Game Design Doc (Run 6 unlock), Progression Doc

4. Auto-Scout & Auto-Salvage
Techs exist: auto_scout, auto_salvage, total_automation
Status: Tech unlocks exist, but no automation logic to auto-deploy missions
Needed for: QoL improvements in later runs

--Complete, needs testing

5. Hacking System
Status: Derelict configs mention SALVAGE/HACK/DISMANTLE actions, but only basic salvage is currently implemented
The "HACK" action (150% loot + bonus DF, 85% success, costs electronics) is not functional
Mentioned in: Game Design Doc

6. Deep Space Zone
Orbit exists in configs but final mechanics unclear
Status: 8th Ark component (Navigation Array) exclusive to Deep Space
Special mechanics needed: extremely high fuel costs, 6-hour travel, 0.5% legendary spawn rate
Mentioned in: Progression Doc (Run 10 Phase 2)

7. Instant Warp Ability
Tech unlocked: instant_warp (exists in tech tree)
Status: No implementation of the free instant travel mechanic
Mentioned in: Tech tree (Tier 4 Exploration)

--Complete, needs testing

8. Adjacent Orbit Scouting
Tech unlocked: quantum_entanglement_comms
Status: No logic to allow scouts to discover derelicts in neighboring orbits
Mentioned in: Tech tree (Tier 3 Exploration)

--Complete, needs testing

9. Dual Missions
Tech unlocked: fleet_coordination
Status: Ships can't run 2 missions simultaneously per ship type yet
Mentioned in: Tech tree (Tier 5 Exploration)

--Complete tested and working

10. Endless Mode / New Game+
Status: Victory screen exists but no post-game modes
Mentioned in: Game Design Doc (Post-Victory section)

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
Would you like me to help implement any of these missing features? The most impactful ones to tackle next would probably be:

Trading Post (new strategic resource conversion gameplay)
Contracts System (optional objectives for bonuses)