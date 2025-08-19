import React, {
  FC,
  useMemo,
  useRef,
  useLayoutEffect,
  useState,
  useEffect,
  useCallback
} from 'react';
import { Instances, Instance } from '@react-three/drei';
import { Controller } from '@react-spring/three';

import {
  Color,
  DoubleSide,
  ShaderMaterial,
  InstancedBufferAttribute,
  CanvasTexture,
  NearestFilter,
  InstancedMesh
} from 'three';

import { InternalGraphNode } from '../../types';
import { Theme } from '../../themes';
import { InstancedEvents } from '../../types';
import { animationConfig, getInstanceColor } from '../../utils';
import { iconFragmentShader, iconVertexShader } from './shaders/iconShaders';

interface IconAtlas {
  texture: CanvasTexture;
  canvas: HTMLCanvasElement;
  iconCount: number;
}

interface IconAtlasUV {
  u: number;
  v: number;
  width: number;
  height: number;
  atlasIndex: number;
}

interface InstancedIconProps extends InstancedEvents {
  nodes: InternalGraphNode[];
  selections?: string[];
  actives?: string[];
  animated?: boolean;
  draggable?: boolean;
  theme?: Theme;
  draggingIds?: string[];
  hoveredNodeId?: string;
}

// Helper function to create icon atlases from image URLs
const createIconAtlases = async (iconUrls: string[]) => {
  if (iconUrls.length === 0) {
    return { atlases: [], uvMapping: new Map() };
  }

  const iconSize = 256;
  const maxTextureSize = 2048;
  const maxIconsPerRow = Math.floor(maxTextureSize / iconSize);
  const maxIconsPerAtlas = maxIconsPerRow * maxIconsPerRow;

  const atlases = [];
  const allUvMappings = new Map();

  const iconPromises = iconUrls.map(
    url =>
      new Promise<{ url: string; image: HTMLImageElement | null }>(resolve => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve({ url, image: img });
        img.onerror = () => resolve({ url, image: null });
        img.src = url;
      })
  );

  const loadedIcons = await Promise.all(iconPromises);
  const validIcons = loadedIcons.filter(icon => icon.image !== null);

  for (
    let startIndex = 0;
    startIndex < validIcons.length;
    startIndex += maxIconsPerAtlas
  ) {
    const atlasIcons = validIcons.slice(
      startIndex,
      startIndex + maxIconsPerAtlas
    );
    const atlasIndex = atlases.length;

    const cols = Math.min(
      maxIconsPerRow,
      Math.ceil(Math.sqrt(atlasIcons.length))
    );
    const rows = Math.ceil(atlasIcons.length / cols);

    const atlasCanvas = document.createElement('canvas');
    const atlasContext = atlasCanvas.getContext('2d')!;

    atlasCanvas.width = cols * iconSize;
    atlasCanvas.height = rows * iconSize;
    atlasContext.clearRect(0, 0, atlasCanvas.width, atlasCanvas.height);

    atlasIcons.forEach(({ url, image }, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = col * iconSize;
      const y = row * iconSize;

      if (image) {
        atlasContext.drawImage(image, x, y, iconSize, iconSize);
      }

      allUvMappings.set(url, {
        u: x / atlasCanvas.width,
        v: y / atlasCanvas.height,
        width: iconSize / atlasCanvas.width,
        height: iconSize / atlasCanvas.height,
        atlasIndex
      });
    });

    const texture = new CanvasTexture(atlasCanvas);
    texture.minFilter = NearestFilter;
    texture.magFilter = NearestFilter;

    atlases.push({
      texture,
      canvas: atlasCanvas,
      iconCount: atlasIcons.length
    });
  }

  return { atlases, uvMapping: allUvMappings };
};

// Custom shader material for instanced icon sprites (billboard effect)
const createIconSpriteShaderMaterial = (texture: CanvasTexture) => {
  return new ShaderMaterial({
    vertexShader: iconVertexShader,
    fragmentShader: iconFragmentShader,
    uniforms: {
      iconTexture: { value: texture },
      opacity: { value: 1.0 }
    },
    transparent: true,
    depthTest: false,
    depthWrite: false,
    side: DoubleSide
  });
};

