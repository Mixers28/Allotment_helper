export interface BedBase {
  id: string;
  plotId: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotationDeg: number;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}
