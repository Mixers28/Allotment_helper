export interface Season {
  id: string;
  plotId: string;
  label: string;
  startDate: string; // ISO date string YYYY-MM-DD
  endDate: string;   // ISO date string YYYY-MM-DD
  createdAt: Date;
  updatedAt: Date;
}

export interface SeasonWithPlans extends Season {
  bedSectionPlans: import('./section.js').BedSectionPlan[];
}
