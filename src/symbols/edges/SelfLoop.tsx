import React, { FC, useMemo } from 'react';
import { Color, ColorRepresentation } from 'three';
import { useSpring, a } from '@react-spring/three';
import { animationConfig } from 'utils/animation';
import { ThreeEvent } from '@react-three/fiber';

export interface SelfLoopProps {
  /**
   * The unique identifier of the edge.
   */
  id: string;

  /**
   * The color of the edge.
   */
  curve: any;

  /**
   * The size of the edge.
   */
  size: number;

  /**
   * The color of the edge.
   */
  color?: ColorRepresentation;

  /**
   * The opacity of the edge.
   */
  opacity: number;

  /**
   * Whether the edge is animated.
   */
  animated?: boolean;

  /**
   * A function that is called when the mouse pointer is moved over the line.
   */
  onPointerOver?: (event: ThreeEvent<PointerEvent>) => void;

  /**
   * A function that is called when the mouse pointer is moved out of the line.
   */
  onPointerOut?: (event: ThreeEvent<PointerEvent>) => void;

  /**
   * A function that is called when the line is clicked.
   */
  onClick?: (event: ThreeEvent<MouseEvent>) => void;

  /**
   * A function that is called when the line is right-clicked.
   */
  onContextMenu?: () => void;
}

export const SelfLoop: FC<SelfLoopProps> = ({
  id,
  curve,
  opacity = 1,
  size = 1,
  color = '#000',
  animated,
  onPointerOver,
  onPointerOut,
  onClick,
  onContextMenu
}) => {
  const { scale, loopOpacity } = useSpring({
    from: {
      // Note: This prevents incorrect scaling w/ 0
      scale: [0.00001, 0.00001, 0.00001],
      loopOpacity: 0
    },
    to: {
      scale: [size, size, size],
      loopOpacity: opacity
    },
    config: {
      ...animationConfig,
      duration: animated ? undefined : 0
    }
  });
  const normalizedColor = useMemo(() => new Color(color), [color]);

  return (
    <a.mesh
      userData={{ id, type: 'edge' }}
      renderOrder={-1}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      onClick={onClick}
      onPointerDown={event => {
        if (event.nativeEvent.buttons === 2) {
          event.nativeEvent.preventDefault();
          event.stopPropagation();
          onContextMenu();
        }
      }}
      scale={scale as any}
    >
      <tubeGeometry attach="geometry" args={[curve, 128, size / 2, 8, true]} />
      <a.meshBasicMaterial
        attach="material"
        opacity={loopOpacity}
        fog={true}
        transparent={true}
        depthTest={false}
        color={normalizedColor}
      />
    </a.mesh>
  );
};
