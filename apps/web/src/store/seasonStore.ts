import { create } from 'zustand';
import type { Season, BedSectionPlan, LengthSplitDefinition } from '@allotment/domain';

interface SeasonState {
  seasons: Season[];
  currentSeasonId: string | null;
  bedSectionPlans: BedSectionPlan[];
  isLoading: boolean;
  selectedSectionId: string | null; // format: `${planId}-${index}`

  setSeasons: (seasons: Season[]) => void;
  setCurrentSeasonId: (id: string | null) => void;
  setBedSectionPlans: (plans: BedSectionPlan[]) => void;
  addSeason: (season: Season) => void;
  removeSeason: (id: string) => void;
  updateSeasonInStore: (id: string, updates: Partial<Season>) => void;
  addBedSectionPlan: (plan: BedSectionPlan) => void;
  updateBedSectionPlan: (id: string, updates: Partial<BedSectionPlan>) => void;
  removeBedSectionPlan: (id: string) => void;
  getBedSectionPlan: (bedId: string) => BedSectionPlan | undefined;
  setLoading: (loading: boolean) => void;
  setSelectedSectionId: (id: string | null) => void;
  clearSeasons: () => void;
}

export const useSeasonStore = create<SeasonState>((set, get) => ({
  seasons: [],
  currentSeasonId: null,
  bedSectionPlans: [],
  isLoading: false,
  selectedSectionId: null,

  setSeasons: (seasons) => set({ seasons }),

  setCurrentSeasonId: (id) => set({ currentSeasonId: id, selectedSectionId: null }),

  setBedSectionPlans: (plans) => set({ bedSectionPlans: plans }),

  addSeason: (season) =>
    set((state) => ({
      seasons: [season, ...state.seasons],
    })),

  removeSeason: (id) =>
    set((state) => ({
      seasons: state.seasons.filter((s) => s.id !== id),
      currentSeasonId: state.currentSeasonId === id ? null : state.currentSeasonId,
      bedSectionPlans:
        state.currentSeasonId === id ? [] : state.bedSectionPlans,
    })),

  updateSeasonInStore: (id, updates) =>
    set((state) => ({
      seasons: state.seasons.map((s) =>
        s.id === id ? { ...s, ...updates, updatedAt: new Date() } : s
      ),
    })),

  addBedSectionPlan: (plan) =>
    set((state) => ({
      bedSectionPlans: [...state.bedSectionPlans, plan],
    })),

  updateBedSectionPlan: (id, updates) =>
    set((state) => ({
      bedSectionPlans: state.bedSectionPlans.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
      ),
    })),

  removeBedSectionPlan: (id) =>
    set((state) => ({
      bedSectionPlans: state.bedSectionPlans.filter((p) => p.id !== id),
    })),

  getBedSectionPlan: (bedId) => {
    return get().bedSectionPlans.find((p) => p.bedId === bedId);
  },

  setLoading: (loading) => set({ isLoading: loading }),

  setSelectedSectionId: (id) => set({ selectedSectionId: id }),

  clearSeasons: () =>
    set({
      seasons: [],
      currentSeasonId: null,
      bedSectionPlans: [],
      selectedSectionId: null,
    }),
}));

// Helper to get current season from store
export function getCurrentSeason(state: SeasonState): Season | null {
  if (!state.currentSeasonId) return null;
  return state.seasons.find((s) => s.id === state.currentSeasonId) ?? null;
}
