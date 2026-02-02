import { useRef, useCallback, useEffect, useMemo } from 'react';
import { Rect, Text, Group, Circle, Line } from 'react-konva';
import type Konva from 'konva';
import type { BedBase } from '@allotment/domain';
import { usePlotStore } from '../../store/plotStore';
import { useSeasonStore } from '../../store/seasonStore';
import {
  metersToPixels,
  pixelsToMeters,
  formatDimension,
  snapAngle,
} from '../../utils/geometry';
import { usePersistBed, usePersistBedPlan } from '../../hooks/usePersist';
import { calculateLengthSplitSections } from '@allotment/placement';

interface BedShapeProps {
  bed: BedBase;
}

const MIN_SIZE_METERS = 0.3;
const HANDLE_SIZE = 8;
const ROTATION_HANDLE_DISTANCE = 30;

// Pastel colors for sections
const SECTION_COLORS = [
  'rgba(144, 238, 144, 0.4)', // light green
  'rgba(173, 216, 230, 0.4)', // light blue
  'rgba(255, 255, 224, 0.4)', // light yellow
  'rgba(255, 218, 185, 0.4)', // peach
  'rgba(221, 160, 221, 0.4)', // plum
  'rgba(176, 224, 230, 0.4)', // powder blue
  'rgba(255, 228, 196, 0.4)', // bisque
  'rgba(152, 251, 152, 0.4)', // pale green
  'rgba(175, 238, 238, 0.4)', // pale turquoise
  'rgba(255, 182, 193, 0.4)', // light pink
];

