import { useCallback } from 'react';
import { useSeasonStore } from '../../store/seasonStore';
import { useUIStore } from '../../store/uiStore';
import { fetchSeason } from '../../api/client';
import type { BedSectionPlan } from '@allotment/domain';

export function SeasonSelector() {
  const { seasons, currentSeasonId, setCurrentSeasonId, setBedSectionPlans, setLoading } =
    useSeasonStore();
  const { openCreateSeasonModal } = useUIStore();

  const handleSeasonChange = useCallback(
    async (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;

      if (value === 'new') {
        openCreateSeasonModal();
        return;
      }

      if (value === '') {
        setCurrentSeasonId(null);
        setBedSectionPlans([]);
        return;
      }

      setLoading(true);
      try {
        const season = await fetchSeason(value);
        setCurrentSeasonId(season.id);
        setBedSectionPlans(
          season.bedSectionPlans.map((p) => ({
            ...p,
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(p.updatedAt),
          })) as BedSectionPlan[]
        );
      } catch (error) {
        console.error('Failed to load season:', error);
      } finally {
        setLoading(false);
      }
    },
    [setCurrentSeasonId, setBedSectionPlans, setLoading, openCreateSeasonModal]
  );

  const currentSeason = seasons.find((s) => s.id === currentSeasonId);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <label
        htmlFor="season-select"
        style={{ fontSize: '14px', fontWeight: 500 }}
      >
        Season:
      </label>
      <select
        id="season-select"
        value={currentSeasonId ?? ''}
        onChange={handleSeasonChange}
        style={{
          padding: '6px 12px',
          borderRadius: '4px',
          border: '1px solid #ccc',
          fontSize: '14px',
          minWidth: '180px',
          backgroundColor: 'white',
        }}
      >
        <option value="">No Season</option>
        {seasons.map((season) => (
          <option key={season.id} value={season.id}>
            {season.label} ({season.startDate} - {season.endDate})
          </option>
        ))}
        <option value="new">+ New Season...</option>
      </select>
      {currentSeason && (
        <span
          style={{
            fontSize: '12px',
            color: '#666',
            marginLeft: '4px',
          }}
        >
          {currentSeason.startDate} to {currentSeason.endDate}
        </span>
      )}
    </div>
  );
}
