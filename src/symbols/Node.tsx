import React, { FC, useRef, useMemo, useState } from 'react';
import * as THREE from 'three';
import { animationConfig } from '../utils/animation';
import { useSpring, a } from '@react-spring/three';
import { Sphere } from './Sphere';
import { Label } from './Label';
import { Icon } from './Icon';
import { Theme } from '../utils/themes';
import { Ring } from './Ring';

export interface NodeProps {
  theme: Theme;
  id: string;
  position: THREE.Vector3;
  icon?: string;
  selections?: string[];
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
  graph,
  size,
  id,
  selections,
  labelVisible,
  theme,
  onClick
}) => {
  const group = useRef<THREE.Group | null>(null);
  const [isActive, setActive] = useState<boolean>(false);

  const hasSelections = selections?.length > 0;
  const isPrimarySelection = selections?.includes(id);

  const isSelected = useMemo(() => {
    if (isPrimarySelection) {
      return true;
    }

    if (selections?.length) {
      return selections.some(selection => graph.hasLink(selection, id));
    }

    return false;
  }, [selections, id, graph, isPrimarySelection]);

  const selectionOpacity = hasSelections
    ? isSelected || isActive
      ? 1
      : 0.2
    : 1;

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
          onClick={onClick}
          onActive={setActive}
        />
      ) : (
        <Sphere
          size={size}
          color={
            isSelected || isActive ? theme.node.activeFill : theme.node.fill
          }
          opacity={selectionOpacity}
          onClick={onClick}
          onActive={setActive}
        />
      )}
      <Ring
        opacity={isPrimarySelection ? 0.5 : 0}
        size={size}
        color={isSelected || isActive ? theme.ring.activeFill : theme.ring.fill}
      />
      {(labelVisible || isSelected || isActive) && label && (
        <a.group position={labelPosition as any}>
          <Label
            text={label}
            opacity={selectionOpacity}
            color={
              isSelected || isActive ? theme.node.activeColor : theme.node.color
            }
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