export function BedShape({ bed }: BedShapeProps) {
  const groupRef = useRef<Konva.Group>(null);
  const { selectedBedId, setSelectedBedId, updateBed, plot } = usePlotStore();
  const { currentSeasonId, bedSectionPlans, selectedSectionId, setSelectedSectionId } = useSeasonStore();
  const isSelected = selectedBedId === bed.id;

  // Enable persistence for this bed
  usePersistBed(bed.id);

  // Get the section plan for this bed (if any)
  const sectionPlan = bedSectionPlans.find((p) => p.bedId === bed.id);

  // Enable persistence for section plan
  usePersistBedPlan(sectionPlan?.id ?? '');

  // Calculate sections from plan
  const sections = useMemo(() => {
    if (!sectionPlan || !currentSeasonId) return [];
    return calculateLengthSplitSections(
      bed.width,
      bed.height,
      sectionPlan.definition.cuts,
      sectionPlan.id,
      bed.id
    );
  }, [sectionPlan, currentSeasonId, bed.width, bed.height, bed.id]);

  const widthPx = metersToPixels(bed.width);
  const heightPx = metersToPixels(bed.height);
  const xPx = metersToPixels(bed.x);
  const yPx = metersToPixels(bed.y);

  const handleSelect = useCallback(() => {
    if (!bed.isLocked) {
      setSelectedBedId(bed.id);
    }
  }, [bed.id, bed.isLocked, setSelectedBedId]);

  const handleDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      if (bed.isLocked || !plot) return;

      // Account for the offset when getting position
      // The group's x,y represents the center due to offsetX/offsetY
      const centerX = pixelsToMeters(e.target.x());
      const centerY = pixelsToMeters(e.target.y());

      // Convert center position to top-left corner
      const newX = centerX;
      const newY = centerY;

      // Constrain to plot bounds
      const constrainedX = Math.max(
        bed.width / 2,
        Math.min(newX, plot.boundary.width - bed.width / 2)
      );
      const constrainedY = Math.max(
        bed.height / 2,
        Math.min(newY, plot.boundary.height - bed.height / 2)
      );

      updateBed(bed.id, { x: constrainedX, y: constrainedY });
    },
    [bed.id, bed.isLocked, bed.width, bed.height, plot, updateBed]
  );

  const handleResize = useCallback(
    (corner: 'nw' | 'ne' | 'se' | 'sw', localDelta: { x: number; y: number }) => {
      if (bed.isLocked) return;

      // Current bed bounds (center position)
      const centerX = bed.x;
      const centerY = bed.y;
      const halfWidth = bed.width / 2;
      const halfHeight = bed.height / 2;

      // Calculate corners in world space
      const left = centerX - halfWidth;
      const right = centerX + halfWidth;
      const top = centerY - halfHeight;
      const bottom = centerY + halfHeight;

      let newCenterX = centerX;
      let newCenterY = centerY;
      let newWidth = bed.width;
      let newHeight = bed.height;

      // Apply delta based on corner
      switch (corner) {
        case 'nw':
          // Moving top-left corner
          newWidth = Math.max(MIN_SIZE_METERS, bed.width - localDelta.x);
          newHeight = Math.max(MIN_SIZE_METERS, bed.height - localDelta.y);
          newCenterX = right - newWidth / 2;
          newCenterY = bottom - newHeight / 2;
          break;
        case 'ne':
          // Moving top-right corner
          newWidth = Math.max(MIN_SIZE_METERS, bed.width + localDelta.x);
          newHeight = Math.max(MIN_SIZE_METERS, bed.height - localDelta.y);
          newCenterX = left + newWidth / 2;
          newCenterY = bottom - newHeight / 2;
          break;
        case 'se':
          // Moving bottom-right corner
          newWidth = Math.max(MIN_SIZE_METERS, bed.width + localDelta.x);
          newHeight = Math.max(MIN_SIZE_METERS, bed.height + localDelta.y);
          newCenterX = left + newWidth / 2;
          newCenterY = top + newHeight / 2;
          break;
        case 'sw':
          // Moving bottom-left corner
          newWidth = Math.max(MIN_SIZE_METERS, bed.width - localDelta.x);
          newHeight = Math.max(MIN_SIZE_METERS, bed.height + localDelta.y);
          newCenterX = right - newWidth / 2;
          newCenterY = top + newHeight / 2;
          break;
      }

      // Constrain to plot bounds
      if (plot) {
        newCenterX = Math.max(newWidth / 2, Math.min(newCenterX, plot.boundary.width - newWidth / 2));
        newCenterY = Math.max(newHeight / 2, Math.min(newCenterY, plot.boundary.height - newHeight / 2));
      }

      updateBed(bed.id, {
        x: newCenterX,
        y: newCenterY,
        width: newWidth,
        height: newHeight,
      });
    },
    [bed, plot, updateBed]
  );

  const handleRotate = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      if (bed.isLocked) return;

      const stage = e.target.getStage();
      if (!stage) return;

      const center = {
        x: xPx + widthPx / 2,
        y: yPx + heightPx / 2,
      };

      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      // Calculate angle from center to pointer
      const angle =
        Math.atan2(pointer.y - center.y, pointer.x - center.x) *
        (180 / Math.PI);
      const snappedAngle = snapAngle(angle + 90); // Offset by 90 since handle is at top

      updateBed(bed.id, { rotationDeg: snappedAngle });
    },
    [bed.id, bed.isLocked, xPx, yPx, widthPx, heightPx, updateBed]
  );

  // Reset position on re-render if dragged outside bounds
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position({ x: xPx, y: yPx });
    }
  }, [xPx, yPx]);

  const cornerHandles = [
    { id: 'nw', x: 0, y: 0 },
    { id: 'ne', x: widthPx, y: 0 },
    { id: 'se', x: widthPx, y: heightPx },
    { id: 'sw', x: 0, y: heightPx },
  ] as const;

  return (
    <Group
      ref={groupRef}
      x={xPx}
      y={yPx}
      rotation={bed.rotationDeg}
      draggable={!bed.isLocked}
      onClick={handleSelect}
      onTap={handleSelect}
      onDragEnd={handleDragEnd}
      offsetX={widthPx / 2}
      offsetY={heightPx / 2}
    >
      {/* Bed rectangle */}
      <Rect
        x={-widthPx / 2}
        y={-heightPx / 2}
        width={widthPx}
        height={heightPx}
        fill={bed.isLocked ? '#c4b5a0' : '#8fbc8f'}
        stroke={isSelected ? '#2196f3' : '#556b2f'}
        strokeWidth={isSelected ? 3 : 2}
        shadowColor="black"
        shadowBlur={isSelected ? 10 : 5}
        shadowOpacity={0.3}
        cornerRadius={4}
      />

      {/* Bed name */}
      <Text
        x={-widthPx / 2 + 5}
        y={-heightPx / 2 + 5}
        text={bed.name}
        fontSize={12}
        fontStyle="bold"
        fill="#333"
        width={widthPx - 10}
      />

      {/* Dimension labels */}
      <Text
        x={0}
        y={-heightPx / 2 - 18}
        text={`${formatDimension(bed.width)} m`}
        fontSize={11}
        fill="#333"
        align="center"
        offsetX={25}
      />
      <Text
        x={widthPx / 2 + 5}
        y={0}
        text={`${formatDimension(bed.height)} m`}
        fontSize={11}
        fill="#333"
        offsetY={6}
      />

      {/* Lock indicator */}
      {bed.isLocked && (
        <Text
          x={widthPx / 2 - 20}
          y={-heightPx / 2 + 5}
          text="🔒"
          fontSize={14}
        />
      )}

      {/* Section overlays (only when season is active) */}
      {currentSeasonId && sections.length > 0 && sections.map((section, idx) => {
        const sectionYPx = metersToPixels(section.boundsLocal.y0);
        const sectionHeightPx = metersToPixels(section.boundsLocal.y1 - section.boundsLocal.y0);
        const isSectionSelected = selectedSectionId === section.id;

        return (
          <Group key={section.id}>
            {/* Section fill */}
            <Rect
              x={-widthPx / 2}
              y={-heightPx / 2 + sectionYPx}
              width={widthPx}
              height={sectionHeightPx}
              fill={SECTION_COLORS[idx % SECTION_COLORS.length]}
              stroke={isSectionSelected ? '#ff9800' : '#666'}
              strokeWidth={isSectionSelected ? 2 : 1}
              dash={isSectionSelected ? undefined : [4, 4]}
              onClick={(e) => {
                e.cancelBubble = true;
                setSelectedSectionId(section.id);
                setSelectedBedId(bed.id);
              }}
            />
            {/* Section label */}
            <Text
              x={-widthPx / 2 + widthPx / 2}
              y={-heightPx / 2 + sectionYPx + sectionHeightPx / 2}
              text={section.name}
              fontSize={14}
              fontStyle="bold"
              fill="#333"
              align="center"
              verticalAlign="middle"
              offsetX={20}
              offsetY={7}
            />
          </Group>
        );
      })}

      {/* Resize handles (only when selected and not locked) */}
      {isSelected && !bed.isLocked && (
        <>
          {cornerHandles.map((handle) => (
            <Circle
              key={handle.id}
              x={handle.x - widthPx / 2}
              y={handle.y - heightPx / 2}
              radius={HANDLE_SIZE}
              fill="white"
              stroke="#2196f3"
              strokeWidth={2}
              draggable
              onDragMove={(e) => {
                // Get delta in local coordinates (pixels)
                const localDelta = {
                  x: pixelsToMeters(e.target.x() - (handle.x - widthPx / 2)),
                  y: pixelsToMeters(e.target.y() - (handle.y - heightPx / 2)),
                };
                handleResize(handle.id, localDelta);
              }}
              onDragEnd={(e) => {
                // Reset handle position after resize
                e.target.position({
                  x: handle.x - widthPx / 2,
                  y: handle.y - heightPx / 2,
                });
              }}
            />
          ))}

          {/* Rotation handle */}
          <Line
            points={[0, -heightPx / 2, 0, -heightPx / 2 - ROTATION_HANDLE_DISTANCE]}
            stroke="#2196f3"
            strokeWidth={2}
          />
          <Circle
            x={0}
            y={-heightPx / 2 - ROTATION_HANDLE_DISTANCE}
            radius={HANDLE_SIZE}
            fill="#2196f3"
            stroke="white"
            strokeWidth={2}
            draggable
            onDragMove={handleRotate}
            onDragEnd={(e) => {
              e.target.position({
                x: 0,
                y: -heightPx / 2 - ROTATION_HANDLE_DISTANCE,
              });
            }}
          />
        </>
      )}
    </Group>
  );
}
