import React, { FC, useRef, useMemo, useState } from 'react';
import * as THREE from 'three';
import { animationConfig } from '../utils/animation';
import { useSpring, a } from '@react-spring/three';
import { Sphere } from './Sphere';
import { Label } from './Label';
import chroma from 'chroma-js';
import { Icon } from './Icon';

export interface NodeProps {
  id: string;
  position: THREE.Vector3;
  icon?: string;
  data: any;
  graph: any;
  label?: string;
  size?: number;
  color?: string;
  selectedNodes?: string[];
  labelVisible?: boolean;
  onClick?: () => void;
}

export const Node: FC<NodeProps> = ({
  position,
  label,
  icon,
  size,
  labelVisible,
  color,
  onClick
}) => {
  const group = useRef<THREE.Group | null>(null);
  const activeColor = useMemo(() => chroma(color).brighten(0.5).hex(), [color]);
  const [isActive, setActive] = useState<boolean>(false);

  const selectionOpacity = 1;
  const isSelected = false;

  const labelOffset = size + 7;
  const { nodePosition, labelPosition } = useSpring({
    from: {
      nodePosition: [0, 0, 0],
      labelPosition: [0, -labelOffset, 2]
    },
    to: {
      nodePosition: position ? [position.x, position.y, position.z] : [0, 0, 0],
      labelPosition: [0, -labelOffset, 2]
    },
    config: animationConfig
  });

  return (
    <a.group ref={group} position={nodePosition as any}>
      {icon ? (
        <Icon
          image={icon}
          size={size + 8}
          opacity={selectionOpacity}
          selected={isSelected}
          active={isActive}
          onClick={onClick}
          onActive={state => setActive(state)}
        />
      ) : (
        <Sphere
          selected={isSelected}
          active={isActive}
          size={size}
          color={color}
          activeColor={activeColor}
          opacity={selectionOpacity}
          onClick={onClick}
          onActive={setActive}
        />
      )}
      {(labelVisible || isSelected || isActive) && label && (
        <a.group position={labelPosition as any}>
          <Label text={label} opacity={selectionOpacity} />
        </a.group>
      )}
    </a.group>
  );
};

Node.defaultProps = {
  size: 7,
  labelVisible: true,
  color: '#11cff7'
};
