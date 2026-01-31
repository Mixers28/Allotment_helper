/**
 * Coordinate transform utilities for bed-local ↔ world coordinate conversions.
 * All coordinates are in meters.
 */

export interface Point {
  x: number;
  y: number;
}

export interface BedTransform {
  x: number;
  y: number;
  rotationDeg: number;
}

/**
 * Convert degrees to radians
 */
export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Convert radians to degrees
 */
export function radiansToDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Normalize angle to [0, 360) range
 */
export function normalizeAngle(degrees: number): number {
  const normalized = degrees % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

/**
 * Transform a point from bed-local coordinates to world coordinates.
 * Bed-local origin is at top-left corner of bed.
 * X = length direction, Y = width direction.
 */
export function bedToWorld(localPoint: Point, transform: BedTransform): Point {
  const rad = degreesToRadians(transform.rotationDeg);
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  return {
    x: transform.x + localPoint.x * cos - localPoint.y * sin,
    y: transform.y + localPoint.x * sin + localPoint.y * cos,
  };
}

/**
 * Transform a point from world coordinates to bed-local coordinates.
 */
export function worldToBed(worldPoint: Point, transform: BedTransform): Point {
  const rad = degreesToRadians(-transform.rotationDeg);
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const translated = {
    x: worldPoint.x - transform.x,
    y: worldPoint.y - transform.y,
  };

  return {
    x: translated.x * cos - translated.y * sin,
    y: translated.x * sin + translated.y * cos,
  };
}

/**
 * Get the four corners of a bed in world coordinates.
 * Returns corners in order: top-left, top-right, bottom-right, bottom-left
 */
export function getBedCorners(
  width: number,
  height: number,
  transform: BedTransform
): [Point, Point, Point, Point] {
  const corners: [Point, Point, Point, Point] = [
    { x: 0, y: 0 }, // top-left
    { x: height, y: 0 }, // top-right (height is length along X)
    { x: height, y: width }, // bottom-right
    { x: 0, y: width }, // bottom-left
  ];

  return corners.map((corner) => bedToWorld(corner, transform)) as [
    Point,
    Point,
    Point,
    Point
  ];
}

/**
 * Check if a point in world coordinates is inside a bed.
 */
export function isPointInBed(
  point: Point,
  width: number,
  height: number,
  transform: BedTransform
): boolean {
  const local = worldToBed(point, transform);
  return local.x >= 0 && local.x <= height && local.y >= 0 && local.y <= width;
}

/**
 * Calculate the bounding box of a rotated bed in world coordinates.
 */
export function getBedBoundingBox(
  width: number,
  height: number,
  transform: BedTransform
): { minX: number; minY: number; maxX: number; maxY: number } {
  const corners = getBedCorners(width, height, transform);

  const xs = corners.map((c) => c.x);
  const ys = corners.map((c) => c.y);

  return {
    minX: Math.min(...xs),
    minY: Math.min(...ys),
    maxX: Math.max(...xs),
    maxY: Math.max(...ys),
  };
}
