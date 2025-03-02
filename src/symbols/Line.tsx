import React, { FC, useEffect, useMemo, useRef } from 'react';
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
  onClick?: (event: ThreeEvent<MouseEvent>) => void;

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
  curve,
  curved = false,
  id,
  onContextMenu,
  onClick,
  onPointerOver,
  onPointerOut,
  color = '#000',
  size = 1,
  opacity = 1
}) => {
  const tubeRef = useRef<TubeGeometry | null>(null);
  const draggingId = useStore(state => state.draggingId);
  const normalizedColor = useMemo(() => new Color(color), [color]);
  const center = useStore(state => state.centerPosition);
  const mounted = useRef<boolean>(false);

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

  useSpring(() => {
    const from = curve.getPoint(0);
    const to = curve.getPoint(1);
    return {
      from: {
        // Animate from center first time, then from the actual from point
        fromVertices: !mounted.current
          ? [center?.x, center?.y, center?.z || 0]
          : [to?.x, to?.y, to?.z || 0],
        toVertices: [from?.x, from?.y, from?.z || 0]
      },
      to: {
        fromVertices: [from?.x, from?.y, from?.z || 0],
        toVertices: [to?.x, to?.y, to?.z || 0]
      },
      onChange: event => {
        const { fromVertices, toVertices } = event.value;
        const fromVector = new Vector3(...fromVertices);
        const toVector = new Vector3(...toVertices);

        const curve = getCurve(fromVector, 0, toVector, 0, curved, curveOffset);
        tubeRef.current.copy(new TubeGeometry(curve, 20, size / 2, 5, false));
      },
      config: {
        ...animationConfig,
        duration: animated && !draggingId ? undefined : 0
      }
    };
  }, [animated, draggingId, curve, size]);

  useEffect(() => {
    // Handle mount operation for initial render
    mounted.current = true;
  }, []);

  return (
    <mesh
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
      <tubeGeometry attach="geometry" ref={tubeRef} />
      <a.meshBasicMaterial
        attach="material"
        opacity={lineOpacity}
        fog={true}
        transparent={true}
        depthTest={false}
        color={normalizedColor}
      />
    </mesh>
  );
};
