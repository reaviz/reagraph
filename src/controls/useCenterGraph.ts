import { useThree } from '@react-three/fiber';
import { useControls } from '../controls';
import { useCallback, useEffect } from 'react';
import * as THREE from 'three';
import { useHotkeys } from 'reakeys';
import { getLayoutCenter } from '../utils/layout';
import { InternalGraphNode } from '../types';

const PADDING = 50;

export interface CenterGraphInput {
  nodes: InternalGraphNode[];
}

export interface CenterGraphOutput {
  centerNodes: (nodes: InternalGraphNode[]) => void;
}

export const useCenterGraph = ({
  nodes
}: CenterGraphInput): CenterGraphOutput => {
  const { invalidate } = useThree();
  const { controls } = useControls();

  const centerNodes = useCallback(
    (centerNodes: any[], factor: number = 0) => {
      requestAnimationFrame(() => {
        // Centers the graph based on the central most node
        const { minX, maxX, minY, maxY, minZ, maxZ } =
          getLayoutCenter(centerNodes);

        controls?.fitToBox(
          new THREE.Box3(
            new THREE.Vector3(minX, minY, minZ + factor),
            new THREE.Vector3(maxX, maxY, maxZ + factor)
          ),
          true,
          {
            paddingLeft: PADDING,
            paddingRight: PADDING,
            paddingBottom: PADDING,
            paddingTop: PADDING
          }
        );

        invalidate();
      });
    },
    [invalidate, controls]
  );

  // On load of graph, listen for center events and center the graph
  useEffect(() => {
    if (controls && nodes?.length) {
      centerNodes(nodes);
    }
  }, [controls, centerNodes, nodes]);

  useHotkeys([
    {
      name: 'Center',
      keys: ['command+shift+c'],
      callback: () => centerNodes(nodes)
    }
  ]);

  return { centerNodes };
};
