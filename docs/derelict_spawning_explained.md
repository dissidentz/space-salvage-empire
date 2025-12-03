# How Derelicts Spawn in Space Salvage Empire

## Summary
Derelicts appear in **two ways**:

1. **Scout Mission Completion** (Active - player controlled)
2. **Passive Background Spawning** (Automatic - happens over time)

---

## 1. Scout Mission Completion ✅ WHEN THE MISSION FINISHES

**When**: When a scout probe mission completes successfully  
**Where**: In the target orbit (or adjacent orbits with tech)  
**Trigger**: Player launches scout mission → Mission timer finishes → Derelict spawns

### How It Works:
```
Player → Launches Scout Mission → Waits for timer → Mission Complete → Derelict Spawns
```

**Code Location**: `src/stores/gameStore.ts` - `completeMissionIfReady()` function (line 955-987)

```typescript
if (mission.type === 'scout') {
  // Mission completed - NOW spawn the derelict
  const derelict = state.spawnDerelict(spawnOrbit);
  // Notification shows up
}
```

**With quantum_entanglement_comms tech**: Can spawn in target orbit OR adjacent orbits (±1)

---

## 2. Passive Background Spawning ✅ HAPPENS AUTOMATICALLY

**When**: Continuously in the background (checked every 100ms)  
**Where**: Only in your CURRENT orbit  
**Trigger**: Automatic - based on probability

### How It Works:
```
Game Loop (every 100ms) → Random Check → ~0.2% chance → Derelict Spawns in Current Orbit
```

**Code Location**: `src/engine/derelictSpawning.ts` - `checkPassiveSpawning()` function

**Spawn Rate Formula**:
```
baseSpawnRate = 0.002 (0.2% per tick)
orbitMultiplier = varies by orbit (LEO: 1.0x, GEO: 1.2x, Mars: 2.0x, etc.)
finalChance = baseSpawnRate × orbitMultiplier
```

**Average Spawn Time**:
- LEO: ~50 seconds per derelict
- Mars: ~25 seconds per derelict (2x multiplier)
- Kuiper: ~10 seconds per derelict (5x multiplier)

**Limits**:
- Max 5 derelicts per orbit (passive spawning won't exceed this)
- Max 6 derelicts total across all orbits

---

## Key Differences

| Feature | Scout Missions | Passive Spawning |
|---------|---------------|------------------|
| **Timing** | When mission finishes | Continuous background |
| **Location** | Target orbit (±1 with tech) | Current orbit only |
| **Player Control** | Yes - launch missions | No - automatic |
| **Cost** | Fuel + Ship required | Free |
| **Spawn Rate** | Depends on scout success rate | ~0.2% per tick (50sec avg) |
| **Notification** | "Scout discovered..." | "New derelict detected..." |

---

## Deep Space Scanners

The **Deep Space Scanner** ship increases the passive spawn rate:
- Each scanner adds +2% to derelict spawn chance
- This is a passive effect (no action needed)
- Works in addition to the automatic background spawning

**Code Location**: `src/config/ships.ts` (line 197-202)

---

## Expiration

All derelicts expire after **15 minutes** (900 seconds) unless:
- A salvage mission is actively targeting them
- They are salvaged before expiring

**Code Location**: Line 1322 in `gameStore.ts`:
```typescript
expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
```

---

## Visual Summary

```
DERELICT SPAWNING FLOW:

┌─────────────────────────────────────┐
│  ACTIVE: Scout Missions             │
│  - Player launches scout            │
│  - Mission timer completes          │
│  - Derelict spawns in target orbit  │
│  - (OR adjacent with tech unlock)   │
└─────────────────────────────────────┘
              +
┌─────────────────────────────────────┐
│  PASSIVE: Background Spawning       │
│  - Runs every 100ms automatically   │
│  - 0.2% chance per tick             │
│  - Only in CURRENT orbit            │
│  - Faster in higher orbits          │
└─────────────────────────────────────┘
              ↓
         [DERELICTS!]
```
