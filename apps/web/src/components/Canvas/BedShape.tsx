import { useRef, useCallback, useEffect } from 'react';
import { Rect, Text, Group, Circle, Line } from 'react-konva';
import type Konva from 'konva';
import type { BedBase } from '@allotment/domain';
import { usePlotStore } from '../../store/plotStore';
import {
  metersToPixels,
  pixelsToMeters,
  formatDimension,
  snapAngle,
} from '../../utils/geometry';
import { usePersistBed } from '../../hooks/usePersist';

interface BedShapeProps {
  bed: BedBase;
}

const MIN_SIZE_METERS = 0.3;
const HANDLE_SIZE = 8;
const ROTATION_HANDLE_DISTANCE = 30;

export function BedShape({ bed }: BedShapeProps) {
  const groupRef = useRef<Konva.Group>(null);
  const { selectedBedId, setSelectedBedId, updateBed, plot } = usePlotStore();
  const isSelected = selectedBedId === bed.id;

  // Enable persistence for this bed
  usePersistBed(bed.id);

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

      const newX = pixelsToMeters(e.target.x());
      const newY = pixelsToMeters(e.target.y());

      // Constrain to plot bounds
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
    (corner: 'nw' | 'ne' | 'se' | 'sw', newPos: { x: number; y: number }) => {
      if (bed.isLocked) return;

      const currentRight = bed.x + bed.width;
      const currentBottom = bed.y + bed.height;

      let newX = bed.x;
      let newY = bed.y;
      let newWidth = bed.width;
      let newHeight = bed.height;

      switch (corner) {
        case 'nw':
          newX = Math.min(newPos.x, currentRight - MIN_SIZE_METERS);
          newY = Math.min(newPos.y, currentBottom - MIN_SIZE_METERS);
          newWidth = currentRight - newX;
          newHeight = currentBottom - newY;
          break;
        case 'ne':
          newY = Math.min(newPos.y, currentBottom - MIN_SIZE_METERS);
          newWidth = Math.max(MIN_SIZE_METERS, newPos.x - bed.x);
          newHeight = currentBottom - newY;
          break;
        case 'se':
          newWidth = Math.max(MIN_SIZE_METERS, newPos.x - bed.x);
          newHeight = Math.max(MIN_SIZE_METERS, newPos.y - bed.y);
          break;
        case 'sw':
          newX = Math.min(newPos.x, currentRight - MIN_SIZE_METERS);
          newWidth = currentRight - newX;
          newHeight = Math.max(MIN_SIZE_METERS, newPos.y - bed.y);
          break;
      }

      updateBed(bed.id, {
        x: Math.max(0, newX),
        y: Math.max(0, newY),
        width: newWidth,
        height: newHeight,
      });
    },
    [bed, updateBed]
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
                const newPos = {
                  x: pixelsToMeters(xPx + e.target.x()),
                  y: pixelsToMeters(yPx + e.target.y()),
                };
                handleResize(handle.id, newPos);
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
