import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateBedSchema, type CreateBedInput } from '@allotment/domain';
import { useUIStore } from '../../store/uiStore';
import { usePlotStore } from '../../store/plotStore';
import { createBed } from '../../api/client';

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

export function AddBedModal() {
  const { closeAddBedModal } = useUIStore();
  const { plot, beds, addBed } = usePlotStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateBedInput>({
    resolver: zodResolver(CreateBedSchema),
    defaultValues: {
      name: `Bed ${beds.length + 1}`,
      x: 0.5,
      y: 0.5,
      width: 1.2,
      height: 3,
      rotationDeg: 0,
    },
  });

  const onSubmit = async (data: CreateBedInput) => {
    if (!plot) return;

    try {
      const bed = await createBed(plot.id, data);
      addBed({
        ...bed,
        createdAt: new Date(bed.createdAt),
        updatedAt: new Date(bed.updatedAt),
      });
      closeAddBedModal();
    } catch (error) {
      console.error('Failed to create bed:', error);
    }
  };

  return (
    <div style={overlayStyle} onClick={closeAddBedModal}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginTop: 0, marginBottom: '24px' }}>Add Bed</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <label style={labelStyle}>
            Bed Name
            <input
              {...register('name')}
              style={inputStyle}
              placeholder="Bed 1"
            />
            {errors.name && (
              <span style={{ color: 'red', fontSize: '12px' }}>
                {errors.name.message}
              </span>
            )}
          </label>

          <div style={{ display: 'flex', gap: '16px' }}>
            <label style={{ ...labelStyle, flex: 1 }}>
              X Position (m)
              <input
                {...register('x', { valueAsNumber: true })}
                type="number"
                step="0.1"
                min="0"
                style={inputStyle}
              />
              {errors.x && (
                <span style={{ color: 'red', fontSize: '12px' }}>
                  {errors.x.message}
                </span>
              )}
            </label>

            <label style={{ ...labelStyle, flex: 1 }}>
              Y Position (m)
              <input
                {...register('y', { valueAsNumber: true })}
                type="number"
                step="0.1"
                min="0"
                style={inputStyle}
              />
              {errors.y && (
                <span style={{ color: 'red', fontSize: '12px' }}>
                  {errors.y.message}
                </span>
              )}
            </label>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <label style={{ ...labelStyle, flex: 1 }}>
              Width (m)
              <input
                {...register('width', { valueAsNumber: true })}
                type="number"
                step="0.1"
                min="0.1"
                style={inputStyle}
              />
              {errors.width && (
                <span style={{ color: 'red', fontSize: '12px' }}>
                  {errors.width.message}
                </span>
              )}
            </label>

            <label style={{ ...labelStyle, flex: 1 }}>
              Length (m)
              <input
                {...register('height', { valueAsNumber: true })}
                type="number"
                step="0.1"
                min="0.1"
                style={inputStyle}
              />
              {errors.height && (
                <span style={{ color: 'red', fontSize: '12px' }}>
                  {errors.height.message}
                </span>
              )}
            </label>
          </div>

          <label style={labelStyle}>
            Rotation (degrees)
            <input
              {...register('rotationDeg', { valueAsNumber: true })}
              type="number"
              step="15"
              min="0"
              max="360"
              style={inputStyle}
            />
            {errors.rotationDeg && (
              <span style={{ color: 'red', fontSize: '12px' }}>
                {errors.rotationDeg.message}
              </span>
            )}
          </label>

          <div style={buttonContainerStyle}>
            <button
              type="button"
              onClick={closeAddBedModal}
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
              {isSubmitting ? 'Adding...' : 'Add Bed'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
