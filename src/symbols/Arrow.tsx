import React, { FC, useMemo, useRef, useEffect, useCallback } from 'react';
import { useSpring, a } from '@react-spring/three';
import { Color, ColorRepresentation, Mesh, DoubleSide, Vector3 } from 'three';
import { animationConfig } from '../utils';
import { useStore } from '../store';

export type EdgeArrowPosition = 'none' | 'mid' | 'end';

export interface ArrowProps {
  animated?: boolean;
  color?: ColorRepresentation;
  length: number;
  opacity?: number;
  position: Vector3;
  rotation: Vector3;
  size: number;
  onContextMenu?: () => void;
  onActive?: (state: boolean) => void;
}

export const Arrow: FC<ArrowProps> = ({
  animated,
  color,
  length,
  opacity,
  position,
  rotation,
  size,
  onActive,
  onContextMenu
}) => {
  const normalizedColor = useMemo(() => new Color(color), [color]);
  const meshRef = useRef<Mesh | null>(null);
  const draggingId = useStore(state => state.draggingId);

  const [{ pos, arrowOpacity }] = useSpring(
    () => ({
      from: {
        pos: [0, 0, 0],
        arrowOpacity: 0
      },
      to: {
        pos: [position.x, position.y, position.z],
        arrowOpacity: opacity
      },
      config: {
        ...animationConfig,
        duration: animated && !draggingId ? undefined : 0
      }
    }),
    [animated, draggingId, opacity, position]
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

Arrow.defaultProps = {
  size: 1,
  opacity: 0.5,
  color: '#D8E6EA'
};
