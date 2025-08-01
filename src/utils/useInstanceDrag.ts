import { useThree } from '@react-three/fiber';
import { useMemo, useRef, useCallback } from 'react';
import { Vector2, Vector3, Plane } from 'three';
import { CenterPositionVector } from '../utils/layout';

interface InstanceDragParams {
  draggable: boolean;
  bounds?: CenterPositionVector;
  set: (instanceId: number, position: Vector3) => void;
  onDragStart: (instanceId: number) => void;
  onDragEnd: (instanceId: number) => void;
}

export const useInstanceDrag = ({
  draggable,
  set,
  bounds,
  onDragStart,
  onDragEnd
}: InstanceDragParams) => {
  const camera = useThree(state => state.camera);
  const raycaster = useThree(state => state.raycaster);
  const size = useThree(state => state.size);
  const gl = useThree(state => state.gl);

  // Store drag state internally
  const dragState = useRef<{
    instanceId: number | null;
    instancePosition: Vector3;
    offset: Vector3;
    mouse3D: Vector3;
    lastMoveTime: number;
  }>({
    instanceId: null,
    instancePosition: new Vector3(),
    offset: new Vector3(),
    mouse3D: new Vector3(),
    lastMoveTime: 0
  });

  const { mouse2D, normal, plane } = useMemo(
    () => ({
      // Normalized 2D screen space mouse coords
      mouse2D: new Vector2(),
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

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      console.log('handlePointerMove', event);
      if (dragState.current.instanceId === null) return;

      // Throttle mouse move events to 16ms (~60fps) for better performance
      const now = performance.now();
      if (now - dragState.current.lastMoveTime < 16) return;
      dragState.current.lastMoveTime = now;

      // Compute normalized mouse coordinates (screen space)
      const nx =
        ((event.clientX - (clientRect?.left ?? 0)) / size.width) * 2 - 1;
      const ny =
        -((event.clientY - (clientRect?.top ?? 0)) / size.height) * 2 + 1;

      // Unlike the mouse from useThree, this works offscreen
      mouse2D.set(nx, ny);

      // Update raycaster (otherwise it doesn't track offscreen)
      raycaster.setFromCamera(mouse2D, camera);

      // The drag plane is normal to the camera view
      camera.getWorldDirection(normal).negate();

      // Find the plane that's normal to the camera and contains our drag point
      plane.setFromNormalAndCoplanarPoint(normal, dragState.current.mouse3D);

      // Find the point of intersection
      raycaster.ray.intersectPlane(plane, dragState.current.mouse3D);

      // Update the object position with the original offset
      const updated = new Vector3()
        .copy(dragState.current.mouse3D)
        .add(dragState.current.offset);

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

      set(dragState.current.instanceId, updated);
    },
    [camera, raycaster, size, clientRect, mouse2D, normal, plane, bounds, set]
  );

  const handlePointerUp = useCallback(() => {
    if (dragState.current.instanceId !== null) {
      const instanceId = dragState.current.instanceId;
      dragState.current.instanceId = null;
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      onDragEnd(instanceId);
    }
  }, [handlePointerMove, onDragEnd]);

  const handleDragStart = useCallback(
    (instanceId: number, point: Vector3, instancePosition: Vector3) => {
      if (!draggable) return;

      // Store drag state
      dragState.current.instanceId = instanceId;
      dragState.current.instancePosition.copy(instancePosition);
      dragState.current.offset.copy(instancePosition).sub(point);
      dragState.current.mouse3D.copy(point);
      dragState.current.lastMoveTime = 0;

      // Add global event listeners
      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);

      // Run user callback
      onDragStart(instanceId);
    },
    [draggable, handlePointerMove, handlePointerUp, onDragStart]
  );

  return { handleDragStart };
};
