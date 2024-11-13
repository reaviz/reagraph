import React, { FC, useMemo, useRef, useEffect, useCallback } from 'react';
import { useSpring, a } from '@react-spring/three';
import { Color, ColorRepresentation, Mesh, DoubleSide, Vector3 } from 'three';
import { animationConfig } from '../utils';
import { useStore } from '../store';

export type EdgeArrowPosition = 'none' | 'mid' | 'end';

export interface ArrowProps {
  /**
   * Whether the arrow should be animated.
   */
  animated?: boolean;

  /**
   * The color of the arrow.
   */
  color?: ColorRepresentation;

  /**
   * The length of the arrow.
   */
  length: number;

  /**
   * The opacity of the arrow.
   */
  opacity?: number;

  /**
   * The position of the arrow in 3D space.
   */
  position: Vector3;

  /**
   * The rotation of the arrow in 3D space.
   */
  rotation: Vector3;

  /**
   * The size of the arrow.
   */
  size: number;

  /**
   * A function that is called when the arrow is right-clicked.
   */
  onContextMenu?: () => void;

  /**
   * A function that is called when the arrow is selected or deselected.
   */
  onActive?: (state: boolean) => void;
}

export const Arrow: FC<ArrowProps> = ({
  animated,
  color = '#D8E6EA',
  length,
  opacity = 0.5,
  position,
  rotation,
  size = 1,
  onActive,
  onContextMenu
}) => {
  const normalizedColor = useMemo(() => new Color(color), [color]);
  const meshRef = useRef<Mesh | null>(null);
  const isDragging = useStore(state => state.draggingIds.length > 0);
  const center = useStore(state => state.centerPosition);

  const [{ pos, arrowOpacity }] = useSpring(
    () => ({
      from: {
        pos: center ? [center.x, center.y, center.z] : [0, 0, 0],
        arrowOpacity: 0
      },
      to: {
        pos: [position.x, position.y, position.z],
        arrowOpacity: opacity
      },
      config: {
        ...animationConfig,
        duration: animated && !isDragging ? undefined : 0
      }
    }),
    [animated, isDragging, opacity, position]
  );

  const setQuaternion = useCallback(() => {
    const axis = new Vector3(0, 1, 0);
    meshRef.current?.quaternion.setFromUnitVectors(axis, rotation);
  }, [rotation, meshRef]);

  useEffect(() => setQuaternion(), [setQuaternion]);

  return (
    <a.mesh
      position={pos as any}
      ref={meshRef}
      scale={[1, 1, 1]}
      onPointerOver={() => onActive(true)}
      onPointerOut={() => onActive(false)}
      onPointerDown={event => {
        // context menu controls
        if (event.nativeEvent.buttons === 2) {
          event.stopPropagation();
          onContextMenu();
        }
      }}
    >
      <cylinderGeometry
        args={[0, size, length, 20, 1, true]}
        attach="geometry"
      />
      <a.meshBasicMaterial
        attach="material"
        color={normalizedColor}
        depthTest={false}
        opacity={arrowOpacity}
        transparent={true}
        side={DoubleSide}
        fog={true}
      />
    </a.mesh>
  );
};
