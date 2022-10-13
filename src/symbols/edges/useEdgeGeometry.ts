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
import { getCurvePoints } from '../../utils';
import { EdgeArrowPosition, getArrowSize, getArrowVectors } from '../Arrow';
import { EdgeShape } from '../Edge';

export type UseEdgeGeometry = {
  getGeometries(edges: Array<InternalGraphEdge>): Array<BufferGeometry>;
  getGeometry(
    active: Array<InternalGraphEdge>,
    inactive: Array<InternalGraphEdge>
  ): BufferGeometry;
};

const NULL_GEOMETRY = new BoxGeometry(0, 0, 0);

export function useEdgeGeometry(
  arrowPlacement: EdgeArrowPosition,
  shape: EdgeShape
): UseEdgeGeometry {
  // We don't want to rerun everything when the state changes,
  // but we do want to use the most recent nodes whenever `getGeometries`
  // or `getGeometry` is run, so we store it in a ref:
  const stateRef = useRef<GraphState>();
  useStore(state => {
    stateRef.current = state;
  });

  const geometryCacheRef = useRef(new Map<string, BufferGeometry>());

  const curved = shape === 'curve';
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

        const fromVector = new Vector3(
          from?.position.x,
          from?.position.y,
          from?.position.z || 0
        );
        const toVector = new Vector3(
          to?.position.x,
          to?.position.y,
          to?.position.z || 0
        );

        const curve = curved
          ? new CatmullRomCurve3(getCurvePoints(fromVector, toVector))
          : new CatmullRomCurve3([fromVector, toVector]);

        let edgeGeometry = new TubeBufferGeometry(
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

        const [arrowLength, arrowSize] = getArrowSize(size);

        const [arrowPosition, arrowRotation] = getArrowVectors(
          arrowPlacement,
          curve,
          arrowLength,
          from.size
        );
        const quaternion = new Quaternion();
        quaternion.setFromUnitVectors(new Vector3(0, 1, 0), arrowRotation);

        const arrowGeometry = new CylinderGeometry(
          0,
          arrowSize,
          arrowLength,
          20,
          1,
          true
        );
        arrowGeometry.applyQuaternion(quaternion);
        arrowGeometry.translate(
          arrowPosition.x,
          arrowPosition.y,
          arrowPosition.z
        );

        // Move edge so it doesn't stick through the arrow:
        if (arrowPlacement && arrowPlacement === 'end') {
          const curve = curved
            ? new CatmullRomCurve3(getCurvePoints(fromVector, arrowPosition))
            : new CatmullRomCurve3([fromVector, arrowPosition]);
          edgeGeometry = new TubeBufferGeometry(curve, 20, size / 2, 5, false);
        }

        const merged = mergeBufferGeometries([edgeGeometry, arrowGeometry]);
        geometries.push(merged);
        cache.set(hash, merged);
      });
      return geometries;
    },
    [arrowPlacement, curved]
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
