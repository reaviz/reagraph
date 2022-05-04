import React, { FC, useMemo } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion-3d';
import { animationConfig } from '../utils/animation';

export interface IconProps {
  image: string;
  opacity?: number;
  animated?: boolean;
  size?: number;
  onActive?: (state: boolean) => void;
  onClick?: () => void;
  onContextMenu?: () => void;
}

export const Icon: FC<IconProps> = ({
  image,
  size,
  opacity,
  animated,
  onActive,
  onClick,
  onContextMenu
}) => {
  const texture = useMemo(() => new THREE.TextureLoader().load(image), [image]);

  return (
    <motion.sprite
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
        onActive(true);
        document.body.style['cursor'] = 'pointer';
      }}
      onPointerOut={() => {
        onActive(false);
        document.body.style['cursor'] = 'inherit';
      }}
    >
      <motion.spriteMaterial
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
        attach="material"
        fog={true}
        depthTest={false}
        transparent={true}
      >
        <primitive
          attach="map"
          object={texture}
          minFilter={THREE.LinearFilter}
        />
      </motion.spriteMaterial>
    </motion.sprite>
  );
};

Icon.defaultProps = {
  opacity: 1
};
