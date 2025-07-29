import React, { FC, useMemo, useRef, useLayoutEffect } from 'react';
import { Instances, Instance } from '@react-three/drei';
import { InternalGraphNode } from '../../types';
import {
  Color,
  ShaderMaterial,
  InstancedBufferAttribute,
  CanvasTexture,
  NearestFilter
} from 'three';

interface InstancedTextProps {
  nodes: InternalGraphNode[];
  selections?: string[];
  actives?: string[];
  animated?: boolean;
  fontSize?: number;
}

// Cache for text atlases to prevent recreation
const atlasCache = new Map<
  string,
  {
    atlases: any[];
    uvMapping: Map<string, any>;
    cellWidth: number;
    cellHeight: number;
  }
>();

// Helper function to create multiple text atlases
const createTextAtlases = (texts: string[], fontSize = 320) => {
  // Create cache key from texts
  const cacheKey = texts.sort().join('|') + `|${fontSize}`;
  if (atlasCache.has(cacheKey)) {
    return atlasCache.get(cacheKey)!;
  }
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

  // Cell size for all atlases - optimized to prevent GPU memory issues
  const cellWidth = Math.min(
    2048, // Reduced max width to save GPU memory
    Math.max(512, Math.ceil(maxTextWidth + fontSize * 0.8)) // Reduced padding
  );
  const cellHeight = Math.max(320, fontSize * 3.0); // Increased for 3-line text

  // Calculate how many texts fit in one smaller atlas to reduce GPU memory usage
  const maxTextureSize = 4096; // Reduced from 8192 to 4096
  const maxCols = Math.floor(maxTextureSize / cellWidth);
  const maxRows = Math.floor(maxTextureSize / cellHeight);
  const maxTextsPerAtlas = maxCols * maxRows;

  // Split texts into chunks that fit in individual atlases
  const atlases = [];
  const allUvMappings = new Map<
    string,
    { u: number; v: number; width: number; height: number; atlasIndex: number }
  >();

  for (
    let startIndex = 0;
    startIndex < texts.length;
    startIndex += maxTextsPerAtlas
  ) {
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

      // Split text into multiple lines (up to 3) to show full text
      const maxWidth = cellWidth - fontSize * 0.2; // Reduced padding to fit more text
      const words = text.split(' ');
      const lines = [];
      let currentLine = '';

      // Distribute words across lines
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (atlasContext.measureText(testLine).width <= maxWidth) {
          currentLine = testLine;
        } else {
          if (currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            // Single word is too long, force it on a line
            lines.push(word);
          }
        }
      }

      if (currentLine) {
        lines.push(currentLine);
      }

      // Limit to 3 lines maximum
      const displayLines = lines.slice(0, 3);

      if (displayLines.length === 1) {
        // Single line
        atlasContext.fillText(
          displayLines[0],
          x + cellWidth / 2,
          y + cellHeight / 2
        );
      } else {
        // Multiple lines
        const lineHeight = fontSize * 1.2;
        const totalHeight = (displayLines.length - 1) * lineHeight;
        const startY = y + cellHeight / 2 - totalHeight / 2;

        displayLines.forEach((line, index) => {
          atlasContext.fillText(
            line,
            x + cellWidth / 2,
            startY + index * lineHeight
          );
        });
      }

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

    console.log(
      `Atlas ${atlasIndex}: ${atlasCanvas.width}x${atlasCanvas.height}, texts: ${atlasTexts.length}`
    );
  }

  console.log(
    `Created ${atlases.length} text atlases for ${texts.length} texts (${Math.round(atlases.reduce((sum, a) => sum + a.canvas.width * a.canvas.height, 0) / 1024 / 1024)}MB)`
  );

  const result = { atlases, uvMapping: allUvMappings, cellWidth, cellHeight };
  atlasCache.set(cacheKey, result);

  return result;
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
    depthWrite: false
  });
};

