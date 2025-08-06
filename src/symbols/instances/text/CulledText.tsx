import React, { FC, useMemo, useRef, useLayoutEffect, useEffect } from 'react';
import {
  CanvasTexture,
  NearestFilter,
  Color,
  InstancedMesh,
  PlaneGeometry,
  ShaderMaterial,
  Matrix4,
  Vector3,
  InstancedBufferAttribute
} from 'three';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { Controller } from '@react-spring/core';
import { InternalGraphNode } from '../../../types';
import { getInstanceColor } from '../../../utils/instances';
import { animationConfig } from '../../../utils/animation';
import { Theme } from '../../../themes/theme';
import { fragmentShader } from './shaders/fragmentShader';
import { vertexShader } from './shaders/vertexShader';

// Texture cache to prevent memory leaks and WebGL context loss
const textureCache = new Map<
  string,
  {
    texture: CanvasTexture;
    lastUsed: number;
    refCount: number;
    canvas: HTMLCanvasElement;
    isActive: boolean;
    frameProtected: number;
  }
>();
const canvasElements = new Set<HTMLCanvasElement>();
const activeTextures = new Set<string>();
let currentFrame = 0;
const MAX_CACHE_SIZE = 20; // Further reduce cache size to prevent memory issues
const CACHE_CLEANUP_INTERVAL = 30000; // Less frequent cleanup (30 seconds)
const MAX_CANVAS_SIZE = 256; // Smaller canvas dimensions to reduce memory

// Global cleanup interval reference for proper disposal
let cleanupIntervalId: ReturnType<typeof setInterval> | null = null;
let forceCleanupThreshold = 0;

// Minimal cleanup - only remove truly unused textures
const cleanupTextureCache = () => {
  // Disable most cleanup to prevent text disappearing
  // Only cleanup when cache is extremely large
  if (textureCache.size <= 100) {
    return;
  }

  const now = Date.now();
  const entries = Array.from(textureCache.entries());

  // Only remove textures that are very old and completely unused
  entries.forEach(([key, data]) => {
    const veryOld = now - data.lastUsed > 600000; // 10 minutes
    const completelyUnused = data.refCount === 0 && !data.isActive;
    const notInActiveSet = !activeTextures.has(key);

    if (
      veryOld &&
      completelyUnused &&
      notInActiveSet &&
      textureCache.size > 100
    ) {
      try {
        if (data.texture) {
          data.texture.dispose();
        }
        if (data.canvas) {
          canvasElements.delete(data.canvas);
        }
        textureCache.delete(key);
      } catch (e) {
        console.warn('Error disposing texture:', e);
      }
    }
  });
};

// Initialize cleanup interval with memory monitoring
const initializeCleanup = () => {
  if (!cleanupIntervalId) {
    cleanupIntervalId = setInterval(() => {
      // Monitor memory usage and trigger cleanup only if needed
      if (typeof performance !== 'undefined' && (performance as any).memory) {
        const memoryInfo = (performance as any).memory;
        const memoryUsageRatio =
          memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit;

        // Only cleanup when memory usage is high
        if (memoryUsageRatio > 0.85) {
          console.warn(
            `High memory usage detected: ${(memoryUsageRatio * 100).toFixed(1)}%, triggering cleanup`
          );
          cleanupTextureCache();
        }
      }
    }, CACHE_CLEANUP_INTERVAL);
  }
};

// Cleanup all textures and stop interval
const destroyTextureCache = () => {
  if (cleanupIntervalId) {
    clearInterval(cleanupIntervalId);
    cleanupIntervalId = null;
  }

  textureCache.forEach(data => {
    try {
      data.texture.dispose();
      if (data.canvas) {
        canvasElements.delete(data.canvas);
        const ctx = data.canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, data.canvas.width, data.canvas.height);
        }
        data.canvas.width = 0;
        data.canvas.height = 0;
      }
    } catch (e) {
      // Ignore disposal errors during cleanup
    }
  });
  textureCache.clear();
  canvasElements.clear();

  // Also clear shader materials
  clearShaderMaterials();
};

// Initialize cleanup on module load
initializeCleanup();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', destroyTextureCache);
}

interface OptimizedTextProps {
  nodes: InternalGraphNode[];
  selections?: string[];
  draggingIds?: string[];
  actives?: string[];
  animated?: boolean;
  fontSize?: number;
  maxWidth?: number;
  theme: Theme;
}

// SOLUTION 1: Instanced Mesh with Custom Shader (Best Performance)
// Groups identical texts and uses instancing to reduce draw calls

