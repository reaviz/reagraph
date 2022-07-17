import React, { FC, useMemo, useRef, useEffect, useCallback } from 'react';
import { useSpring, a } from '@react-spring/three';
import { Color, ColorRepresentation, Mesh, DoubleSide } from 'three';
import {
  getQuaternion,
  animationConfig,
  getMidPoint,
  getArrowPosition,
  EdgeVectors3
} from '../utils';
import { useStore } from '../store';

export interface ArrowProps {
  position: EdgeVectors3;
  color?: ColorRepresentation;
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
  const normalizedColor = useMemo(() => new Color(color), [color]);
  const meshRef = useRef<Mesh | null>(null);
  const quaternion = useMemo(() => getQuaternion(position), [position]);
  const draggingId = useStore(state => state.draggingId);
  const [arrowLength, arrowSize] = useMemo(
    () => [size + 6, 2 + size / 1.5],
    [size]
  );

  const endPos = useMemo(() => {
    if (placement === 'mid') {
      return getMidPoint(position);
    } else {
      return getArrowPosition(position, arrowLength);
    }
  }, [position, placement, arrowLength]);

  const [{ pos, arrowOpacity }] = useSpring(
    () => ({
      from: {
        pos: [0, 0, 0],
        arrowOpacity: 0
      },
      to: {
        pos: [endPos.x, endPos.y, endPos.z],
        arrowOpacity: opacity
      },
      config: {
        ...animationConfig,
        duration: animated && !draggingId ? undefined : 0
      }
    }),
    [animated, draggingId, opacity, endPos]
  );

  const setQuaternion = useCallback(() => {
    meshRef.current?.quaternion.setFromUnitVectors(
      quaternion[0],
      quaternion[1]
    );
  }, [quaternion, meshRef]);

  useEffect(() => setQuaternion(), [position, setQuaternion]);

  return (
    <a.mesh position={pos as any} ref={meshRef} scale={[1, 1, 1]}>
      <cylinderGeometry
        args={[0, arrowSize, arrowLength, 20, 20, true]}
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
  placement: 'end',
  color: '#D8E6EA'
};
