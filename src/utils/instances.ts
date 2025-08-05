import { Color, Vector3 } from 'three';
import { Controller } from '@react-spring/three';

import { Instance } from '../symbols/instances/types';
import { animationConfig } from './animation';
import { InternalGraphNode } from '../types';
import { Theme } from '../themes/theme';

export const updateInstancePosition = (
  instance: Instance,
  position: Vector3,
  animated: boolean
) => {
  if (animated && !instance.isDragging) {
    // For initial render animation, start from center if instance is at origin
    const isAtOrigin =
      instance.position.x === 0 &&
      instance.position.y === 0 &&
      instance.position.z === 0;
    const startPosition = {
      x: isAtOrigin ? 0 : instance.position.x,
      y: isAtOrigin ? 0 : instance.position.y,
      z: isAtOrigin ? 0 : instance.position.z
    };
    const targetPosition = {
      x: position.x,
      y: position.y,
      z: position.z
    };

    const controller = new Controller({
      x: startPosition.x,
      y: startPosition.y,
      z: startPosition.z,
      config: animationConfig
    });

    controller.start({
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z,
      onChange: () => {
        const x = controller.springs.x.get();
        const y = controller.springs.y.get();
        const z = controller.springs.z.get();

        instance.position.copy(new Vector3(x, y, z));
        instance.updateMatrixPosition();
      }
    });
  } else {
    instance.position.copy(new Vector3(position.x, position.y, position.z));
    instance.updateMatrixPosition();
  }
};

export const getInstanceColor = (
  instance: Instance,
  node: InternalGraphNode,
  theme: Theme,
  actives: string[],
  selections: string[]
) => {
  const isActive = actives.includes(node.id);
  const isSelected = selections.includes(node.id);
  const shouldHighlight = isSelected || isActive;
  const combinedActiveState = shouldHighlight || instance.isDragging;
  const color = combinedActiveState
    ? theme.node.activeFill
    : node.fill || theme.node.fill;

  return color;
};

export const nodeToInstance = (
  node: InternalGraphNode,
  instance: Instance,
  animated: boolean,
  theme: Theme,
  actives: string[],
  selections: string[],
  draggingIds: string[]
) => {
  const isActive = actives.includes(node.id);
  const hasSelections = selections.length > 0;
  const isSelected = selections.includes(node.id);
  const isDragging = draggingIds.includes(node.id);
  const shouldHighlight = isSelected || isActive;

  const selectionOpacity = hasSelections
    ? shouldHighlight
      ? theme.node.selectedOpacity
      : theme.node.inactiveOpacity
    : theme.node.opacity;

  instance.nodeId = node.id;
  instance.node = node;
  instance.isDragging = isDragging || isSelected;
  updateInstancePosition(
    instance,
    node.position as unknown as Vector3,
    animated
  );
  instance.color = getInstanceColor(instance, node, theme, actives, selections);
  instance.scale.setScalar(node.size);
  instance.opacity = selectionOpacity;
};
