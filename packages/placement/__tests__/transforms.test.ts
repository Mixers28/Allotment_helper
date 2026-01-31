import { describe, it, expect } from 'vitest';
import {
  degreesToRadians,
  radiansToDegrees,
  normalizeAngle,
  bedToWorld,
  worldToBed,
  getBedCorners,
  isPointInBed,
  getBedBoundingBox,
} from '../src/transforms';

describe('transforms', () => {
  describe('degreesToRadians', () => {
    it('converts 0 degrees to 0 radians', () => {
      expect(degreesToRadians(0)).toBe(0);
    });

    it('converts 90 degrees to PI/2 radians', () => {
      expect(degreesToRadians(90)).toBeCloseTo(Math.PI / 2);
    });

    it('converts 180 degrees to PI radians', () => {
      expect(degreesToRadians(180)).toBeCloseTo(Math.PI);
    });

    it('converts 360 degrees to 2*PI radians', () => {
      expect(degreesToRadians(360)).toBeCloseTo(2 * Math.PI);
    });
  });

  describe('radiansToDegrees', () => {
    it('converts 0 radians to 0 degrees', () => {
      expect(radiansToDegrees(0)).toBe(0);
    });

    it('converts PI/2 radians to 90 degrees', () => {
      expect(radiansToDegrees(Math.PI / 2)).toBeCloseTo(90);
    });

    it('converts PI radians to 180 degrees', () => {
      expect(radiansToDegrees(Math.PI)).toBeCloseTo(180);
    });
  });

  describe('normalizeAngle', () => {
    it('keeps angles in [0, 360) unchanged', () => {
      expect(normalizeAngle(45)).toBe(45);
      expect(normalizeAngle(0)).toBe(0);
      expect(normalizeAngle(359)).toBe(359);
    });

    it('normalizes angles >= 360', () => {
      expect(normalizeAngle(360)).toBe(0);
      expect(normalizeAngle(450)).toBe(90);
      expect(normalizeAngle(720)).toBe(0);
    });

    it('normalizes negative angles', () => {
      expect(normalizeAngle(-90)).toBe(270);
      expect(normalizeAngle(-180)).toBe(180);
      expect(Math.abs(normalizeAngle(-360))).toBe(0);
    });
  });

  describe('bedToWorld', () => {
    it('transforms local origin to world position when not rotated', () => {
      const result = bedToWorld({ x: 0, y: 0 }, { x: 5, y: 10, rotationDeg: 0 });
      expect(result.x).toBeCloseTo(5);
      expect(result.y).toBeCloseTo(10);
    });

    it('transforms local point when not rotated', () => {
      const result = bedToWorld({ x: 2, y: 3 }, { x: 5, y: 10, rotationDeg: 0 });
      expect(result.x).toBeCloseTo(7);
      expect(result.y).toBeCloseTo(13);
    });

    it('transforms local point with 90 degree rotation', () => {
      const result = bedToWorld({ x: 1, y: 0 }, { x: 0, y: 0, rotationDeg: 90 });
      expect(result.x).toBeCloseTo(0);
      expect(result.y).toBeCloseTo(1);
    });

    it('transforms local point with 180 degree rotation', () => {
      const result = bedToWorld(
        { x: 1, y: 0 },
        { x: 0, y: 0, rotationDeg: 180 }
      );
      expect(result.x).toBeCloseTo(-1);
      expect(result.y).toBeCloseTo(0);
    });
  });

  describe('worldToBed', () => {
    it('transforms world position to local origin when not rotated', () => {
      const result = worldToBed({ x: 5, y: 10 }, { x: 5, y: 10, rotationDeg: 0 });
      expect(result.x).toBeCloseTo(0);
      expect(result.y).toBeCloseTo(0);
    });

    it('is inverse of bedToWorld', () => {
      const transform = { x: 3, y: 7, rotationDeg: 45 };
      const localPoint = { x: 2, y: 1 };
      const worldPoint = bedToWorld(localPoint, transform);
      const backToLocal = worldToBed(worldPoint, transform);
      expect(backToLocal.x).toBeCloseTo(localPoint.x);
      expect(backToLocal.y).toBeCloseTo(localPoint.y);
    });
  });

  describe('getBedCorners', () => {
    it('returns corners for unrotated bed', () => {
      const corners = getBedCorners(2, 4, { x: 0, y: 0, rotationDeg: 0 });
      // width=2 (Y direction), height=4 (X direction, which is length)
      expect(corners[0]).toEqual({ x: 0, y: 0 }); // top-left
      expect(corners[1]).toEqual({ x: 4, y: 0 }); // top-right
      expect(corners[2]).toEqual({ x: 4, y: 2 }); // bottom-right
      expect(corners[3]).toEqual({ x: 0, y: 2 }); // bottom-left
    });

    it('returns corners for 90 degree rotated bed', () => {
      const corners = getBedCorners(2, 4, { x: 0, y: 0, rotationDeg: 90 });
      expect(corners[0].x).toBeCloseTo(0);
      expect(corners[0].y).toBeCloseTo(0);
      expect(corners[1].x).toBeCloseTo(0);
      expect(corners[1].y).toBeCloseTo(4);
    });
  });

  describe('isPointInBed', () => {
    it('returns true for point inside unrotated bed', () => {
      const result = isPointInBed(
        { x: 1, y: 1 },
        2,
        4,
        { x: 0, y: 0, rotationDeg: 0 }
      );
      expect(result).toBe(true);
    });

    it('returns false for point outside unrotated bed', () => {
      const result = isPointInBed(
        { x: 10, y: 10 },
        2,
        4,
        { x: 0, y: 0, rotationDeg: 0 }
      );
      expect(result).toBe(false);
    });

    it('returns true for point on bed boundary', () => {
      const result = isPointInBed(
        { x: 0, y: 0 },
        2,
        4,
        { x: 0, y: 0, rotationDeg: 0 }
      );
      expect(result).toBe(true);
    });
  });

  describe('getBedBoundingBox', () => {
    it('returns bounding box for unrotated bed', () => {
      const bbox = getBedBoundingBox(2, 4, { x: 1, y: 1, rotationDeg: 0 });
      expect(bbox.minX).toBeCloseTo(1);
      expect(bbox.minY).toBeCloseTo(1);
      expect(bbox.maxX).toBeCloseTo(5); // 1 + 4 (height)
      expect(bbox.maxY).toBeCloseTo(3); // 1 + 2 (width)
    });

    it('returns expanded bounding box for rotated bed', () => {
      const bbox = getBedBoundingBox(2, 4, { x: 0, y: 0, rotationDeg: 45 });
      // Rotated rectangle should have larger bounding box
      // At 45°, a 2m wide x 4m long bed will have diagonal ~ sqrt(2^2 + 4^2) = ~4.47m
      expect(bbox.minX).toBeLessThan(0);
      expect(bbox.maxX).toBeGreaterThan(2.8); // Diagonal projection
      expect(bbox.maxY).toBeGreaterThan(2.8);
    });
  });
});
