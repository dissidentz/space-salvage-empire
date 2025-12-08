import type { GameSlice, UiSlice } from './types';

export const createUiSlice: GameSlice<UiSlice> = (set, get) => ({
  ui: {
    activeView: 'dashboard',
    activeTab: 'fleet',
    notifications: [],
    automationSettings: {
        autoScoutEnabled: false,
        autoSalvageEnabled: false,
        autoScoutTargetLimit: 5,
    },
    openModal: null,
    eventLog: [],
    settings: {
        soundEnabled: true,
        musicEnabled: true,
        soundVolume: 0.5,
        musicVolume: 0.5,
        autoSave: true,
        autoSaveInterval: 60,
        showAnimations: true,
        compactMode: false,
    },
    activeTooltip: null,
    afkSummary: null,
  },

  setActiveView: (view) => {
    set((state) => ({
      ui: {
        ...state.ui,
        activeView: view,
      },
    }));
  },

  openModal: (modal, data) => {
    set((state) => ({
      ui: {
        ...state.ui,
        openModal: modal,
        modalData: data,
      },
    }));
  },

  closeModal: () => {
    set((state) => ({
      ui: {
        ...state.ui,
        openModal: null,
        modalData: undefined,
      },
    }));
  },

  addNotification: (type, message, duration = 3000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const timestamp = Date.now();
    
    set((state) => ({
      ui: {
        ...state.ui,
        notifications: [
          ...state.ui.notifications,
          { id, type, message, timestamp, duration },
        ],
        // Also add to persistent event log
        eventLog: [
          { id, type, message, timestamp },
          ...state.ui.eventLog,
        ].slice(0, 200), // Keep last 200 events
      },
    }));

    if (duration > 0) {
      setTimeout(() => {
        get().clearNotification(id);
      }, duration);
    }
  },

  clearNotification: (id) => {
    set((state) => ({
      ui: {
        ...state.ui,
        notifications: state.ui.notifications.filter((n) => n.id !== id),
      },
    }));
  },
});
