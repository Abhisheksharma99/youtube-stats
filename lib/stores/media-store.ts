import { create } from "zustand";
import type { GeneratedMedia } from "@/lib/types";

interface GenerationQueueItem {
  id: string;
  projectId: string;
  type: GeneratedMedia["type"];
  prompt: string;
  config: Record<string, unknown>;
  status: "queued" | "processing" | "done" | "error";
  createdAt: Date;
}

interface MediaState {
  generatedMedia: GeneratedMedia[];
  selectedMedia: GeneratedMedia[];
  generationQueue: GenerationQueueItem[];
}

interface MediaActions {
  addMedia: (media: GeneratedMedia) => void;
  updateMedia: (id: string, updates: Partial<GeneratedMedia>) => void;
  selectMedia: (media: GeneratedMedia) => void;
  deselectMedia: (id: string) => void;
  clearSelection: () => void;
  fetchMediaByProject: (projectId: string) => Promise<void>;
}

export const useMediaStore = create<MediaState & MediaActions>()(
  (set) => ({
    generatedMedia: [],
    selectedMedia: [],
    generationQueue: [],

    addMedia: (media) =>
      set((state) => ({
        generatedMedia: [...state.generatedMedia, media],
      })),

    updateMedia: (id, updates) =>
      set((state) => ({
        generatedMedia: state.generatedMedia.map((m) =>
          m.id === id ? { ...m, ...updates } : m
        ),
        selectedMedia: state.selectedMedia.map((m) =>
          m.id === id ? { ...m, ...updates } : m
        ),
      })),

    selectMedia: (media) =>
      set((state) => {
        if (state.selectedMedia.some((m) => m.id === media.id)) return state;
        return { selectedMedia: [...state.selectedMedia, media] };
      }),

    deselectMedia: (id) =>
      set((state) => ({
        selectedMedia: state.selectedMedia.filter((m) => m.id !== id),
      })),

    clearSelection: () => set({ selectedMedia: [] }),

    fetchMediaByProject: async (projectId) => {
      try {
        const res = await fetch(`/api/projects/${projectId}/media`);
        if (!res.ok) {
          throw new Error(`Failed to fetch media: ${res.statusText}`);
        }
        const media: GeneratedMedia[] = await res.json();
        set({ generatedMedia: media });
      } catch {
        // silently fail — consumers can check generatedMedia length
      }
    },
  })
);
