import React, { FC, useMemo, useRef, useEffect, useCallback } from 'react';
import { useSpring, a } from '@react-spring/three';
import { Mesh } from 'three';
import {
  getQuaternion,
  animationConfig,
  getMidPoint,
  getEndPoint,
  EdgeVectors3
} from '../utils';

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
  const meshRef = useRef<Mesh | null>(null);
  const quaternion = useMemo(() => getQuaternion(position), [position]);

  const endPos = useMemo(() => {
    if (placement === 'mid') {
      return getMidPoint(position);
    } else {
      // TODO: Improve this
      return getEndPoint(position);
    }
  }, [position, placement]);

  const { pos, arrowOpacity } = useSpring({
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
      duration: animated ? undefined : 0
    }
  });

  const setQuaternion = useCallback(() => {
    meshRef.current?.quaternion.setFromUnitVectors(
      quaternion[0],
      quaternion[1]
    );
  }, [quaternion, meshRef]);

  useEffect(() => setQuaternion(), [position, setQuaternion]);

  return (
    <a.mesh position={pos as any} ref={meshRef} scale={[size, size, size]}>
      <cylinderGeometry args={[0, 3, 7, 20, 20, false]} attach="geometry" />
      <a.meshBasicMaterial
        attach="material"
        color={color}
        depthTest={false}
        opacity={arrowOpacity}
        transparent={true}
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
