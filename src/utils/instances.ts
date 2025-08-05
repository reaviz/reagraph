import { Vector3 } from 'three';
import { Controller } from '@react-spring/three';

import { Instance } from '../symbols/instances/types';
import { animationConfig } from './animation';

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
