import React, {
  FC,
  useMemo,
  useRef,
  useLayoutEffect,
  useState,
  useEffect
} from 'react';
import { Instances, Instance } from '@react-three/drei';
import { InternalGraphNode } from '../../types';
import {
  Color,
  DoubleSide,
  ShaderMaterial,
  InstancedBufferAttribute,
  CanvasTexture,
  NearestFilter
} from 'three';

interface InstancedIconProps {
  nodes: InternalGraphNode[];
  selections?: string[];
  actives?: string[];
  animated?: boolean;
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
    vertexShader: `
      attribute float customOpacity;
      attribute vec4 uvOffset;
      varying vec2 vUv;
      varying float vOpacity;

      void main() {
        vUv = uv * uvOffset.zw + uvOffset.xy;
        vOpacity = customOpacity;

        // Simple and reliable billboard approach
        // Get the center position from instance matrix
        vec3 center = instanceMatrix[3].xyz;

        // Get scale from instance matrix
        float scale = length(instanceMatrix[0].xyz);

        // Transform center to view space
        vec4 mvCenter = modelViewMatrix * vec4(center, 1.0);

        // Apply billboard effect: add vertex position in view space
        vec4 mvPosition = mvCenter;
        mvPosition.xy += position.xy * scale;

        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform sampler2D iconTexture;
      uniform float opacity;

      varying vec2 vUv;
      varying float vOpacity;

      void main() {
        vec4 iconColor = texture2D(iconTexture, vUv);
        if (iconColor.a < 0.1) discard;

        gl_FragColor = vec4(iconColor.rgb, iconColor.a * vOpacity * opacity);
      }
    `,
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
  animated = true
}) => {
  const instancesRef = useRef<any | null>(null);
  const iconInstancesRefs = useRef<any[]>([]);
  const materialRef = useRef<ShaderMaterial | null>(null);
  const [iconAtlases, setIconAtlases] = useState<{
    atlases: any[];
    uvMapping: Map<string, any>;
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
            console.log(
              `Loaded ${result.atlases.length} icon atlases with ${result.uvMapping.size} icons`
            );
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

  const shouldShowLabels = true;

  // Prepare instance data with opacity values
  const instanceData = useMemo(() => {
    return nodes.map(node => ({
      ...node,
      opacity: actives.includes(node.id) ? 1.0 : 0.5,
      color: node.fill
    }));
  }, [nodes, actives]);

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

        atlasNodes.forEach((node, i) => {
          const iconUvData = iconAtlases.uvMapping.get(node.icon!);
          if (iconUvData) {
            opacityArray[i] = node.opacity;
            uvOffsetArray[i * 4] = iconUvData.u;
            uvOffsetArray[i * 4 + 1] = iconUvData.v;
            uvOffsetArray[i * 4 + 2] = iconUvData.width;
            uvOffsetArray[i * 4 + 3] = iconUvData.height;
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
  }, [nodesByIconAtlas, iconAtlases]);

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
                position={[pos.x, pos.y, pos.z]}
                scale={[node.size * 1.0, node.size * 1.0, 1]}
                userData={{
                  nodeId: node.id,
                  isIcon: true,
                  atlasIndex
                }}
              />
            );
          })}
        </Instances>
      );
    })
  );
};
