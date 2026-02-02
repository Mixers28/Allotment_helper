import { describe, it, expect } from 'vitest';
import {
  calculateLengthSplitSections,
  getSectionName,
  calculateOptimalCutPosition,
} from '../src/sections';

describe('sections', () => {
  describe('calculateLengthSplitSections', () => {
    const planId = 'plan-123';
    const bedId = 'bed-456';

    it('returns single section when no cuts provided', () => {
      const sections = calculateLengthSplitSections(1.2, 3.0, [], planId, bedId);

      expect(sections).toHaveLength(1);
      expect(sections[0]).toMatchObject({
        id: `${planId}-0`,
        bedSectionPlanId: planId,
        bedId: bedId,
        index: 0,
        name: 'Section A',
        boundsLocal: {
          x0: 0,
          x1: 1.2,
          y0: 0,
          y1: 3.0,
        },
      });
    });

    it('creates two sections with single cut', () => {
      const sections = calculateLengthSplitSections(1.2, 3.0, [1.5], planId, bedId);

      expect(sections).toHaveLength(2);
      expect(sections[0]).toMatchObject({
        name: 'Section A',
        boundsLocal: { x0: 0, x1: 1.2, y0: 0, y1: 1.5 },
      });
      expect(sections[1]).toMatchObject({
        name: 'Section B',
        boundsLocal: { x0: 0, x1: 1.2, y0: 1.5, y1: 3.0 },
      });
    });

    it('creates multiple sections with multiple cuts', () => {
      const sections = calculateLengthSplitSections(
        1.2,
        3.0,
        [1.0, 2.0],
        planId,
        bedId
      );

      expect(sections).toHaveLength(3);
      expect(sections[0]).toMatchObject({
        index: 0,
        name: 'Section A',
        boundsLocal: { y0: 0, y1: 1.0 },
      });
      expect(sections[1]).toMatchObject({
        index: 1,
        name: 'Section B',
        boundsLocal: { y0: 1.0, y1: 2.0 },
      });
      expect(sections[2]).toMatchObject({
        index: 2,
        name: 'Section C',
        boundsLocal: { y0: 2.0, y1: 3.0 },
      });
    });

    it('filters out cuts at or below 0', () => {
      const sections = calculateLengthSplitSections(
        1.2,
        3.0,
        [0, -1, 1.5],
        planId,
        bedId
      );

      expect(sections).toHaveLength(2);
      expect(sections[0]).toMatchObject({
        boundsLocal: { y0: 0, y1: 1.5 },
      });
    });

    it('filters out cuts at or beyond bed height', () => {
      const sections = calculateLengthSplitSections(
        1.2,
        3.0,
        [1.5, 3.0, 4.0],
        planId,
        bedId
      );

      expect(sections).toHaveLength(2);
      expect(sections[1]).toMatchObject({
        boundsLocal: { y0: 1.5, y1: 3.0 },
      });
    });

    it('sorts unsorted cuts correctly', () => {
      const sections = calculateLengthSplitSections(
        1.2,
        3.0,
        [2.0, 1.0],
        planId,
        bedId
      );

      expect(sections).toHaveLength(3);
      expect(sections[0].boundsLocal.y1).toBe(1.0);
      expect(sections[1].boundsLocal.y0).toBe(1.0);
      expect(sections[1].boundsLocal.y1).toBe(2.0);
    });

    it('all sections span full bed width', () => {
      const bedWidth = 1.5;
      const sections = calculateLengthSplitSections(
        bedWidth,
        3.0,
        [1.0, 2.0],
        planId,
        bedId
      );

      sections.forEach((section) => {
        expect(section.boundsLocal.x0).toBe(0);
        expect(section.boundsLocal.x1).toBe(bedWidth);
      });
    });
  });

  describe('getSectionName', () => {
    it('returns A for index 0', () => {
      expect(getSectionName(0)).toBe('A');
    });

    it('returns Z for index 25', () => {
      expect(getSectionName(25)).toBe('Z');
    });

    it('returns AA for index 26', () => {
      expect(getSectionName(26)).toBe('AA');
    });

    it('returns AB for index 27', () => {
      expect(getSectionName(27)).toBe('AB');
    });
  });

  describe('calculateOptimalCutPosition', () => {
    it('returns midpoint when no existing cuts', () => {
      const position = calculateOptimalCutPosition(3.0, []);
      expect(position).toBe(1.5);
    });

    it('finds midpoint of larger gap with one cut', () => {
      // Bed height 3.0, cut at 1.0
      // Gaps: 0-1.0 (1.0m), 1.0-3.0 (2.0m)
      // Larger gap is 1.0-3.0, midpoint is 2.0
      const position = calculateOptimalCutPosition(3.0, [1.0]);
      expect(position).toBe(2.0);
    });

    it('finds midpoint of largest gap with multiple cuts', () => {
      // Bed height 4.0, cuts at 1.0, 2.0, 3.0
      // All gaps are 1.0m, should return midpoint of first gap
      const position = calculateOptimalCutPosition(4.0, [1.0, 2.0, 3.0]);
      expect(position).toBe(0.5);
    });

    it('handles unsorted cuts', () => {
      const position = calculateOptimalCutPosition(3.0, [2.0, 1.0]);
      // Gaps: 0-1.0 (1.0m), 1.0-2.0 (1.0m), 2.0-3.0 (1.0m)
      // All equal, returns midpoint of first (0.5)
      expect(position).toBe(0.5);
    });

    it('rounds to 2 decimal places', () => {
      // Bed height 3.0, cut at 1.0
      // Larger gap 1.0-3.0, midpoint 2.0
      const position = calculateOptimalCutPosition(3.333, []);
      expect(position).toBe(1.67); // (0 + 3.333) / 2 = 1.6665 -> 1.67
    });
  });
});
