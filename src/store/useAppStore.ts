import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import localStorageCache from '../utils/localStorageCache';
import logger from '../utils/logger';
import config from '../utils/config';

// Logger instance for this store
const log = logger.createScoped('AppStore');

// Define the store state type
interface AppState {
  // User state
  user: {
    id: string | null;
    name: string | null;
    email: string | null;
    isAuthenticated: boolean;
    apiKeys: {
      gemini: string | null;
    };
  };
  
  // Authentication state
  isLoading: boolean;
  
  // UI state
  ui: {
    theme: 'light' | 'dark' | 'system';
    sidebarOpen: boolean;
    currentView: string;
    notifications: Array<{
      id: string;
      type: 'info' | 'success' | 'warning' | 'error';
      message: string;
      timestamp: number;
      read: boolean;
    }>;
  };
  
  // Settings
  settings: {
    defaultModel: string;
    defaultContentType: string;
    defaultRegion: string;
    autoSave: boolean;
    offlineMode: boolean;
  };
  
  // Content generation state
  contentGeneration: {
    inProgress: boolean;
    progress: number;
    currentStep: string;
    error: string | null;
  };
  
  // Actions
  checkAuth: () => Promise<void>;
  
  actions: {
    // User actions
    setUser: (user: Partial<AppState['user']>) => void;
    logout: () => void;
    setApiKey: (service: 'gemini', key: string) => void;
    
    // UI actions
    setTheme: (theme: AppState['ui']['theme']) => void;
    toggleSidebar: () => void;
    setCurrentView: (view: string) => void;
    addNotification: (type: 'info' | 'success' | 'warning' | 'error', message: string) => void;
    markNotificationAsRead: (id: string) => void;
    clearNotifications: () => void;
    
    // Settings actions
    updateSettings: (settings: Partial<AppState['settings']>) => void;
    
    // Content generation actions
    startContentGeneration: () => void;
    updateGenerationProgress: (progress: number, step: string) => void;
    completeContentGeneration: () => void;
    setGenerationError: (error: string) => void;
  };
}

