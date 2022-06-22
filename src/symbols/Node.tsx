import React, { FC, useRef, useMemo, useState } from 'react';
import { Group, Vector2, Vector3, Plane } from 'three';
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
import { useGesture } from 'react-use-gesture';
import { useThree } from '@react-three/fiber';
import { useCameraControls } from '../CameraControls';

export interface NodeProps extends InternalGraphNode {
  theme: Theme;
  graph: any;
  disabled?: boolean;
  selections?: string[];
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
  graph,
  size: nodeSize,
  fill,
  disabled,
  id,
  draggable,
  selections,
  labelVisible,
  theme,
  contextMenuItems,
  onClick
}) => {
  const cameraControls = useCameraControls();
  const { raycaster, size, camera } = useThree();

  const group = useRef<Group | null>(null);
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

  const [dragging, setDragging] = useState<boolean>(false);

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

  useCursor(isActive && !dragging, 'pointer');
  useCursor(dragging, 'grabbing');

  // Reference: https://codesandbox.io/s/react-three-draggable-cxu37
  const { mouse2D, mouse3D, offset, normal, plane } = useMemo(
    () => ({
      // Normalized 2D screen space mouse coords
      mouse2D: new Vector2(),
      // 3D world space mouse coords
      mouse3D: new Vector3(),
      // Drag point offset from object origin
      offset: new Vector3(),
      // Normal of the drag plane
      normal: new Vector3(),
      // Drag plane
      plane: new Plane()
    }),
    []
  );

  const bind = useGesture(
    {
      onDragStart: ({ event }) => {
        setDragging(true);

        // @ts-ignore
        const { eventObject, point } = event;

        // Save the offset of click point from object origin
        eventObject.getWorldPosition(offset).sub(point);

        // Set initial 3D cursor position (needed for onDrag plane calculation)
        mouse3D.copy(point);

        // Run user callback
        cameraControls.controls.enabled = false;
      },
      onDrag: ({ xy: [x, y] }) => {
        // Compute normalized mouse coordinates (screen space)
        const nx = (x / size.width) * 2 - 1;
        const ny = (-y / size.height) * 2 + 1;

        // Unlike the mouse from useThree, this works offscreen
        mouse2D.set(nx, ny);

        // Update raycaster (otherwise it doesn't track offscreen)
        raycaster.setFromCamera(mouse2D, camera);

        // The drag plane is normal to the camera view
        camera.getWorldDirection(normal).negate();

        // Find the plane that's normal to the camera and contains our drag point
        plane.setFromNormalAndCoplanarPoint(normal, mouse3D);

        // Find the point of intersection
        raycaster.ray.intersectPlane(plane, mouse3D);

        // Update the object position with the original offset
        const updated = new Vector3(position.x, position.y, position.z)
          .copy(mouse3D)
          .add(offset);

        return set({
          nodePosition: [updated.x, updated.y, updated.z]
        });
      },
      onDragEnd: () => {
        setDragging(false);
        cameraControls.controls.enabled = true;
      }
    },
    { drag: { enabled: draggable } }
  );

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
