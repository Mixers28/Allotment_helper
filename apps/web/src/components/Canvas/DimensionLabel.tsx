import { Text } from 'react-konva';
import { formatDimension } from '../../utils/geometry';

interface DimensionLabelProps {
  x: number;
  y: number;
  value: number;
  unit?: string;
  rotation?: number;
}

export function DimensionLabel({
  x,
  y,
  value,
  unit = 'm',
  rotation = 0,
}: DimensionLabelProps) {
  return (
    <Text
      x={x}
      y={y}
      text={`${formatDimension(value)} ${unit}`}
      fontSize={12}
      fill="#333"
      rotation={rotation}
      align="center"
    />
  );
}
