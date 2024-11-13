import { useCallback, useRef } from 'react';
import {
  BoxGeometry,
  BufferGeometry,
  CylinderGeometry,
  Quaternion,
  TubeGeometry,
  Vector3
} from 'three';
import { mergeBufferGeometries } from 'three-stdlib';

import { GraphState, useStore } from '../../store';
import { InternalGraphEdge } from '../../types';
import {
  getArrowSize,
  getArrowVectors,
  getVector,
  getCurve
} from '../../utils';
import { EdgeArrowPosition } from '../Arrow';
import { EdgeInterpolation } from '../Edge';

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
  interpolation: EdgeInterpolation
): UseEdgeGeometry {
  // We don't want to rerun everything when the state changes,
  // but we do want to use the most recent nodes whenever `getGeometries`
  // or `getGeometry` is run, so we store it in a ref:
  const stateRef = useRef<GraphState>();
  const theme = useStore(state => state.theme);
  useStore(state => {
    stateRef.current = state;
  });

  const geometryCacheRef = useRef(new Map<string, BufferGeometry>());

  // Add memoized geometries for arrows and null geometry
  const nullGeometryRef = useRef(new BoxGeometry(0, 0, 0));
  const baseArrowGeometryRef = useRef<CylinderGeometry>();

  const curved = interpolation === 'curved';
  const getGeometries = useCallback(
    (edges: Array<InternalGraphEdge>): Array<BufferGeometry> => {
      const geometries: Array<BufferGeometry> = [];
      const cache = geometryCacheRef.current;

      // Pre-compute values outside the loop
      const { nodes } = stateRef.current;
      const nodesMap = new Map(nodes.map(node => [node.id, node]));
      const labelFontSize = theme.edge.label.fontSize;

      // Initialize base arrow geometry if needed
      if (arrowPlacement !== 'none' && !baseArrowGeometryRef.current) {
        baseArrowGeometryRef.current = new CylinderGeometry(
          0,
          1,
          1,
          20,
          1,
          true
        );
      }

      edges.forEach(edge => {
        const { target, source, size = 1 } = edge;
        const from = nodesMap.get(source);
        const to = nodesMap.get(target);

        if (!from || !to) {
          return;
        }

        // Improved hash function to include size
        const hash = `${from.position.x},${from.position.y},${to.position.x},${to.position.y},${size}`;
        if (cache.has(hash)) {
          geometries.push(cache.get(hash));
          return;
        }

        const fromVector = getVector(from);
        const fromOffset = from.size + labelFontSize;
        const toVector = getVector(to);
        const toOffset = to.size + labelFontSize;
        let curve = getCurve(
          fromVector,
          fromOffset,
          toVector,
          toOffset,
          curved
        );

        let edgeGeometry = new TubeGeometry(curve, 20, size / 2, 5, false);

        if (arrowPlacement === 'none') {
          geometries.push(edgeGeometry);
          cache.set(hash, edgeGeometry);
          return;
        }

        // Reuse base arrow geometry and scale/rotate as needed
        const [arrowLength, arrowSize] = getArrowSize(size);
        const arrowGeometry = baseArrowGeometryRef.current.clone();
        arrowGeometry.scale(arrowSize, arrowLength, arrowSize);
        const [arrowPosition, arrowRotation] = getArrowVectors(
          arrowPlacement,
          curve,
          arrowLength
        );
        const quaternion = new Quaternion();
        quaternion.setFromUnitVectors(new Vector3(0, 1, 0), arrowRotation);
        arrowGeometry.applyQuaternion(quaternion);
        arrowGeometry.translate(
          arrowPosition.x,
          arrowPosition.y,
          arrowPosition.z
        );

        // Move edge so it doesn't stick through the arrow:
        if (arrowPlacement && arrowPlacement === 'end') {
          const curve = getCurve(
            fromVector,
            fromOffset,
            arrowPosition,
            0,
            curved
          );
          edgeGeometry = new TubeGeometry(curve, 20, size / 2, 5, false);
        }

        const merged = mergeBufferGeometries([edgeGeometry, arrowGeometry]);
        geometries.push(merged);
        cache.set(hash, merged);
      });
      return geometries;
    },
    [arrowPlacement, curved, theme.edge.label.fontSize]
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
