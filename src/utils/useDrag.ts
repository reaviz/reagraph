import { useThree } from '@react-three/fiber';
import { useMemo } from 'react';
import { useGesture } from '@use-gesture/react';
import { Vector2, Vector3, Plane } from 'three';
import { InternalGraphPosition } from '../types';
import { CenterPositionVector } from './layout';

interface DragParams {
  draggable: boolean;
  position: InternalGraphPosition;
  bounds?: CenterPositionVector;
  set: (position: Vector3) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

export const useDrag = ({
  draggable,
  set,
  position,
  bounds,
  onDragStart,
  onDragEnd
}: DragParams) => {
  const camera = useThree(state => state.camera);
  const raycaster = useThree(state => state.raycaster);
  const size = useThree(state => state.size);
  const gl = useThree(state => state.gl);

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

  const clientRect = useMemo(
    () => gl.domElement.getBoundingClientRect(),
    [gl.domElement]
  );

  return useGesture(
    {
      onDragStart: ({ event }) => {
        // @ts-ignore
        const { eventObject, point } = event;

        // Save the offset of click point from object origin
        eventObject.getWorldPosition(offset).sub(point);

        // Set initial 3D cursor position (needed for onDrag plane calculation)
        mouse3D.copy(point);

        // Run user callback
        onDragStart();
      },
      onDrag: ({ xy, buttons, cancel }) => {
        // If the left mouse button is not pressed, cancel the drag
        if (buttons !== 1) {
          cancel();
          return;
        }
        // Compute normalized mouse coordinates (screen space)
        const nx = ((xy[0] - (clientRect?.left ?? 0)) / size.width) * 2 - 1;
        const ny = -((xy[1] - (clientRect?.top ?? 0)) / size.height) * 2 + 1;

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

        // If there's a cluster, clamp the position within its circular bounds
        if (bounds) {
          const center = new Vector3(
            (bounds.minX + bounds.maxX) / 2,
            (bounds.minY + bounds.maxY) / 2,
            (bounds.minZ + bounds.maxZ) / 2
          );
          const radius = (bounds.maxX - bounds.minX) / 2;

          // Calculate direction from center to updated position
          const direction = updated.clone().sub(center);
          const distance = direction.length();

          // If outside the circle, clamp to the circle's edge
          if (distance > radius) {
            direction.normalize().multiplyScalar(radius);
            updated.copy(center).add(direction);
          }
        }

        return set(updated);
      },
      onDragEnd
    },
    { drag: { enabled: draggable, threshold: 10 } }
  );
};
