import { useCallback, useMemo } from 'react';
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
  // bed.x and bed.y are top-left corner, but we render with center for rotation
  const xPx = metersToPixels(bed.x + bed.width / 2);
  const yPx = metersToPixels(bed.y + bed.height / 2);

  const handleSelect = useCallback(() => {
    if (!bed.isLocked) {
      setSelectedBedId(bed.id);
    }
  }, [bed.id, bed.isLocked, setSelectedBedId]);

  const handleDragStart = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      if (bed.isLocked) return;
      // Prevent the stage from being dragged when dragging a bed
      e.cancelBubble = true;
    },
    [bed.isLocked]
  );

  const handleDragMove = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      if (bed.isLocked) return;
      // Continue preventing stage drag during the entire drag operation
      e.cancelBubble = true;
    },
    [bed.isLocked]
  );

  const handleDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      if (bed.isLocked || !plot) return;

      // Group position is the center (due to offsetX/offsetY)
      const centerX = pixelsToMeters(e.target.x());
      const centerY = pixelsToMeters(e.target.y());

      // Convert center to top-left corner for storage
      const newX = centerX - bed.width / 2;
      const newY = centerY - bed.height / 2;

      // Constrain to plot bounds (keep top-left within bounds)
      const constrainedX = Math.max(
        0,
        Math.min(newX, plot.boundary.width - bed.width)
      );
      const constrainedY = Math.max(
        0,
        Math.min(newY, plot.boundary.height - bed.height)
      );

      updateBed(bed.id, { x: constrainedX, y: constrainedY });
    },
    [bed.id, bed.isLocked, bed.width, bed.height, plot, updateBed]
  );

  const handleResize = useCallback(
    (corner: 'nw' | 'ne' | 'se' | 'sw', localDelta: { x: number; y: number }) => {
      if (bed.isLocked) return;

      // bed.x, bed.y are top-left corner
      const left = bed.x;
      const top = bed.y;
      const right = bed.x + bed.width;
      const bottom = bed.y + bed.height;

      let newX = bed.x;
      let newY = bed.y;
      let newWidth = bed.width;
      let newHeight = bed.height;

      // Apply delta based on corner
      switch (corner) {
        case 'nw':
          // Moving top-left corner
          newWidth = Math.max(MIN_SIZE_METERS, bed.width - localDelta.x);
          newHeight = Math.max(MIN_SIZE_METERS, bed.height - localDelta.y);
          newX = right - newWidth;
          newY = bottom - newHeight;
          break;
        case 'ne':
          // Moving top-right corner
          newWidth = Math.max(MIN_SIZE_METERS, bed.width + localDelta.x);
          newHeight = Math.max(MIN_SIZE_METERS, bed.height - localDelta.y);
          newY = bottom - newHeight;
          break;
        case 'se':
          // Moving bottom-right corner
          newWidth = Math.max(MIN_SIZE_METERS, bed.width + localDelta.x);
          newHeight = Math.max(MIN_SIZE_METERS, bed.height + localDelta.y);
          break;
        case 'sw':
          // Moving bottom-left corner
          newWidth = Math.max(MIN_SIZE_METERS, bed.width - localDelta.x);
          newHeight = Math.max(MIN_SIZE_METERS, bed.height + localDelta.y);
          newX = right - newWidth;
          break;
      }

      // Constrain to plot bounds
      if (plot) {
        newX = Math.max(0, Math.min(newX, plot.boundary.width - newWidth));
        newY = Math.max(0, Math.min(newY, plot.boundary.height - newHeight));
      }

      updateBed(bed.id, {
        x: newX,
        y: newY,
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


  const cornerHandles = [
    { id: 'nw', x: 0, y: 0 },
    { id: 'ne', x: widthPx, y: 0 },
    { id: 'se', x: widthPx, y: heightPx },
    { id: 'sw', x: 0, y: heightPx },
  ] as const;

  return (
    <Group
      x={xPx}
      y={yPx}
      rotation={bed.rotationDeg}
      draggable={!bed.isLocked}
      onClick={handleSelect}
      onTap={handleSelect}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
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
              onDragStart={(e) => {
                // Prevent stage from dragging when dragging resize handle
                e.cancelBubble = true;
              }}
              onDragMove={(e) => {
                // Prevent stage from dragging
                e.cancelBubble = true;
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
            onDragStart={(e) => {
              // Prevent stage from dragging when dragging rotation handle
              e.cancelBubble = true;
            }}
            onDragMove={(e) => {
              // Prevent stage from dragging
              e.cancelBubble = true;
              handleRotate(e);
            }}
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
