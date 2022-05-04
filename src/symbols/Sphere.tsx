import React, { FC } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion-3d';
import { animationConfig } from '../utils/animation';

export interface SphereProps {
  size?: number;
  color?: string;
  opacity?: number;
  animated?: boolean;
  onActive?: (active: boolean) => void;
  onClick?: () => void;
  onContextMenu?: () => void;
}

export const Sphere: FC<SphereProps> = ({
  color,
  size,
  animated,
  opacity,
  onActive,
  onClick,
  onContextMenu
}) => (
  <motion.mesh
    initial={{
      scale: [0.00001, 0.00001, 0.00001]
    }}
    animate={{
      scale: [size, size, size]
    }}
    transition={{
      ...animationConfig,
      type: animated ? 'spring' : false
    }}
    onClick={onClick}
    onPointerDown={event => {
      // context menu controls
      if (event.nativeEvent.buttons === 2) {
        onContextMenu();
      }
    }}
    onPointerOver={() => {
      onActive?.(true);
      document.body.style['cursor'] = 'pointer';
    }}
    onPointerOut={() => {
      onActive?.(false);
      document.body.style['cursor'] = 'inherit';
    }}
  >
    <sphereBufferGeometry attach="geometry" args={[1, 25, 25]} />
    <motion.meshPhongMaterial
      attach="material"
      side={THREE.DoubleSide}
      transparent={true}
      fog={true}
      initial={{
        color,
        opacity: 0
      }}
      animate={{
        color,
        opacity
      }}
      transition={{
        ...animationConfig,
        type: animated ? 'spring' : false
      }}
    />
  </motion.mesh>
);

Sphere.defaultProps = {
  opacity: 1,
  active: false,
  selected: false
};
