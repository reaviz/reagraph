import type { SpringValue } from '@react-spring/three';
import { useSpring } from '@react-spring/three';
import { useFrame } from '@react-three/fiber';
import type { MutableRefObject } from 'react';
import { useEffect, useMemo, useRef } from 'react';
import type { BufferGeometry, Mesh } from 'three';
import { BufferAttribute } from 'three';

import type { Theme } from '../../themes';
import { animationConfig } from '../../utils';

// Lerp factor for smooth edge animation (higher = faster convergence)
const LERP_FACTOR = 0.15;

export function useEdgePositionAnimation(
  meshRef: MutableRefObject<Mesh>,
  targetGeometry: BufferGeometry,
  animated: boolean
): void {
  const currentPositionsRef = useRef<Float32Array | null>(null);
  const targetPositionsRef = useRef<Float32Array | null>(null);
  const isFirstRenderRef = useRef(true);

  // Extract target positions from geometry and store in ref for useFrame access
  const targetPositions = useMemo(() => {
    const positions = targetGeometry.getAttribute('position');
    return positions ? new Float32Array(positions.array) : null;
  }, [targetGeometry]);

  // Update target ref when positions change
  useEffect(() => {
    if (targetPositions) {
      targetPositionsRef.current = targetPositions;
    }
  }, [targetPositions]);

  // Handle first render and topology changes
  useEffect(() => {
    if (!targetPositions) return;

    const topologyChanged = !currentPositionsRef.current ||
      currentPositionsRef.current.length !== targetPositions.length;

    if (isFirstRenderRef.current || !animated || topologyChanged) {
      // Snap to target positions
      meshRef.current.geometry = targetGeometry;
      currentPositionsRef.current = new Float32Array(targetPositions);
      isFirstRenderRef.current = false;
    }
  }, [targetGeometry, targetPositions, animated, meshRef]);

  // Smooth animation using useFrame with lerp
  useFrame(() => {
    if (!animated || !currentPositionsRef.current || !targetPositionsRef.current) {
      return;
    }

    const current = currentPositionsRef.current;
    const target = targetPositionsRef.current;

    // Skip if lengths don't match (topology change handled by effect above)
    if (current.length !== target.length) {
      return;
    }

    // Check if we need to animate (any position differs significantly)
    let needsUpdate = false;
    const threshold = 0.01;

    for (let i = 0; i < current.length; i++) {
      if (Math.abs(current[i] - target[i]) > threshold) {
        needsUpdate = true;
        break;
      }
    }

    if (!needsUpdate) {
      return;
    }

    // Lerp all positions toward target
    for (let i = 0; i < current.length; i++) {
      current[i] += (target[i] - current[i]) * LERP_FACTOR;
    }

    // Update mesh geometry
    const meshGeometry = meshRef.current?.geometry;
    if (meshGeometry) {
      const newPosition = new BufferAttribute(new Float32Array(current), 3);
      meshGeometry.setAttribute('position', newPosition);
      newPosition.needsUpdate = true;
    }
  });
}

export type UseEdgeOpacityAnimations = {
  activeOpacity: SpringValue<number>;
  inactiveOpacity: SpringValue<number>;
  scale: SpringValue<number>;
};

export function useEdgeOpacityAnimation(
  animated: boolean,
  hasSelections: boolean,
  theme: Theme
): UseEdgeOpacityAnimations {
  const [{ activeOpacity, inactiveOpacity, scale }] = useSpring(() => {
    return {
      from: {
        activeOpacity: 0,
        inactiveOpacity: 0,
        scale: animated ? 0.001 : 1 // Start small to animate in like nodes
      },
      to: {
        activeOpacity: hasSelections
          ? theme.edge.selectedOpacity
          : theme.edge.opacity,
        inactiveOpacity: hasSelections
          ? theme.edge.inactiveOpacity
          : theme.edge.opacity,
        scale: 1
      },
      config: animated
        ? {
            // Animation config to match node animation timing
            ...animationConfig
          }
        : { duration: 0 }
    };
  }, [animated, hasSelections, theme]);

  return { activeOpacity, inactiveOpacity, scale };
}
