export interface LengthSplitDefinition {
  cuts: number[]; // Cut positions along bed length in meters
}

export interface BedSectionPlan {
  id: string;
  seasonId: string;
  bedId: string;
  mode: 'length_splits';
  definition: LengthSplitDefinition;
  createdAt: Date;
  updatedAt: Date;
}

export interface SectionBounds {
  x0: number; // Start along length
  x1: number; // End along length
  y0: number; // Start along width (always 0 for lengthwise)
  y1: number; // End along width (always bed.width)
}

export interface Section {
  id: string; // Generated: `${bedSectionPlanId}-${index}`
  bedSectionPlanId: string;
  bedId: string;
  index: number;
  name: string; // "Section A", "Section B", etc.
  boundsLocal: SectionBounds;
}
