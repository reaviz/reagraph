import React, { FC, useMemo, useRef, useEffect, useCallback } from 'react';
import { useSpring, a } from '@react-spring/three';
import * as THREE from 'three';
import {
  getQuaternion,
  animationConfig,
  getMidPoint,
  getEndPoint,
  EdgeVector
} from '../utils';

export interface ArrowProps {
  position: EdgeVector;
  color?: string;
  opacity?: number;
  size?: number;
  placement?: 'mid' | 'end';
}

export const Arrow: FC<ArrowProps> = ({
  position,
  size = 1,
  opacity = 0.5,
  placement = 'end',
  color = '#0078FF'
}) => {
  const meshRef = useRef<THREE.Mesh | null>(null);
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
    config: animationConfig
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
