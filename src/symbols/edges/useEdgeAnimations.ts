import { SpringValue, useSpring } from '@react-spring/three';
import { useCallback, useEffect, useRef } from 'react';
import { BufferAttribute, BufferGeometry } from 'three';

import { Theme } from '../../themes';
import { animationConfig } from '../../utils';

export function useEdgePositionAnimation(
  geometry: BufferGeometry,
  animated: boolean
): void {
  const geometryRef = useRef<BufferGeometry>(geometry);
  const bufferPool = useRef<Float32Array>();

  useEffect(() => {
    geometryRef.current = geometry;
    const positions = geometry.getAttribute('position');
    bufferPool.current = new Float32Array(positions.array.length);
  }, [geometry]);

  const getAnimationPositions = useCallback(() => {
    const positions = geometryRef.current.getAttribute('position');
    const from = new Float32Array(positions.array.length);
    return {
      from,
      to: positions.array
    };
  }, []);

  const updateGeometryPosition = useCallback((positions: Array<number>) => {
    const buffer = bufferPool.current!;
    buffer.set(positions);
    const newPosition = new BufferAttribute(buffer, 3, false);
    geometryRef.current.setAttribute('position', newPosition);
    newPosition.needsUpdate = true;
  }, []);

  useSpring(() => {
    if (!animated) {
      return null;
    }

    const animationPositions = getAnimationPositions();

    return {
      from: {
        positions: animationPositions.from
      },
      to: {
        positions: animationPositions.to
      },
      onChange: event => {
        updateGeometryPosition(event.value.positions);
      },
      config: {
        ...animationConfig,
        duration: animated ? undefined : 0
      }
    };
  }, [animated, getAnimationPositions, updateGeometryPosition]);
}

export type UseEdgeOpacityAnimations = {
  activeOpacity: SpringValue<number>;
  inactiveOpacity: SpringValue<number>;
};

export function useEdgeOpacityAnimation(
  animated: boolean,
  hasSelections: boolean,
  theme: Theme
): UseEdgeOpacityAnimations {
  const [{ activeOpacity, inactiveOpacity }] = useSpring(() => {
    return {
      from: {
        activeOpacity: 0,
        inactiveOpacity: 0
      },
      to: {
        activeOpacity: hasSelections
          ? theme.edge.selectedOpacity
          : theme.edge.opacity,
        inactiveOpacity: hasSelections
          ? theme.edge.inactiveOpacity
          : theme.edge.opacity
      },
      config: {
        ...animationConfig,
        duration: animated ? undefined : 0
      }
    };
  }, [animated, hasSelections, theme]);

  return { activeOpacity, inactiveOpacity };
}
