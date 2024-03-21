import { useThree } from '@react-three/fiber';
import { useCameraControls } from './useCameraControls';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { Vector3, Box3, PerspectiveCamera } from 'three';
import { useHotkeys } from 'reakeys';
import { getLayoutCenter } from '../utils/layout';
import { InternalGraphNode } from '../types';
import { useStore } from '../store';
import { isNodeInView, getDegreesToClosest2dAxis } from './utils';
import { LayoutTypes } from 'layout/types';

const PADDING = 50;

export type CenterNodesParams = {
  nodes?: InternalGraphNode[];
  animated?: boolean;
  centerOnlyIfNodesNotInView?: boolean;
};

export type CenterNodesByIdParams = {
  nodeIds?: string[];
  centerOnlyIfNodesNotInView?: boolean;
};

export interface CenterGraphInput {
  /**
   * Whether the animate the transition or not.
   */
  animated?: boolean;

  /**
   * Whether the center graph function is disabled or not.
   */
  disabled?: boolean;

  /**
   * The layout type of the graph used to determine rotation logic.
   */
  layoutType: LayoutTypes;
}

export interface CenterGraphOutput {
  /**
   * Centers the graph on a specific node or list of nodes.
   *
   * @param nodes - An array of `InternalGraphNode` objects to center the graph on. If this parameter is omitted,
   * the graph will be centered on all nodes.
   *
   * @param animated - A boolean flag that determines whether the centering action should be animated.
   *
   * @param centerOnlyIfNodesNotInView - A boolean flag that determines whether the graph should
   * only be centered if the nodes specified by `nodes` are not currently in view. If this
   * parameter is `true`, the graph will only be re-centered if one or more of the nodes
   * specified by `nodes` are not currently visible in the viewport. If this parameter is
   * `false` or omitted, the graph will be re-centered regardless of whether the nodes
   * are currently in view.
   */
  centerNodes: ({
    nodes,
    animated,
    centerOnlyIfNodesNotInView
  }: CenterNodesParams) => void;

  /**
   * Centers the graph on a specific node or list of nodes.
   *
   * @param ids - An array of node IDs to center the graph on. If this parameter is omitted,
   * the graph will be centered on all nodes.
   *
   * @param centerOnlyIfNodesNotInView - A boolean flag that determines whether the graph should
   * only be centered if the nodes specified by `ids` are not currently in view. If this
   * parameter is `true`, the graph will only be re-centered if one or more of the nodes
   * specified by `ids` are not currently in view. If this parameter is
   * `false` or omitted, the graph will be re-centered regardless of whether the nodes
   * are currently in view.
   */
  centerNodesById: ({
    nodeIds,
    centerOnlyIfNodesNotInView
  }: CenterNodesByIdParams) => void;

  /**
   * Whether the graph is centered or not.
   */
  isCentered?: boolean;
}

export const useCenterGraph = ({
  animated,
  disabled,
  layoutType
}: CenterGraphInput): CenterGraphOutput => {
  const nodes = useStore(state => state.nodes);
  const [isCentered, setIsCentered] = useState<boolean>(false);
  const invalidate = useThree(state => state.invalidate);
  const { controls } = useCameraControls();
  const camera = useThree(state => state.camera) as PerspectiveCamera;
  const mounted = useRef<boolean>(false);

  const centerNodes = useCallback(
    async ({
      nodes,
      animated = true,
      centerOnlyIfNodesNotInView = false
    }: CenterNodesParams) => {
      if (
        !mounted.current ||
        !centerOnlyIfNodesNotInView ||
        (centerOnlyIfNodesNotInView &&
          nodes?.some(node => !isNodeInView(camera, node.position)))
      ) {
        // Centers the graph based on the central most node
        const { minX, maxX, minY, maxY, minZ, maxZ, x, y, z } =
          getLayoutCenter(nodes);

        if (!layoutType.includes('3d')) {
          // fitToBox will auto rotate to the closest axis including the z axis, which is not desired for 2D graphs
          // So get the rotation to the closest flat axis for 2D graphs
          const { horizontalRotation, verticalRotation } =
            getDegreesToClosest2dAxis(
              controls?.azimuthAngle,
              controls?.polarAngle
            );

          void controls?.rotate(horizontalRotation, verticalRotation, true);
        }

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

        if (!isCentered) {
          setIsCentered(true);
        }

        invalidate();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [invalidate, controls, nodes]
  );

  const centerNodesById = useCallback(
    ({
      nodeIds,
      centerOnlyIfNodesNotInView
    }: {
      nodeIds?: string[];
      centerOnlyIfNodesNotInView?: boolean;
    }) => {
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

      centerNodes({
        nodes: mappedNodes || nodes,
        animated,
        centerOnlyIfNodesNotInView
      });
    },
    [animated, centerNodes, nodes]
  );

  useLayoutEffect(() => {
    async function load() {
      // Once we've loaded controls and we have nodes, let's recenter
      if (controls && nodes?.length) {
        if (!mounted.current) {
          // Center the graph once nodes are loaded on mount
          await centerNodes({ nodes, animated: false });
          mounted.current = true;
        } else {
          // If node positions have changed and some aren't in view, center the graph
          await centerNodes({
            nodes,
            animated,
            centerOnlyIfNodesNotInView: true
          });
        }
      }
    }

    load();
  }, [controls, centerNodes, nodes, animated, camera]);

  useHotkeys([
    {
      name: 'Center',
      disabled,
      category: 'Graph',
      keys: ['command+shift+c'],
      callback: () => centerNodes({ nodes })
    }
  ]);

  return { centerNodes, centerNodesById, isCentered };
};
