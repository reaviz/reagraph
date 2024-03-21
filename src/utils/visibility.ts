import { PerspectiveCamera } from 'three';
import { EdgeLabelPosition } from '../symbols';

export type LabelVisibilityType = 'all' | 'auto' | 'none' | 'nodes' | 'edges';

interface CalcLabelVisibilityArgs {
  nodeCount: number;
  nodePosition?: { x: number; y: number; z: number };
  labelType: LabelVisibilityType;
  camera?: PerspectiveCamera;
}

export function calcLabelVisibility({
  nodeCount,
  nodePosition,
  labelType,
  camera
}: CalcLabelVisibilityArgs) {
  return (shape: 'node' | 'edge', size: number) => {
    if (
      camera &&
      nodePosition &&
      camera?.position?.z / camera?.zoom - nodePosition?.z > 6000
    ) {
      return false;
    }

    if (labelType === 'all') {
      return true;
    } else if (labelType === 'nodes' && shape === 'node') {
      return true;
    } else if (labelType === 'edges' && shape === 'edge') {
      return true;
    } else if (labelType === 'auto' && shape === 'node') {
      if (size > 7) {
        return true;
      } else if (
        camera &&
        nodePosition &&
        camera.position.z / camera.zoom - nodePosition.z < 3000
      ) {
        return true;
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
