export interface PlotBase {
  id: string;
  name: string;
  units: 'meters' | 'feet';
  boundaryType: 'rect';
  boundary: {
    width: number;
    height: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface PlotWithBeds extends PlotBase {
  beds: import('./bed.js').BedBase[];
}
