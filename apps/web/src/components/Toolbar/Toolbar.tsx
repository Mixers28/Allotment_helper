import { usePlotStore } from '../../store/plotStore';
import { useUIStore } from '../../store/uiStore';
import { LockToggle } from './LockToggle';
import { deleteBed, deletePlot } from '../../api/client';

const buttonStyle = {
  padding: '8px 16px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 500 as const,
  transition: 'background-color 0.2s',
};

const activeButtonStyle = {
  ...buttonStyle,
  backgroundColor: '#2196f3',
  color: 'white',
};

const inactiveButtonStyle = {
  ...buttonStyle,
  backgroundColor: '#e0e0e0',
  color: '#333',
};

const disabledButtonStyle = {
  ...buttonStyle,
  backgroundColor: '#f5f5f5',
  color: '#999',
  cursor: 'not-allowed' as const,
};

export function Toolbar() {
  const { plot, selectedBedId, beds, removeBed, clearPlot } = usePlotStore();
  const { currentTool, setCurrentTool, openAddBedModal } = useUIStore();

  const selectedBed = beds.find((b) => b.id === selectedBedId);

  const handleDeleteBed = async () => {
    if (!selectedBedId) return;

    if (!confirm('Are you sure you want to delete this bed?')) {
      return;
    }

    try {
      await deleteBed(selectedBedId);
      removeBed(selectedBedId);
    } catch (error) {
      console.error('Failed to delete bed:', error);
      alert('Failed to delete bed. Please try again.');
    }
  };

  const handleDeletePlot = async () => {
    if (!plot) return;

    if (!confirm('Are you sure you want to delete this plot? This will also delete all beds and seasons associated with it.')) {
      return;
    }

    try {
      await deletePlot(plot.id);
      clearPlot();
    } catch (error) {
      console.error('Failed to delete plot:', error);
      alert('Failed to delete plot. Please try again.');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
      }}
    >
      <button
        style={currentTool === 'select' ? activeButtonStyle : inactiveButtonStyle}
        onClick={() => setCurrentTool('select')}
      >
        Select
      </button>

      <button
        style={
          plot
            ? disabledButtonStyle
            : currentTool === 'draw-plot'
              ? activeButtonStyle
              : inactiveButtonStyle
        }
        onClick={() => !plot && setCurrentTool('draw-plot')}
        disabled={!!plot}
        title={plot ? 'Plot already exists' : 'Draw plot boundary'}
      >
        Draw Plot
      </button>

      <button
        style={plot ? inactiveButtonStyle : disabledButtonStyle}
        onClick={() => plot && openAddBedModal()}
        disabled={!plot}
        title={!plot ? 'Create a plot first' : 'Add a new bed'}
      >
        Add Bed
      </button>

      {plot && !selectedBed && (
        <button
          style={{
            ...inactiveButtonStyle,
            backgroundColor: '#ff5252',
            color: 'white',
          }}
          onClick={handleDeletePlot}
          title="Delete this plot and all its beds"
        >
          Delete Plot
        </button>
      )}

      {selectedBed && (
        <>
          <div
            style={{
              width: '1px',
              backgroundColor: '#ddd',
              margin: '0 8px',
            }}
          />
          <LockToggle bed={selectedBed} />
          <button
            style={{
              ...inactiveButtonStyle,
              backgroundColor: '#ff5252',
              color: 'white',
            }}
            onClick={handleDeleteBed}
            title="Delete this bed"
          >
            Delete Bed
          </button>
        </>
      )}
    </div>
  );
}
