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

// Helper function to create multiple text atlases
const createTextAtlases = (texts: string[], fontSize = 256) => {
  // Create a temporary canvas to measure text
  const tempCanvas = document.createElement('canvas');
  const tempContext = tempCanvas.getContext('2d')!;
  tempContext.font = `${fontSize}px Arial`;

  // Calculate required cell size based on longest text
  let maxTextWidth = 0;
  texts.forEach(text => {
    const textWidth = tempContext.measureText(text).width;
    maxTextWidth = Math.max(maxTextWidth, textWidth);
  });

  // Cell size for all atlases
  const cellWidth = Math.min(2048, Math.max(1024, Math.ceil(maxTextWidth + fontSize * 1.5)));
  const cellHeight = Math.max(320, fontSize * 1.5);

  // Calculate how many texts fit in one 8192x8192 atlas
  const maxTextureSize = 8192;
  const maxCols = Math.floor(maxTextureSize / cellWidth);
  const maxRows = Math.floor(maxTextureSize / cellHeight);
  const maxTextsPerAtlas = maxCols * maxRows;

  // Split texts into chunks that fit in individual atlases
  const atlases = [];
  const allUvMappings = new Map<string, { u: number, v: number, width: number, height: number, atlasIndex: number }>();

  for (let startIndex = 0; startIndex < texts.length; startIndex += maxTextsPerAtlas) {
    const atlasTexts = texts.slice(startIndex, startIndex + maxTextsPerAtlas);
    const atlasIndex = atlases.length;

    // Calculate grid for this atlas
    let cols = Math.min(maxCols, Math.ceil(Math.sqrt(atlasTexts.length)));
    let rows = Math.ceil(atlasTexts.length / cols);

    if (rows > maxRows) {
      rows = maxRows;
      cols = Math.ceil(atlasTexts.length / rows);
    }

    // Create canvas for this atlas
    const atlasCanvas = document.createElement('canvas');
    const atlasContext = atlasCanvas.getContext('2d')!;

    atlasCanvas.width = cols * cellWidth;
    atlasCanvas.height = rows * cellHeight;

    atlasContext.fillStyle = 'white';
    atlasContext.font = `${fontSize}px Arial`;
    atlasContext.textAlign = 'center';
    atlasContext.textBaseline = 'middle';

    // Render texts in this atlas
    atlasTexts.forEach((text, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);

      const x = col * cellWidth;
      const y = row * cellHeight;

      // Clear the cell
      atlasContext.clearRect(x, y, cellWidth, cellHeight);

      // Check if text fits, truncate if necessary
      let displayText = text;
      const maxWidth = cellWidth - fontSize * 0.3;
      if (atlasContext.measureText(displayText).width > maxWidth) {
        while (atlasContext.measureText(displayText + '...').width > maxWidth && displayText.length > 0) {
          displayText = displayText.slice(0, -1);
        }
        displayText += '...';
      }

      atlasContext.fillText(displayText, x + cellWidth / 2, y + cellHeight / 2);

      // Store UV mapping with atlas index
      allUvMappings.set(text, {
        u: x / atlasCanvas.width,
        v: y / atlasCanvas.height,
        width: cellWidth / atlasCanvas.width,
        height: cellHeight / atlasCanvas.height,
        atlasIndex
      });
    });

    // Create texture for this atlas
    const texture = new CanvasTexture(atlasCanvas);
    texture.minFilter = NearestFilter;
    texture.magFilter = NearestFilter;

    atlases.push({
      texture,
      canvas: atlasCanvas,
      textCount: atlasTexts.length
    });

    console.log(`Atlas ${atlasIndex}: ${atlasCanvas.width}x${atlasCanvas.height}, texts: ${atlasTexts.length}`);
  }

  console.log(`Created ${atlases.length} atlases for ${texts.length} texts total`);
  return { atlases, uvMapping: allUvMappings };
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
  const textInstancesRefs = useRef<any[]>([]);
  const materialRef = useRef<ShaderMaterial | null>(null);

  // Create multiple text atlases and materials
  const { textAtlases, textMaterials, uvMapping } = useMemo(() => {
    const texts = nodes.map(node => node.id);
    const { atlases, uvMapping } = createTextAtlases(texts);
    const materials = atlases.map(atlas => createTextShaderMaterial(atlas.texture));
    return {
      textAtlases: atlases,
      textMaterials: materials,
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
      opacity: actives.includes(node.id) ? 1.0 : 0.9,
      color: node.fill
    }));
  }, [nodes, actives]);

  // Group nodes by atlas index
  const nodesByAtlas = useMemo(() => {
    const groups: { [key: number]: typeof instanceData } = {};

    instanceData.forEach(node => {
      const uvData = uvMapping.get(node.id);
      if (uvData) {
        const atlasIndex = uvData.atlasIndex;
        if (!groups[atlasIndex]) {
          groups[atlasIndex] = [];
        }
        groups[atlasIndex].push(node);
      }
    });

    return groups;
  }, [instanceData, uvMapping]);

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

  // Set up custom instance attributes for text atlases
  useLayoutEffect(() => {
    Object.entries(nodesByAtlas).forEach(([atlasIndexStr, atlasNodes]) => {
      const atlasIndex = parseInt(atlasIndexStr);
      const textInstancesRef = textInstancesRefs.current[atlasIndex];

      if (textInstancesRef?.geometry && shouldShowLabels) {
        const geometry = textInstancesRef.geometry;

        const opacityArray = new Float32Array(atlasNodes.length);
        const uvOffsetArray = new Float32Array(atlasNodes.length * 4);

        atlasNodes.forEach((node, i) => {
          const uvData = uvMapping.get(node.id);
          if (uvData) {
            opacityArray[i] = node.opacity;
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
    });
  }, [nodesByAtlas, uvMapping, shouldShowLabels]);

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

    // Update text opacity for all atlases
    Object.entries(nodesByAtlas).forEach(([atlasIndexStr, atlasNodes]) => {
      const atlasIndex = parseInt(atlasIndexStr);
      const textInstancesRef = textInstancesRefs.current[atlasIndex];

      if (textInstancesRef?.geometry?.attributes?.customOpacity && shouldShowLabels) {
        const textOpacityAttribute = textInstancesRef.geometry.attributes.customOpacity;

        atlasNodes.forEach((node, i) => {
          textOpacityAttribute.array[i] = node.opacity;
        });

        textOpacityAttribute.needsUpdate = true;
      }
    });
  }, [instanceData, nodesByAtlas, shouldShowLabels]);

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

      {/* Text Labels - Multiple atlases for better coverage */}
      {shouldShowLabels && Object.entries(nodesByAtlas).map(([atlasIndexStr, atlasNodes]) => {
        const atlasIndex = parseInt(atlasIndexStr);
        return (
          <Instances
            key={`atlas-${atlasIndex}`}
            ref={ref => { textInstancesRefs.current[atlasIndex] = ref; }}
            limit={atlasNodes.length}
            range={atlasNodes.length}
          >
            <planeGeometry attach="geometry" args={[6, 1.5]} />
            <primitive attach="material" object={textMaterials[atlasIndex]} />

            {atlasNodes.map(node => (
              <Instance
                key={`label-${node.id}`}
                position={[
                  node.position?.x || 0,
                  (node.position?.y || 0) + (node.size * 1.5),
                  node.position?.z || 0
                ]}
                scale={[node.size * 3.0, node.size * 3.0, 1]}
                userData={{
                  nodeId: node.id,
                  isLabel: true,
                  atlasIndex
                }}
              />
            ))}
          </Instances>
        );
      })}
    </>
  );
};
