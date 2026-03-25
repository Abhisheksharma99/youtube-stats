import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Project } from '@/lib/types'

interface ProjectState {
  projects: Project[]
  activeProjectId: string | null
  isLoading: boolean
  error: string | null
}

interface ProjectActions {
  setProjects: (projects: Project[]) => void
  addProject: (project: Project) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  setActiveProject: (id: string | null) => void
  fetchProjects: () => Promise<void>
}

export const useProjectStore = create<ProjectState & ProjectActions>()(
  persist(
    (set, get) => ({
      projects: [],
      activeProjectId: null,
      isLoading: false,
      error: null,

      setProjects: (projects) =>
        set({ projects }),

      addProject: (project) =>
        set((state) => ({
          projects: [...state.projects, project],
        })),

      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
          ),
        })),

      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          activeProjectId: state.activeProjectId === id ? null : state.activeProjectId,
        })),

      setActiveProject: (id) =>
        set({ activeProjectId: id }),

      fetchProjects: async () => {
        set({ isLoading: true, error: null })
        try {
          const res = await fetch('/api/projects')
          if (!res.ok) {
            throw new Error(`Failed to fetch projects: ${res.statusText}`)
          }
          const projects: Project[] = await res.json()
          set({ projects, isLoading: false })
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to fetch projects'
          set({ error: message, isLoading: false })
        }
      },
    }),
    {
      name: 'contentforge-projects',
      partialize: (state) => ({
        projects: state.projects,
        activeProjectId: state.activeProjectId,
      }),
    }
  )
)
