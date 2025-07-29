import React, {
  FC,
  useMemo,
  useRef,
  useLayoutEffect
} from 'react';
import { Instances, Instance, createInstances } from '@react-three/drei';
import { InternalGraphNode } from '../../types';
import {
  Color,
  DoubleSide,
  ShaderMaterial,
  InstancedBufferAttribute,
  TextureLoader,
  Texture
} from 'three';

interface NestedSpheresWithIconsProps {
  nodes: InternalGraphNode[];
  selections?: string[];
  actives?: string[];
  animated?: boolean;
}

// Basic sphere material that uses instance colors
const createBasicSphereMaterial = () => {
  return new ShaderMaterial({
    vertexShader: `
      varying vec3 vColor;

      void main() {
        // Get color from instance matrix (stored in instance color)
        vColor = instanceColor;

        gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vColor;

      void main() {
        gl_FragColor = vec4(vColor, 1.0);
      }
    `,
    transparent: false
  });
};

// Create nested instances for spheres and icons
const [SphereInstances, SphereInstance] = createInstances();
const [IconInstances, IconInstance] = createInstances();

// Simple material for icons
const createIconMaterial = (iconTexture: Texture) => {
  return new ShaderMaterial({
    vertexShader: `
      varying vec2 vUv;

      void main() {
        vUv = uv;

        // Billboard positioning
        vec3 pos = position;

        // Camera right and up vectors
        vec3 right = normalize(vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]));
        vec3 up = normalize(vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]));

        // Create billboard
        vec3 billboardPos = right * pos.x + up * pos.y;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(billboardPos, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D iconTexture;
      varying vec2 vUv;

      void main() {
        vec4 texColor = texture2D(iconTexture, vUv);
        if (texColor.a < 0.1) discard;
        gl_FragColor = texColor;
      }
    `,
    uniforms: {
      iconTexture: { value: iconTexture }
    },
    transparent: true,
    depthWrite: false,
    depthTest: false,
    side: DoubleSide
  });
};

export const NestedSpheresWithIcons: FC<NestedSpheresWithIconsProps> = ({
  nodes,
  selections = [],
  actives = [],
  animated = true
}) => {
  const textureLoader = useMemo(() => new TextureLoader(), []);

  // Find unique icons that need to be loaded
  const iconUrls = useMemo(() => {
    const urls = new Set<string>();
    nodes.forEach(node => {
      if (node.icon) {
        urls.add(node.icon);
      }
    });
    return Array.from(urls);
  }, [nodes]);

  // Load icon textures
  const iconTextures = useMemo(() => {
    const textures: { [url: string]: Texture } = {};
    iconUrls.forEach(url => {
      textures[url] = textureLoader.load(url);
    });
    return textures;
  }, [iconUrls, textureLoader]);

  // Create sphere material
  const sphereMaterial = useMemo(() => {
    return createBasicSphereMaterial();
  }, []);

  // Create icon materials for each unique icon
  const iconMaterials = useMemo(() => {
    const materials: { [url: string]: ShaderMaterial } = {};
    Object.entries(iconTextures).forEach(([url, texture]) => {
      materials[url] = createIconMaterial(texture);
    });
    return materials;
  }, [iconTextures]);

  // Prepare instance data with opacity values
  const instanceData = useMemo(() => {
    return nodes.map(node => ({
      ...node,
      opacity: actives.includes(node.id) ? 1.0 : 1,
      color: node.fill
    }));
  }, [nodes, actives]);

  // Group nodes by icon for efficient rendering
  const nodesByIcon = useMemo(() => {
    const groups: { [iconUrl: string]: InternalGraphNode[] } = {};

    instanceData.forEach(node => {
      if (node.icon) {
        if (!groups[node.icon]) {
          groups[node.icon] = [];
        }
        groups[node.icon].push(node);
      }
    });

    return groups;
  }, [instanceData]);

  const circleSegmentsDetail = 5;

  return (
    <SphereInstances limit={nodes.length} range={nodes.length}>
      <icosahedronGeometry args={[1, circleSegmentsDetail]} />
      <primitive object={sphereMaterial} />

      {/* Render icons nested inside spheres */}
      {Object.entries(nodesByIcon).map(([iconUrl, nodesWithIcon]) => {
        const material = iconMaterials[iconUrl];
        if (!material) return null;

        return (
          <IconInstances key={iconUrl} limit={nodesWithIcon.length} range={nodesWithIcon.length}>
            <planeGeometry args={[1, 1]} />
            <primitive object={material} />

            {nodesWithIcon.map(node => (
              <IconInstance
                key={`icon_${node.id}`}
                position={[
                  node.position?.x || 0,
                  node.position?.y || 0,
                  (node.position?.z || 0) + 0.1
                ]}
                scale={[node.size * 0.8, node.size * 0.8, 1]}
              />
            ))}
          </IconInstances>
        );
      })}

      {/* Sphere instances */}
      {instanceData.map(node => (
        <SphereInstance
          key={node.id}
          position={[
            node.position?.x || 0,
            node.position?.y || 0,
            node.position?.z || 0
          ]}
          scale={node.size}
          color={node.color}
        />
      ))}
    </SphereInstances>
  );
};