const createTextTexture = (
  text: string,
  fontSize: number,
  color: string,
  maxWidth: number
) => {
  const cacheKey = `${text}|${fontSize}|${color}|${maxWidth}`;
  const cached = textureCache.get(cacheKey);

  if (cached) {
    cached.lastUsed = Date.now();
    cached.refCount++;
    // Ensure texture is still valid and mark as active with frame protection
    if (
      cached.texture &&
      cached.canvas &&
      cached.canvas.width > 0 &&
      cached.canvas.height > 0
    ) {
      cached.isActive = true;
      cached.frameProtected = currentFrame + 60; // Protect for 60 frames (~1 second at 60fps)
      activeTextures.add(cacheKey);
      return cached.texture;
    } else {
      // Remove invalid cache entry
      textureCache.delete(cacheKey);
      canvasElements.delete(cached.canvas);
      activeTextures.delete(cacheKey);
    }
  }

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;

  // Track canvas element for cleanup
  canvasElements.add(canvas);

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

  // Use higher resolution for better quality when zoomed
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x for memory
  const desiredWidth = Math.max(16, maxLineWidth + 20);
  const desiredHeight = Math.max(16, totalHeight + 20);
  const targetWidth = Math.max(
    64,
    Math.min(MAX_CANVAS_SIZE, desiredWidth * pixelRatio)
  );
  const targetHeight = Math.max(
    64,
    Math.min(MAX_CANVAS_SIZE, desiredHeight * pixelRatio)
  );

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  // Scale context for high DPI
  context.scale(pixelRatio, pixelRatio);

  // Use simple font scaling instead of complex calculations
  let actualFontSize = fontSize;
  if (desiredWidth > MAX_CANVAS_SIZE || desiredHeight > MAX_CANVAS_SIZE) {
    const scaleX = MAX_CANVAS_SIZE / desiredWidth;
    const scaleY = MAX_CANVAS_SIZE / desiredHeight;
    const scale = Math.min(scaleX, scaleY);
    actualFontSize = Math.floor(fontSize * scale);
  }

  // Redraw with potentially scaled font
  context.font = `${actualFontSize * 1.2}px Arial, sans-serif`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  const actualLineHeight = actualFontSize * 1.2;
  const actualTotalHeight = lines.length * actualLineHeight;
  const startY =
    canvas.height / pixelRatio / 2 - (actualTotalHeight - actualLineHeight) / 2;

  // Draw text with multi-layer halo/glow effect
  context.font = `${actualFontSize}px Arial, sans-serif`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.lineJoin = 'round';
  context.miterLimit = 2;

  lines.forEach((line, index) => {
    const x = canvas.width / pixelRatio / 2;
    const y = startY + index * actualLineHeight;

    // Draw multiple stroke layers for soft halo effect
    const maxStroke = Math.max(6, actualFontSize / 6);

    // Outer glow layers
    for (let i = maxStroke; i > 0; i--) {
      const alpha = 0.9 * (1 - i / maxStroke);
      context.strokeStyle = `rgba(0, 0, 0, ${alpha})`;
      context.lineWidth = i * 2.5;
      context.strokeText(line, x, y);
    }

    // Draw main text
    context.fillStyle = color;
    context.fillText(line, x, y);
  });

  const texture = new CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true; // Enable mipmaps for better quality when scaled
  texture.format = THREE.RGBAFormat;
  texture.type = THREE.UnsignedByteType;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  // Force texture upload to prevent deferred allocation issues
  texture.needsUpdate = true;

  // Add validation flag
  (texture as any)._isValid = true;

  // Store in cache with reference counting and canvas reference
  textureCache.set(cacheKey, {
    texture,
    lastUsed: Date.now(),
    refCount: 1,
    canvas,
    isActive: true,
    frameProtected: currentFrame + 60 // Protect for 60 frames
  });

  // Mark texture as active
  activeTextures.add(cacheKey);

  // Only trigger cleanup if cache is much larger than limit
  if (textureCache.size > MAX_CACHE_SIZE * 3) {
    setTimeout(() => cleanupTextureCache(), 100);
  }

  return texture;
};

// Shader material cache to prevent recreation
const shaderMaterialCache = new Map<string, ShaderMaterial>();

// Custom shader for instanced billboards
const createInstancedTextShader = (texture: CanvasTexture) => {
  const textureId = texture.uuid;

  // Check if shader already exists for this texture
  let material = shaderMaterialCache.get(textureId);

  if (material) {
    // Update texture uniform if material exists
    material.uniforms.map.value = texture;
    return material;
  }

  // Create new shader material
  material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      map: { value: texture }
    },
    transparent: true,
    depthWrite: false
  });

  shaderMaterialCache.set(textureId, material);
  return material;
};

