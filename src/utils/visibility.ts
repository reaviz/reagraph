import type { PerspectiveCamera } from 'three';

import type { EdgeLabelPosition } from '../symbols/Edge';

export type LabelVisibilityType = 'all' | 'auto' | 'none' | 'nodes' | 'edges';

interface CalcLabelVisibilityArgs {
  nodeCount: number;
  nodePosition?: { x: number; y: number; z: number };
  labelType: LabelVisibilityType;
  camera?: PerspectiveCamera;
}

export function calcLabelVisibility({
  nodePosition,
  labelType,
  camera
}: CalcLabelVisibilityArgs) {
  return (shape: 'node' | 'edge', size: number) => {
    const isAlwaysVisible =
      labelType === 'all' ||
      (labelType === 'nodes' && shape === 'node') ||
      (labelType === 'edges' && shape === 'edge');

    if (
      !isAlwaysVisible &&
      camera &&
      nodePosition &&
      camera?.position?.z / camera?.zoom - nodePosition?.z > 6000
    ) {
      return false;
    }

    if (isAlwaysVisible) {
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

export const isServerRender = typeof window === 'undefined';
