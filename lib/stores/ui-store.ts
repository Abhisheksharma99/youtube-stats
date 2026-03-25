import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type NotificationType = 'info' | 'success' | 'warning' | 'error'

interface Notification {
  id: string
  type: NotificationType
  message: string
  timestamp: Date
}

type Theme = 'light' | 'dark'

interface UIState {
  sidebarOpen: boolean
  activeTab: string
  theme: Theme
  notifications: Notification[]
}

interface UIActions {
  toggleSidebar: () => void
  setActiveTab: (tab: string) => void
  setTheme: (theme: Theme) => void
  addNotification: (type: NotificationType, message: string) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

export const useUIStore = create<UIState & UIActions>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      activeTab: 'projects',
      theme: 'dark',
      notifications: [],

      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setActiveTab: (tab) =>
        set({ activeTab: tab }),

      setTheme: (theme) =>
        set({ theme }),

      addNotification: (type, message) =>
        set((state) => ({
          notifications: [
            ...state.notifications,
            {
              id: crypto.randomUUID(),
              type,
              message,
              timestamp: new Date(),
            },
          ],
        })),

      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      clearNotifications: () =>
        set({ notifications: [] }),
    }),
    {
      name: 'contentforge-ui',
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        theme: state.theme,
        activeTab: state.activeTab,
      }),
    }
  )
)