// Clear all shader materials
const clearShaderMaterials = () => {
  shaderMaterialCache.forEach(material => {
    try {
      material.dispose();
    } catch (e) {
      // Ignore disposal errors during cleanup
    }
  });
  shaderMaterialCache.clear();
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
  const currentTextGroupsRef = useRef<
    { text: string; color: string; fontSize: number; maxWidth: number }[]
  >([]);
  const geometryRefs = useRef<PlaneGeometry[]>([]);
  const animationControllers = useRef<Map<string, Controller>>(new Map());
  const seenNodes = useRef<Set<string>>(new Set());

  // Reset seen nodes when animated prop changes to ensure animations restart
  useEffect(() => {
    if (animated) {
      seenNodes.current.clear();
    }
  }, [animated]);

  // Update frame counter for texture protection
  useEffect(() => {
    const updateFrame = () => {
      currentFrame++;
      requestAnimationFrame(updateFrame);
    };
    const frameId = requestAnimationFrame(updateFrame);
    return () => cancelAnimationFrame(frameId);
  }, []);

  // WebGL context recovery
  useEffect(() => {
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      console.warn('WebGL context lost, clearing texture cache...');
      // Clear cache to prevent stale textures after context recovery
      textureCache.forEach(data => {
        try {
          data.texture.dispose();
          if (data.canvas) {
            canvasElements.delete(data.canvas);
            const ctx = data.canvas.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, data.canvas.width, data.canvas.height);
            }
            data.canvas.width = 0;
            data.canvas.height = 0;
          }
        } catch (e) {
          // Ignore disposal errors during context loss
        }
      });
      textureCache.clear();
      canvasElements.clear();

      // Also clear shader materials on context loss
      clearShaderMaterials();
    };

    const handleContextRestored = () => {
      console.log('WebGL context restored');
      // Re-initialize cleanup after context restoration
      initializeCleanup();
    };

    const canvas = gl.domElement;
    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, [gl]);

  // Group nodes by text content and color
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
      const key = `${node.label}|${nodeColor}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(node);
    });

    return Array.from(groups.entries()).map(([key, groupNodes]) => {
      const [text, color] = key.split('|');
      const texture = createTextTexture(text, fontSize, color, maxWidth);

      // Ensure texture stays active while in use with frame protection
      const cacheKey = `${text}|${color}|${fontSize}|${maxWidth}`;
      const cached = textureCache.get(cacheKey);
      if (cached) {
        cached.isActive = true;
        cached.lastUsed = Date.now();
        cached.frameProtected = currentFrame + 120; // Longer protection during active use
        activeTextures.add(cacheKey);
      }

      return {
        text,
        color,
        nodes: groupNodes,
        texture
      };
    });
  }, [nodes, fontSize, maxWidth, theme, actives, selections]);

  // Cleanup textures and geometries when component unmounts or textGroups change
  useEffect(() => {
    // Don't dispose textures during re-renders - let cache cleanup handle it
    // This prevents blinking and ensures text remains visible

    // Dispose old geometries
    geometryRefs.current.forEach(geometry => {
      try {
        geometry.dispose();
      } catch (e) {
        console.warn('Error disposing geometry:', e);
      }
    });
    geometryRefs.current = [];

    // Update current reference WITHOUT disposing active textures
    currentTextGroupsRef.current = textGroups.map(group => ({
      text: group.text,
      color: group.color,
      fontSize,
      maxWidth
    }));

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

      // Don't dispose textures on unmount - prevents blinking on component changes
      // Just mark as inactive and let the cleanup timer handle it much later if needed
      currentTextGroupsRef.current.forEach(
        ({ text, color, fontSize, maxWidth }) => {
          const cacheKey = `${text}|${fontSize}|${color}|${maxWidth}`;
          const cached = textureCache.get(cacheKey);
          if (cached) {
            cached.isActive = false;
            activeTextures.delete(cacheKey);
          }
        }
      );

      // Dispose all geometries
      geometryRefs.current.forEach(geometry => {
        try {
          geometry.dispose();
        } catch (e) {
          // Ignore disposal errors during cleanup
        }
      });
      geometryRefs.current = [];

      // Clear mesh refs
      meshRefs.current = [];
    };
  }, [textGroups, fontSize, maxWidth]);

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

  // Update instance matrices and attributes
  useLayoutEffect(() => {
    // Keep textures active during rendering updates
    textGroups.forEach(group => {
      const cacheKey = `${group.text}|${group.color}|${fontSize}|${maxWidth}`;
      const cached = textureCache.get(cacheKey);
      if (cached) {
        cached.isActive = true;
        cached.lastUsed = Date.now();
        activeTextures.add(cacheKey);
      }
    });

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
        const nodeId = node.id;
        const isNewNode = !seenNodes.current.has(nodeId);

        // Set target position
        position.set(
          node.position?.x || 0,
          (node.position?.y || 0) - (node.size || 1) * 2,
          (node.position?.z || 0) + 0.1
        );

        const scale = (node.size || 1) * 2;

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

        // Set opacity
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

      // Make sure instance matrix is updated for all changes
      mesh.instanceMatrix.needsUpdate = true;

      // Update custom attributes
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
  }, [textGroups, actives, selections, animated, fontSize, maxWidth, theme]);

  return (
    <group name="instanced-sprite-text">
      {textGroups.map((group, index) => {
        const aspectRatio =
          group.texture.image.width / group.texture.image.height;

        // Create and store geometry reference for proper disposal
        const geometry = new PlaneGeometry(aspectRatio, 1);
        geometryRefs.current[index] = geometry;

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
  const { camera, size } = useThree();
  const [visibleNodes, setVisibleNodes] = React.useState<InternalGraphNode[]>(
    []
  );
  const frustumRef = useRef(new THREE.Frustum());
  const matrixRef = useRef(new Matrix4());
  const frameCountRef = useRef(0);

  const lastCameraPositionRef = useRef<{ x: number; y: number; z: number }>({
    x: camera.position.x,
    y: camera.position.y,
    z: camera.position.z
  });
  const lastNodesHashRef = useRef<string>('');

  useFrame(() => {
    frameCountRef.current++;

    // Create a hash of node positions to detect changes
    const nodesHash = nodes
      .map(
        n =>
          `${n.id}:${n.position?.x || 0},${n.position?.y || 0},${n.position?.z || 0}`
      )
      .join('|');
    const nodesChanged = lastNodesHashRef.current !== nodesHash;

    // For smooth movement, update every frame when nodes are changing position
    // Only throttle when nodes are static and camera isn't moving
    const shouldThrottle = !nodesChanged && frameCountRef.current % 30 !== 0;

    if (shouldThrottle) {
      return;
    }

    const lastPos = lastCameraPositionRef.current;
    const currPos = camera.position;
    const hasMoved =
      lastPos.x !== currPos.x ||
      lastPos.y !== currPos.y ||
      lastPos.z !== currPos.z;

    // Always update if camera moved OR nodes changed OR if we don't have any visible nodes yet
    if (!hasMoved && !nodesChanged && visibleNodes.length > 0) {
      return;
    }

    if (nodesChanged) {
      lastNodesHashRef.current = nodesHash;
    }

    lastCameraPositionRef.current = {
      x: currPos.x,
      y: currPos.y,
      z: currPos.z
    };

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

      const isInFrustum = frustumRef.current.containsPoint(nodePosition);
      if (!isInFrustum) {
        return false;
      }

      const distance = camera.position.distanceTo(nodePosition);
      if (distance > 8000) {
        return false;
      }

      const screenPosition = nodePosition.clone().project(camera);
      const isOnScreen =
        screenPosition.x >= -1.2 &&
        screenPosition.x <= 1.2 &&
        screenPosition.y >= -1.2 &&
        screenPosition.y <= 1.2 &&
        screenPosition.z >= 0 &&
        screenPosition.z <= 1;

      if (!isOnScreen) {
        return false;
      }

      const nodeSize = node.size || 1;
      const fov = (camera as any).fov;
      let projectedSize = 0;
      if (typeof fov === 'number') {
        projectedSize =
          (nodeSize * size.height) /
          (distance * Math.tan((fov * Math.PI) / 360));
      } else {
        projectedSize = nodeSize * 2;
      }
      if (projectedSize < 10) {
        return false;
      }

      return true;
    });

    const prioritizedVisible = visible
      .map(node => {
        const distance = camera.position.distanceTo(
          new Vector3(
            node.position?.x || 0,
            node.position?.y || 0,
            node.position?.z || 0
          )
        );

        let priority = 1000 - distance;
        if (actives.includes(node.id)) {
          priority += 500;
        }
        if (selections.includes(node.id)) {
          priority += 1000;
        }

        return { node, distance, priority };
      })
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 500)
      .map(item => item.node);

    setVisibleNodes(prioritizedVisible);
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
