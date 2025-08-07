import React, { FC, useMemo, useRef, useLayoutEffect, useEffect, useState } from 'react';
import {
  InstancedMesh,
  Matrix4,
  Vector3,
  Color,
  MeshBasicMaterial,
  BufferGeometry,
  Float32BufferAttribute,
  InstancedBufferAttribute,
  Group
} from 'three';
import { TextGeometry, FontLoader } from 'three-stdlib';
import { useFrame, useThree } from '@react-three/fiber';
import { Controller } from '@react-spring/core';
import { InternalGraphNode } from '../../../types';
import { getInstanceColor } from '../../../utils/instances';
import { animationConfig } from '../../../utils/animation';
import { Theme } from '../../../themes/theme';

interface InstancedTextGeometryProps {
  nodes: InternalGraphNode[];
  selections?: string[];
  actives?: string[];
  animated?: boolean;
  fontSize?: number;
  maxWidth?: number;
  theme: Theme;
  fontUrl?: string;
}

// Font cache to prevent reloading
const fontCache = new Map<string, any>();
const geometryCache = new Map<string, BufferGeometry>();

// Default font data (embedded as base64 or URL)
const DEFAULT_FONT_URL = 'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json';

const loadFont = async (fontUrl: string): Promise<any> => {
  if (fontCache.has(fontUrl)) {
    return fontCache.get(fontUrl);
  }

  try {
    const loader = new FontLoader();
    const font = await new Promise((resolve, reject) => {
      loader.load(fontUrl, resolve, undefined, reject);
    });
    fontCache.set(fontUrl, font);
    return font;
  } catch (error) {
    console.warn('Failed to load font, falling back to default:', error);
    // Fallback to default font
    if (fontUrl !== DEFAULT_FONT_URL) {
      return loadFont(DEFAULT_FONT_URL);
    }
    throw error;
  }
};

const createTextGeometry = (
  text: string,
  font: any,
  fontSize: number,
  maxWidth: number
): BufferGeometry => {
  const cacheKey = `${text}|${fontSize}|${maxWidth}`;

  if (geometryCache.has(cacheKey)) {
    return geometryCache.get(cacheKey)!.clone();
  }

  // Handle text wrapping
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  // Simple text wrapping based on character count
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length * fontSize * 0.6 <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  // Create geometry for each line
  const geometries: BufferGeometry[] = [];
  const lineHeight = fontSize * 1.2;
  const totalHeight = lines.length * lineHeight;

  lines.forEach((line, index) => {
    if (!line.trim()) return;

    const geometry = new TextGeometry(line, {
      font: font,
      size: fontSize,
      height: 0.1,
      curveSegments: 12,
      bevelEnabled: false,
      bevelThickness: 0,
      bevelSize: 0,
      bevelOffset: 0
    });

    // Center the geometry
    geometry.computeBoundingBox();
    const box = geometry.boundingBox;
    if (box) {
      const centerX = -(box.max.x + box.min.x) / 2;
      const centerY = -(box.max.y + box.min.y) / 2;
      geometry.translate(centerX, centerY, 0);
    }

    // Position each line vertically
    geometry.translate(0, totalHeight / 2 - (index + 0.5) * lineHeight, 0);
    geometries.push(geometry);
  });

  // Use the first geometry for now (simplified approach)
  let mergedGeometry: BufferGeometry;
  if (geometries.length === 1) {
    mergedGeometry = geometries[0];
  } else if (geometries.length > 1) {
    // For multiple lines, just use the first geometry
    // In a full implementation, you'd want to properly merge geometries
    mergedGeometry = geometries[0];
    // Clean up other geometries
    for (let i = 1; i < geometries.length; i++) {
      geometries[i].dispose();
    }
  } else {
    // Empty text - create minimal geometry
    mergedGeometry = new BufferGeometry();
  }

  // Cache the geometry
  geometryCache.set(cacheKey, mergedGeometry.clone());
  return mergedGeometry;
};

