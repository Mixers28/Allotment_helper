const SNAP_ANGLES = [
  0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240,
  255, 270, 285, 300, 315, 330, 345, 360,
];
const SNAP_THRESHOLD = 5; // degrees

export function snapAngle(angle: number): number {
  const normalized = ((angle % 360) + 360) % 360;
  for (const snap of SNAP_ANGLES) {
    if (Math.abs(normalized - snap) <= SNAP_THRESHOLD) {
      return snap === 360 ? 0 : snap;
    }
  }
  return normalized;
}

export function formatDimension(value: number): string {
  return value.toFixed(2);
}

export function calculateArea(width: number, height: number): number {
  return width * height;
}

// Pixels per meter for canvas rendering
export const PIXELS_PER_METER = 50;

export function metersToPixels(meters: number): number {
  return meters * PIXELS_PER_METER;
}

export function pixelsToMeters(pixels: number): number {
  return pixels / PIXELS_PER_METER;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function constrainToBounds(
  x: number,
  y: number,
  width: number,
  height: number,
  boundsWidth: number,
  boundsHeight: number
): { x: number; y: number } {
  return {
    x: clamp(x, 0, Math.max(0, boundsWidth - width)),
    y: clamp(y, 0, Math.max(0, boundsHeight - height)),
  };
}
