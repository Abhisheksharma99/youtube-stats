'use client'

import { create } from 'zustand'

interface ProjectState {
  activeProjectId: string | null
  recentProjectIds: string[]

  setActiveProject: (id: string | null) => void
  addRecentProject: (id: string) => void
}

export const useProjectStore = create<ProjectState>()((set) => ({
  activeProjectId: null,
  recentProjectIds: [],

  setActiveProject: (id) => set({ activeProjectId: id }),

  addRecentProject: (id) =>
    set((state) => {
      const filtered = state.recentProjectIds.filter((pid) => pid !== id)
      return {
        recentProjectIds: [id, ...filtered].slice(0, 5),
      }
    }),
}))
