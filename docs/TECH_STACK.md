# Space Salvage Empire - Complete Tech Stack

Based on your requirements for animations, sounds, and the complexity of the game systems.

---

## Core Technology Decisions

### **Primary Framework: React + TypeScript**
**Why:**
- You're already familiar (we discussed artifacts using React)
- Excellent state management for complex idle games
- Component-based architecture perfect for modular game systems
- TypeScript provides type safety for complex game formulas
- Large ecosystem for animations and audio

---

## Full Tech Stack

### **1. Foundation Layer**

#### **Build Tool: Vite**
```json
{
  "vite": "^5.0.0"
}
```
**Why:**
- Lightning-fast hot module replacement (HMR) for development
- Optimized production builds
- TypeScript support out of the box
- Much faster than Create React App

#### **Language: TypeScript**
```json
{
  "typescript": "^5.3.0"
}
```
**Why:**
- Type safety for complex game formulas (cost calculations, production rates)
- Better autocomplete and refactoring
- Catches bugs at compile time
- Self-documenting code

---

### **2. UI Framework**

#### **Core: React 18**
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0"
}
```

#### **Styling: Tailwind CSS**
```json
{
  "tailwindcss": "^3.4.0",
  "autoprefixer": "^10.4.0",
  "postcss": "^8.4.0"
}
```
**Why:**
- Rapid UI development with utility classes
- Responsive design built-in
- Easy dark mode support (space theme)
- Small bundle size with purging
- Perfect for game UI (resource bars, buttons, modals)

#### **Component Library: shadcn/ui** (Optional but recommended)
```bash
npx shadcn-ui@latest init
```
**Why:**
- Pre-built accessible components (modals, tooltips, tabs)
- Built on Radix UI (excellent accessibility)
- Customizable with Tailwind
- Copy-paste components (not a dependency)
- Great for modals, dropdowns, progress bars

---

### **3. Animation Layer**

#### **Animation: Framer Motion**
```json
{
  "framer-motion": "^11.0.0"
}
```
**Why:**
- Best React animation library
- Smooth animations for:
  - Resource pop-ups (+1000 Metal)
  - Ship movement in Solar System view
  - Button interactions
  - Page transitions
  - Derelict discovery celebrations
- Simple API with powerful features
- Great performance

**Example Use Cases:**
```typescript
// Resource gain animation
<motion.div
  initial={{ y: 0, opacity: 1 }}
  animate={{ y: -50, opacity: 0 }}
  transition={{ duration: 1 }}
>
  +1000 Metal
</motion.div>

// Ship movement
<motion.div
  animate={{ x: shipPosition }}
  transition={{ duration: missionTime }}
>
  🚀
</motion.div>

// Button pulse on hover
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Buy Drone
</motion.button>
```

#### **Canvas Graphics: Konva + React-Konva** (For Solar System View)
```json
{
  "react-konva": "^18.2.0",
  "konva": "^9.3.0"
}
```
**Why:**
- 2D canvas rendering for Solar System visualization
- Better performance than DOM for many moving ships
- Draw orbits, planets, ships, derelicts
- Easy event handling (click on ships/derelicts)
- Can export canvas as image (screenshot feature)

**Alternative:** **Three.js + React-Three-Fiber** (if you want 3D)
```json
{
  "@react-three/fiber": "^8.15.0",
  "@react-three/drei": "^9.92.0",
  "three": "^0.160.0"
}
```
- More visually impressive (3D Solar System)
- Steeper learning curve
- Larger bundle size
- Better "wow factor"

**Recommendation:** Start with Konva (2D), upgrade to Three.js later if desired

---

### **4. Audio System**

#### **Audio: Howler.js**
```json
{
  "howler": "^2.2.4"
}
```
**Why:**
- Best audio library for web games
- Handles audio sprites (multiple sounds in one file)
- Automatic fallbacks and caching
- Volume control, fade in/out
- Mobile-friendly (handles restrictions)
- Small and reliable

**Sound Effects Needed:**
- Click/button press
- Resource gain (different pitch for different resources)
- Ship launch
- Derelict discovered (radar ping)
- Mission complete (success fanfare)
- Prestige activation (whoosh)
- Ark component found (epic horn)
- Background ambient space music

**Example Usage:**
```typescript
import { Howl } from 'howler';

