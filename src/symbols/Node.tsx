import React, { FC, useMemo, useState } from 'react';
import { Sphere } from './Sphere';
import { Label } from './Label';
import { Icon } from './Icon';
import { Theme } from '../utils/themes';
import { Ring } from './Ring';
import { InternalGraphNode } from '../types';
import { MenuItem, RadialMenu } from '../RadialMenu';
import { Html } from '@react-three/drei';
import { motion } from 'framer-motion-3d';
import { animationConfig } from '../utils/animation';

export interface NodeProps extends InternalGraphNode {
  theme: Theme;
  graph: any;
  selections?: string[];
  animated?: boolean;
  contextMenuItems?: MenuItem[];
  onClick?: () => void;
}

export const Node: FC<NodeProps> = ({
  position,
  label,
  animated,
  icon,
  graph,
  size,
  fill,
  id,
  selections,
  labelVisible,
  theme,
  contextMenuItems,
  onClick
}) => {
  const [isActive, setActive] = useState<boolean>(false);
  const [menuVisible, setMenuVisible] = useState<boolean>(false);

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

  return (
    <motion.group
      initial={{
        x: 0,
        y: 0,
        z: 0
      }}
      animate={{
        x: position.x || 0,
        y: position.y || 0,
        z: position.z || 0
      }}
      transition={{
        ...animationConfig,
        type: animated ? 'spring' : false
      }}
    >
      {icon ? (
        <Icon
          image={icon}
          size={size + 8}
          opacity={selectionOpacity}
          animated={animated}
          onClick={onClick}
          onActive={setActive}
          onContextMenu={() => setMenuVisible(true)}
        />
      ) : (
        <Sphere
          size={size}
          color={
            isSelected || isActive
              ? theme.node.activeFill
              : fill || theme.node.fill
          }
          opacity={selectionOpacity}
          animated={animated}
          onClick={onClick}
          onActive={setActive}
          onContextMenu={() => {
            if (contextMenuItems?.length) {
              setMenuVisible(true);
            }
          }}
        />
      )}
      <Ring
        opacity={isPrimarySelection ? 0.5 : 0}
        size={size}
        animated={animated}
        color={isSelected || isActive ? theme.ring.activeFill : theme.ring.fill}
      />
      {menuVisible && (
        <Html prepend={true} center={true}>
          <RadialMenu
            theme={theme}
            items={contextMenuItems}
            onClose={() => setMenuVisible(false)}
          />
        </Html>
      )}
      {(labelVisible || isSelected || isActive) && label && (
        <group position={[0, -labelOffset, 2]}>
          <Label
            text={label}
            opacity={selectionOpacity}
            color={
              isSelected || isActive ? theme.node.activeColor : theme.node.color
            }
          />
        </group>
      )}
    </motion.group>
  );
};

Node.defaultProps = {
  size: 7,
  labelVisible: true
};
