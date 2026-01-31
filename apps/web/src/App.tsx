import { useEffect } from 'react';
import { PlotCanvas } from './components/Canvas/PlotCanvas';
import { Toolbar } from './components/Toolbar/Toolbar';
import { CreatePlotModal } from './components/Modals/CreatePlotModal';
import { AddBedModal } from './components/Modals/AddBedModal';
import { usePlotStore } from './store/plotStore';
import { useUIStore } from './store/uiStore';
import { fetchPlots } from './api/client';

function App() {
  const { plot, setPlot, setBeds, setLoading } = usePlotStore();
  const { createPlotModalOpen, addBedModalOpen } = useUIStore();

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
          }
        }
      } catch (error) {
        console.error('Failed to load plot:', error);
      } finally {
        setLoading(false);
      }
    }

    loadPlot();
  }, [setPlot, setBeds, setLoading]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Toolbar />
      <PlotCanvas />
      {createPlotModalOpen && <CreatePlotModal />}
      {addBedModalOpen && plot && <AddBedModal />}
    </div>
  );
}

export default App;