export const InstancedIcon: FC<InstancedIconProps> = ({
  nodes,
  selections = [],
  actives = [],
  animated = true,
  draggable = false,
  theme,
  draggingIds = [],
  hoveredNodeId,
  onPointerOver,
  onPointerOut,
  onPointerDown,
  onClick
}) => {
  const instancesRef = useRef<InstancedMesh | null>(null);
  const iconInstancesRefs = useRef<InstancedMesh[]>([]);
  const instanceRefs = useRef<Map<string, InstancedMesh>>(new Map());
  const activeControllers = useRef<Map<string, Controller>>(new Map());
  const initializedNodes = useRef<Set<string>>(new Set());
  const [iconAtlases, setIconAtlases] = useState<{
    atlases: IconAtlas[];
    uvMapping: Map<string, IconAtlasUV>;
  }>({ atlases: [], uvMapping: new Map() });

  // Memoize unique icon URLs to prevent unnecessary recomputation
  const uniqueIconUrls = useMemo(() => {
    const iconUrls = nodes
      .map(node => node.icon)
      .filter(icon => icon && typeof icon === 'string') as string[];
    return [...new Set(iconUrls)];
  }, [nodes]);

  // Load icon atlases asynchronously with cleanup
  useEffect(() => {
    let isCancelled = false;

    if (uniqueIconUrls.length > 0) {
      createIconAtlases(uniqueIconUrls)
        .then(result => {
          if (!isCancelled) {
            setIconAtlases(result);
          }
        })
        .catch(error => {
          console.error('Failed to load icon atlases:', error);
        });
    } else {
      setIconAtlases({ atlases: [], uvMapping: new Map() });
    }

    return () => {
      isCancelled = true;
    };
  }, [uniqueIconUrls]);

  // Create icon materials for instanced rendering
  const iconMaterials = useMemo(() => {
    return iconAtlases.atlases.map(atlas =>
      createIconSpriteShaderMaterial(atlas.texture)
    );
  }, [iconAtlases.atlases]);

  const instanceData = useMemo(() => {
    return nodes.map(node => {
      const isActive = actives.includes(node.id);
      const hasSelections = selections.length > 0;
      const isSelected = selections.includes(node.id);
      const isDragging = draggingIds.includes(node.id);
      const shouldHighlight = isSelected || isActive;
      const selectionOpacity = hasSelections
        ? shouldHighlight
          ? theme.node.selectedOpacity
          : theme.node.inactiveOpacity
        : theme.node.opacity;

      return {
        ...node,
        opacity: selectionOpacity,
        color: getInstanceColor(
          node,
          theme,
          actives,
          selections,
          isDragging,
          hoveredNodeId === node.id
        )
      };
    });
  }, [nodes, actives, selections, draggingIds, hoveredNodeId, theme]);

  // Group nodes by icon atlas index
  const nodesByIconAtlas = useMemo(() => {
    const groups: { [key: number]: typeof instanceData } = {};

    instanceData.forEach(node => {
      if (node.icon) {
        const iconUvData = iconAtlases.uvMapping.get(node.icon);
        if (iconUvData) {
          const atlasIndex = iconUvData.atlasIndex;
          if (!groups[atlasIndex]) {
            groups[atlasIndex] = [];
          }
          groups[atlasIndex].push(node);
        }
      }
    });

    return groups;
  }, [instanceData, iconAtlases.uvMapping]);

  // Helper function to animate instance position
  const animateInstancePosition = useCallback(
    (
      instanceRef: InstancedMesh,
      targetPosition: { x: number; y: number; z: number },
      nodeId: string,
      isDragging: boolean = false
    ) => {
      if (!animated || !instanceRef || isDragging) return;

      // Stop any existing animation for this node
      const existingController = activeControllers.current.get(nodeId);
      if (existingController) {
        existingController.stop();
      }

      // Use current instance position as starting point
      const currentPos = instanceRef.position;
      const isInitial = !initializedNodes.current.has(nodeId);

      const startPosition = {
        x: isInitial ? 0 : currentPos.x,
        y: isInitial ? 0 : currentPos.y,
        z: isInitial ? 0 : currentPos.z
      };

      const controller = new Controller({
        x: startPosition.x,
        y: startPosition.y,
        z: startPosition.z,
        config: animationConfig
      });

      // Store the controller so we can stop it later if needed
      activeControllers.current.set(nodeId, controller);

      controller.start({
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        onChange: () => {
          const x = controller.springs.x.get();
          const y = controller.springs.y.get();
          const z = controller.springs.z.get();

          if (instanceRef.position) {
            instanceRef.position.set(x, y, z);
          }
        },
        onFinish: () => {
          // Clean up the controller when animation finishes
          activeControllers.current.delete(nodeId);
        }
      });
    },
    [animated]
  );

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

  // Set up custom instance attributes for icon atlases
  useLayoutEffect(() => {
    Object.entries(nodesByIconAtlas).forEach(([atlasIndexStr, atlasNodes]) => {
      const atlasIndex = parseInt(atlasIndexStr);
      const iconInstancesRef = iconInstancesRefs.current[atlasIndex];

      if (iconInstancesRef?.geometry && iconAtlases.atlases.length > 0) {
        const geometry = iconInstancesRef.geometry;

        const opacityArray = new Float32Array(atlasNodes.length);
        const uvOffsetArray = new Float32Array(atlasNodes.length * 4);
        const colorArray = new Float32Array(atlasNodes.length * 3);

        atlasNodes.forEach((node, i) => {
          const iconUvData = iconAtlases.uvMapping.get(node.icon!);
          if (iconUvData) {
            opacityArray[i] = node.opacity;
            uvOffsetArray[i * 4] = iconUvData.u;
            uvOffsetArray[i * 4 + 1] = iconUvData.v;
            uvOffsetArray[i * 4 + 2] = iconUvData.width;
            uvOffsetArray[i * 4 + 3] = iconUvData.height;

            // Convert color to RGB values
            const color = new Color(node.color);
            colorArray[i * 3] = color.r;
            colorArray[i * 3 + 1] = color.g;
            colorArray[i * 3 + 2] = color.b;
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
        geometry.setAttribute(
          'customColor',
          new InstancedBufferAttribute(colorArray, 3)
        );

        geometry.attributes.customOpacity.needsUpdate = true;
        geometry.attributes.uvOffset.needsUpdate = true;
        geometry.attributes.customColor.needsUpdate = true;
      }
    });
  }, [nodesByIconAtlas, iconAtlases]);

  // Handle position updates with animation
  useLayoutEffect(() => {
    instanceData.forEach(node => {
      const instanceRef = instanceRefs.current.get(node.id);
      const pos = node.position || { x: 0, y: 0, z: 0 };
      const isDragging = draggingIds.includes(node.id);

      if (instanceRef) {
        const currentPos = instanceRef.position;
        const hasPositionChanged =
          currentPos.x !== pos.x ||
          currentPos.y !== pos.y ||
          currentPos.z !== pos.z;

        // Stop any ongoing animation if node starts being dragged
        if (isDragging) {
          const existingController = activeControllers.current.get(node.id);
          if (existingController) {
            existingController.stop();
            activeControllers.current.delete(node.id);
          }
        }

        if (hasPositionChanged) {
          if (isDragging) {
            // During dragging: update position immediately
            instanceRef.position.set(pos.x, pos.y, pos.z);
          } else if (animated) {
            // Not dragging and animation enabled: use animation
            animateInstancePosition(instanceRef, pos, node.id, isDragging);
          } else {
            // Animation disabled: update position immediately
            instanceRef.position.set(pos.x, pos.y, pos.z);
          }
        }
      }
    });
  }, [instanceData, animated, draggingIds, animateInstancePosition]);

  return (
    iconAtlases.atlases.length > 0 &&
    Object.entries(nodesByIconAtlas).map(([atlasIndexStr, atlasNodes]) => {
      const atlasIndex = parseInt(atlasIndexStr);
      return (
        <Instances
          key={`icon-atlas-${atlasIndex}`}
          ref={ref => {
            iconInstancesRefs.current[atlasIndex] = ref;
          }}
          limit={atlasNodes.length}
          range={atlasNodes.length}
        >
          <planeGeometry attach="geometry" args={[1, 1]} />
          <primitive attach="material" object={iconMaterials[atlasIndex]} />

          {atlasNodes.map(node => {
            const pos = node.position || { x: 0, y: 0, z: 0 };
            return (
              <Instance
                key={`icon-${node.id}`}
                ref={(ref: InstancedMesh) => {
                  if (ref && ref.position) {
                    instanceRefs.current.set(node.id, ref);
                    const isInitial = !initializedNodes.current.has(node.id);
                    const isDragging = draggingIds.includes(node.id);

                    if (isInitial && animated && !isDragging) {
                      // Initial animation from origin
                      ref.position.set(0, 0, 0);
                      animateInstancePosition(ref, pos, node.id, isDragging);
                      initializedNodes.current.add(node.id);
                    } else {
                      // Set position immediately
                      ref.position.set(pos.x, pos.y, pos.z);
                      initializedNodes.current.add(node.id);
                    }
                  }
                }}
                position={animated ? [0, 0, 0] : [pos.x, pos.y, pos.z]}
                scale={[node.size * 1.0, node.size * 1.0, 1]}
                userData={{
                  node: node,
                  isIcon: true,
                  atlasIndex
                }}
                onClick={event => onClick?.(event, node)}
                onPointerOver={event => onPointerOver?.(event, node)}
                onPointerOut={event => onPointerOut?.(event, node)}
                onPointerDown={event => {
                  if (!draggable) return;
                  onPointerDown?.(event, node);
                }}
              />
            );
          })}
        </Instances>
      );
    })
  );
};
