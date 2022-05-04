import React, { FC, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  getQuaternion,
  getMidPoint,
  getEndPoint,
  EdgeVectors3,
  animationConfig
} from '../utils';
import { motion } from 'framer-motion-3d';

export interface ArrowProps {
  position: EdgeVectors3;
  color?: string;
  animated?: boolean;
  opacity?: number;
  size?: number;
  placement?: 'mid' | 'end';
}

export const Arrow: FC<ArrowProps> = ({
  position,
  size,
  animated,
  opacity,
  placement,
  color
}) => {
  const meshRef = useRef<any | null>(null);
  const quaternion = useMemo(() => getQuaternion(position), [position]);

  const endPos = useMemo(() => {
    if (placement === 'mid') {
      return getMidPoint(position);
    } else {
      // TODO: Improve this
      return getEndPoint(position);
    }
  }, [position, placement]);

  const setQuaternion = useCallback(() => {
    meshRef.current?.quaternion.setFromUnitVectors(
      quaternion[0],
      quaternion[1]
    );
  }, [quaternion, meshRef]);

  useEffect(() => setQuaternion(), [position, setQuaternion]);

  return (
    <motion.mesh
      ref={meshRef}
      initial={{
        x: 0,
        y: 0,
        z: 0,
        scale: [0.00001, 0.00001, 0.00001]
      }}
      animate={{
        x: endPos.x,
        y: endPos.y,
        z: endPos.z,
        scale: [size, size, size]
      }}
      transition={{
        ...animationConfig,
        type: animated ? 'spring' : false
      }}
    >
      <cylinderGeometry args={[0, 3, 7, 20, 20, false]} attach="geometry" />
      <motion.meshBasicMaterial
        attach="material"
        color={color}
        depthTest={false}
        transparent={true}
        fog={true}
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
      />
    </motion.mesh>
  );
};

Arrow.defaultProps = {
  size: 1,
  opacity: 0.5,
  placement: 'end',
  color: '#D8E6EA'
};
