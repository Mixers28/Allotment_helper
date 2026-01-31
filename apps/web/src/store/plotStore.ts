import { create } from 'zustand';
import type { PlotBase, BedBase } from '@allotment/domain';

interface PlotState {
  plot: PlotBase | null;
  beds: BedBase[];
  isLoading: boolean;
  selectedBedId: string | null;

  setPlot: (plot: PlotBase) => void;
  setBeds: (beds: BedBase[]) => void;
  updateBed: (id: string, updates: Partial<BedBase>) => void;
  addBed: (bed: BedBase) => void;
  removeBed: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setSelectedBedId: (id: string | null) => void;
  clearPlot: () => void;
}

export const usePlotStore = create<PlotState>((set) => ({
  plot: null,
  beds: [],
  isLoading: true,
  selectedBedId: null,

  setPlot: (plot) => set({ plot }),
  setBeds: (beds) => set({ beds }),
  updateBed: (id, updates) =>
    set((state) => ({
      beds: state.beds.map((b) =>
        b.id === id ? { ...b, ...updates, updatedAt: new Date() } : b
      ),
    })),
  addBed: (bed) => set((state) => ({ beds: [...state.beds, bed] })),
  removeBed: (id) =>
    set((state) => ({
      beds: state.beds.filter((b) => b.id !== id),
      selectedBedId: state.selectedBedId === id ? null : state.selectedBedId,
    })),
  setLoading: (loading) => set({ isLoading: loading }),
  setSelectedBedId: (id) => set({ selectedBedId: id }),
  clearPlot: () => set({ plot: null, beds: [], selectedBedId: null }),
}));
