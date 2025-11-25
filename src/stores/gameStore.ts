import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameState } from '@/types';

interface GameStore extends GameState {
  addResource: (type: keyof GameState['resources'], amount: number) => void;
  buyShip: (type: string, count?: number) => void;
  // Add more actions
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      resources: {
        debris: 0,
        metal: 0,
        electronics: 0,
        fuel: 0,
        rareMaterials: 0,
        exoticAlloys: 0,
        aiCores: 0,
        dataFragments: 0,
        darkMatter: 0,
      },
      ships: {},

      addResource: (type, amount) =>
        set((state) => ({
          resources: {
            ...state.resources,
            [type]: state.resources[type] + amount,
          },
        })),

      buyShip: (type, count = 1) =>
        set((state) => ({
          ships: {
            ...state.ships,
            [type]: (state.ships[type] || 0) + count,
          },
        })),
    }),
    {
      name: 'space-salvage-save',
    }
  )
);