import { a, useSpring } from '@react-spring/three';
import type { ThreeEvent } from '@react-three/fiber';
import type { FC } from 'react';
import React, { useEffect, useMemo, useRef } from 'react';
import type { ColorRepresentation, Curve } from 'three';
import { Color, ShaderMaterial, TubeGeometry, Vector3 } from 'three';

import { useStore } from '../store';
import { animationConfig, getCurve } from '../utils';

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
   * Whether the line should be dashed.
   */
  dashed?: boolean;

  /**
   * Dash pattern for the line: [dashSize, gapSize]
   */
  dashArray?: [number, number];

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
   * The render order of the line. Useful when edges are rendered on top of each other.
   */
  renderOrder?: number;

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

// Dashed line shader for tube geometry
const dashedVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const dashedFragmentShader = `
  uniform vec3 color;
  uniform float opacity;
  uniform float dashSize;
  uniform float gapSize;
  uniform float lineLength;
  varying vec2 vUv;

  void main() {
    float totalSize = dashSize + gapSize;
    float position = mod(vUv.x * lineLength, totalSize);

    if (position > dashSize) {
      discard;
    }

    gl_FragColor = vec4(color, opacity);
  }
`;

export const Line: FC<LineProps> = ({
  curveOffset,
  animated,
  color = '#000',
  curve,
  curved = false,
  dashed = false,
  dashArray = [3, 1],
  id,
  opacity = 1,
  size = 1,
  renderOrder = -1,
  onContextMenu,
  onClick,
  onPointerOver,
  onPointerOut
}) => {
  const tubeRef = useRef<TubeGeometry | null>(null);
  const isDragging = useStore(state => state.draggingIds.length > 0);
  const normalizedColor = useMemo(() => new Color(color), [color]);
  const center = useStore(state => state.centerPosition);
  const mounted = useRef<boolean>(false);

  // Create dashed material
  const dashedMaterial = useMemo(() => {
    if (!dashed) return null;
    const [dashSize, dashGap] = dashArray;

    return new ShaderMaterial({
      uniforms: {
        color: { value: normalizedColor },
        opacity: { value: opacity },
        dashSize: { value: dashSize },
        gapSize: { value: dashGap },
        lineLength: { value: curve.getLength() }
      },
      vertexShader: dashedVertexShader,
      fragmentShader: dashedFragmentShader,
      transparent: true,
      depthTest: false
    });
  }, [dashed, normalizedColor, opacity, curve, dashArray]);

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

        if (tubeRef.current) {
          // Use slightly smaller radius for dashed lines for visual distinction
          const radius = dashed ? size * 0.4 : size / 2;
          tubeRef.current.copy(new TubeGeometry(curve, 20, radius, 5, false));
        }
      },
      config: {
        ...animationConfig,
        duration: animated && !isDragging ? undefined : 0
      }
    };
  }, [animated, isDragging, curve, size, dashed, curved, curveOffset]);

  useEffect(() => {
    // Handle mount operation for initial render
    mounted.current = true;
  }, []);

  return (
    <mesh
      userData={{ id, type: 'edge' }}
      renderOrder={renderOrder}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      onClick={onClick}
      // context menu controls
      onPointerDown={event => {
        if (event.nativeEvent.buttons === 2) {
          event.stopPropagation();
        }
      }}
      onContextMenu={event => {
        event.nativeEvent.preventDefault();
        event.stopPropagation();
        onContextMenu();
      }}
    >
      <tubeGeometry attach="geometry" ref={tubeRef} />
      {dashed ? (
        <primitive attach="material" object={dashedMaterial} />
      ) : (
        <a.meshBasicMaterial
          attach="material"
          opacity={lineOpacity}
          fog={true}
          transparent={true}
          color={normalizedColor}
        />
      )}
    </mesh>
  );
};
