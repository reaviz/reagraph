import React, { FC } from 'react';
import * as THREE from 'three';
import { animationConfig } from '../utils/animation';
import { Billboard } from '@react-three/drei';
import { motion } from 'framer-motion-3d';

export interface RingProps {
  color?: string;
  animated?: boolean;
  size?: number;
  opacity?: number;
}

export const Ring: FC<RingProps> = ({ color, size, opacity, animated }) => (
  <Billboard position={[0, 0, 1]}>
    <motion.mesh
      initial={{
        scale: [0.00001, 0.00001, 0.00001]
      }}
      animate={{
        scale: [size / 2, size / 2, 1]
      }}
      transition={{
        ...animationConfig,
        type: animated ? 'spring' : false
      }}
    >
      <ringBufferGeometry attach="geometry" args={[4, 4.5, 25]} />
      <motion.meshBasicMaterial
        attach="material"
        color={color}
        transparent={true}
        depthTest={false}
        side={THREE.DoubleSide}
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
  </Billboard>
);

Ring.defaultProps = {
  color: '#D8E6EA',
  size: 1,
  opacity: 0.5
};
