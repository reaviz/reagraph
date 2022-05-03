import React, { FC, useRef, useMemo, useState } from 'react';
import * as THREE from 'three';
import { animationConfig } from '../utils/animation';
import { useSpring, a } from '@react-spring/three';
import { Sphere } from './Sphere';
import { Label } from './Label';
import chroma from 'chroma-js';
import { Icon } from './Icon';
import { Theme } from '../utils/themes';

export interface NodeProps {
  theme: Theme;
  id: string;
  position: THREE.Vector3;
  icon?: string;
  data: any;
  graph: any;
  label?: string;
  size?: number;
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
  theme,
  onClick
}) => {
  const fill = theme.node.fill;
  const group = useRef<THREE.Group | null>(null);
  const activeColor = useMemo(() => chroma(fill).brighten(0.5).hex(), [fill]);
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
          color={fill}
          activeColor={activeColor}
          opacity={selectionOpacity}
          onClick={onClick}
          onActive={setActive}
        />
      )}
      {(labelVisible || isSelected || isActive) && label && (
        <a.group position={labelPosition as any}>
          <Label
            text={label}
            opacity={selectionOpacity}
            color={theme.node.color}
          />
        </a.group>
      )}
    </a.group>
  );
};

Node.defaultProps = {
  size: 7,
  labelVisible: true
};
