import { useRef, useState, useCallback } from 'react';
import { Stage, Layer, Rect, Group } from 'react-konva';
import type Konva from 'konva';
import { usePlotStore } from '../../store/plotStore';
import { useUIStore } from '../../store/uiStore';
import { PlotBoundary } from './PlotBoundary';
import { BedShape } from './BedShape';
import { DrawingRect } from './DrawingRect';
import { metersToPixels, pixelsToMeters } from '../../utils/geometry';
import { createPlot as createPlotApi } from '../../api/client';

const CANVAS_PADDING = 100;

export function PlotCanvas() {
  const stageRef = useRef<Konva.Stage>(null);
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: CANVAS_PADDING, y: CANVAS_PADDING });

  const { plot, beds, isLoading, setPlot, setBeds, setSelectedBedId } = usePlotStore();
  const {
    currentTool,
    isDrawingPlot,
    drawStart,
    drawCurrent,
    startDrawingPlot,
    updateDrawing,
    endDrawingPlot,
    setCurrentTool,
  } = useUIStore();

  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale =
      e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const clampedScale = Math.max(0.1, Math.min(10, newScale));

    setStageScale(clampedScale);
    setStagePos({
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    });
  }, []);

  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (currentTool !== 'draw-plot' || plot) return;

      const stage = e.target.getStage();
      if (!stage) return;

      const pos = stage.getPointerPosition();
      if (!pos) return;

      const worldPos = {
        x: (pos.x - stagePos.x) / stageScale,
        y: (pos.y - stagePos.y) / stageScale,
      };

      startDrawingPlot(worldPos);
    },
    [currentTool, plot, stagePos, stageScale, startDrawingPlot]
  );

  const handleMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!isDrawingPlot) return;

      const stage = e.target.getStage();
      if (!stage) return;

      const pos = stage.getPointerPosition();
      if (!pos) return;

      const worldPos = {
        x: (pos.x - stagePos.x) / stageScale,
        y: (pos.y - stagePos.y) / stageScale,
      };

      updateDrawing(worldPos);
    },
    [isDrawingPlot, stagePos, stageScale, updateDrawing]
  );

  const handleMouseUp = useCallback(async () => {
    if (!isDrawingPlot || !drawStart || !drawCurrent) return;

    const width = Math.abs(drawCurrent.x - drawStart.x);
    const height = Math.abs(drawCurrent.y - drawStart.y);

    if (width > 0.5 && height > 0.5) {
      const widthMeters = pixelsToMeters(width);
      const heightMeters = pixelsToMeters(height);

      try {
        const newPlot = await createPlotApi({
          name: 'My Plot',
          units: 'meters',
          boundary: {
            width: widthMeters,
            height: heightMeters,
          },
        });

        setPlot({
          id: newPlot.id,
          name: newPlot.name,
          units: newPlot.units as 'meters' | 'feet',
          boundaryType: newPlot.boundaryType as 'rect',
          boundary: newPlot.boundary,
          createdAt: new Date(newPlot.createdAt),
          updatedAt: new Date(newPlot.updatedAt),
        });
        setBeds([]);
        setCurrentTool('select');
      } catch (error) {
        console.error('Failed to create plot:', error);
      }
    }

    endDrawingPlot();
  }, [
    isDrawingPlot,
    drawStart,
    drawCurrent,
    setPlot,
    setBeds,
    setCurrentTool,
    endDrawingPlot,
  ]);

  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      // Deselect if clicking on empty area
      if (e.target === e.target.getStage()) {
        setSelectedBedId(null);
      }
    },
    [setSelectedBedId]
  );

  if (isLoading) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <Stage
      ref={stageRef}
      width={window.innerWidth}
      height={window.innerHeight}
      scaleX={stageScale}
      scaleY={stageScale}
      x={stagePos.x}
      y={stagePos.y}
      draggable={false}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleStageClick}
      style={{ backgroundColor: '#e8e8e8' }}
    >
      <Layer>
        {/* Grid background */}
        <Group>
          {Array.from({ length: 50 }).map((_, i) => (
            <Rect
              key={`grid-v-${i}`}
              x={i * metersToPixels(1)}
              y={0}
              width={1}
              height={metersToPixels(50)}
              fill="#ddd"
            />
          ))}
          {Array.from({ length: 50 }).map((_, i) => (
            <Rect
              key={`grid-h-${i}`}
              x={0}
              y={i * metersToPixels(1)}
              width={metersToPixels(50)}
              height={1}
              fill="#ddd"
            />
          ))}
        </Group>

        {/* Plot boundary */}
        {plot && <PlotBoundary plot={plot} />}

        {/* Beds */}
        {beds.map((bed) => (
          <BedShape key={bed.id} bed={bed} />
        ))}

        {/* Drawing preview */}
        {isDrawingPlot && drawStart && drawCurrent && (
          <DrawingRect start={drawStart} current={drawCurrent} />
        )}
      </Layer>
    </Stage>
  );
}