const sounds = {
  click: new Howl({ src: ['/sounds/click.mp3'], volume: 0.5 }),
  resource: new Howl({ src: ['/sounds/resource.mp3'], volume: 0.3 }),
  discovery: new Howl({ src: ['/sounds/radar-ping.mp3'], volume: 0.6 }),
  prestige: new Howl({ src: ['/sounds/prestige-whoosh.mp3'], volume: 0.8 }),
};

// Play on resource gain
sounds.resource.play();

// Background music
const bgMusic = new Howl({
  src: ['/sounds/ambient-space.mp3'],
  loop: true,
  volume: 0.2
});
bgMusic.play();
```

---

### **5. State Management**

#### **State: Zustand**
```json
{
  "zustand": "^4.4.0"
}
```
**Why:**
- Simpler than Redux, more powerful than Context
- Perfect for game state (resources, ships, missions)
- Minimal boilerplate
- TypeScript-friendly
- Built-in persistence middleware (localStorage)
- No provider wrapping needed

**Example Store:**
```typescript
import create from 'zustand';
import { persist } from 'zustand/middleware';

interface GameState {
  resources: {
    debris: number;
    metal: number;
    electronics: number;
    // ...
  };
  ships: {
    salvageDrone: number;
    refineryBarge: number;
    // ...
  };
  addResource: (type: string, amount: number) => void;
  buyShip: (type: string) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      resources: { debris: 0, metal: 0, electronics: 0 },
      ships: { salvageDrone: 0, refineryBarge: 0 },
      
      addResource: (type, amount) =>
        set((state) => ({
          resources: {
            ...state.resources,
            [type]: state.resources[type] + amount,
          },
        })),
      
      buyShip: (type) =>
        set((state) => ({
          ships: {
            ...state.ships,
            [type]: state.ships[type] + 1,
          },
        })),
    }),
    {
      name: 'space-salvage-save',
    }
  )
);
```

---

### **6. Game Logic Layer**

#### **Utilities:**

**break_infinity.js** - For huge numbers
```json
{
  "break_infinity.js": "^2.1.0"
}
```
**Why:**
- Handles numbers beyond JavaScript's limit (up to 1e308)
- Essential for idle games (numbers grow exponentially)
- Drop-in replacement for regular numbers

**date-fns** - Time calculations
```json
{
  "date-fns": "^3.0.0"
}
```
**Why:**
- Offline time calculations
- Mission duration tracking
- Construction timers
- Lighter than moment.js

**lodash** - Utility functions
```json
{
  "lodash": "^4.17.21",
  "@types/lodash": "^4.14.0"
}
```
**Why:**
- Deep cloning game state
- Throttle/debounce for performance
- Array/object manipulation
- Reliable utilities

---

### **7. Data Persistence**

#### **LocalStorage + LZ-String Compression**
```json
{
  "lz-string": "^1.5.0"
}
```
**Why:**
- Compress save data (game state can get large)
- Zustand handles localStorage automatically
- LZ-String reduces save size by 80%+
- Enable import/export for backups

**Example:**
```typescript
import LZString from 'lz-string';

// Save
const saveGame = () => {
  const state = useGameStore.getState();
  const compressed = LZString.compressToBase64(JSON.stringify(state));
  localStorage.setItem('space-salvage-save', compressed);
};

