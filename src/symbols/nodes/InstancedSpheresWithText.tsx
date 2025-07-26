import React, { FC, useMemo, useRef, useLayoutEffect } from 'react';
import { Instances, Instance, Text } from '@react-three/drei';
import { InternalGraphNode } from '../../types';
import { Color, DoubleSide, ShaderMaterial, InstancedBufferAttribute, CanvasTexture, NearestFilter } from 'three';
import { useFrame } from '@react-three/fiber';

interface InstancedSpheresProps {
  nodes: InternalGraphNode[];
  selections?: string[];
  actives?: string[];
  animated?: boolean;
}

// Helper function to create text texture
const createTextTexture = (text: string, fontSize = 64) => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;

  // Set canvas size
  canvas.width = 256;
  canvas.height = 64;

  // Configure text styling
  context.fillStyle = 'white';
  context.font = `${fontSize}px Arial`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  // Clear canvas and draw text
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  // Create texture
  const texture = new CanvasTexture(canvas);
  texture.minFilter = NearestFilter;
  texture.magFilter = NearestFilter;

  return texture;
};

// Custom shader material for text labels
const createTextShaderMaterial = () => {
  return new ShaderMaterial({
    vertexShader: `
      attribute float customOpacity;
      attribute float textureIndex;
      varying vec2 vUv;
      varying float vOpacity;

      void main() {
        vUv = uv;
        vOpacity = customOpacity;

        // Billboard effect - always face camera
        vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        mvPosition.xy += position.xy;

        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform sampler2D textTexture;
      uniform float opacity;

      varying vec2 vUv;
      varying float vOpacity;

      void main() {
        vec4 textColor = texture2D(textTexture, vUv);
        if (textColor.a < 0.1) discard;

        gl_FragColor = vec4(textColor.rgb, textColor.a * vOpacity * opacity);
      }
    `,
    uniforms: {
      textTexture: { value: null },
      opacity: { value: 1.0 }
    },
    transparent: true,
    depthWrite: false,
  });
};

// Custom shader material with per-instance opacity and color
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

      void main() {
        // Use the color directly without lighting to avoid artifacts
        vec3 finalColor = vColor;

        // Optional: Very subtle ambient occlusion based on normal
        // float ao = 0.95 + 0.05 * abs(dot(vNormal, vec3(0.0, 1.0, 0.0)));
        // finalColor *= ao;

        gl_FragColor = vec4(finalColor, vOpacity * opacity);
      }
    `,
    uniforms: {
      opacity: { value: 1.0 }
    },
    transparent: true,
    side: DoubleSide,
    fog: true,
    depthWrite: false, // This can help with transparency artifacts
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

  const shaderMaterial = useMemo(() => {
    const material = createInstanceShaderMaterial();
    materialRef.current = material;
    return material;
  }, []);

  // For simplicity, we'll use individual Text components from drei
  // This is more practical than trying to manage multiple textures in one shader
  const shouldShowLabels = true; // You can make this configurable

  // Prepare instance data with opacity values
  const instanceData = useMemo(() => {
    return nodes.map(node => ({
      ...node,
      opacity: actives.includes(node.id) ? 1.0 : 0.3,
      color: node.fill // Use original color, don't fade it
    }));
  }, [nodes, actives]);

  // Set up custom instance attributes for spheres
  useLayoutEffect(() => {
    if (instancesRef.current?.geometry) {
      const geometry = instancesRef.current.geometry;

      // Create opacity attribute array
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
      geometry.setAttribute('customOpacity', new InstancedBufferAttribute(opacityArray, 1));
      geometry.setAttribute('customColor', new InstancedBufferAttribute(colorArray, 3));

      // Mark geometry as needing update
      geometry.attributes.customOpacity.needsUpdate = true;
      geometry.attributes.customColor.needsUpdate = true;
    }
  }, [instanceData]);

  // Update opacity and color values when data changes
  useLayoutEffect(() => {
    if (instancesRef.current?.geometry?.attributes?.customOpacity &&
        instancesRef.current?.geometry?.attributes?.customColor) {
      const opacityAttribute = instancesRef.current.geometry.attributes.customOpacity;
      const colorAttribute = instancesRef.current.geometry.attributes.customColor;

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

  return (
    <>
      {/* Spheres - Try icosahedron for better geometry */}
      <Instances ref={instancesRef} limit={nodes.length} range={nodes.length}>
        <icosahedronGeometry attach="geometry" args={[1, 3]} />
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

      {/* Text Labels - Using individual Text components for better performance */}
      {shouldShowLabels && instanceData.map(node => (
        <Text
          key={`label-${node.id}`}
          position={[
            node.position?.x || 0,
            (node.position?.y || 0) + (node.size * 1.5),
            node.position?.z || 0
          ]}
          fontSize={12}
          color="white"
          anchorX="center"
          anchorY="middle"
          material-transparent={true}
          material-opacity={node.opacity}
          material-depthWrite={false}
        >
          {node.id}
        </Text>
      ))}
    </>
  );
};
