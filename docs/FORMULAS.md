# Space Salvage Empire - Mathematical Formulas

## Cost Formulas

### Ship Purchase Cost
```typescript
cost(n) = floor(baseCost * (growthRate ^ n))
```
Where:
- `n` = current count of ship type
- `baseCost` = initial cost (from config)
- `growthRate` = exponential scaling factor

**Growth Rates by Tier:**
- Tier 1 (common): 1.15
- Tier 2 (uncommon): 1.18
- Tier 3 (rare): 1.20
- Tier 4 (epic): 1.22
- Tier 5 (legendary): 1.25

**Example:**
```typescript
// Salvage Drone: baseCost = 10, growth = 1.15
cost(0) = 10 * (1.15^0) = 10
cost(1) = 10 * (1.15^1) = 11.5 → 11
cost(10) = 10 * (1.15^10) = 40.45 → 40
cost(100) = 10 * (1.15^100) = 11,739,085
```

### Buy Multiple Cost
```typescript
totalCost = sum(i=n to n+amount-1) of baseCost * (growthRate^i)

// Simplified (geometric series):
totalCost = baseCost * (growthRate^n) * ((growthRate^amount - 1) / (growthRate - 1))
```

## Production Formulas

### Per-Tick Production
```typescript
perTickProduction = (baseProduction * shipCount * globalMultipliers) / TICKS_PER_SECOND
```
Where:
- `baseProduction` = base rate per second (from config)
- `shipCount` = number of ships owned
- `globalMultipliers` = product of all applicable bonuses (tech, DM perks, orbit, formations)
- `TICKS_PER_SECOND` = 10

**Global Multipliers:**
```typescript
globalMultiplier = 
  orbitMultiplier *
  techMultiplier *
  prestigeMultiplier *
  formationMultiplier *
  colonyMultiplier
```

**Example:**
```typescript
// 50 Salvage Drones in Mars orbit with tech boost
baseProduction = 1 debris/sec
shipCount = 50
orbitMultiplier = 10 (Mars)
techMultiplier = 1.5 (Drone Optimization I+II+III)
prestigeMultiplier = 1.25 (Efficient Drones I perk)
formationMultiplier = 1.0 (no formation)
colonyMultiplier = 1.0 (no colony)

globalMultiplier = 10 * 1.5 * 1.25 * 1.0 * 1.0 = 18.75
perTickProduction = (1 * 50 * 18.75) / 10 = 93.75 debris per tick
perSecondProduction = 93.75 * 10 = 937.5 debris/sec
```

### Conversion Formulas
```typescript
// Refinery Barge: Debris → Metal
metalPerTick = (debrisConsumed * conversionRatio * shipCount) / TICKS_PER_SECOND
debrisConsumed = min(availableDebris, maxConsumption)

// Base: 10 debris → 2 metal (ratio = 0.2)
// With tech: 10 debris → 5 metal (ratio = 0.5)
```

## Prestige Formulas

### Dark Matter Gain
```typescript
baseDM = sqrt(totalDataFragments / 100)
orbitBonus = 1 + (maxOrbitReached * 0.3)
derelictBonus = 1 + (totalDerelictsSalvaged / 50)
timeBonus = 1 + min(hoursPlayed / 10, 3.0)

darkMatterGained = floor(baseDM * orbitBonus * derelictBonus * timeBonus)
```

**Orbit Values:**
- LEO = 0
- GEO = 1
- Lunar = 2
- Mars = 3
- Asteroid Belt = 4
- Jovian = 5
- Kuiper = 6
- Deep Space = 7

**Example Calculations:**

**Run 1:** 500 DF, Asteroid Belt (4), 20 derelicts, 168 hours (7 days)
```typescript
baseDM = sqrt(500/100) = 2.236
orbitBonus = 1 + (4 * 0.3) = 2.2
derelictBonus = 1 + (20/50) = 1.4
timeBonus = 1 + min(168/10, 3.0) = 1 + 3.0 = 4.0 (capped)
darkMatter = floor(2.236 * 2.2 * 1.4 * 4.0) = floor(27.6) = 27 DM
```

**Run 5:** 5,000 DF, Kuiper (6), 150 derelicts, 72 hours (3 days)
```typescript
baseDM = sqrt(5000/100) = 7.071
orbitBonus = 1 + (6 * 0.3) = 2.8
derelictBonus = 1 + (150/50) = 4.0
timeBonus = 1 + min(72/10, 3.0) = 1 + 3.0 = 4.0 (capped at 3, so 4.0)
darkMatter = floor(7.071 * 2.8 * 4.0 * 4.0) = floor(316.4) = 316 DM
```

### Total DM Curve (Expected)
```
Run 1: ~20-30 DM
Run 2: ~35-50 DM
Run 3: ~55-75 DM
Run 4: ~75-100 DM
Run 5: ~95-130 DM
Run 6: ~110-150 DM
Run 7: ~125-170 DM
Run 8: ~140-190 DM
Run 9: ~160-220 DM
Total by Run 10: ~815-1,100 DM
```

## Mission Formulas

### Scout Discovery Chance
```typescript
baseChance = 0.15 // 15% per mission
scoutBonus = scoutCount * 0.02 // +2% per additional scout
techBonus = getTechMultiplier('scouting') // from tech tree
prestigeBonus = getPrestigeMultiplier('scouting') // from DM perks
orbitMultiplier = currentOrbit.discoveryRate

discoveryChance = baseChance * (1 + scoutBonus) * techBonus * prestigeBonus * orbitMultiplier
discoveryChance = min(discoveryChance, 0.95) // cap at 95%
```

