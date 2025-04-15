import { useThree } from '@react-three/fiber';
import { useCameraControls } from './useCameraControls';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { Vector3, Box3, PerspectiveCamera } from 'three';
import { getLayoutCenter } from '../utils/layout';
import { InternalGraphNode } from '../types';
import { useStore } from '../store';
import { isNodeInView, getDegreesToClosest2dAxis } from './utils';
import { LayoutTypes } from 'layout/types';

const PADDING = 50;

export interface CenterNodesParams {
  animated?: boolean;
  centerOnlyIfNodesNotInView?: boolean;
}

export interface FitNodesParams {
  animated?: boolean;
  fitOnlyIfNodesNotInView?: boolean;
}

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
  centerNodes: (nodes: InternalGraphNode[], opts: CenterNodesParams) => void;

  /**
   * Centers the graph on a specific node or list of nodes.
   *
   * @param nodeIds - An array of node IDs to center the graph on. If this parameter is omitted,
   * the graph will be centered on all nodes.
   *
   * @param opts.centerOnlyIfNodesNotInView - A boolean flag that determines whether the graph should
   * only be centered if the nodes specified by `ids` are not currently in view. If this
   * parameter is `true`, the graph will only be re-centered if one or more of the nodes
   * specified by `ids` are not currently in view. If this parameter is
   * `false` or omitted, the graph will be re-centered regardless of whether the nodes
   * are currently in view.
   */
  centerNodesById: (nodeIds: string[], opts?: CenterNodesParams) => void;

  /**
   * Fit all the given nodes into view of the camera.
   *
   * @param nodeIds - An array of node IDs to fit the view on. If this parameter is omitted,
   * the view will fit to all nodes.
   *
   * @param opts.fitOnlyIfNodesNotInView - A boolean flag that determines whether the view should
   * only be fit if the nodes specified by `ids` are not currently in view. If this
   * parameter is `true`, the view will only be fit if one or more of the nodes
   * specified by `ids` are not currently visible in the viewport. If this parameter is
   * `false` or omitted, the view will be fit regardless of whether the nodes
   * are currently in view.
   */
  fitNodesInViewById: (nodeIds: string[], opts?: FitNodesParams) => void;

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
    async (nodes, opts?: CenterNodesParams) => {
      const animated = opts?.animated !== undefined ? opts?.animated : true;
      const centerOnlyIfNodesNotInView =
        opts?.centerOnlyIfNodesNotInView !== undefined
          ? opts?.centerOnlyIfNodesNotInView
          : false;

      if (
        !mounted.current ||
        !centerOnlyIfNodesNotInView ||
        (centerOnlyIfNodesNotInView &&
          nodes?.some(node => !isNodeInView(camera, node.position)))
      ) {
        // Centers the graph based on the central most node
        const { x, y, z } = getLayoutCenter(nodes);

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

  const fitNodesInView = useCallback(
    async (
      nodes,
      opts: FitNodesParams = { animated: true, fitOnlyIfNodesNotInView: false }
    ) => {
      const { fitOnlyIfNodesNotInView } = opts;

      if (
        !fitOnlyIfNodesNotInView ||
        (fitOnlyIfNodesNotInView &&
          nodes?.some(node => !isNodeInView(camera, node.position)))
      ) {
        const { minX, maxX, minY, maxY, minZ, maxZ } = getLayoutCenter(nodes);

        if (!layoutType.includes('3d')) {
          // fitToBox will auto rotate to the closest axis including the z axis,
          // which is not desired for 2D graphs
          // So get the rotation to the closest flat axis for 2D graphs
          const { horizontalRotation, verticalRotation } =
            getDegreesToClosest2dAxis(
              controls?.azimuthAngle,
              controls?.polarAngle
            );

          void controls?.rotate(horizontalRotation, verticalRotation, true);
        }

        await controls?.zoomTo(1, opts?.animated);

        await controls?.fitToBox(
          new Box3(
            new Vector3(minX, minY, minZ),
            new Vector3(maxX, maxY, maxZ)
          ),
          opts?.animated,
          {
            cover: false,
            paddingLeft: PADDING,
            paddingRight: PADDING,
            paddingBottom: PADDING,
            paddingTop: PADDING
          }
        );
      }
    },
    [camera, controls, layoutType]
  );

  const getNodesById = useCallback(
    (nodeIds: string[]) => {
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

      return mappedNodes;
    },
    [nodes]
  );

  const centerNodesById = useCallback(
    (nodeIds: string[], opts: CenterNodesParams) => {
      const mappedNodes = getNodesById(nodeIds);

      centerNodes(mappedNodes || nodes, {
        animated,
        centerOnlyIfNodesNotInView: opts?.centerOnlyIfNodesNotInView
      });
    },
    [animated, centerNodes, getNodesById, nodes]
  );

  const fitNodesInViewById = useCallback(
    async (nodeIds: string[], opts: FitNodesParams) => {
      const mappedNodes = getNodesById(nodeIds);

      await fitNodesInView(mappedNodes || nodes, { animated, ...opts });
    },
    [animated, fitNodesInView, getNodesById, nodes]
  );

  useLayoutEffect(() => {
    async function load() {
      // Once we've loaded controls and we have nodes, let's recenter
      if (controls && nodes?.length) {
        if (!mounted.current) {
          // Center the graph once nodes are loaded on mount
          await centerNodes(nodes, { animated: false });
          await fitNodesInView(nodes, { animated: false });
          mounted.current = true;
        }
      }
    }

    load();
  }, [controls, centerNodes, nodes, animated, camera, fitNodesInView]);

  return { centerNodes, centerNodesById, fitNodesInViewById, isCentered };
};
