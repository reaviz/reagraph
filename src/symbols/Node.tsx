import React, { FC, useRef, useMemo, useState } from 'react';
import { Group } from 'three';
import { animationConfig } from '../utils/animation';
import { useSpring, a } from '@react-spring/three';
import { Sphere } from './Sphere';
import { Label } from './Label';
import { Icon } from './Icon';
import { Theme } from '../utils/themes';
import { Ring } from './Ring';
import { InternalGraphNode } from '../types';
import { MenuItem, RadialMenu } from '../RadialMenu';
import { Html, useCursor } from '@react-three/drei';
import { useCameraControls } from '../CameraControls';
import { useStore } from '../store';
import { useDrag } from '../utils/useDrag';

export interface NodeProps extends InternalGraphNode {
  theme: Theme;
  disabled?: boolean;
  animated?: boolean;
  contextMenuItems?: MenuItem[];
  draggable?: boolean;
  onClick?: () => void;
}

export const Node: FC<NodeProps> = ({
  position,
  label,
  animated,
  icon,
  size: nodeSize,
  fill,
  disabled,
  id,
  draggable,
  labelVisible,
  theme,
  contextMenuItems,
  onClick
}) => {
  const cameraControls = useCameraControls();
  const { isPrimarySelection, hasSelections, hasLinksSelected } = useStore(
    state => ({
      hasSelections: state.selections?.length,
      isPrimarySelection: state.selections?.includes(id),
      hasLinksSelected: state.selections?.some(selection =>
        state.graph.hasLink(selection, id)
      )
    })
  );

  const group = useRef<Group | null>(null);
  const [isActive, setActive] = useState<boolean>(false);
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [dragging, setDragging] = useState<boolean>(false);
  const isSelected = isPrimarySelection || hasLinksSelected;

  const selectionOpacity = hasSelections
    ? isSelected || isActive
      ? 1
      : 0.2
    : 1;

  const [{ nodePosition, labelPosition }, set] = useSpring(
    () => ({
      from: {
        nodePosition: [0, 0, 0],
        labelPosition: [0, -(nodeSize + 7), 2]
      },
      to: {
        nodePosition: position
          ? [position.x, position.y, position.z]
          : [0, 0, 0],
        labelPosition: [0, -(nodeSize + 7), 2]
      },
      config: {
        ...animationConfig,
        duration: animated && !dragging ? undefined : 0
      }
    }),
    [dragging, position, animated, nodeSize]
  );

  const bind = useDrag({
    draggable,
    position,
    set,
    onDragStart: () => {
      setDragging(true);
      setActive(true);
      cameraControls.controls.enabled = false;
    },
    onDragEnd: () => {
      setDragging(false);
      setActive(false);
      cameraControls.controls.enabled = true;
    }
  });

  useCursor(isActive && !dragging, 'pointer');
  useCursor(dragging, 'grabbing');

  return (
    <a.group ref={group} position={nodePosition as any} {...(bind() as any)}>
      {icon ? (
        <Icon
          id={id}
          image={icon}
          size={nodeSize + 8}
          opacity={selectionOpacity}
          animated={animated}
          onClick={onClick}
          onActive={setActive}
          onContextMenu={() => {
            if (contextMenuItems?.length && !disabled) {
              setMenuVisible(true);
            }
          }}
        />
      ) : (
        <Sphere
          id={id}
          size={nodeSize}
          color={
            isSelected || isActive
              ? theme.node.activeFill
              : fill || theme.node.fill
          }
          opacity={selectionOpacity}
          animated={animated}
          onClick={onClick}
          onActive={val => {
            if (!disabled) {
              setActive(val);
            }
          }}
          onContextMenu={() => {
            if (contextMenuItems?.length && !disabled) {
              setMenuVisible(true);
            }
          }}
        />
      )}
      <Ring
        opacity={isPrimarySelection ? 0.5 : 0}
        size={nodeSize}
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
  labelVisible: true,
  draggable: false
};
