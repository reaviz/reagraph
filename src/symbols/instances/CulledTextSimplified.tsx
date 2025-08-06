import React, {
  FC,
  useMemo,
  useRef,
  useLayoutEffect,
  useEffect,
  useState
} from 'react';
import {
  CanvasTexture,
  Color,
  InstancedMesh,
  PlaneGeometry,
  ShaderMaterial,
  Matrix4,
  Vector3,
  InstancedBufferAttribute,
  Frustum
} from 'three';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { Controller } from '@react-spring/core';
import { InternalGraphNode } from '../../types';
import { getInstanceColor } from '../../utils/instances';
import { animationConfig } from '../../utils/animation';
import { Theme } from '../../themes/theme';

// Simple texture cache with context loss handling
const textureCache = new Map<string, CanvasTexture>();
const MAX_CACHE_SIZE = 100; // Increased for better performance with large datasets
let isContextLost = false;

interface OptimizedTextProps {
  nodes: InternalGraphNode[];
  selections?: string[];
  actives?: string[];
  animated?: boolean;
  fontSize?: number;
  maxWidth?: number;
  theme: Theme;
}

const createTextTexture = (
  text: string,
  fontSize: number,
  color: string,
  maxWidth: number
): CanvasTexture => {
  const cacheKey = `${text}|${fontSize}|${color}|${maxWidth}`;

  // Clear cache if context was lost
  if (isContextLost) {
    textureCache.clear();
    isContextLost = false;
  }

  const cached = textureCache.get(cacheKey);
  if (cached && cached.image && cached.image.width > 0) {
    return cached;
  }

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;

  context.font = `${fontSize}px Arial, sans-serif`;

  // Simple text wrapping
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (context.measureText(testLine).width <= maxWidth - 20) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }

  // Calculate canvas size
  const lineHeight = fontSize * 1.2;
  let maxLineWidth = 0;
  lines.forEach(line => {
    maxLineWidth = Math.max(maxLineWidth, context.measureText(line).width);
  });

  const padding = 10;
  canvas.width = Math.max(64, maxLineWidth + padding * 2);
  canvas.height = Math.max(32, lines.length * lineHeight + padding * 2);

  // Redraw with final canvas size
  context.font = `${fontSize}px Arial, sans-serif`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = color;

  const centerX = canvas.width / 2;
  const startY = canvas.height / 2 - ((lines.length - 1) * lineHeight) / 2;

  lines.forEach((line, index) => {
    const y = startY + index * lineHeight;

    // Simple outline
    context.strokeStyle = 'rgba(0, 0, 0, 0.8)';
    context.lineWidth = 2;
    context.strokeText(line, centerX, y);

    // Fill text
    context.fillText(line, centerX, y);
  });

  const texture = new CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;

  // Aggressive cache management for large datasets
  while (textureCache.size >= MAX_CACHE_SIZE) {
    const firstKey = textureCache.keys().next().value;
    const oldTexture = textureCache.get(firstKey);
    if (oldTexture) {
      try {
        oldTexture.dispose();
      } catch (e) {
        // Ignore disposal errors
      }
      textureCache.delete(firstKey);
    }
  }

  textureCache.set(cacheKey, texture);
  return texture;
};

