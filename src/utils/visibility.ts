import type { PerspectiveCamera } from 'three';

import type { EdgeLabelPosition } from '../symbols';

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
  return (
    shape: 'node' | 'edge',
    size: number,
    // Optional per-call position override so a single closure can be
    // reused across many nodes instead of allocating one per node.
    nodePositionOverride?: { x: number; y: number; z: number }
  ) => {
    const nodePos = nodePositionOverride ?? nodePosition;
    const isAlwaysVisible =
      labelType === 'all' ||
      (labelType === 'nodes' && shape === 'node') ||
      (labelType === 'edges' && shape === 'edge');

    if (
      !isAlwaysVisible &&
      camera &&
      nodePos &&
      camera?.position?.z / camera?.zoom - nodePos?.z > 6000
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
        nodePos &&
        camera.position.z / camera.zoom - nodePos.z < 3000
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
