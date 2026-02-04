import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreatePlotSchema, type CreatePlotInput } from '@allotment/domain';
import { useUIStore } from '../../store/uiStore';
import { usePlotStore } from '../../store/plotStore';
import { useSeasonStore } from '../../store/seasonStore';
import { createPlot } from '../../api/client';

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '8px',
  padding: '24px',
  minWidth: '400px',
  maxWidth: '90vw',
  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  fontSize: '14px',
  marginTop: '4px',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '16px',
  fontSize: '14px',
  fontWeight: 500,
  color: '#333',
};

const buttonContainerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '8px',
  marginTop: '24px',
};

export function CreatePlotModal() {
  const { closeCreatePlotModal } = useUIStore();
  const { setPlot, setBeds } = usePlotStore();
  const { clearSeasons } = useSeasonStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreatePlotInput>({
    resolver: zodResolver(CreatePlotSchema),
    defaultValues: {
      name: 'My Plot',
      units: 'meters',
      boundary: {
        width: 10,
        height: 10,
      },
    },
  });

  const onSubmit = async (data: CreatePlotInput) => {
    try {
      const plot = await createPlot(data);
      setPlot({
        id: plot.id,
        name: plot.name,
        units: plot.units as 'meters' | 'feet',
        boundaryType: plot.boundaryType as 'rect',
        boundary: plot.boundary,
        createdAt: new Date(plot.createdAt),
        updatedAt: new Date(plot.updatedAt),
      });
      setBeds([]);
      clearSeasons();
      closeCreatePlotModal();
    } catch (error) {
      console.error('Failed to create plot:', error);
    }
  };

  return (
    <div style={overlayStyle} onClick={closeCreatePlotModal}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginTop: 0, marginBottom: '24px' }}>Create Plot</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <label style={labelStyle}>
            Plot Name
            <input
              {...register('name')}
              style={inputStyle}
              placeholder="My Garden Plot"
            />
            {errors.name && (
              <span style={{ color: 'red', fontSize: '12px' }}>
                {errors.name.message}
              </span>
            )}
          </label>

          <label style={labelStyle}>
            Width (meters)
            <input
              {...register('boundary.width', { valueAsNumber: true })}
              type="number"
              step="0.1"
              min="0.1"
              style={inputStyle}
            />
            {errors.boundary?.width && (
              <span style={{ color: 'red', fontSize: '12px' }}>
                {errors.boundary.width.message}
              </span>
            )}
          </label>

          <label style={labelStyle}>
            Height (meters)
            <input
              {...register('boundary.height', { valueAsNumber: true })}
              type="number"
              step="0.1"
              min="0.1"
              style={inputStyle}
            />
            {errors.boundary?.height && (
              <span style={{ color: 'red', fontSize: '12px' }}>
                {errors.boundary.height.message}
              </span>
            )}
          </label>

          <input type="hidden" {...register('units')} value="meters" />

          <div style={buttonContainerStyle}>
            <button
              type="button"
              onClick={closeCreatePlotModal}
              style={{
                padding: '10px 20px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: '#2196f3',
                color: 'white',
                cursor: isSubmitting ? 'wait' : 'pointer',
              }}
            >
              {isSubmitting ? 'Creating...' : 'Create Plot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
