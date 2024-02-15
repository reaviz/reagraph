import { useThree } from '@react-three/fiber';
import { useCameraControls } from './useCameraControls';
import { useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import { Vector3, Box3, PerspectiveCamera } from 'three';
import { useHotkeys } from 'reakeys';
import { getLayoutCenter } from '../utils/layout';
import { InternalGraphNode, InternalGraphPosition } from '../types';
import { useStore } from '../store';

const PADDING = 50;

// https://discourse.threejs.org/t/functions-to-calculate-the-visible-width-height-at-a-given-z-depth-from-a-perspective-camera/269
const visibleHeightAtZDepth = (depth: number, camera: PerspectiveCamera) => {
  // compensate for cameras not positioned at z=0
  const cameraOffset = camera.position.z;
  if (depth < cameraOffset) depth -= cameraOffset;
  else depth += cameraOffset;

  // vertical fov in radians
  const vFOV = (camera.fov * Math.PI) / 180;

  // Math.abs to ensure the result is always positive
  return 2 * Math.tan(vFOV / 2) * Math.abs(depth);
};

const visibleWidthAtZDepth = (depth: number, camera: PerspectiveCamera) => {
  const height = visibleHeightAtZDepth(depth, camera);
  return height * camera.aspect;
};

const isNodeInView = (
  camera: PerspectiveCamera,
  nodePosition: InternalGraphPosition
): boolean => {
  const visibleWidth = visibleWidthAtZDepth(1, camera);
  const visibleHeight = visibleHeightAtZDepth(1, camera);

  // The boundary coordinates of the area visible to the camera relative to the scene
  const visibleArea = {
    x0: camera?.position?.x - visibleWidth / 2,
    x1: camera?.position?.x + visibleWidth / 2,
    y0: camera?.position?.y - visibleHeight / 2,
    y1: camera?.position?.y + visibleHeight / 2
  };

  return (
    nodePosition?.x > visibleArea.x0 &&
    nodePosition?.x < visibleArea.x1 &&
    nodePosition?.y > visibleArea.y0 &&
    nodePosition?.y < visibleArea.y1
  );
};

export interface CenterGraphInput {
  /**
   * Whether the animate the transition or not.
   */
  animated?: boolean;
}

export interface CenterGraphOutput {
  /**
   * A function that centers the graph on the nodes with the given nodes.
   * If no nodes are provided, the graph is centered on all nodes.
   */
  centerNodes: (nodes?: InternalGraphNode[]) => void;

  /**
   * A function that centers the graph on the nodes with the given ids.
   * If no ids are provided, the graph is centered on all nodes.
   */
  centerNodesById: (ids?: string[]) => void;
}

export const useCenterGraph = ({
  animated
}: CenterGraphInput): CenterGraphOutput => {
  const nodes = useStore(state => state.nodes);
  const invalidate = useThree(state => state.invalidate);
  const { controls } = useCameraControls();
  const camera = useThree(state => state.camera) as PerspectiveCamera;

  const centerNodes = useCallback(
    (centerNodes: InternalGraphNode[], padding = PADDING, fill = false) => {
      if (
        centerNodes?.some(node => !isNodeInView(camera, node.position)) ||
        centerNodes?.length === nodes?.length
      ) {
        // Centers the graph based on the central most node
        const { minX, maxX, minY, maxY, minZ, maxZ, x, y, z } =
          getLayoutCenter(centerNodes);

        controls.setTarget(x, y, z, animated);
        controls?.fitToBox(
          new Box3(
            new Vector3(minX, minY, minZ),
            new Vector3(maxX, maxY, maxZ)
          ),
          animated,
          {
            cover: fill,
            paddingLeft: padding,
            paddingRight: padding,
            paddingBottom: padding,
            paddingTop: padding
          }
        );

        invalidate();
      }
    },
    [invalidate, controls, animated]
  );

  const centerNodesById = useCallback(
    (nodeIds?: string[]) => {
      let mappedNodes: InternalGraphNode[] | null = null;

      if (nodeIds?.length) {
        // Map the node ids to the actual nodes
        mappedNodes = nodeIds.reduce((acc, id) => {
          const node = nodes.find(n => n.id === id);
          if (node) {
            acc.push(node);
          } else {
            throw new Error(
              `Attempted to center ${id} but it was not found in the nodes`
            );
          }

          return acc;
        }, []);
      }

      centerNodes(mappedNodes || nodes);
    },
    [centerNodes, nodes]
  );

  const mounted = useRef<boolean>(false);
  useLayoutEffect(() => {
    // Center the graph once nodes are loaded on mount
    if (controls && nodes?.length && !mounted.current) {
      centerNodes(nodes);
      mounted.current = true;
    }
  }, [controls, centerNodes, nodes]);

  useHotkeys([
    {
      name: 'Center',
      category: 'Graph',
      keys: ['command+shift+c'],
      callback: () => centerNodes(nodes)
    }
  ]);

  return { centerNodes, centerNodesById };
};
