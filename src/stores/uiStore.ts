import { create } from 'zustand';

interface UIState {
  showResourcesSidebar: boolean;
  toggleResourcesSidebar: () => void;
  showResourceBar: boolean;
  toggleResourceBar: () => void;
}

export const useUIStore = create<UIState>(set => ({
  showResourcesSidebar: false,
  toggleResourcesSidebar: () =>
    set(state => ({ showResourcesSidebar: !state.showResourcesSidebar })),
  showResourceBar: true,
  toggleResourceBar: () =>
    set(state => ({ showResourceBar: !state.showResourceBar })),
}));
