import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ViewType, ApiConfig } from '../types';

interface AppState {
  // Navigation
  currentView: ViewType;

  // API Config
  apiConfig: ApiConfig;

  // UI State
  isLoading: boolean;
  error: string | null;
  notifications: Notification[];

  // Demo & Presenter Mode
  demoMode: boolean;
  presenterMode: boolean;
  presenterFontScale: number;

  // Actions
  setCurrentView: (view: ViewType) => void;
  setApiKey: (key: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;

  // Demo & Presenter Actions
  setDemoMode: (enabled: boolean) => void;
  setPresenterMode: (enabled: boolean) => void;
  setPresenterFontScale: (scale: number) => void;
  togglePresenterMode: () => void;

  // Getters
  hasApiKey: () => boolean;
  hasRules: () => boolean;
  isDemoMode: () => boolean;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial State
      currentView: 'setup',
      apiConfig: {
        anthropicApiKey: ''
      },
      isLoading: false,
      error: null,
      notifications: [],
      demoMode: false,
      presenterMode: false,
      presenterFontScale: 1.0,

      // Actions
      setCurrentView: (view) => set({ currentView: view }),

      setApiKey: (key) => set((state) => ({
        apiConfig: { ...state.apiConfig, anthropicApiKey: key }
      })),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      addNotification: (notification) => set((state) => ({
        notifications: [
          ...state.notifications,
          { ...notification, id: `notif-${Date.now()}` }
        ]
      })),

      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),

      clearNotifications: () => set({ notifications: [] }),

      // Demo & Presenter Actions
      setDemoMode: (enabled) => set({ demoMode: enabled }),

      setPresenterMode: (enabled) => set({ presenterMode: enabled }),

      setPresenterFontScale: (scale) => set({ presenterFontScale: Math.max(0.8, Math.min(1.5, scale)) }),

      togglePresenterMode: () => set((state) => ({ presenterMode: !state.presenterMode })),

      // Getters
      hasApiKey: () => get().apiConfig.anthropicApiKey.length > 0,

      hasRules: () => {
        // Will be checked via rulesStore
        return false;
      },

      isDemoMode: () => get().demoMode
    }),
    {
      name: 'provisions-app-storage',
      partialize: (state) => ({
        apiConfig: state.apiConfig
      })
    }
  )
);
