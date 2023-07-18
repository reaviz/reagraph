import { InternalGraphNode } from '../types';

export interface CenterPositionVector {
  x: number;
  y: number;
  z: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
  height: number;
  width: number;
}

/**
 * Given a collection of nodes, get the center point.
 */
export function getLayoutCenter(
  nodes: InternalGraphNode[]
): CenterPositionVector {
  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  let minZ = Number.POSITIVE_INFINITY;
  let maxZ = Number.NEGATIVE_INFINITY;

  for (let node of nodes) {
    minX = Math.min(minX, node.position.x);
    maxX = Math.max(maxX, node.position.x);
    minY = Math.min(minY, node.position.y);
    maxY = Math.max(maxY, node.position.y);
    minZ = Math.min(minZ, node.position.z);
    maxZ = Math.max(maxZ, node.position.z);
  }

  return {
    height: maxY - minY,
    width: maxX - minX,
    minX,
    maxX,
    minY,
    maxY,
    minZ,
    maxZ,
    x: (maxX + minX) / 2,
    y: (maxY + minY) / 2,
    z: (maxZ + minZ) / 2
  };
}
