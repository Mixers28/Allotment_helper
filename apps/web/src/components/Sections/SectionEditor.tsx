import { useCallback } from 'react';
import { usePlotStore } from '../../store/plotStore';
import { useSeasonStore } from '../../store/seasonStore';
import { useUIStore } from '../../store/uiStore';
import { createBedPlan, deleteBedPlan } from '../../api/client';
import { calculateLengthSplitSections, calculateOptimalCutPosition } from '@allotment/placement';
import type { BedSectionPlan } from '@allotment/domain';

const panelStyle: React.CSSProperties = {
  position: 'absolute',
  top: '60px',
  right: '10px',
  width: '280px',
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
  padding: '16px',
  zIndex: 100,
  maxHeight: 'calc(100vh - 100px)',
  overflowY: 'auto',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '16px',
  paddingBottom: '12px',
  borderBottom: '1px solid #eee',
};

const sectionItemStyle: React.CSSProperties = {
  padding: '8px',
  marginBottom: '8px',
  backgroundColor: '#f5f5f5',
  borderRadius: '4px',
  fontSize: '13px',
};

const buttonStyle: React.CSSProperties = {
  padding: '6px 12px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  backgroundColor: 'white',
  cursor: 'pointer',
  fontSize: '12px',
};

const inputStyle: React.CSSProperties = {
  width: '60px',
  padding: '4px 8px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  fontSize: '12px',
};

export function SectionEditor() {
  const { selectedBedId, beds } = usePlotStore();
  const { currentSeasonId, bedSectionPlans, addBedSectionPlan, updateBedSectionPlan, removeBedSectionPlan } =
    useSeasonStore();
  const { setSectionEditorOpen } = useUIStore();

  const selectedBed = beds.find((b) => b.id === selectedBedId);
  const currentPlan = bedSectionPlans.find((p) => p.bedId === selectedBedId);

  const handleCreatePlan = useCallback(async () => {
    if (!selectedBedId || !currentSeasonId) return;

    try {
      const plan = await createBedPlan(currentSeasonId, {
        bedId: selectedBedId,
        mode: 'length_splits',
        definition: { cuts: [] },
      });
      addBedSectionPlan({
        ...plan,
        createdAt: new Date(plan.createdAt),
        updatedAt: new Date(plan.updatedAt),
      } as BedSectionPlan);
    } catch (error) {
      console.error('Failed to create bed plan:', error);
    }
  }, [selectedBedId, currentSeasonId, addBedSectionPlan]);

  const handleAddCut = useCallback(() => {
    if (!currentPlan || !selectedBed) return;

    const newCutPosition = calculateOptimalCutPosition(
      selectedBed.height,
      currentPlan.definition.cuts
    );

    updateBedSectionPlan(currentPlan.id, {
      definition: {
        cuts: [...currentPlan.definition.cuts, newCutPosition].sort((a, b) => a - b),
      },
    });
  }, [currentPlan, selectedBed, updateBedSectionPlan]);

  const handleRemoveCut = useCallback(
    (index: number) => {
      if (!currentPlan) return;

      const newCuts = currentPlan.definition.cuts.filter((_, i) => i !== index);
      updateBedSectionPlan(currentPlan.id, {
        definition: { cuts: newCuts },
      });
    },
    [currentPlan, updateBedSectionPlan]
  );

  const handleCutChange = useCallback(
    (index: number, value: number) => {
      if (!currentPlan || !selectedBed) return;

      // Clamp value to bed bounds
      const clampedValue = Math.max(0.1, Math.min(value, selectedBed.height - 0.1));

      const newCuts = [...currentPlan.definition.cuts];
      newCuts[index] = clampedValue;

      updateBedSectionPlan(currentPlan.id, {
        definition: { cuts: newCuts.sort((a, b) => a - b) },
      });
    },
    [currentPlan, selectedBed, updateBedSectionPlan]
  );

  const handleDeletePlan = useCallback(async () => {
    if (!currentPlan) return;

    try {
      await deleteBedPlan(currentPlan.id);
      removeBedSectionPlan(currentPlan.id);
    } catch (error) {
      console.error('Failed to delete bed plan:', error);
    }
  }, [currentPlan, removeBedSectionPlan]);

  if (!selectedBed || !currentSeasonId) {
    return null;
  }

  const sections = currentPlan
    ? calculateLengthSplitSections(
        selectedBed.width,
        selectedBed.height,
        currentPlan.definition.cuts,
        currentPlan.id,
        selectedBed.id
      )
    : [];

  return (
    <div style={panelStyle}>
      <div style={headerStyle}>
        <h3 style={{ margin: 0, fontSize: '16px' }}>Section Editor</h3>
        <button
          onClick={() => setSectionEditorOpen(false)}
          style={{
            ...buttonStyle,
            padding: '4px 8px',
            border: 'none',
            backgroundColor: 'transparent',
          }}
        >
          X
        </button>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <strong>{selectedBed.name}</strong>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
          {selectedBed.width.toFixed(2)}m x {selectedBed.height.toFixed(2)}m
        </div>
      </div>

      {!currentPlan ? (
        <div>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
            No sections defined for this bed in the current season.
          </p>
          <button
            onClick={handleCreatePlan}
            style={{
              ...buttonStyle,
              width: '100%',
              backgroundColor: '#4caf50',
              color: 'white',
              border: 'none',
            }}
          >
            Create Section Plan
          </button>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '16px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}
            >
              <strong style={{ fontSize: '13px' }}>Sections ({sections.length})</strong>
              <button
                onClick={handleAddCut}
                style={{
                  ...buttonStyle,
                  backgroundColor: '#2196f3',
                  color: 'white',
                  border: 'none',
                }}
                disabled={sections.length >= 10}
              >
                + Add Split
              </button>
            </div>

            {sections.map((section) => (
              <div key={section.id} style={sectionItemStyle}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontWeight: 500 }}>{section.name}</span>
                  <span style={{ color: '#666' }}>
                    {(section.boundsLocal.x1 - section.boundsLocal.x0).toFixed(2)}m
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>
                  {section.boundsLocal.x0.toFixed(2)}m - {section.boundsLocal.x1.toFixed(2)}m
                </div>
              </div>
            ))}
          </div>

          {currentPlan.definition.cuts.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <strong style={{ fontSize: '13px', display: 'block', marginBottom: '8px' }}>
                Cut Positions
              </strong>
              {currentPlan.definition.cuts.map((cut, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '6px',
                  }}
                >
                  <span style={{ fontSize: '12px', width: '50px' }}>Cut {index + 1}:</span>
                  <input
                    type="number"
                    value={cut}
                    onChange={(e) => handleCutChange(index, parseFloat(e.target.value) || 0)}
                    step="0.1"
                    min="0.1"
                    max={selectedBed.height - 0.1}
                    style={inputStyle}
                  />
                  <span style={{ fontSize: '12px' }}>m</span>
                  <button
                    onClick={() => handleRemoveCut(index)}
                    style={{
                      ...buttonStyle,
                      padding: '2px 8px',
                      color: '#f44336',
                      marginLeft: 'auto',
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleDeletePlan}
            style={{
              ...buttonStyle,
              width: '100%',
              color: '#f44336',
              borderColor: '#f44336',
            }}
          >
            Remove All Sections
          </button>
        </>
      )}
    </div>
  );
}
