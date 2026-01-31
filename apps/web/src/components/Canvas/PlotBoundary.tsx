import { Rect, Text, Group } from 'react-konva';
import type { PlotBase } from '@allotment/domain';
import { metersToPixels, formatDimension, calculateArea } from '../../utils/geometry';

interface PlotBoundaryProps {
  plot: PlotBase;
}

export function PlotBoundary({ plot }: PlotBoundaryProps) {
  const widthPx = metersToPixels(plot.boundary.width);
  const heightPx = metersToPixels(plot.boundary.height);
  const area = calculateArea(plot.boundary.width, plot.boundary.height);

  return (
    <Group>
      {/* Background fill */}
      <Rect
        x={0}
        y={0}
        width={widthPx}
        height={heightPx}
        fill="#f9f7f4"
        stroke="#8b7355"
        strokeWidth={2}
      />

      {/* Width label (top) */}
      <Text
        x={widthPx / 2}
        y={-25}
        text={`${formatDimension(plot.boundary.width)} m`}
        fontSize={14}
        fill="#333"
        align="center"
        offsetX={30}
      />

      {/* Height label (left) */}
      <Text
        x={-10}
        y={heightPx / 2}
        text={`${formatDimension(plot.boundary.height)} m`}
        fontSize={14}
        fill="#333"
        rotation={-90}
        offsetX={30}
      />

      {/* Area label (center) */}
      <Text
        x={widthPx / 2}
        y={heightPx / 2}
        text={`Area: ${formatDimension(area)} m²`}
        fontSize={16}
        fill="#666"
        align="center"
        offsetX={50}
        offsetY={8}
      />

      {/* Plot name */}
      <Text
        x={10}
        y={10}
        text={plot.name}
        fontSize={18}
        fontStyle="bold"
        fill="#333"
      />
    </Group>
  );
}
