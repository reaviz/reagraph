import React, { FC, useMemo, useRef } from 'react';
import { useSpring, a } from '@react-spring/three';
import { animationConfig, getCurve } from '../utils';
import {
  Vector3,
  TubeBufferGeometry,
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
}

export const Line: FC<LineProps> = ({
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
  const tubeRef = useRef<TubeBufferGeometry | null>(null);
  const draggingId = useStore(state => state.draggingId);
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

  useSpring(() => {
    const from = curve.getPoint(0);
    const to = curve.getPoint(1);
    return {
      from: {
        fromVertices: [0, 0, 0],
        toVertices: [0, 0, 0]
      },
      to: {
        fromVertices: [from?.x, from?.y, from?.z || 0],
        toVertices: [to?.x, to?.y, to?.z || 0]
      },
      onChange: event => {
        const { fromVertices, toVertices } = event.value;
        const fromVector = new Vector3(...fromVertices);
        const toVector = new Vector3(...toVertices);

        const curve = getCurve(fromVector, 0, toVector, 0, curved);
        tubeRef.current.copy(
          new TubeBufferGeometry(curve, 20, size / 2, 5, false)
        );
      },
      config: {
        ...animationConfig,
        duration: animated && !draggingId ? undefined : 0
      }
    };
  }, [animated, draggingId, curve, size]);

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
      <tubeBufferGeometry attach="geometry" ref={tubeRef} />
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

Line.defaultProps = {
  color: '#000',
  size: 1,
  opacity: 1
};
