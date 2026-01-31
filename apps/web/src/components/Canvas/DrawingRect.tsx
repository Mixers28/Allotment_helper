import { Rect, Text, Group } from 'react-konva';
import { pixelsToMeters, formatDimension } from '../../utils/geometry';

interface DrawingRectProps {
  start: { x: number; y: number };
  current: { x: number; y: number };
}

export function DrawingRect({ start, current }: DrawingRectProps) {
  const x = Math.min(start.x, current.x);
  const y = Math.min(start.y, current.y);
  const width = Math.abs(current.x - start.x);
  const height = Math.abs(current.y - start.y);

  const widthMeters = pixelsToMeters(width);
  const heightMeters = pixelsToMeters(height);

  return (
    <Group>
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="rgba(139, 115, 85, 0.2)"
        stroke="#8b7355"
        strokeWidth={2}
        dash={[10, 5]}
      />

      {/* Width label */}
      <Text
        x={x + width / 2}
        y={y - 25}
        text={`${formatDimension(widthMeters)} m`}
        fontSize={14}
        fill="#333"
        align="center"
        offsetX={30}
      />

      {/* Height label */}
      <Text
        x={x - 10}
        y={y + height / 2}
        text={`${formatDimension(heightMeters)} m`}
        fontSize={14}
        fill="#333"
        rotation={-90}
        offsetX={30}
      />

      {/* Area label */}
      <Text
        x={x + width / 2}
        y={y + height / 2}
        text={`${formatDimension(widthMeters * heightMeters)} m²`}
        fontSize={14}
        fill="#666"
        align="center"
        offsetX={30}
        offsetY={7}
      />
    </Group>
  );
}
