import React, { FC, useMemo, useRef } from 'react';
import { useSpring, a } from '@react-spring/three';
import { animationConfig, getCurve } from '../utils';
import {
  Vector3,
  TubeGeometry,
  ColorRepresentation,
  Color,
  Curve
} from 'three';
import { useStore } from '../store';
import { ThreeEvent } from '@react-three/fiber';

export interface LineProps {
  /**
   * Whether the line should be animated.
   */
  animated?: boolean;
  /**
   * The color of the line.
   */
  color?: ColorRepresentation;
  /**
   * Whether the line should be curved.
   */
  curved: boolean;
  /**
   * The curve of the line in 3D space.
   */
  curve: Curve<Vector3>;
  /**
   * The unique identifier of the line.
   */
  id: string;
  /**
   * The opacity of the line.
   */
  opacity?: number;
  /**
   * The size of the line.
   */
  size?: number;
  /**
   * A function that is called when the line is clicked.
   */
  onClick?: () => void;
  /**
   * A function that is called when the line is right-clicked.
   */
  onContextMenu?: () => void;
  /**
   * A function that is called when the mouse pointer is moved over the line.
   */
  onPointerOver?: (event: ThreeEvent<PointerEvent>) => void;
  /**
   * A function that is called when the mouse pointer is moved out of the line.
   */
  onPointerOut?: (event: ThreeEvent<PointerEvent>) => void;
  /**
   * The offset of the curve.
   */
  curveOffset?: number;
}

export const Line: FC<LineProps> = ({
  curveOffset,
  animated,
  color,
  curve,
  curved = false,
  id,
  opacity,
  size,
  onContextMenu,
  onClick,
  onPointerOver,
  onPointerOut
}) => {
  const tubeRef = useRef<TubeGeometry | null>(null);
  const normalizedColor = useMemo(() => new Color(color), [color]);

  // Do opacity seperate from vertices for perf
  const { lineOpacity } = useSpring({
    from: {
      lineOpacity: 0
    },
    to: {
      lineOpacity: opacity
    },
    config: {
      ...animationConfig,
      duration: animated ? undefined : 0
    }
  });

  return (
    <a.mesh
      userData={{ id, type: 'edge' }}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      onClick={onClick}
      onPointerDown={event => {
        // context menu controls
        if (event.nativeEvent.buttons === 2) {
          event.stopPropagation();
          onContextMenu();
        }
      }}
    >
      <a.tubeGeometry
        attach="geometry"
        ref={tubeRef}
        args={[curve, 20, size / 2, 5, false]}
      />
      <a.meshBasicMaterial
        attach="material"
        opacity={lineOpacity}
        fog={true}
        transparent={true}
        depthTest={false}
        color={normalizedColor}
      />
    </a.mesh>
  );
};

Line.defaultProps = {
  color: '#000',
  size: 1,
  opacity: 1
};
