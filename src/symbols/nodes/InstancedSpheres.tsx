import React, { FC, useMemo } from 'react';
import { Instances, Instance } from '@react-three/drei';
import { InternalGraphNode } from '../../types';
import { ShaderMaterial } from 'three';

interface InstancedSpheresProps {
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
      opacity: actives.includes(node.id) ? 1.0 : 1,
      color: node.fill
    }));
  }, [nodes, actives]);

  const circleSegmentsDetail = 5;

  return (
    <>
      {/* Spheres render first */}
      <group renderOrder={0}>
        <Instances limit={nodes.length} range={nodes.length}>
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
            />
          ))}
        </Instances>
      </group>
    </>
  );
};
