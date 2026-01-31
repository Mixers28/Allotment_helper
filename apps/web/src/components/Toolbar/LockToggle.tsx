import type { BedBase } from '@allotment/domain';
import { usePlotStore } from '../../store/plotStore';
import { updateBed as updateBedApi } from '../../api/client';

interface LockToggleProps {
  bed: BedBase;
}

export function LockToggle({ bed }: LockToggleProps) {
  const { updateBed } = usePlotStore();

  const handleToggle = async () => {
    const newLocked = !bed.isLocked;

    // Optimistic update
    updateBed(bed.id, { isLocked: newLocked });

    try {
      await updateBedApi(bed.id, { isLocked: newLocked });
    } catch (error) {
      // Revert on error
      console.error('Failed to update lock state:', error);
      updateBed(bed.id, { isLocked: bed.isLocked });
    }
  };

  return (
    <button
      onClick={handleToggle}
      style={{
        padding: '8px 16px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 500,
        backgroundColor: bed.isLocked ? '#ff9800' : '#e0e0e0',
        color: bed.isLocked ? 'white' : '#333',
        transition: 'background-color 0.2s',
      }}
      title={bed.isLocked ? 'Unlock bed geometry' : 'Lock bed geometry'}
    >
      {bed.isLocked ? '🔒 Locked' : '🔓 Unlocked'}
    </button>
  );
}
