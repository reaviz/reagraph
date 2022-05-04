import React, { FC, useRef, useMemo, useEffect } from 'react';
import { animationConfig, EdgeVectors3 } from '../utils';
import * as THREE from 'three';
import { motion } from 'framer-motion-3d';
import { useMotionValue } from 'framer-motion';

export interface LineProps {
  color?: string;
  size?: number;
  animated?: boolean;
  opacity?: number;
  points: EdgeVectors3;
}

export const Line: FC<LineProps> = ({
  color,
  size,
  opacity,
  points,
  animated
}) => {
  const tubeRef = useRef<THREE.TubeBufferGeometry | null>(null);
  const x = useMotionValue([0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    x.set([
      points.from?.x,
      points.from?.y,
      points.from?.z || 0,
      points.to?.x,
      points.to?.y,
      points.to?.z || 0
    ]);
  });

  useEffect(() => {
    const unsub = x.onChange(latest => {
      // Reference: https://bit.ly/3ORuuBP
      const t = new THREE.CatmullRomCurve3([
        new THREE.Vector3(latest[0], latest[1], latest[2]),
        new THREE.Vector3(latest[3], latest[4], latest[5])
      ]);

      tubeRef.current?.copy(
        new THREE.TubeBufferGeometry(t, 20, size / 2, 5, false)
      );
    });

    return () => unsub();
  }, [size, x]);

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
      <motion.meshBasicMaterial
        attach="material"
        initial={{
          opacity: 0
        }}
        animate={{
          opacity
        }}
        transition={{
          ...animationConfig,
          type: animated ? 'spring' : false
        }}
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
