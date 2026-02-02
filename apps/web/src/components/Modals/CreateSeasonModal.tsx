import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateSeasonSchema, type CreateSeasonInput } from '@allotment/domain';
import { useUIStore } from '../../store/uiStore';
import { useSeasonStore } from '../../store/seasonStore';
import { usePlotStore } from '../../store/plotStore';
import { createSeason } from '../../api/client';

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
  boxSizing: 'border-box',
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

function getDefaultDates() {
  const now = new Date();
  const year = now.getFullYear();
  // Default to current year spring-summer season
  return {
    startDate: `${year}-03-01`,
    endDate: `${year}-10-31`,
  };
}

export function CreateSeasonModal() {
  const { closeCreateSeasonModal } = useUIStore();
  const { addSeason, setCurrentSeasonId, setBedSectionPlans } = useSeasonStore();
  const { plot } = usePlotStore();

  const defaultDates = getDefaultDates();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateSeasonInput>({
    resolver: zodResolver(CreateSeasonSchema),
    defaultValues: {
      label: `${new Date().getFullYear()} Growing Season`,
      startDate: defaultDates.startDate,
      endDate: defaultDates.endDate,
    },
  });

  const onSubmit = async (data: CreateSeasonInput) => {
    if (!plot) return;

    try {
      const season = await createSeason(plot.id, data);
      const newSeason = {
        id: season.id,
        plotId: season.plotId,
        label: season.label,
        startDate: season.startDate,
        endDate: season.endDate,
        createdAt: new Date(season.createdAt),
        updatedAt: new Date(season.updatedAt),
      };
      addSeason(newSeason);
      setCurrentSeasonId(season.id);
      setBedSectionPlans([]);
      closeCreateSeasonModal();
    } catch (error) {
      console.error('Failed to create season:', error);
    }
  };

  return (
    <div style={overlayStyle} onClick={closeCreateSeasonModal}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginTop: 0, marginBottom: '24px' }}>Create Season</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <label style={labelStyle}>
            Season Name
            <input
              {...register('label')}
              style={inputStyle}
              placeholder="2026 Spring/Summer"
            />
            {errors.label && (
              <span style={{ color: 'red', fontSize: '12px' }}>
                {errors.label.message}
              </span>
            )}
          </label>

          <label style={labelStyle}>
            Start Date
            <input
              {...register('startDate')}
              type="date"
              style={inputStyle}
            />
            {errors.startDate && (
              <span style={{ color: 'red', fontSize: '12px' }}>
                {errors.startDate.message}
              </span>
            )}
          </label>

          <label style={labelStyle}>
            End Date
            <input
              {...register('endDate')}
              type="date"
              style={inputStyle}
            />
            {errors.endDate && (
              <span style={{ color: 'red', fontSize: '12px' }}>
                {errors.endDate.message}
              </span>
            )}
          </label>

          <div style={buttonContainerStyle}>
            <button
              type="button"
              onClick={closeCreateSeasonModal}
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
                backgroundColor: '#4caf50',
                color: 'white',
                cursor: isSubmitting ? 'wait' : 'pointer',
              }}
            >
              {isSubmitting ? 'Creating...' : 'Create Season'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
