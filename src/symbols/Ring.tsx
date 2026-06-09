import { a, useSpring } from '@react-spring/three';
import { Billboard } from '@react-three/drei';
import type { FC } from 'react';
import React, { useEffect, useMemo, useRef } from 'react';
import type { ColorRepresentation, MeshBasicMaterial } from 'three';
import { Color, DoubleSide, RingGeometry } from 'three';

import { animationConfig } from '../utils/animation';

// Ring geometries only depend on their radius/segment args, which are
// almost always the same across every node's selection ring. Cache and
// share one geometry per unique arg combination instead of allocating one
// per node. Shared geometries are guarded with `dispose={null}`.
const ringGeometryCache = new Map<string, RingGeometry>();
const getRingGeometry = (
  innerRadius: number,
  outerRadius: number,
  segments: number
): RingGeometry => {
  const key = `${innerRadius}|${outerRadius}|${segments}`;
  let geometry = ringGeometryCache.get(key);
  if (!geometry) {
    geometry = new RingGeometry(innerRadius, outerRadius, segments);
    ringGeometryCache.set(key, geometry);
  }
  return geometry;
};

export interface RingProps {
  /**
   * The color of the ring.
   *
   * @default '#D8E6EA'
   */
  color?: ColorRepresentation;

  /**
   * Whether the ring should be animated.
   */
  animated?: boolean;

  /**
   * The size of the ring.
   *
   * @default 1
   */
  size?: number;

  /**
   * The opacity of the ring.
   *
   * @default 0.5
   */
  opacity?: number;

  /**
   * The stroke width of the ring.
   *
   * @default 5
   */
  strokeWidth?: number;

  /**
   * The inner radius of the ring.
   *
   * @default 4
   */
  innerRadius?: number;

  /**
   * The number of segments in the ring geometry.
   *
   * @default 25
   */
  segments?: number;
}

export const Ring: FC<RingProps> = ({
  color = '#D8E6EA',
  size = 1,
  opacity = 0.5,
  animated,
  strokeWidth = 5,
  innerRadius = 4,
  segments = 25
}) => {
  const normalizedColor = useMemo(() => new Color(color), [color]);

  const { ringSize, ringOpacity } = useSpring({
    from: {
      ringOpacity: 0,
      ringSize: [0.00001, 0.00001, 0.00001]
    },
    to: {
      ringOpacity: opacity,
      ringSize: [size / 2, size / 2, 1]
    },
    config: {
      ...animationConfig,
      duration: animated ? undefined : 0
    }
  });

  const strokeWidthFraction = strokeWidth / 10;
  const outerRadius = innerRadius + strokeWidthFraction;

  const geometry = useMemo(
    () => getRingGeometry(innerRadius, outerRadius, segments),
    [innerRadius, outerRadius, segments]
  );

  // The geometry is shared (dispose={null}), so dispose the per-ring
  // material ourselves on unmount.
  const materialRef = useRef<MeshBasicMaterial | null>(null);
  useEffect(() => () => materialRef.current?.dispose(), []);

  return (
    <Billboard position={[0, 0, 1]}>
      <a.mesh
        scale={ringSize as any}
        geometry={geometry}
        dispose={null}
        // Disabling raycast/pointer events when ring is invisible (opacity = 0)
        // This prevents invisible rings highlighting parent nodes when hovered over
        raycast={opacity > 0 ? undefined : () => []}
      >
        <a.meshBasicMaterial
          ref={materialRef as any}
          attach="material"
          color={normalizedColor}
          transparent={true}
          depthTest={false}
          opacity={ringOpacity}
          side={DoubleSide}
          fog={true}
        />
      </a.mesh>
    </Billboard>
  );
};