### Mission Duration
```typescript
baseDuration = shipConfig.missionDuration // in ms
techReduction = getTechMultiplier('missionSpeed') // 0.7 = 30% faster
prestigeReduction = getPrestigeMultiplier('missionSpeed')
orbitModifier = currentOrbit.missionTimeModifier // 1.0 default

finalDuration = baseDuration * techReduction * prestigeReduction * orbitModifier
```

### Salvage Success Rate
```typescript
baseSuccess = 0.90 // 90% for normal frigates, 95% for heavy
shipUpgradeBonus = getShipUpgrade('reinforcedHull') // +0.05
techBonus = getTechBonus('salvageMastery') // +0.05
derelictRisk = derelict.riskModifier // 0.8 for hazardous

successRate = min(baseSuccess + shipUpgradeBonus + techBonus) * derelictRisk)
successRate = clamp(successRate, 0.05, 0.99) // min 5%, max 99%
```

## Derelict Spawn Formulas

### Passive Spawn Check (Every 5 seconds)
```typescript
baseChance = 0.01 // 1% per check
scannerBonus = deepSpaceScannerCount * 0.02 // +2% per scanner
techBonus = getTechMultiplier('derelictSpawn')
orbitMultiplier = currentOrbit.spawnRateMultiplier

spawnChance = baseChance * (1 + scannerBonus) * techBonus * orbitMultiplier

if (random() < spawnChance) {
  spawnDerelict()
}
```

### Rarity Roll
```typescript
// Roll d100
roll = random() * 100

if (roll < orbitConfig.legendaryChance) return 'legendary'
else if (roll < orbitConfig.legendaryChance + orbitConfig.epicChance) return 'epic'
else if (roll < ... + orbitConfig.rareChance) return 'rare'
else if (roll < ... + orbitConfig.uncommonChance) return 'uncommon'
else return 'common'
```

### Loot Roll
```typescript
for each rewardInTable:
  if (random() < reward.dropChance):
    amount = randomInt(reward.min, reward.max)
    
    // Apply multipliers
    amount = floor(amount * salvageRewardMultiplier * hackMultiplier * dismantleMultiplier)
    
    grantReward(reward.type, amount)
```

## Offline Progress Formulas

### Offline Time Calculation
```typescript
offlineTime = min(currentTime - lastSaveTime, MAX_OFFLINE_TIME)
// MAX_OFFLINE_TIME = 4 hours = 14,400,000 ms default

offlineEfficiency = 0.5 // 50% base, increased by tech/perks to max 100%
```

### Offline Production
```typescript
// Simple method (used for display):
offlineGain = productionPerSecond * (offlineTime / 1000) * offlineEfficiency

// Precise method (handles resource constraints):
ticksOffline = offlineTime / 100 // 100ms per tick
for (tick = 0; tick < ticksOffline; tick++) {
  calculateProduction() // same as online tick
  // Skip derelict spawns, missions, etc.
}
applyEfficiencyPenalty(offlineEfficiency)
```

## Number Formatting

### Short Format
```typescript
if (n < 1000) return n.toFixed(0)
if (n < 1_000_000) return (n / 1000).toFixed(1) + 'K'
if (n < 1_000_000_000) return (n / 1_000_000).toFixed(1) + 'M'
if (n < 1_000_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B'
if (n < 1e15) return (n / 1e12).toFixed(1) + 'T'

// Use break_infinity.js for larger numbers
return breakInfinity.format(n)
```

### Scientific Notation (for very large numbers)
```typescript
// e.g., 1.23e45
return n.toExponential(2)
```

## Performance Optimizations

### Batch Production Calculation (for offline)
```typescript
// Instead of calculating every tick individually:
totalTicks = offlineTime / 100
batchSize = 1000 // calculate 1000 ticks at once

for (batch = 0; batch < totalTicks / batchSize; batch++) {
  production = calculateProduction() * batchSize
  addResources(production)
}
```

### Memoized Cost Calculation
```typescript
// Cache costs to avoid repeated expensive calculations
const costCache = new Map<string, number>()

function getCost(shipType: string, count: number): number {
  const key = `${shipType}-${count}`
  if (costCache.has(key)) return costCache.get(key)!
  
  const cost = calculateCost(shipType, count)
  costCache.set(key, cost)
  return cost
}
```

## Balance Guidelines

### Idle vs Active Ratio
- Active play: 100% production
- Offline: 50-100% production (based on tech/perks)
- Target: Players should want to check in but not feel punished for being offline

### Cost Scaling
- Each purchase should represent ~10-20 seconds of production income
- Exception: Major unlocks (new ships, colonies) can be 2-5 minutes of income
- Late game: Costs scale faster than production to maintain challenge

### Mission Balance
- Scout missions: ~10 minutes (enough time to do something else, not so long you forget)
- Salvage missions: ~20 minutes (meaningful commitment)
- Deep Space travel: ~6 hours (overnight progress, check in morning)

### Prestige Timing
- First prestige: 2-6 hours of active play (7 days calendar)
- Subsequent prestiges: 1-3 hours active play each
- Final run: 8-10 days (epic finale)