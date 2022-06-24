import { EdgeLabelPosition } from '../symbols';

const NODE_THRESHOLD = 20;

export type LabelVisibilityType = 'all' | 'auto' | 'none' | 'nodes' | 'edges';

export function calcLabelVisibility(
  nodeCount: number,
  type: LabelVisibilityType
) {
  return (shape: 'node' | 'edge', size: number) => {
    if (type === 'all') {
      return true;
    } else if (type === 'nodes' && shape === 'node') {
      return true;
    } else if (type === 'edges' && shape === 'edge') {
      return true;
    } else if (type === 'auto' && shape === 'node') {
      if (nodeCount <= NODE_THRESHOLD) {
        return true;
      } else {
        return size > 7;
      }
    }

    return false;
  };
}

export function getLabelOffsetByType(
  offset: number,
  position: EdgeLabelPosition
): number {
  switch (position) {
  case 'above':
    return offset;
  case 'below':
    return -offset;
  case 'inline':
  case 'natural':
  default:
    return 0;
  }
}