export const InstancedText: FC<InstancedTextProps> = ({
  nodes,
  selections = [],
  actives = [],
  animated = true,
  fontSize = 320
}) => {
  const textInstancesRefs = useRef<any[]>([]);

  // Create multiple text atlases and materials
  const { textAtlases, textMaterials, uvMapping, aspectRatio } = useMemo(() => {
    const texts = nodes.map(node => node.label);
    const { atlases, uvMapping, cellWidth, cellHeight } =
      createTextAtlases(texts, fontSize);
    const materials = atlases.map(atlas =>
      createTextShaderMaterial(atlas.texture)
    );
    return {
      textAtlases: atlases,
      textMaterials: materials,
      uvMapping,
      aspectRatio: cellWidth / cellHeight
    };
  }, [nodes, fontSize]);

  // Prepare instance data with opacity values
  const instanceData = useMemo(() => {
    return nodes.map(node => ({
      ...node,
      opacity: actives.includes(node.id) ? 1.0 : 0.5,
      color: node.fill
    }));
  }, [nodes, actives]);

  // Group nodes by atlas index
  const nodesByAtlas = useMemo(() => {
    const groups: { [key: number]: typeof instanceData } = {};

    instanceData.forEach(node => {
      const uvData = uvMapping.get(node.label);
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

  // Set up custom instance attributes for text atlases
  useLayoutEffect(() => {
    Object.entries(nodesByAtlas).forEach(([atlasIndexStr, atlasNodes]) => {
      const atlasIndex = parseInt(atlasIndexStr);
      const textInstancesRef = textInstancesRefs.current[atlasIndex];

      if (textInstancesRef?.geometry) {
        const geometry = textInstancesRef.geometry;

        const opacityArray = new Float32Array(atlasNodes.length);
        const uvOffsetArray = new Float32Array(atlasNodes.length * 4);

        atlasNodes.forEach((node, i) => {
          const uvData = uvMapping.get(node.label);
          if (uvData) {
            opacityArray[i] = node.opacity;
            uvOffsetArray[i * 4] = uvData.u;
            uvOffsetArray[i * 4 + 1] = uvData.v;
            uvOffsetArray[i * 4 + 2] = uvData.width;
            uvOffsetArray[i * 4 + 3] = uvData.height;
          }
        });

        geometry.setAttribute(
          'customOpacity',
          new InstancedBufferAttribute(opacityArray, 1)
        );
        geometry.setAttribute(
          'uvOffset',
          new InstancedBufferAttribute(uvOffsetArray, 4)
        );

        geometry.attributes.customOpacity.needsUpdate = true;
        geometry.attributes.uvOffset.needsUpdate = true;
      }
    });
  }, [nodesByAtlas, uvMapping]);

  // Update opacity and color values when data changes
  useLayoutEffect(() => {
    // Update text opacity for all atlases
    Object.entries(nodesByAtlas).forEach(([atlasIndexStr, atlasNodes]) => {
      const atlasIndex = parseInt(atlasIndexStr);
      const textInstancesRef = textInstancesRefs.current[atlasIndex];

      if (textInstancesRef?.geometry?.attributes?.customOpacity) {
        const textOpacityAttribute =
          textInstancesRef.geometry.attributes.customOpacity;

        atlasNodes.forEach((node, i) => {
          textOpacityAttribute.array[i] = node.opacity;
        });

        textOpacityAttribute.needsUpdate = true;
      }
    });
  }, [instanceData, nodesByAtlas]);

  return Object.entries(nodesByAtlas).map(([atlasIndexStr, atlasNodes]) => {
    const atlasIndex = parseInt(atlasIndexStr);

    return (
      <Instances
        key={`atlas-${atlasIndex}`}
        ref={ref => {
          textInstancesRefs.current[atlasIndex] = ref;
        }}
        limit={atlasNodes.length}
        range={atlasNodes.length}
      >
        <planeGeometry attach="geometry" args={[aspectRatio, 1]} />
        <primitive attach="material" object={textMaterials[atlasIndex]} />

        {atlasNodes.map(node => (
          <Instance
            key={`label-${node.id}`}
            position={[
              node.position?.x || 0,
              (node.position?.y || 0) - node.size * 2.0,
              node.position?.z || 0
            ]}
            scale={[node.size * 2.0, node.size * 2.0, 1]}
            userData={{
              nodeId: node.id,
              isLabel: true,
              atlasIndex
            }}
          />
        ))}
      </Instances>
    );
  });
};
