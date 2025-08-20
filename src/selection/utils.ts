import { InstancedMesh2 } from '@three.ez/instanced-mesh';
import Graph from 'graphology';
import { Box2, Vector2, Vector3 } from 'three';
import { Camera } from '@react-three/fiber';

import { Theme } from '../themes';
import { Instance } from '../types';

export type PathSelectionTypes = 'direct' | 'out' | 'in' | 'all';

/**
 * Given a graph and a list of node ids, return the adjacent nodes and edges.
 *
 * TODO: This method could be improved with the introduction of graphology
 */
export function getAdjacents(
  graph: Graph,
  nodeIds: string | string[],
  type: PathSelectionTypes
) {
  nodeIds = Array.isArray(nodeIds) ? nodeIds : [nodeIds];

  const nodes: string[] = [];
  const edges: string[] = [];

  for (const nodeId of nodeIds) {
    const graphLinks = [
      ...(graph.inEdgeEntries(nodeId) ?? []),
      ...(graph.outEdgeEntries(nodeId) ?? [])
    ];

    if (!graphLinks) {
      continue;
    }

    for (const link of graphLinks) {
      const linkId = link.attributes.id;

      if (type === 'in') {
        if (link.target === nodeId && !edges.includes(linkId)) {
          edges.push(linkId);
        }
      } else if (type === 'out') {
        if (link.source === nodeId && !edges.includes(linkId)) {
          edges.push(linkId);
        }
      } else {
        if (!edges.includes(linkId)) {
          edges.push(linkId);
        }
      }

      if (type === 'out' || type === 'all') {
        const toId = link.target;
        if (!nodes.includes(toId as string)) {
          nodes.push(toId as string);
        }
      }

      if (type === 'in' || type === 'all') {
        if (!nodes.includes(link.source)) {
          nodes.push(link.source as string);
        }
      }
    }
  }

  return {
    nodes,
    edges
  };
}

/**
 * Set the vectors.
 */
export function prepareRay(event, vec, size) {
  const { offsetX, offsetY } = event;
  const { width, height } = size;
  vec.set((offsetX / width) * 2 - 1, -(offsetY / height) * 2 + 1);
}

/**
 * Create a lasso element.
 */
export function createElement(theme: Theme) {
  const element = document.createElement('div');
  element.style.pointerEvents = 'none';
  element.style.border = theme.lasso.border;
  element.style.backgroundColor = theme.lasso.background;
  element.style.position = 'fixed';
  return element;
}

/**
 * Helper function to get instances within selection bounds for InstancedMesh2
 */
export const getInstancesInBounds = (
  instancedMesh: InstancedMesh2<Instance>,
  selectionBounds: Box2,
  camera: Camera,
  size: { width: number; height: number }
): string[] => {
  const selectedIds: string[] = [];
  const tempVector = new Vector3();
  const tempVector2 = new Vector2();

  if (!instancedMesh.instances) return selectedIds;

  for (const instance of instancedMesh.instances) {
    if (!instance.visible || !instance.position) continue;

    // Project 3D position to 2D screen coordinates
    tempVector.copy(instance.position);
    tempVector.project(camera);

    // Convert from NDC (-1 to 1) to screen coordinates (0 to width/height)
    tempVector2.set(
      ((tempVector.x + 1) / 2) * size.width,
      ((-tempVector.y + 1) / 2) * size.height
    );

    // Check if screen position is within selection bounds
    if (selectionBounds.containsPoint(tempVector2)) {
      selectedIds.push(instance.nodeId);
    }
  }

  return selectedIds;
};
