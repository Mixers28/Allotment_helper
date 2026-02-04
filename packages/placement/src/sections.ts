import type { SectionBounds, Section } from '@allotment/domain';

/**
 * Calculate section bounds from a length_splits definition.
 * Sections span full bed width and are divided along bed length (height).
 *
 * @param bedWidth - Bed width in meters (local Y dimension)
 * @param bedHeight - Bed height/length in meters (local X dimension)
 * @param cuts - Array of cut positions along length (meters from origin)
 * @param bedSectionPlanId - ID of the bed section plan
 * @param bedId - ID of the bed
 * @returns Array of sections with bounds in bed-local coordinates
 */
export function calculateLengthSplitSections(
  bedWidth: number,
  bedHeight: number,
  cuts: number[],
  bedSectionPlanId: string,
  bedId: string
): Section[] {
  // Filter out cuts that are outside bed bounds and sort
  const validCuts = cuts
    .filter(c => c > 0 && c < bedHeight)
    .sort((a, b) => a - b);

  // Create boundaries array: [0, ...cuts, bedHeight]
  const boundaries = [0, ...validCuts, bedHeight];

  return boundaries.slice(0, -1).map((start, index) => {
    const end = boundaries[index + 1]!;
    const bounds: SectionBounds = {
      x0: start,
      x1: end,
      y0: 0,
      y1: bedWidth,
    };

    return {
      id: `${bedSectionPlanId}-${index}`,
      bedSectionPlanId,
      bedId,
      index,
      name: `Section ${String.fromCharCode(65 + index)}`, // A, B, C, ...
      boundsLocal: bounds,
    };
  });
}

/**
 * Get the section letter name from an index.
 * @param index - Zero-based section index
 * @returns Letter name (A, B, C, ..., Z, AA, AB, ...)
 */
export function getSectionName(index: number): string {
  if (index < 26) {
    return String.fromCharCode(65 + index);
  }
  // For more than 26 sections (unlikely but handled)
  const first = Math.floor(index / 26) - 1;
  const second = index % 26;
  return String.fromCharCode(65 + first) + String.fromCharCode(65 + second);
}

/**
 * Calculate the optimal position for a new cut in a bed.
 * Places the cut at the midpoint of the largest existing section.
 *
 * @param bedHeight - Bed length in meters
 * @param existingCuts - Current cut positions
 * @returns Optimal position for a new cut
 */
export function calculateOptimalCutPosition(
  bedHeight: number,
  existingCuts: number[]
): number {
  const sortedCuts = [...existingCuts].sort((a, b) => a - b);
  const boundaries = [0, ...sortedCuts, bedHeight];

  let maxGap = 0;
  let maxGapStart = 0;
  let maxGapEnd = bedHeight;

  for (let i = 0; i < boundaries.length - 1; i++) {
    const gap = boundaries[i + 1]! - boundaries[i]!;
    if (gap > maxGap) {
      maxGap = gap;
      maxGapStart = boundaries[i]!;
      maxGapEnd = boundaries[i + 1]!;
    }
  }

  // Return midpoint of largest gap, rounded to 2 decimal places
  return Math.round(((maxGapStart + maxGapEnd) / 2) * 100) / 100;
}
