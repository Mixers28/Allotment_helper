import { create } from 'zustand';

type Tool = 'select' | 'draw-plot' | 'add-bed';

interface UIState {
  currentTool: Tool;
  createPlotModalOpen: boolean;
  addBedModalOpen: boolean;
  isDrawingPlot: boolean;
  drawStart: { x: number; y: number } | null;
  drawCurrent: { x: number; y: number } | null;

  setCurrentTool: (tool: Tool) => void;
  openCreatePlotModal: () => void;
  closeCreatePlotModal: () => void;
  openAddBedModal: () => void;
  closeAddBedModal: () => void;
  startDrawingPlot: (start: { x: number; y: number }) => void;
  updateDrawing: (current: { x: number; y: number }) => void;
  endDrawingPlot: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  currentTool: 'select',
  createPlotModalOpen: false,
  addBedModalOpen: false,
  isDrawingPlot: false,
  drawStart: null,
  drawCurrent: null,

  setCurrentTool: (tool) => set({ currentTool: tool }),
  openCreatePlotModal: () => set({ createPlotModalOpen: true }),
  closeCreatePlotModal: () => set({ createPlotModalOpen: false }),
  openAddBedModal: () => set({ addBedModalOpen: true }),
  closeAddBedModal: () => set({ addBedModalOpen: false }),
  startDrawingPlot: (start) =>
    set({ isDrawingPlot: true, drawStart: start, drawCurrent: start }),
  updateDrawing: (current) => set({ drawCurrent: current }),
  endDrawingPlot: () =>
    set({ isDrawingPlot: false, drawStart: null, drawCurrent: null }),
}));
