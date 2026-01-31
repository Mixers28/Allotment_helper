import { usePlotStore } from '../../store/plotStore';
import { useUIStore } from '../../store/uiStore';
import { LockToggle } from './LockToggle';

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
  const { plot, selectedBedId, beds, removeBed } = usePlotStore();
  const { currentTool, setCurrentTool, openAddBedModal } = useUIStore();

  const selectedBed = beds.find((b) => b.id === selectedBedId);

  const handleDeleteBed = async () => {
    if (!selectedBedId) return;

    try {
      const response = await fetch(`/api/beds/${selectedBedId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        removeBed(selectedBedId);
      }
    } catch (error) {
      console.error('Failed to delete bed:', error);
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 100,
        display: 'flex',
        gap: '8px',
        padding: '10px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
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
          >
            Delete
          </button>
        </>
      )}
    </div>
  );
}
