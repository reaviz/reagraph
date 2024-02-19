import { useThree } from '@react-three/fiber';
import { useCameraControls } from './useCameraControls';
import { useCallback, useLayoutEffect, useRef } from 'react';
import { Vector3, Box3, PerspectiveCamera } from 'three';
import { useHotkeys } from 'reakeys';
import { getLayoutCenter } from '../utils/layout';
import { InternalGraphNode } from '../types';
import { useStore } from '../store';
import { isNodeInView } from './utils';

const PADDING = 50;

export interface CenterGraphInput {
  /**
   * Whether the animate the transition or not.
   */
  animated?: boolean;

  /**
   * Whether the center graph function is disabled or not.
   */
  disabled?: boolean;
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
  animated,
  disabled
}: CenterGraphInput): CenterGraphOutput => {
  const nodes = useStore(state => state.nodes);
  const invalidate = useThree(state => state.invalidate);
  const { controls } = useCameraControls();
  const camera = useThree(state => state.camera) as PerspectiveCamera;

  const centerNodes = useCallback(
    async (centerNodes: InternalGraphNode[]) => {
      if (
        centerNodes?.some(node => !isNodeInView(camera, node.position)) ||
        centerNodes?.length === nodes?.length
      ) {
        // Centers the graph based on the central most node
        const { minX, maxX, minY, maxY, minZ, maxZ, x, y, z } =
          getLayoutCenter(centerNodes);

        await controls?.fitToBox(
          new Box3(
            new Vector3(minX, minY, minZ),
            new Vector3(maxX, maxY, maxZ)
          ),
          animated,
          {
            cover: false,
            paddingLeft: PADDING,
            paddingRight: PADDING,
            paddingBottom: PADDING,
            paddingTop: PADDING
          }
        );
        await controls.setTarget(x, y, z, animated);

        invalidate();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    async function load() {
      // Center the graph once nodes are loaded on mount
      if (controls && nodes?.length && !mounted.current) {
        await centerNodes(nodes);
        mounted.current = true;
      }
    }

    load();
  }, [controls, centerNodes, nodes]);

  useHotkeys([
    {
      name: 'Center',
      disabled,
      category: 'Graph',
      keys: ['command+shift+c'],
      callback: () => centerNodes(nodes)
    }
  ]);

  return { centerNodes, centerNodesById };
};
