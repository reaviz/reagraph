import React, {
  FC,
  useMemo,
  useRef,
  useLayoutEffect
} from 'react';
import { Instances, Instance } from '@react-three/drei';
import { InternalGraphNode } from '../../types';
import {
  Color,
  DoubleSide,
  ShaderMaterial,
  InstancedBufferAttribute,
} from 'three';

interface InstancedSpheresProps {
  nodes: InternalGraphNode[];
  selections?: string[];
  actives?: string[];
  animated?: boolean;
}

// Simple shader material without icon support
const createInstanceShaderMaterial = () => {
  return new ShaderMaterial({
    vertexShader: `
      #ifdef GL_FRAGMENT_PRECISION_HIGH
        precision highp float;
      #else
        precision mediump float;
      #endif

      attribute float customOpacity;
      attribute vec3 customColor;

      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying float vOpacity;
      varying vec3 vColor;
      varying vec2 vUv;

      void main() {
        // Calculate world position first
        vec4 worldPosition = instanceMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;

        // Transform normal properly
        vec3 objectNormal = vec3(normal);
        vec3 transformedNormal = normalMatrix * objectNormal;
        vNormal = normalize(transformedNormal);

        // Pass through attributes
        vOpacity = customOpacity;
        vColor = customColor;
        vUv = uv;

        // Final position calculation
        gl_Position = projectionMatrix * modelViewMatrix * worldPosition;
      }
    `,
    fragmentShader: `
      #ifdef GL_FRAGMENT_PRECISION_HIGH
        precision highp float;
      #else
        precision mediump float;
      #endif

      uniform float opacity;

      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying float vOpacity;
      varying vec3 vColor;
      varying vec2 vUv;

      void main() {
        gl_FragColor = vec4(vColor, vOpacity * opacity);
      }
    `,
    uniforms: {
      opacity: { value: 1.0 }
    },
    transparent: true,
    side: DoubleSide,
    fog: true,
    depthWrite: true
  });
};

export const InstancedSpheres: FC<InstancedSpheresProps> = ({
  nodes,
  selections = [],
  actives = [],
  animated = true
}) => {
  const instancesRef = useRef<any | null>(null);
  const materialRef = useRef<ShaderMaterial | null>(null);

  // Create sphere shader material
  const shaderMaterial = useMemo(() => {
    const material = createInstanceShaderMaterial();
    materialRef.current = material;
    return material;
  }, []);

  // Prepare instance data with opacity values
  const instanceData = useMemo(() => {
    return nodes.map(node => ({
      ...node,
      opacity: actives.includes(node.id) ? 1.0 : 1,
      color: node.fill
    }));
  }, [nodes, actives]);

  // Set up custom instance attributes for spheres
  useLayoutEffect(() => {
    if (instancesRef.current?.geometry) {
      const geometry = instancesRef.current.geometry;

      // Create attribute arrays
      const opacityArray = new Float32Array(instanceData.length);
      const colorArray = new Float32Array(instanceData.length * 3);

      instanceData.forEach((node, i) => {
        opacityArray[i] = node.opacity;

        // Convert color to RGB values
        const color = new Color(node.color);
        colorArray[i * 3] = color.r;
        colorArray[i * 3 + 1] = color.g;
        colorArray[i * 3 + 2] = color.b;
      });

      // Add the custom attributes to geometry
      geometry.setAttribute(
        'customOpacity',
        new InstancedBufferAttribute(opacityArray, 1)
      );
      geometry.setAttribute(
        'customColor',
        new InstancedBufferAttribute(colorArray, 3)
      );

      // Mark geometry as needing update
      geometry.attributes.customOpacity.needsUpdate = true;
      geometry.attributes.customColor.needsUpdate = true;
    }
  }, [instanceData]);

  // Update opacity and color values when data changes
  useLayoutEffect(() => {
    if (
      instancesRef.current?.geometry?.attributes?.customOpacity &&
      instancesRef.current?.geometry?.attributes?.customColor
    ) {
      const opacityAttribute =
        instancesRef.current.geometry.attributes.customOpacity;
      const colorAttribute =
        instancesRef.current.geometry.attributes.customColor;

      instanceData.forEach((node, i) => {
        opacityAttribute.array[i] = node.opacity;

        const color = new Color(node.color);
        colorAttribute.array[i * 3] = color.r;
        colorAttribute.array[i * 3 + 1] = color.g;
        colorAttribute.array[i * 3 + 2] = color.b;
      });

      opacityAttribute.needsUpdate = true;
      colorAttribute.needsUpdate = true;
    }
  }, [instanceData]);

  const circleSegmentsDetail = 5;

  return (
    <>
      {/* Spheres - Higher subdivision for smoother appearance */}
      <Instances ref={instancesRef} limit={nodes.length} range={nodes.length}>
        <icosahedronGeometry
          attach="geometry"
          args={[1, circleSegmentsDetail]}
        />
        <primitive attach="material" object={shaderMaterial} />

        {instanceData.map(node => (
          <Instance
            key={node.id}
            position={[
              node.position?.x || 0,
              node.position?.y || 0,
              node.position?.z || 0
            ]}
            scale={node.size}
            userData={{
              nodeId: node.id,
              isActive: actives.includes(node.id)
            }}
          />
        ))}
      </Instances>
    </>
  );
};