// Load
const loadGame = () => {
  const compressed = localStorage.getItem('space-salvage-save');
  if (compressed) {
    const state = JSON.parse(LZString.decompressFromBase64(compressed));
    useGameStore.setState(state);
  }
};
```

---

### **8. Development Tools**

#### **Code Quality:**
```json
{
  "eslint": "^8.56.0",
  "@typescript-eslint/eslint-plugin": "^6.19.0",
  "@typescript-eslint/parser": "^6.19.0",
  "prettier": "^3.2.0",
  "eslint-config-prettier": "^9.1.0"
}
```

#### **Testing (Optional but recommended):**
```json
{
  "vitest": "^1.2.0",
  "@testing-library/react": "^14.1.0",
  "@testing-library/jest-dom": "^6.2.0"
}
```
**Why:**
- Test game formulas (cost calculations, production rates)
- Ensure prestige doesn't break saves
- Test edge cases (negative resources, overflow)

---

### **9. Asset Management**

#### **Icons: Lucide React**
```json
{
  "lucide-react": "^0.312.0"
}
```
**Why:**
- 1000+ clean, modern icons
- Perfect for UI (ships, resources, actions)
- Tree-shakeable (only import what you use)
- Consistent style

**Examples:**
- Rocket (ships)
- Zap (energy/fuel)
- Package (cargo/resources)
- Wrench (salvage)
- Star (prestige)
- Target (missions)

#### **Sound Effects: Free Sources**
- **Freesound.org** - UI sounds, clicks, whooshes
- **Zapsplat.com** - Sci-fi effects, space ambience
- **Incompetech.com** - Background music (royalty-free)
- **Pixabay** - Growing library of free sounds

#### **Image Assets (Optional):**
- **Stable Diffusion** - Generate space backgrounds, ship art
- **Midjourney** - High-quality derelict illustrations
- **Unsplash** - Space photography for backgrounds

---

### **10. Deployment**

#### **Hosting: Vercel** (Recommended)
```bash
npm install -g vercel
vercel deploy
```
**Why:**
- Free hosting for hobby projects
- Automatic HTTPS
- CDN distribution
- Zero config for Vite/React
- Instant deployments
- Preview deployments for testing

**Alternatives:**
- **Netlify** - Similar to Vercel
- **GitHub Pages** - Free, simple, static hosting
- **Itch.io** - Great for indie games, built-in community
- **Steam** - If you want to go big (via Greenlight/Direct)

---

## Complete package.json

```json
{
  "name": "space-salvage-empire",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx",
    "test": "vitest"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.4.0",
    "framer-motion": "^11.0.0",
    "react-konva": "^18.2.0",
    "konva": "^9.3.0",
    "howler": "^2.2.4",
    "break_infinity.js": "^2.1.0",
    "date-fns": "^3.0.0",
    "lodash": "^4.17.21",
    "lz-string": "^1.5.0",
    "lucide-react": "^0.312.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/howler": "^2.2.11",
    "@types/lodash": "^4.14.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "eslint": "^8.56.0",
    "@typescript-eslint/eslint-plugin": "^6.19.0",
    "@typescript-eslint/parser": "^6.19.0",
    "prettier": "^3.2.0",
    "eslint-config-prettier": "^9.1.0",
    "vitest": "^1.2.0",
    "@testing-library/react": "^14.1.0",
    "@testing-library/jest-dom": "^6.2.0"
  }
}
```

---

## Project Structure

```
space-salvage-empire/
├── public/
│   ├── sounds/
│   │   ├── click.mp3
│   │   ├── resource-gain.mp3
│   │   ├── ship-launch.mp3
│   │   ├── discovery.mp3
│   │   ├── prestige.mp3
│   │   └── ambient-space.mp3
│   └── images/
│       ├── backgrounds/
│       └── derelicts/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn components
│   │   ├── ResourceBar.tsx
│   │   ├── FleetPanel.tsx
│   │   ├── SolarSystemView.tsx
│   │   ├── DerelictModal.tsx
│   │   ├── TechTree.tsx
│   │   ├── PrestigeScreen.tsx
│   │   └── ArkAssembly.tsx
│   ├── stores/
│   │   ├── gameStore.ts     # Main game state (Zustand)
│   │   └── uiStore.ts       # UI state (modals, tabs)
│   ├── engine/
│   │   ├── tick.ts          # Game loop (10 ticks/sec)
│   │   ├── production.ts    # Production calculations
│   │   ├── missions.ts      # Mission logic
│   │   ├── derelicts.ts     # Derelict spawning/rewards
│   │   ├── prestige.ts      # DM calculations
│   │   └── offline.ts       # Offline progress
│   ├── config/
│   │   ├── ships.ts         # Ship definitions
│   │   ├── resources.ts     # Resource definitions
│   │   ├── orbits.ts        # Orbit data
│   │   ├── derelicts.ts     # Derelict templates
│   │   ├── tech.ts          # Tech tree
│   │   └── prestige.ts      # DM perks
│   ├── utils/
│   │   ├── formulas.ts      # Cost/production formulas
│   │   ├── format.ts        # Number formatting
│   │   ├── save.ts          # Save/load logic
│   │   └── audio.ts         # Sound manager
│   ├── hooks/
│   │   ├── useGameLoop.ts   # Tick engine hook
│   │   ├── useMissions.ts   # Mission management
│   │   └── useSound.ts      # Audio hook
│   ├── types/
│   │   └── index.ts         # TypeScript interfaces
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .eslintrc.cjs
├── .prettierrc
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── package.json
```

---

## Performance Considerations

### **Optimization Strategies:**

1. **React.memo for expensive components:**
```typescript
export const FleetPanel = React.memo(() => {
  // Only re-renders when ships change
});
```

2. **Zustand selectors to prevent unnecessary renders:**
```typescript
// Bad: re-renders on ANY state change
const state = useGameStore();

