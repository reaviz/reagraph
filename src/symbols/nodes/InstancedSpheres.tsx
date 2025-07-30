import React, { FC, useMemo, useRef, useEffect } from 'react';
import { Instances, Instance } from '@react-three/drei';
import { InternalGraphNode } from '../../types';
import { ShaderMaterial, InstancedBufferAttribute, InstancedMesh } from 'three';

interface InstancedSpheresProps {
  nodes: InternalGraphNode[];
  selections?: string[];
  actives?: string[];
  animated?: boolean;
}

// Basic sphere material that uses instance colors and opacity
const createBasicSphereMaterial = () => {
  return new ShaderMaterial({
    vertexShader: `
      varying vec3 vColor;
      varying float vOpacity;
      attribute float opacity;

      void main() {
        // Get color from instance matrix (stored in instance color)
        vColor = instanceColor;
        vOpacity = opacity;

        gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vOpacity;

      void main() {
        gl_FragColor = vec4(vColor, vOpacity);
      }
    `,
    transparent: true
  });
};

export const InstancedSpheres: FC<InstancedSpheresProps> = ({
  nodes,
  selections = [],
  actives = [],
  animated = true
}) => {
  // Create sphere material
  const sphereMaterial = useMemo(() => {
    return createBasicSphereMaterial();
  }, []);

  // Prepare instance data with opacity values
  const instanceData = useMemo(() => {
    return nodes.map(node => ({
      ...node,
      opacity: actives.includes(node.id) ? 1.0 : 0.3,
      color: node.fill
    }));
  }, [nodes, actives]);

  const circleSegmentsDetail = 5;

  const meshRef = useRef<InstancedMesh>(null);

  // Set up opacity attribute after instances are created
  useEffect(() => {
    if (meshRef.current && meshRef.current.geometry) {
      const opacityArray = new Float32Array(instanceData.map(node => node.opacity));
      meshRef.current.geometry.setAttribute('opacity', new InstancedBufferAttribute(opacityArray, 1));
    }
  }, [instanceData]);

  return (
    <>
      {/* Spheres render first */}
      <group renderOrder={0}>
        <Instances ref={meshRef} limit={nodes.length} range={nodes.length}>
          <icosahedronGeometry args={[1, circleSegmentsDetail]} />
          <primitive object={sphereMaterial} />

          {/* Sphere instances */}
          {instanceData.map(node => (
            <Instance
              key={node.id}
              position={[
                node.position?.x || 0,
                node.position?.y || 0,
                node.position?.z || 0
              ]}
              scale={node.size}
              color={node.color}
              onClick={e => {
                console.log('clicked', node.id);
              }}
            />
          ))}
        </Instances>
      </group>
    </>
  );
};
