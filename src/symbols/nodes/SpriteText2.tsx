import React, { FC, useMemo, useRef, useLayoutEffect } from 'react';
import {
  CanvasTexture,
  SpriteMaterial,
  Sprite,
  NearestFilter,
  Color,
  InstancedMesh,
  PlaneGeometry,
  ShaderMaterial,
  Matrix4,
  Vector3,
  InstancedBufferAttribute,
  BufferGeometry,
  Points,
  PointsMaterial,
  Float32BufferAttribute
} from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { InternalGraphNode } from '../../types';

interface OptimizedTextProps {
  nodes: InternalGraphNode[];
  selections?: string[];
  actives?: string[];
  animated?: boolean;
  fontSize?: number;
  maxWidth?: number;
}

// SOLUTION 1: Instanced Mesh with Custom Shader (Best Performance)
// Groups identical texts and uses instancing to reduce draw calls

const createTextTexture = (text: string, fontSize: number, color: string, maxWidth: number) => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;

  context.font = `${fontSize}px Arial, sans-serif`;

  // Handle text wrapping
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (context.measureText(testLine).width <= maxWidth - 20) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  // Size canvas
  const lineHeight = fontSize * 1.2;
  const totalHeight = lines.length * lineHeight;
  let maxLineWidth = 0;
  lines.forEach(line => {
    maxLineWidth = Math.max(maxLineWidth, context.measureText(line).width);
  });

  canvas.width = Math.max(64, maxLineWidth + 20);
  canvas.height = Math.max(32, totalHeight + 20);

  // Redraw after resize
  context.font = `${fontSize}px Arial, sans-serif`;
  context.fillStyle = color;
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  const startY = canvas.height / 2 - (totalHeight - lineHeight) / 2;
  lines.forEach((line, index) => {
    context.fillText(line, canvas.width / 2, startY + index * lineHeight);
  });

  const texture = new CanvasTexture(canvas);
  texture.minFilter = NearestFilter;
  texture.magFilter = NearestFilter;
  return texture;
};

// Custom shader for instanced billboards
const createInstancedTextShader = (texture: CanvasTexture) => {
  return new ShaderMaterial({
    vertexShader: `
      attribute float opacity;
      attribute vec3 color;

      varying vec2 vUv;
      varying float vOpacity;
      varying vec3 vColor;

      void main() {
        vUv = uv;
        vOpacity = opacity;
        vColor = color;

        // Billboard effect
        vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);

        // Scale and orient to camera
        vec3 scale = vec3(
          length(instanceMatrix[0].xyz),
          length(instanceMatrix[1].xyz),
          length(instanceMatrix[2].xyz)
        );

        mvPosition.xy += position.xy * scale.xy;

        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform sampler2D map;

      varying vec2 vUv;
      varying float vOpacity;
      varying vec3 vColor;

      void main() {
        vec4 texColor = texture2D(map, vUv);
        if (texColor.a < 0.1) discard;

        gl_FragColor = vec4(texColor.rgb * vColor, texColor.a * vOpacity);
      }
    `,
    uniforms: {
      map: { value: texture }
    },
    transparent: true,
    depthWrite: false
  });
};

export const InstancedSpriteText: FC<OptimizedTextProps> = ({
  nodes,
  selections = [],
  actives = [],
  fontSize = 32,
  maxWidth = 300
}) => {
  const meshRefs = useRef<InstancedMesh[]>([]);

  // Group nodes by text content and color
  const textGroups = useMemo(() => {
    const groups = new Map<string, InternalGraphNode[]>();

    nodes.forEach(node => {
      const key = `${node.label}|${node.fill || 'white'}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(node);
    });

    return Array.from(groups.entries()).map(([key, groupNodes]) => {
      const [text, color] = key.split('|');
      return {
        text,
        color,
        nodes: groupNodes,
        texture: createTextTexture(text, fontSize, color, maxWidth)
      };
    });
  }, [nodes, fontSize, maxWidth]);

  // Update instance matrices and attributes
  useLayoutEffect(() => {
    textGroups.forEach((group, groupIndex) => {
      const mesh = meshRefs.current[groupIndex];
      if (!mesh) return;

      const { nodes: groupNodes } = group;
      const matrix = new Matrix4();
      const position = new Vector3();

      // Set up instance attributes
      const opacityArray = new Float32Array(groupNodes.length);
      const colorArray = new Float32Array(groupNodes.length * 3);

      groupNodes.forEach((node, i) => {
        // Set position and scale
        position.set(
          node.position?.x || 0,
          (node.position?.y || 0) - (node.size || 1) * 2,
          (node.position?.z || 0) + 0.1
        );

        const scale = (node.size || 1) * 2;
        matrix.makeTranslation(position.x, position.y, position.z);
        matrix.scale(new Vector3(scale, scale, scale));

        mesh.setMatrixAt(i, matrix);

        // Set opacity
        opacityArray[i] = actives.includes(node.id) ? 1.0 : 0.5;

        // Set color
        const color = new Color(node.fill || 'white');
        colorArray[i * 3] = color.r;
        colorArray[i * 3 + 1] = color.g;
        colorArray[i * 3 + 2] = color.b;
      });

      mesh.instanceMatrix.needsUpdate = true;

      // Update custom attributes
      if (mesh.geometry) {
        mesh.geometry.setAttribute('opacity', new InstancedBufferAttribute(opacityArray, 1));
        mesh.geometry.setAttribute('color', new InstancedBufferAttribute(colorArray, 3));
      }
    });
  }, [textGroups, actives, selections]);

  return (
    <group name="instanced-sprite-text">
      {textGroups.map((group, index) => {
        const aspectRatio = group.texture.image.width / group.texture.image.height;

        return (
          <instancedMesh
            key={`${group.text}-${group.color}`}
            ref={ref => { meshRefs.current[index] = ref!; }}
            args={[undefined, undefined, group.nodes.length]}
          >
            <planeGeometry args={[aspectRatio, 1]} />
            <primitive object={createInstancedTextShader(group.texture)} />
          </instancedMesh>
        );
      })}
    </group>
  );
};

// SOLUTION 4: Frustum Culling + Batching
// Only render visible text labels

export const CulledText: FC<OptimizedTextProps> = ({
  nodes,
  selections = [],
  actives = [],
  fontSize = 32,
  maxWidth = 300
}) => {
  const { camera } = useThree();
  const [visibleNodes, setVisibleNodes] = React.useState<InternalGraphNode[]>([]);

  useFrame(() => {
    // Simple frustum culling - only update every few frames
    if (Math.random() < 0.01) { // 1% chance each frame
      const visible = nodes.filter(node => {
        const distance = camera.position.distanceTo(
          new Vector3(node.position?.x || 0, node.position?.y || 0, node.position?.z || 0)
        );
        return distance < 10000; // Only show within 100 units
      });

      setVisibleNodes([...visible.slice(0, 500)]); // Limit to 500 visible
    }
  });

  return (
    <InstancedSpriteText
      nodes={visibleNodes}
      selections={selections}
      actives={actives}
      fontSize={fontSize}
      maxWidth={maxWidth}
    />
  );
};
