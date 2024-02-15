import { useThree } from '@react-three/fiber';
import { useCameraControls } from './useCameraControls';
import { useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import { Vector3, Box3, Euler, PerspectiveCamera } from 'three';
import { useHotkeys } from 'reakeys';
import { getLayoutCenter } from '../utils/layout';
import { InternalGraphNode, InternalGraphPosition } from '../types';
import { useStore } from '../store';

const PADDING = 50;

const isNodeInView = (
  camera: PerspectiveCamera,
  nodePosition: InternalGraphPosition
): boolean => {
  const direction = { x: 0, y: 0, z: -1 };

  // Calculate the vector from the camera to the node
  const toNode = {
    x: nodePosition?.x - camera?.position?.x,
    y: nodePosition?.y - camera?.position?.y,
    z: nodePosition?.z - camera?.position?.z
  };

  // Calculate the dot product of the two vectors
  const dotProduct =
    direction.x * toNode.x + direction.y * toNode.y + direction.z * toNode.z;

  // Calculate the lengths of the vectors
  const directionLength = Math.sqrt(
    direction.x * direction.x +
      direction.y * direction.y +
      direction.z * direction.z
  );

  const toNodeLength = Math.sqrt(
    toNode.x * toNode.x + toNode.y * toNode.y + toNode.z * toNode.z
  );

  // Calculate the angle between the vectors
  const angle = Math.acos(dotProduct / (directionLength * toNodeLength));

  // Convert the field of view to radians
  const fovRadians = (camera?.fov * Math.PI) / 180;

  return angle < fovRadians;
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

  // Find the ideal spacing for focusing
  const centerPadding = useMemo(() => {
    const { maxX, maxY } = getLayoutCenter(nodes);
    return Math.max(maxX, maxY);
  }, [nodes]);

  const centerNodes = useCallback(
    (centerNodes: InternalGraphNode[], padding = PADDING, fill = false) => {
      if (
        centerNodes?.some(node => !isNodeInView(camera, node.position)) ||
        centerNodes?.length === nodes?.length
      ) {
        // Centers the graph based on the central most node
        const { minX, maxX, minY, maxY, minZ, maxZ, x, y, z } =
          getLayoutCenter(centerNodes);

        controls.setTarget(x, y, z);
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
      let padding = PADDING;

      if (nodeIds?.length) {
        // Get center padding + our default padding
        padding = centerPadding + PADDING;

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

      centerNodes(mappedNodes || nodes, padding, !!mappedNodes);
    },
    [centerNodes, nodes, centerPadding]
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
