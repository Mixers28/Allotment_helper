import { useEffect } from 'react';
import { PlotCanvas } from './components/Canvas/PlotCanvas';
import { Toolbar } from './components/Toolbar/Toolbar';
import { CreatePlotModal } from './components/Modals/CreatePlotModal';
import { AddBedModal } from './components/Modals/AddBedModal';
import { CreateSeasonModal } from './components/Modals/CreateSeasonModal';
import { SeasonSelector } from './components/Seasons/SeasonSelector';
import { SectionEditor } from './components/Sections/SectionEditor';
import { usePlotStore } from './store/plotStore';
import { useSeasonStore } from './store/seasonStore';
import { useUIStore } from './store/uiStore';
import { fetchPlots, fetchSeasons } from './api/client';
import type { Season } from '@allotment/domain';

function App() {
  const { plot, setPlot, setBeds, setLoading, selectedBedId } = usePlotStore();
  const { setSeasons, currentSeasonId } = useSeasonStore();
  const { createPlotModalOpen, addBedModalOpen, createSeasonModalOpen, sectionEditorOpen, setSectionEditorOpen } = useUIStore();

  useEffect(() => {
    async function loadPlot() {
      try {
        const plots = await fetchPlots();
        if (plots.length > 0) {
          const firstPlot = plots[0];
          if (firstPlot) {
            setPlot({
              id: firstPlot.id,
              name: firstPlot.name,
              units: firstPlot.units as 'meters' | 'feet',
              boundaryType: firstPlot.boundaryType as 'rect',
              boundary: firstPlot.boundary,
              createdAt: new Date(firstPlot.createdAt),
              updatedAt: new Date(firstPlot.updatedAt),
            });
            setBeds(
              firstPlot.beds.map((b) => ({
                ...b,
                createdAt: new Date(b.createdAt),
                updatedAt: new Date(b.updatedAt),
              }))
            );

            // Load seasons for this plot
            const seasons = await fetchSeasons(firstPlot.id);
            setSeasons(
              seasons.map((s) => ({
                ...s,
                createdAt: new Date(s.createdAt),
                updatedAt: new Date(s.updatedAt),
              })) as Season[]
            );
          }
        }
      } catch (error) {
        console.error('Failed to load plot:', error);
      } finally {
        setLoading(false);
      }
    }

    loadPlot();
  }, [setPlot, setBeds, setLoading, setSeasons]);

  // Open section editor when a bed is selected and a season is active
  useEffect(() => {
    if (selectedBedId && currentSeasonId && !sectionEditorOpen) {
      setSectionEditorOpen(true);
    }
  }, [selectedBedId, currentSeasonId, sectionEditorOpen, setSectionEditorOpen]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '8px 16px', backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
        <Toolbar />
        {plot && <SeasonSelector />}
      </div>
      <PlotCanvas />
      {sectionEditorOpen && <SectionEditor />}
      {createPlotModalOpen && <CreatePlotModal />}
      {addBedModalOpen && plot && <AddBedModal />}
      {createSeasonModalOpen && plot && <CreateSeasonModal />}
    </div>
  );
}

export default App;