const createInstancedTextShader = (texture: CanvasTexture): ShaderMaterial => {
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

        vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
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
        if (texColor.a < 0.01) discard;
        gl_FragColor = vec4(texColor.rgb * vColor, texColor.a * vOpacity);
      }
    `,
    uniforms: { map: { value: texture } },
    transparent: true,
    depthWrite: false
  });
};

export const InstancedSpriteText: FC<OptimizedTextProps> = ({
  nodes,
  selections = [],
  actives = [],
  animated = false,
  fontSize = 32,
  maxWidth = 300,
  theme
}) => {
  const { gl } = useThree();
  const meshRefs = useRef<InstancedMesh[]>([]);
  const animationControllers = useRef<Map<string, Controller>>(new Map());
  const seenNodes = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (animated) {
      seenNodes.current.clear();
    }
  }, [animated]);

  // Handle WebGL context loss
  useEffect(() => {
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      console.warn('WebGL context lost, clearing texture cache...');
      isContextLost = true;
      textureCache.clear();
    };

    const handleContextRestored = () => {
      console.log('WebGL context restored');
      isContextLost = false;
    };

    const canvas = gl.domElement;
    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, [gl]);

  const textGroups = useMemo(() => {
    const groups = new Map<string, InternalGraphNode[]>();

    nodes.forEach(node => {
      const nodeColor = getInstanceColor(
        node,
        theme,
        actives,
        selections,
        false
      );

      // Limit text length to prevent too many unique textures with large datasets
      let displayText = node.label || '';
      if (displayText.length > 50) {
        displayText = displayText.substring(0, 47) + '...';
      }

      const key = `${displayText}|${nodeColor}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(node);
    });

    // Limit total number of text groups to prevent context loss
    const sortedEntries = Array.from(groups.entries())
      .sort(([, a], [, b]) => b.length - a.length) // Sort by group size (most nodes first)
      .slice(0, 50); // Limit to 50 most common text groups

    return sortedEntries.map(([key, groupNodes]) => {
      const [text, color] = key.split('|');
      const texture = createTextTexture(text, fontSize, color, maxWidth);

      return {
        text,
        color,
        nodes: groupNodes,
        texture
      };
    });
  }, [nodes, fontSize, maxWidth, theme, actives, selections]);

  useEffect(() => {
    const controllers = animationControllers.current;
    return () => {
      controllers.forEach(controller => {
        controller.stop();
      });
      controllers.clear();
    };
  }, []);

  const animateNode = (
    nodeId: string,
    mesh: InstancedMesh,
    nodeIndex: number,
    startPos: Vector3,
    targetPos: Vector3,
    scale: number
  ) => {
    const controller = new Controller({
      x: startPos.x,
      y: startPos.y,
      z: startPos.z,
      config: animationConfig
    });

    animationControllers.current.set(nodeId, controller);

    controller.start({
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      onChange: () => {
        const matrix = new Matrix4();
        matrix.makeTranslation(
          controller.springs.x.get(),
          controller.springs.y.get(),
          controller.springs.z.get()
        );
        matrix.scale(new Vector3(scale, scale, scale));
        mesh.setMatrixAt(nodeIndex, matrix);
        mesh.instanceMatrix.needsUpdate = true;
      },
      onRest: () => {
        animationControllers.current.delete(nodeId);
      }
    });
  };

  useLayoutEffect(() => {
    textGroups.forEach((group, groupIndex) => {
      const mesh = meshRefs.current[groupIndex];
      if (!mesh) return;

      const { nodes: groupNodes } = group;
      const matrix = new Matrix4();
      const position = new Vector3();
      const opacityArray = new Float32Array(groupNodes.length);
      const colorArray = new Float32Array(groupNodes.length * 3);

      groupNodes.forEach((node, i) => {
        const nodeId = node.id;
        const isNewNode = !seenNodes.current.has(nodeId);

        position.set(
          node.position?.x || 0,
          (node.position?.y || 0) - (node.size || 1) * 2,
          (node.position?.z || 0) + 0.1
        );

        const scale = (node.size || 1) * 2;

        if (animated && isNewNode) {
          const startPos = new Vector3(0, 0, 0);
          seenNodes.current.add(nodeId);

          matrix.makeTranslation(0, 0, 0);
          matrix.scale(new Vector3(scale, scale, scale));
          mesh.setMatrixAt(i, matrix);
          mesh.instanceMatrix.needsUpdate = true;

          requestAnimationFrame(() => {
            animateNode(nodeId, mesh, i, startPos, position, scale);
          });
        } else {
          seenNodes.current.add(nodeId);
          matrix.makeTranslation(position.x, position.y, position.z);
          matrix.scale(new Vector3(scale, scale, scale));
          mesh.setMatrixAt(i, matrix);
        }

        const isActive =
          actives.includes(node.id) || selections.includes(node.id);
        opacityArray[i] = 1;

        const color = new Color(
          isActive ? theme.node.label.activeColor : theme.node.label.color
        );
        colorArray[i * 3] = color.r;
        colorArray[i * 3 + 1] = color.g;
        colorArray[i * 3 + 2] = color.b;
      });

      mesh.instanceMatrix.needsUpdate = true;

      if (mesh.geometry) {
        mesh.geometry.setAttribute(
          'opacity',
          new InstancedBufferAttribute(opacityArray, 1)
        );
        mesh.geometry.setAttribute(
          'color',
          new InstancedBufferAttribute(colorArray, 3)
        );
      }
    });
  }, [textGroups, actives, selections, animated, theme]);

  return (
    <group name="instanced-sprite-text">
      {textGroups.map((group, index) => {
        const aspectRatio =
          group.texture.image.width / group.texture.image.height;
        const geometry = new PlaneGeometry(aspectRatio, 1);

        return (
          <instancedMesh
            key={`${group.text}-${group.color}`}
            ref={ref => {
              meshRefs.current[index] = ref!;
            }}
            args={[geometry, undefined, group.nodes.length]}
          >
            <primitive object={createInstancedTextShader(group.texture)} />
          </instancedMesh>
        );
      })}
    </group>
  );
};

export const CulledText: FC<OptimizedTextProps> = ({
  nodes,
  selections = [],
  actives = [],
  animated = false,
  fontSize = 32,
  maxWidth = 300,
  theme
}) => {
  const { camera } = useThree();
  const [visibleNodes, setVisibleNodes] = useState<InternalGraphNode[]>([]);
  const frustumRef = useRef(new Frustum());
  const matrixRef = useRef(new Matrix4());
  const frameCountRef = useRef(0);

  useFrame(() => {
    frameCountRef.current++;

    // Throttle updates for large datasets to prevent performance issues
    const shouldThrottle =
      nodes.length > 500 && frameCountRef.current % 3 !== 0;
    if (shouldThrottle) {
      return;
    }
    matrixRef.current.multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse
    );
    frustumRef.current.setFromProjectionMatrix(matrixRef.current);

    const visible = nodes.filter(node => {
      const nodePosition = new Vector3(
        node.position?.x || 0,
        node.position?.y || 0,
        node.position?.z || 0
      );

      if (!frustumRef.current.containsPoint(nodePosition)) {
        return false;
      }

      const distance = camera.position.distanceTo(nodePosition);
      if (distance > 5000) {
        return false;
      }

      return true;
    });

    // Dynamically adjust max visible nodes based on total node count
    const maxVisibleNodes =
      nodes.length > 500 ? 200 : nodes.length > 200 ? 250 : 300;

    const prioritized = visible
      .map(node => {
        const distance = camera.position.distanceTo(
          new Vector3(
            node.position?.x || 0,
            node.position?.y || 0,
            node.position?.z || 0
          )
        );

        let priority = 1000 - distance;
        if (actives.includes(node.id)) priority += 500;
        if (selections.includes(node.id)) priority += 1000;

        return { node, priority };
      })
      .sort((a, b) => b.priority - a.priority)
      .slice(0, maxVisibleNodes)
      .map(item => item.node);

    setVisibleNodes(prioritized);
  });

  return (
    <InstancedSpriteText
      nodes={visibleNodes}
      selections={selections}
      actives={actives}
      animated={animated}
      fontSize={fontSize}
      maxWidth={maxWidth}
      theme={theme}
    />
  );
};
