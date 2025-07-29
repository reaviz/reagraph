import React, { FC, useMemo, useRef, useLayoutEffect, useEffect } from 'react';
import {
  CanvasTexture,
  NearestFilter,
  Color,
  InstancedMesh,
  ShaderMaterial,
  Matrix4,
  Vector3,
  InstancedBufferAttribute
} from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { InternalGraphNode } from '../../types';

interface MemoryOptimizedTextProps {
  nodes: InternalGraphNode[];
  selections?: string[];
  actives?: string[];
  fontSize?: number;
  maxWidth?: number;
}

// SOLUTION 1: Memory-Optimized Text with Aggressive Cleanup
// Prevents context loss by managing GPU memory carefully

const textureCache = new Map<string, { texture: CanvasTexture; lastUsed: number; refCount: number }>();
const MAX_CACHE_SIZE = 50; // Limit cached textures
const CACHE_CLEANUP_INTERVAL = 5000; // Cleanup every 5 seconds

// Aggressive texture cleanup
const cleanupTextureCache = () => {
  const now = Date.now();
  const entries = Array.from(textureCache.entries());

  // Sort by last used time
  entries.sort((a, b) => a[1].lastUsed - b[1].lastUsed);

  // Remove old unused textures
  while (textureCache.size > MAX_CACHE_SIZE && entries.length > 0) {
    const [key, data] = entries.shift()!;
    if (data.refCount === 0) {
      data.texture.dispose();
      textureCache.delete(key);
      console.log(`Disposed texture: ${key}`);
    }
  }
};

// Create smaller, more efficient textures
const createOptimizedTexture = (text: string, fontSize: number, color: string, maxWidth: number) => {
  const cacheKey = `${text}|${fontSize}|${color}`;
  const cached = textureCache.get(cacheKey);

  if (cached) {
    cached.lastUsed = Date.now();
    cached.refCount++;
    return cached.texture;
  }

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', {
    alpha: true,
    antialias: false // Disable antialiasing to save memory
  })!;

  // Use smaller font and canvas size to reduce memory
  const actualFontSize = Math.min(fontSize, 24); // Cap font size
  context.font = `${actualFontSize}px Arial`;

  // Truncate very long text to save memory
  const truncatedText = text.length > 20 ? text.substring(0, 17) + '...' : text;

  const metrics = context.measureText(truncatedText);
  const textWidth = Math.min(metrics.width, maxWidth);

  // Use power-of-2 dimensions for better GPU efficiency
  canvas.width = Math.min(256, 2 ** Math.ceil(Math.log2(textWidth + 20)));
  canvas.height = Math.min(64, 2 ** Math.ceil(Math.log2(actualFontSize + 10)));

  // Redraw after canvas resize
  context.font = `${actualFontSize}px Arial`;
  context.fillStyle = color;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(truncatedText, canvas.width / 2, canvas.height / 2);

  const texture = new CanvasTexture(canvas);
  texture.minFilter = NearestFilter;
  texture.magFilter = NearestFilter;
  texture.generateMipmaps = false; // Disable mipmaps to save memory

  // Store in cache with reference counting
  textureCache.set(cacheKey, {
    texture,
    lastUsed: Date.now(),
    refCount: 1
  });

  // Cleanup old textures
  if (textureCache.size > MAX_CACHE_SIZE) {
    cleanupTextureCache();
  }

  return texture;
};

// Memory-efficient shader
const createMemoryEfficientShader = (texture: CanvasTexture) => {
  return new ShaderMaterial({
    vertexShader: `
      attribute float opacity;
      varying vec2 vUv;
      varying float vOpacity;

      void main() {
        vUv = uv;
        vOpacity = opacity;

        vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        mvPosition.xy += position.xy * 2.0;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform sampler2D map;
      varying vec2 vUv;
      varying float vOpacity;

      void main() {
        vec4 texColor = texture2D(map, vUv);
        if (texColor.a < 0.1) discard;
        gl_FragColor = vec4(texColor.rgb, texColor.a * vOpacity);
      }
    `,
    uniforms: {
      map: { value: texture }
    },
    transparent: true,
    depthWrite: false
  });
};