// Good: only re-renders when debris changes
const debris = useGameStore(state => state.resources.debris);
```

3. **RequestAnimationFrame for smooth animations:**
```typescript
const animate = () => {
  updateShipPositions();
  requestAnimationFrame(animate);
};
```

4. **Web Workers for heavy calculations (optional):**
```typescript
// offlineCalculations.worker.ts
self.onmessage = (e) => {
  const { timeOffline, productionRates } = e.data;
  const result = calculateOfflineGains(timeOffline, productionRates);
  self.postMessage(result);
};
```

5. **Lazy loading for modals:**
```typescript
const PrestigeScreen = lazy(() => import('./components/PrestigeScreen'));
```

---

## Bundle Size Targets

**Target:** < 500KB initial bundle (gzipped)
- React + ReactDOM: ~130KB
- Zustand: ~3KB
- Framer Motion: ~60KB
- Konva: ~80KB
- Howler: ~9KB
- Utilities: ~20KB
- Your code: ~100-150KB
- **Total: ~400-450KB** ✅

**Optimization:**
- Code splitting by route/modal
- Tree-shaking unused code
- Lazy load audio assets
- Compress images (WebP format)

---

## Development Workflow

```bash
# Initial setup
npm create vite@latest space-salvage-empire -- --template react-ts
cd space-salvage-empire
npm install

# Install dependencies
npm install react react-dom zustand framer-motion react-konva konva howler break_infinity.js date-fns lodash lz-string lucide-react

# Install dev dependencies
npm install -D @types/react @types/react-dom @types/howler @types/lodash @vitejs/plugin-react typescript vite tailwindcss autoprefixer postcss

# Setup Tailwind
npx tailwindcss init -p

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Vercel
vercel deploy
```

---

## Why This Stack?

✅ **Modern & Fast:** Vite + React 18 for instant dev server and optimal builds
✅ **Type-Safe:** TypeScript prevents bugs in complex formulas
✅ **Smooth Animations:** Framer Motion for juicy UI feedback
✅ **Great Audio:** Howler.js handles all sound needs
✅ **Easy State:** Zustand is simpler than Redux, powerful enough for game logic
✅ **Visual Impact:** Konva for animated Solar System view
✅ **Big Numbers:** break_infinity.js handles exponential growth
✅ **Production-Ready:** All libraries are mature, well-documented, and maintained
✅ **Small Bundle:** Entire game under 500KB gzipped
✅ **Free Hosting:** Vercel makes deployment trivial

---

## Alternative Considerations

### **If you want 3D visuals:**
Replace Konva with Three.js + React-Three-Fiber
- More impressive visually
- Steeper learning curve
- +200KB bundle size

### **If you want mobile app:**
Use React Native instead of React DOM
- Same codebase works on iOS/Android
- Different animation libraries (Reanimated instead of Framer Motion)
- More complex deployment

### **If you want multiplayer:**
Add Socket.io or Supabase Realtime
- Shared derelict discoveries
- Leaderboards
- Trading between players
- Requires backend server

---

This tech stack gives you everything needed to build a polished, performant, animated idle game with sound. All libraries are battle-tested and have great TypeScript support.

**Ready to start building?**