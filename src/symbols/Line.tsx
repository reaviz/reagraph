import React, { FC, useMemo, useRef } from 'react';
import { useSpring, a } from '@react-spring/three';
import { animationConfig, EdgeVector } from '../utils';
import * as THREE from 'three';

export interface LineProps {
  color?: string;
  size?: number;
  opacity?: number;
  points: EdgeVector;
}

export const Line: FC<LineProps> = ({ color, size, opacity, points }) => {
  const tubeRef = useRef<THREE.TubeBufferGeometry | null>(null);

  // Do opacity seperate from vertices for perf
  const { lineOpacity } = useSpring({
    from: {
      lineOpacity: 0
    },
    to: {
      lineOpacity: opacity
    },
    config: animationConfig
  });

  useSpring({
    from: {
      fromVertices: [0, 0, 0],
      toVertices: [0, 0, 0]
    },
    to: {
      fromVertices: [points.from?.x, points.from?.y, points.from?.z || 0],
      toVertices: [points.to?.x, points.to?.y, points.to?.z || 0]
    },
    onChange: event => {
      const { fromVertices, toVertices } = event.value;
      // Reference: https://bit.ly/3ORuuBP
      const t = new THREE.CatmullRomCurve3([
        new THREE.Vector3(...fromVertices),
        new THREE.Vector3(...toVertices)
      ]);

      tubeRef.current.copy(
        new THREE.TubeBufferGeometry(t, 20, size / 2, 5, false)
      );
    },
    config: animationConfig
  });

  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 0)
      ]),
    []
  );

  return (
    <mesh>
      <tubeBufferGeometry
        attach="geometry"
        args={[curve, 20, size / 2, 5, false]}
        ref={tubeRef}
      />
      <a.meshBasicMaterial
        attach="material"
        opacity={lineOpacity}
        fog={true}
        transparent={true}
        depthTest={false}
        color={color}
      />
    </mesh>
  );
};

Line.defaultProps = {
  color: '#000',
  size: 1,
  opacity: 1
};