export const MemoryOptimizedText: FC<MemoryOptimizedTextProps> = ({
  nodes,
  selections = [],
  actives = [],
  fontSize = 24, // Reduced default size
  maxWidth = 200 // Reduced default width
}) => {
  const meshRefs = useRef<InstancedMesh[]>([]);
  const { gl } = useThree();

  // Context loss recovery
  useEffect(() => {
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      console.warn('WebGL context lost, attempting recovery...');
    };

    const handleContextRestored = () => {
      console.log('WebGL context restored');
      // Clear cache to force texture recreation
      textureCache.forEach(data => data.texture.dispose());
      textureCache.clear();
    };

    const canvas = gl.domElement;
    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, [gl]);

  // Periodic cleanup
  useEffect(() => {
    const cleanup = setInterval(cleanupTextureCache, CACHE_CLEANUP_INTERVAL);
    return () => clearInterval(cleanup);
  }, []);

  // Limit visible nodes more aggressively
  const limitedNodes = useMemo(() => {
    // Show only closest 200 nodes to reduce memory usage
    return nodes
      .slice(0, 200)
      .filter(node => node.label && node.label.length > 0);
  }, [nodes]);

  // Group by text with smaller groups
  const textGroups = useMemo(() => {
    const groups = new Map<string, InternalGraphNode[]>();

    limitedNodes.forEach(node => {
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
        texture: createOptimizedTexture(text, fontSize, color, maxWidth)
      };
    });
  }, [limitedNodes, fontSize, maxWidth]);

  // Cleanup textures when component unmounts
  useEffect(() => {
    return () => {
      textGroups.forEach(group => {
        const cached = textureCache.get(`${group.text}|${fontSize}|${group.color}`);
        if (cached) {
          cached.refCount--;
          if (cached.refCount <= 0) {
            cached.texture.dispose();
            textureCache.delete(`${group.text}|${fontSize}|${group.color}`);
          }
        }
      });
    };
  }, [textGroups, fontSize]);

  // Update instances with memory efficiency
  useLayoutEffect(() => {
    textGroups.forEach((group, groupIndex) => {
      const mesh = meshRefs.current[groupIndex];
      if (!mesh || !group.nodes.length) return;

      const { nodes: groupNodes } = group;
      const matrix = new Matrix4();
      const position = new Vector3();

      const opacityArray = new Float32Array(groupNodes.length);

      groupNodes.forEach((node, i) => {
        position.set(
          node.position?.x || 0,
          (node.position?.y || 0) - (node.size || 1) * 1.5,
          (node.position?.z || 0) + 0.1
        );

        const scale = Math.min((node.size || 1) * 1.5, 3); // Cap scale
        matrix.makeTranslation(position.x, position.y, position.z);
        matrix.scale(new Vector3(scale, scale, scale));
        mesh.setMatrixAt(i, matrix);

        opacityArray[i] = actives.includes(node.id) ? 1.0 : 0.3;
      });

      mesh.instanceMatrix.needsUpdate = true;

      if (mesh.geometry) {
        mesh.geometry.setAttribute('opacity', new InstancedBufferAttribute(opacityArray, 1));
      }
    });
  }, [textGroups, actives]);

  return (
    <group name="memory-optimized-text">
      {textGroups.slice(0, 10).map((group, index) => { // Limit to 10 groups max
        const aspectRatio = group.texture.image.width / group.texture.image.height;

        return (
          <instancedMesh
            key={`${group.text}-${group.color}`}
            ref={ref => { meshRefs.current[index] = ref!; }}
            args={[undefined, undefined, Math.min(group.nodes.length, 50)]} // Cap instances per group
          >
            <planeGeometry args={[aspectRatio, 1]} />
            <primitive object={createMemoryEfficientShader(group.texture)} />
          </instancedMesh>
        );
      })}
    </group>
  );
};

// SOLUTION 2: Ultra-Low Memory Text (Emergency Mode)
// Fallback when context is lost or memory is extremely limited

export const UltraLowMemoryText: FC<MemoryOptimizedTextProps> = ({
  nodes,
  actives = []
}) => {
  // Only show 50 most important nodes as simple colored points
  const importantNodes = useMemo(() => {
    return nodes
      .filter(node => actives.includes(node.id))
      .slice(0, 50);
  }, [nodes, actives]);

  return (
    <group name="ultra-low-memory-text">
      {importantNodes.map(node => (
        <mesh
          key={node.id}
          position={[
            node.position?.x || 0,
            (node.position?.y || 0) - (node.size || 1) * 2,
            (node.position?.z || 0) + 0.1
          ]}
        >
          <circleGeometry args={[0.5, 8]} />
          <meshBasicMaterial
            color={node.fill || 'white'}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
    </group>
  );
};

// SOLUTION 3: Context Recovery Hook
// Automatically handles context loss and recovery

export const useWebGLContextRecovery = () => {
  const { gl } = useThree();
  const [contextLost, setContextLost] = React.useState(false);

  useEffect(() => {
    const canvas = gl.domElement;

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      setContextLost(true);
      console.warn('WebGL context lost');

      // Clear all caches
      textureCache.forEach(data => {
        try {
          data.texture.dispose();
        } catch (e) {
          // Ignore disposal errors during context loss
        }
      });
      textureCache.clear();
    };

    const handleContextRestored = () => {
      setContextLost(false);
      console.log('WebGL context restored');
    };

    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, [gl]);

  return { contextLost };
};

// SOLUTION 4: Adaptive Text Component
// Automatically switches between modes based on performance

export const AdaptiveText: FC<MemoryOptimizedTextProps> = (props) => {
  const { contextLost } = useWebGLContextRecovery();
  const [performanceMode, setPerformanceMode] = React.useState<'normal' | 'low' | 'ultra'>('normal');
  const frameTimeRef = useRef<number[]>([]);

  useFrame((state, delta) => {
    // Monitor performance
    frameTimeRef.current.push(delta);
    if (frameTimeRef.current.length > 60) {
      frameTimeRef.current.shift();
    }

    if (frameTimeRef.current.length === 60) {
      const avgFrameTime = frameTimeRef.current.reduce((a, b) => a + b) / 60;
      const fps = 1 / avgFrameTime;

      if (fps < 30 && performanceMode === 'normal') {
        setPerformanceMode('low');
        console.log('Switching to low memory mode');
      } else if (fps < 15 && performanceMode === 'low') {
        setPerformanceMode('ultra');
        console.log('Switching to ultra low memory mode');
      } else if (fps > 45 && performanceMode !== 'normal') {
        setPerformanceMode('normal');
        console.log('Switching back to normal mode');
      }
    }
  });

  if (contextLost || performanceMode === 'ultra') {
    return <UltraLowMemoryText {...props} />;
  }

  if (performanceMode === 'low') {
    return <MemoryOptimizedText {...props} fontSize={16} maxWidth={150} />;
  }

  return <MemoryOptimizedText {...props} />;
};
