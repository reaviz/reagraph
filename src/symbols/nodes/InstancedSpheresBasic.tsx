import React, { FC } from 'react';
import { Instances, Instance } from '@react-three/drei';
import { InternalGraphNode } from '../../types';
import { Color, DoubleSide } from 'three';
import { useStore } from 'store';

interface InstancedSpheresProps {
  nodes: InternalGraphNode[];
  selections?: string[];
  actives?: string[];
  animated?: boolean;
}

export const InstancedSpheres: FC<InstancedSpheresProps> = ({
  nodes,
  selections = [],
  actives = [],
  animated = true
}) => {
  const count = nodes.length;


  if (count === 0) {
    return null;
  }

  // Using Drei's Instances component which handles instanceColor automatically
  return (
    <Instances limit={count} range={count}>
      <sphereGeometry attach="geometry" args={[1, 25, 25]} />
      <meshPhongMaterial
        attach="material"
        side={DoubleSide}
        transparent={true}
        fog={true}
        opacity={1}
      />
      {nodes.map((node, index) => {
        const isSelected = selections.includes(node.id);
        const isActive = actives.includes(node.id);


        return (
          <Instance
            key={node.id}
            color={node.fill}
            position={[
              node.position?.x || 0,
              node.position?.y || 0,
              node.position?.z || 0
            ]}
            scale={node.size}
            userData={{
              nodeId: node.id,
              isSelected,
              isActive
            }}
          />
        );
      })}
    </Instances>
  );
};