// Create the store with persistence
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial user state (temporarily set to authenticated for testing)
      user: {
        id: "test-user-id",
        name: "Test User",
        email: "test@example.com",
        isAuthenticated: true,
        apiKeys: {
          gemini: null,
        },
      },
      
      // Authentication loading state
      isLoading: false,
      
      // Check authentication status
      checkAuth: async () => {
        set({ isLoading: true });
        try {
          // In a real app, this would check with the backend
          // For now, we'll just use the stored user
          const currentUser = get().user;
          
          // Simulate a network request
          await new Promise(resolve => setTimeout(resolve, 500));
          
          if (!currentUser.isAuthenticated) {
            // If no authenticated user, we'd normally redirect to login
            // For testing, we'll just keep the test user
            set({
              user: {
                id: "test-user-id",
                name: "Test User",
                email: "test@example.com",
                isAuthenticated: true,
                apiKeys: {
                  gemini: null,
                },
              }
            });
          }
        } catch (error) {
          console.error("Auth check failed:", error);
        } finally {
          set({ isLoading: false });
        }
      },
      
      // Initial UI state
      ui: {
        theme: 'system',
        sidebarOpen: true,
        currentView: 'dashboard',
        notifications: [],
      },
      
      // Initial settings
      settings: {
        defaultModel: 'gemini-2.5-pro',
        defaultContentType: 'blog',
        defaultRegion: 'usa',
        autoSave: true,
        offlineMode: config.features.offlineMode,
      },
      
      // Initial content generation state
      contentGeneration: {
        inProgress: false,
        progress: 0,
        currentStep: '',
        error: null,
      },
      
      // Actions
      actions: {
        // User actions
        setUser: (user) => {
          set((state) => ({
            user: { ...state.user, ...user },
          }));
          log.info('User updated', { userId: user.id });
        },
        
        logout: () => {
          set({
            user: {
              id: null,
              name: null,
              email: null,
              isAuthenticated: false,
              apiKeys: {
                gemini: null,
              },
            },
          });
          log.info('User logged out');
        },
        
        setApiKey: (service, key) => {
          set((state) => ({
            user: {
              ...state.user,
              apiKeys: {
                ...state.user.apiKeys,
                [service]: key,
              },
            },
          }));
          log.info(`API key set for ${service}`);
        },
        
        // UI actions
        setTheme: (theme) => {
          set((state) => ({
            ui: { ...state.ui, theme },
          }));
          
          // Apply theme to document
          if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          
          log.info(`Theme set to ${theme}`);
        },
        
        toggleSidebar: () => {
          set((state) => ({
            ui: { ...state.ui, sidebarOpen: !state.ui.sidebarOpen },
          }));
        },
        
        setCurrentView: (view) => {
          set((state) => ({
            ui: { ...state.ui, currentView: view },
          }));
          log.info(`Current view set to ${view}`);
        },
        
        addNotification: (type, message) => {
          const notification = {
            id: crypto.randomUUID(),
            type,
            message,
            timestamp: Date.now(),
            read: false,
          };
          
          set((state) => ({
            ui: {
              ...state.ui,
              notifications: [notification, ...state.ui.notifications].slice(0, 100), // Limit to 100 notifications
            },
          }));
          
          log.info(`Added ${type} notification: ${message}`);
          
          // Auto-remove after 5 seconds for non-error notifications
          if (type !== 'error') {
            setTimeout(() => {
              set((state) => ({
                ui: {
                  ...state.ui,
                  notifications: state.ui.notifications.filter((n) => n.id !== notification.id),
                },
              }));
            }, 5000);
          }
        },
        
        markNotificationAsRead: (id) => {
          set((state) => ({
            ui: {
              ...state.ui,
              notifications: state.ui.notifications.map((n) =>
                n.id === id ? { ...n, read: true } : n
              ),
            },
          }));
        },
        
        clearNotifications: () => {
          set((state) => ({
            ui: {
              ...state.ui,
              notifications: [],
            },
          }));
          log.info('Notifications cleared');
        },
        
        // Settings actions
        updateSettings: (settings) => {
          set((state) => ({
            settings: { ...state.settings, ...settings },
          }));
          log.info('Settings updated', settings);
        },
        
        // Content generation actions
        startContentGeneration: () => {
          set({
            contentGeneration: {
              inProgress: true,
              progress: 0,
              currentStep: 'Initializing',
              error: null,
            },
          });
          log.info('Content generation started');
        },
        
        updateGenerationProgress: (progress, step) => {
          set({
            contentGeneration: {
              ...get().contentGeneration,
              progress,
              currentStep: step,
            },
          });
          log.debug(`Generation progress: ${progress}%, step: ${step}`);
        },
        
        completeContentGeneration: () => {
          set({
            contentGeneration: {
              ...get().contentGeneration,
              inProgress: false,
              progress: 100,
              currentStep: 'Complete',
            },
          });
          log.info('Content generation completed');
        },
        
        setGenerationError: (error) => {
          set({
            contentGeneration: {
              ...get().contentGeneration,
              inProgress: false,
              error,
            },
          });
          log.error(`Content generation error: ${error}`);
        },
      },
    }),
    {
      name: 'ea-policyframe-store',
      storage: createJSONStorage(() => ({
        getItem: (key) => {
          return localStorageCache.getItem(key);
        },
        setItem: (key, value) => {
          localStorageCache.setItem(key, value, 30 * 24 * 60 * 60 * 1000); // 30 days
        },
        removeItem: (key) => {
          localStorageCache.removeItem(key);
        },
      })),
      partialize: (state) => ({
        // Only persist these parts of the state
        user: {
          id: state.user.id,
          name: state.user.name,
          email: state.user.email,
          isAuthenticated: state.user.isAuthenticated,
          apiKeys: state.user.apiKeys,
        },
        ui: {
          theme: state.ui.theme,
        },
        settings: state.settings,
      }),
    }
  )
);

// Initialize theme on load
if (typeof window !== 'undefined') {
  const { setTheme } = useAppStore.getState().actions;
  const theme = useAppStore.getState().ui.theme;
  setTheme(theme);
}

export default useAppStore;