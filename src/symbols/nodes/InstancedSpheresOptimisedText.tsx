import React, { FC, useMemo, useRef, useLayoutEffect } from 'react';
import { Instances, Instance } from '@react-three/drei';
import { InternalGraphNode } from '../../types';
import { Color, DoubleSide, ShaderMaterial, InstancedBufferAttribute, CanvasTexture, NearestFilter } from 'three';
import { useFrame } from '@react-three/fiber';

interface InstancedSpheresProps {
  nodes: InternalGraphNode[];
  selections?: string[];
  actives?: string[];
  animated?: boolean;
}

// Helper function to create text atlas
const createTextAtlas = (texts: string[], fontSize = 128) => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;

  const cellWidth = 1024;
  const cellHeight = 256;
  const cols = Math.ceil(Math.sqrt(texts.length));
  const rows = Math.ceil(texts.length / cols);

  canvas.width = cols * cellWidth;
  canvas.height = rows * cellHeight;

  context.fillStyle = 'white';
  context.font = `${fontSize}px Arial`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  const uvMapping = new Map<string, { u: number, v: number, width: number, height: number }>();

  texts.forEach((text, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);

    const x = col * cellWidth;
    const y = row * cellHeight;

    context.clearRect(x, y, cellWidth, cellHeight);
    context.fillText(text, x + cellWidth / 2, y + cellHeight / 2);

    uvMapping.set(text, {
      u: x / canvas.width,
      v: y / canvas.height,
      width: cellWidth / canvas.width,
      height: cellHeight / canvas.height
    });
  });

  const texture = new CanvasTexture(canvas);
  texture.minFilter = NearestFilter;
  texture.magFilter = NearestFilter;

  return { texture, uvMapping };
};

// Custom shader material for instanced text labels
const createTextShaderMaterial = (texture: CanvasTexture) => {
  return new ShaderMaterial({
    vertexShader: `
      attribute float customOpacity;
      attribute vec4 uvOffset; // u, v, width, height
      varying vec2 vUv;
      varying float vOpacity;

      void main() {
        vUv = uv * uvOffset.zw + uvOffset.xy;
        vOpacity = customOpacity;

        // Billboard effect - always face camera
        vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        mvPosition.xy += position.xy * 6.0; // Scale text quads larger

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
      textTexture: { value: texture },
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
  const textInstancesRef = useRef<any | null>(null);
  const materialRef = useRef<ShaderMaterial | null>(null);

  // Create text atlas and material
  const { textAtlas, textMaterial, uvMapping } = useMemo(() => {
    const texts = nodes.map(node => node.id);
    const { texture, uvMapping } = createTextAtlas(texts);
    const material = createTextShaderMaterial(texture);
    return {
      textAtlas: texture,
      textMaterial: material,
      uvMapping
    };
  }, [nodes]);

  // Create sphere shader material
  const shaderMaterial = useMemo(() => {
    const material = createInstanceShaderMaterial();
    materialRef.current = material;
    return material;
  }, []);

  const shouldShowLabels = true;

  // Prepare instance data with opacity values
  const instanceData = useMemo(() => {
    return nodes.map(node => ({
      ...node,
      opacity: actives.includes(node.id) ? 1.0 : 0.3,
      color: node.fill
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

  // Set up custom instance attributes for text
  useLayoutEffect(() => {
    if (textInstancesRef.current?.geometry && shouldShowLabels) {
      const geometry = textInstancesRef.current.geometry;

      const opacityArray = new Float32Array(instanceData.length);
      const uvOffsetArray = new Float32Array(instanceData.length * 4);

      instanceData.forEach((node, i) => {
        opacityArray[i] = node.opacity;

        const uvData = uvMapping.get(node.id);
        if (uvData) {
          uvOffsetArray[i * 4] = uvData.u;
          uvOffsetArray[i * 4 + 1] = uvData.v;
          uvOffsetArray[i * 4 + 2] = uvData.width;
          uvOffsetArray[i * 4 + 3] = uvData.height;
        }
      });

      geometry.setAttribute('customOpacity', new InstancedBufferAttribute(opacityArray, 1));
      geometry.setAttribute('uvOffset', new InstancedBufferAttribute(uvOffsetArray, 4));

      geometry.attributes.customOpacity.needsUpdate = true;
      geometry.attributes.uvOffset.needsUpdate = true;
    }
  }, [instanceData, uvMapping, shouldShowLabels]);

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

    // Update text opacity
    if (textInstancesRef.current?.geometry?.attributes?.customOpacity && shouldShowLabels) {
      const textOpacityAttribute = textInstancesRef.current.geometry.attributes.customOpacity;

      instanceData.forEach((node, i) => {
        textOpacityAttribute.array[i] = node.opacity;
      });

      textOpacityAttribute.needsUpdate = true;
    }
  }, [instanceData, shouldShowLabels]);

  return (
    <>
      {/* Spheres - Higher subdivision for smoother appearance */}
      <Instances ref={instancesRef} limit={nodes.length} range={nodes.length}>
        <icosahedronGeometry attach="geometry" args={[1, 5]} />
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

      {/* Text Labels - Using instanced rendering for better performance */}
      {shouldShowLabels && (
        <Instances ref={textInstancesRef} limit={nodes.length} range={nodes.length}>
          <planeGeometry attach="geometry" args={[3, 0.75]} />
          <primitive attach="material" object={textMaterial} />

          {instanceData.map(node => (
            <Instance
              key={`label-${node.id}`}
              position={[
                node.position?.x || 0,
                (node.position?.y || 0) + (node.size * 1.5),
                node.position?.z || 0
              ]}
              scale={[node.size * 2.5, node.size * 2.5, 1]}
              userData={{
                nodeId: node.id,
                isLabel: true
              }}
            />
          ))}
        </Instances>
      )}
    </>
  );
};
