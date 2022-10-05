import { useCallback, useRef } from 'react';
import {
  BoxGeometry,
  BufferGeometry,
  CatmullRomCurve3,
  CylinderGeometry,
  Quaternion,
  TubeBufferGeometry,
  Vector3
} from 'three';
import { mergeBufferGeometries } from 'three-stdlib';

import { GraphState, useStore } from '../../store';
import { InternalGraphEdge } from '../../types';
import {
  getArrowPosition,
  getMidPoint,
  getPoints,
  getQuaternion
} from '../../utils';
import { EdgeArrowPosition, LABEL_FONT_SIZE } from './Edge';

export type UseEdgeGeometry = {
  getGeometries(edges: Array<InternalGraphEdge>): Array<BufferGeometry>;
  getGeometry(
    active: Array<InternalGraphEdge>,
    inactive: Array<InternalGraphEdge>
  ): BufferGeometry;
};

const NULL_GEOMETRY = new BoxGeometry(0, 0, 0);

export function useEdgeGeometry(
  arrowPlacement: EdgeArrowPosition
): UseEdgeGeometry {
  // We don't want to rerun everything when the state changes,
  // but we do want to use the most recent nodes whenever `getGeometries`
  // or `getGeometry` is run, so we store it in a ref:
  const stateRef = useRef<GraphState>();
  useStore(state => {
    stateRef.current = state;
  });

  const geometryCacheRef = useRef(new Map<string, BufferGeometry>());

  const getGeometries = useCallback(
    (edges: Array<InternalGraphEdge>): Array<BufferGeometry> => {
      const geometries: Array<BufferGeometry> = [];
      const cache = geometryCacheRef.current;

      const { nodes } = stateRef.current;

      edges.forEach(edge => {
        const { toId, fromId, size = 1 } = edge;

        const from = nodes.find(node => node.id === fromId);
        const to = nodes.find(node => node.id === toId);

        if (!from || !to) {
          return;
        }

        // Create hash so geometry can be reused if edge doesn't move:
        const hash = `fromX:${from.position.x},fromY:${from.position.y},toX:${to.position.x}},toY:${to.position.y}`;
        if (cache.has(hash)) {
          const geometry = cache.get(hash);
          geometries.push(geometry);
          return;
        }

        // Handle arrow position offset
        const offset = arrowPlacement === 'end' ? to.size : 0;
        const curvePoints = getPoints({
          from,
          to: { ...to, size: offset + size + LABEL_FONT_SIZE }
        });

        const fromVertices = [
          curvePoints.from?.x,
          curvePoints.from?.y,
          curvePoints.from?.z || 0
        ];
        const toVertices = [
          curvePoints.to?.x,
          curvePoints.to?.y,
          curvePoints.to?.z || 0
        ];

        const curve = new CatmullRomCurve3([
          new Vector3(...fromVertices),
          new Vector3(...toVertices)
        ]);
        const edgeGeometry = new TubeBufferGeometry(
          curve,
          20,
          size / 2,
          5,
          false
        );

        if (arrowPlacement === 'none') {
          geometries.push(edgeGeometry);
          cache.set(hash, edgeGeometry);
          return;
        }

        const arrowPoints = getPoints({ from, to });

        const arrowLength = size + 6;
        const arrowSize = 2 + size / 1.5;

        let position =
          arrowPlacement === 'mid'
            ? getMidPoint(arrowPoints)
            : getArrowPosition(arrowPoints, arrowLength);

        const [fromVector, toVector] = getQuaternion(arrowPoints);
        const quaternion = new Quaternion();
        quaternion.setFromUnitVectors(fromVector, toVector);

        const arrowGeometry = new CylinderGeometry(
          0,
          arrowSize,
          arrowLength,
          20,
          1,
          true
        );
        arrowGeometry.applyQuaternion(quaternion);
        arrowGeometry.translate(position.x, position.y, position.z);

        const merged = mergeBufferGeometries([edgeGeometry, arrowGeometry]);
        geometries.push(merged);
        cache.set(hash, merged);
      });
      return geometries;
    },
    [arrowPlacement]
  );

  const getGeometry = useCallback(
    (
      active: Array<InternalGraphEdge>,
      inactive: Array<InternalGraphEdge>
    ): BufferGeometry => {
      const activeGeometries = getGeometries(active);
      const inactiveGeometries = getGeometries(inactive);

      return mergeBufferGeometries(
        [
          inactiveGeometries.length
            ? mergeBufferGeometries(inactiveGeometries)
            : NULL_GEOMETRY,
          activeGeometries.length
            ? mergeBufferGeometries(activeGeometries)
            : NULL_GEOMETRY
        ],
        true
      );
    },
    [getGeometries]
  );

  return {
    getGeometries,
    getGeometry
  };
}