export const InstancedTextGeometry: FC<InstancedTextGeometryProps> = ({
  nodes,
  selections = [],
  actives = [],
  animated = false,
  fontSize = 32,
  maxWidth = 300,
  theme,
  fontUrl = DEFAULT_FONT_URL
}) => {
  const { gl } = useThree();
  const [font, setFont] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const meshRefs = useRef<InstancedMesh[]>([]);
  const geometryRefs = useRef<BufferGeometry[]>([]);
  const materialRefs = useRef<MeshBasicMaterial[]>([]);
  const animationControllers = useRef<Map<string, Controller>>(new Map());
  const seenNodes = useRef<Set<string>>(new Set());

  // Load font
  useEffect(() => {
    setIsLoading(true);
    loadFont(fontUrl)
      .then(loadedFont => {
        setFont(loadedFont);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Failed to load font:', error);
        setIsLoading(false);
      });
  }, [fontUrl]);

  // Reset seen nodes when animated prop changes
  useEffect(() => {
    if (animated) {
      seenNodes.current.clear();
    }
  }, [animated, nodes.length]);

  // Group nodes by text content and color
  const textGroups = useMemo(() => {
    if (!font || isLoading) return [];

    const groups = new Map<string, InternalGraphNode[]>();

    nodes.forEach(node => {
      const nodeColor = getInstanceColor(
        node,
        theme,
        actives,
        selections,
        false
      );
      const key = `${node.label}|${nodeColor}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(node);
    });

    return Array.from(groups.entries()).map(([key, groupNodes]) => {
      const [text, color] = key.split('|');
      const geometry = createTextGeometry(text, font, fontSize, maxWidth);

      return {
        text,
        color,
        nodes: groupNodes,
        geometry
      };
    });
  }, [nodes, font, fontSize, maxWidth, theme, actives, selections, isLoading]);

  // Cleanup geometries and materials when component unmounts
  useEffect(() => {
    return () => {
      // Stop all animation controllers
      animationControllers.current.forEach(controller => {
        try {
          controller.stop();
        } catch (e) {
          // Ignore errors during cleanup
        }
      });
      animationControllers.current.clear();

      // Dispose geometries and materials
      geometryRefs.current.forEach(geometry => {
        try {
          geometry.dispose();
        } catch (e) {
          console.warn('Error disposing geometry:', e);
        }
      });
      geometryRefs.current = [];

      materialRefs.current.forEach(material => {
        try {
          material.dispose();
        } catch (e) {
          console.warn('Error disposing material:', e);
        }
      });
      materialRefs.current = [];

      // Clear mesh refs
      meshRefs.current = [];
    };
  }, []);

  // Animation helper function
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

  // Update instance matrices
  useLayoutEffect(() => {
    if (!font || isLoading) return;

    textGroups.forEach((group, groupIndex) => {
      const mesh = meshRefs.current[groupIndex];
      if (!mesh) return;

      const { nodes: groupNodes } = group;
      const matrix = new Matrix4();
      const position = new Vector3();

      groupNodes.forEach((node, i) => {
        const nodeId = node.id;
        const isNewNode = !seenNodes.current.has(nodeId);

        // Set target position
        position.set(
          node.position?.x || 0,
          (node.position?.y || 0) - (node.size || 1) * 2,
          (node.position?.z || 0) + 0.1
        );

        const scale = (node.size || 1) * 0.1; // Scale down for 3D text

        if (animated && isNewNode) {
          // New node - animate from center
          const startPos = new Vector3(0, 0, 0);
          seenNodes.current.add(nodeId);

          // Set initial position at center
          matrix.makeTranslation(0, 0, 0);
          matrix.scale(new Vector3(scale, scale, scale));
          mesh.setMatrixAt(i, matrix);
          mesh.instanceMatrix.needsUpdate = true;

          // Start animation immediately after setting initial position
          requestAnimationFrame(() => {
            animateNode(nodeId, mesh, i, startPos, position, scale);
          });
        } else {
          // Existing node or no animation - set directly
          seenNodes.current.add(nodeId);
          matrix.makeTranslation(position.x, position.y, position.z);
          matrix.scale(new Vector3(scale, scale, scale));
          mesh.setMatrixAt(i, matrix);
        }
      });

      // Update instance matrix
      mesh.instanceMatrix.needsUpdate = true;
    });
  }, [textGroups, actives, selections, animated, fontSize, maxWidth, theme, font, isLoading]);

  if (isLoading || !font) {
    return null;
  }

  return (
    <group name="instanced-text-geometry">
      {textGroups.map((group, index) => {
        // Create material for this text group
        const material = new MeshBasicMaterial({
          color: new Color(group.color),
          transparent: true,
          opacity: 1.0
        });
        materialRefs.current[index] = material;

        // Store geometry reference
        geometryRefs.current[index] = group.geometry;

        return (
          <instancedMesh
            key={`${group.text}-${group.color}`}
            ref={ref => {
              meshRefs.current[index] = ref!;
            }}
            args={[group.geometry, material, group.nodes.length]}
          />
        );
      })}
    </group>
  );
};
