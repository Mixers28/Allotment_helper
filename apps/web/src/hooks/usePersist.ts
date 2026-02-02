import { useEffect, useRef } from 'react';
import { usePlotStore } from '../store/plotStore';
import { useSeasonStore } from '../store/seasonStore';
import { updateBed as updateBedApi, updateBedPlan as updateBedPlanApi } from '../api/client';

export function usePersistBed(bedId: string) {
  const bed = usePlotStore((s) => s.beds.find((b) => b.id === bedId));
  const timeoutRef = useRef<number>();
  const lastSavedRef = useRef<string>('');

  useEffect(() => {
    if (!bed) return;

    const currentState = JSON.stringify({
      x: bed.x,
      y: bed.y,
      width: bed.width,
      height: bed.height,
      rotationDeg: bed.rotationDeg,
      isLocked: bed.isLocked,
    });

    // Skip if no change
    if (currentState === lastSavedRef.current) return;

    clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(async () => {
      try {
        await updateBedApi(bedId, {
          x: bed.x,
          y: bed.y,
          width: bed.width,
          height: bed.height,
          rotationDeg: bed.rotationDeg,
          isLocked: bed.isLocked,
        });
        lastSavedRef.current = currentState;
      } catch (error) {
        console.error('Failed to save bed:', error);
      }
    }, 500);

    return () => clearTimeout(timeoutRef.current);
  }, [
    bed?.x,
    bed?.y,
    bed?.width,
    bed?.height,
    bed?.rotationDeg,
    bed?.isLocked,
    bedId,
  ]);
}

export function usePersistAllBeds() {
  const beds = usePlotStore((s) => s.beds);

  return beds.map((bed) => bed.id);
}

export function usePersistBedPlan(planId: string) {
  const plan = useSeasonStore((s) => s.bedSectionPlans.find((p) => p.id === planId));
  const timeoutRef = useRef<number>();
  const lastSavedRef = useRef<string>('');

  useEffect(() => {
    if (!plan) return;

    const currentState = JSON.stringify(plan.definition);

    // Skip if no change
    if (currentState === lastSavedRef.current) return;

    clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(async () => {
      try {
        await updateBedPlanApi(planId, {
          definition: plan.definition,
        });
        lastSavedRef.current = currentState;
      } catch (error) {
        console.error('Failed to save bed plan:', error);
      }
    }, 500);

    return () => clearTimeout(timeoutRef.current);
  }, [plan?.definition, planId]);
}
