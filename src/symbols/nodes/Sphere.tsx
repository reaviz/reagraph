import { a, useSpring } from '@react-spring/three';
import type { FC } from 'react';
import React, { useEffect, useMemo, useRef } from 'react';
import type { MeshPhongMaterial } from 'three';
import { Color, DoubleSide, SphereGeometry } from 'three';

import { useStore } from '../../store';
import type { NodeRendererProps } from '../../types';
import { animationConfig } from '../../utils/animation';
import { Ring } from '../Ring';

// All default sphere nodes use an identical unit-sphere geometry that is
// scaled per-node by the mesh transform, so we share a single geometry
// instance instead of allocating one BufferGeometry per node. On large
// graphs this avoids tens/hundreds of MB of duplicated GPU buffers.
// `dispose={null}` on the mesh keeps R3F from disposing this shared
// geometry when an individual node unmounts (we dispose the per-node
// material manually instead).
const SPHERE_GEOMETRY = new SphereGeometry(1, 25, 25);

export const Sphere: FC<NodeRendererProps> = ({
  color,
  id,
  size,
  selected,
  opacity = 1,
  animated
}) => {
  const { scale, nodeOpacity } = useSpring({
    from: {
      // Note: This prevents incorrect scaling w/ 0
      scale: [0.00001, 0.00001, 0.00001],
      nodeOpacity: 0
    },
    to: {
      scale: [size, size, size],
      nodeOpacity: opacity
    },
    config: {
      ...animationConfig,
      duration: animated ? undefined : 0
    }
  });
  const normalizedColor = useMemo(() => new Color(color), [color]);
  const theme = useStore(state => state.theme);

  // The geometry is shared (dispose={null}), so dispose the per-node
  // material ourselves when the node unmounts to avoid leaking it.
  const materialRef = useRef<MeshPhongMaterial | null>(null);
  useEffect(() => () => materialRef.current?.dispose(), []);

  return (
    <>
      <a.mesh
        userData={{ id, type: 'node' }}
        scale={scale as any}
        geometry={SPHERE_GEOMETRY}
        dispose={null}
      >
        <a.meshPhongMaterial
          ref={materialRef as any}
          attach="material"
          side={DoubleSide}
          transparent={true}
          fog={true}
          opacity={nodeOpacity}
          color={normalizedColor}
          emissive={normalizedColor}
          emissiveIntensity={0.7}
        />
      </a.mesh>
      <Ring
        opacity={selected ? 0.5 : 0}
        size={size}
        animated={animated}
        color={selected ? theme.ring.activeFill : theme.ring.fill}
      />
    </>
  );
};
