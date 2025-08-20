import React, {
  FC,
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef
} from 'react';
import { useThree } from '@react-three/fiber';
import { SelectionBox } from 'three-stdlib';
import { InstancedMesh2 } from '@three.ez/instanced-mesh';
import { Box2, Mesh, Scene, TubeGeometry, Vector2 } from 'three';

import { useCameraControls } from '../CameraControls/useCameraControls';
import { useStore } from '../store';
import { createElement, getInstancesInBounds, prepareRay } from './utils';
import { Instance } from '../types';

export type LassoType = 'none' | 'all' | 'node' | 'edge';

export type LassoProps = PropsWithChildren<{
  /**
   * Whether the lasso tool is disabled.
   */
  disabled?: boolean;

  /**
   * The type of the lasso tool.
   */
  type?: LassoType;

  /**
   * A function that is called when the lasso tool is used to select nodes.
   * The function receives an array of the ids of the selected nodes.
   */
  onLasso?: (selections: string[]) => void;

  /**
   * A function that is called when the lasso tool is released, ending the selection.
   * The function receives an array of the ids of the selected nodes.
   */
  onLassoEnd?: (selections: string[]) => void;
}>;

export const Lasso: FC<LassoProps> = ({
  children,
  type = 'none',
  onLasso,
  onLassoEnd,
  disabled
}) => {
  const theme = useStore(state => state.theme);
  const camera = useThree(state => state.camera);
  const gl = useThree(state => state.gl);
  const setEvents = useThree(state => state.setEvents);
  const size = useThree(state => state.size);
  const get = useThree(state => state.get);
  const scene = useThree(state => state.scene);

  const cameraControls = useCameraControls();

  const actives = useStore(state => state.actives);
  const setActives = useStore(state => state.setActives);
  const edges = useStore(state => state.edges);
  const edgeMeshes = useStore(state => state.edgeMeshes);

  const selectionBoxRef = useRef<SelectionBox | null>(null);
  const edgeMeshSelectionBoxRef = useRef<SelectionBox | null>(null);
  const elementRef = useRef<HTMLDivElement>(createElement(theme));
  const vectorsRef = useRef<[Vector2, Vector2, Vector2] | null>(null);
  const isDownRef = useRef(false);
  const oldRaycasterEnabledRef = useRef<boolean>(get().events.enabled);
  const oldControlsEnabledRef = useRef<boolean>(
    cameraControls.controls?.enabled
  );

  const instancedMeshesRef = useRef<InstancedMesh2<Instance>[]>([]);
  const collectInstancedMeshes = useCallback(() => {
    instancedMeshesRef.current = [];
    scene.traverse(object => {
      if (object instanceof InstancedMesh2 && object.instances) {
        instancedMeshesRef.current.push(object as InstancedMesh2<Instance>);
      }
    });
  }, [scene]);

  const onPointerMove = useCallback(
    event => {
      if (isDownRef.current) {
        const [startPoint, pointTopLeft, pointBottomRight] = vectorsRef.current;

        pointBottomRight.x = Math.max(startPoint.x, event.clientX);
        pointBottomRight.y = Math.max(startPoint.y, event.clientY);
        pointTopLeft.x = Math.min(startPoint.x, event.clientX);
        pointTopLeft.y = Math.min(startPoint.y, event.clientY);
        elementRef.current.style.left = `${pointTopLeft.x}px`;
        elementRef.current.style.top = `${pointTopLeft.y}px`;
        elementRef.current.style.width = `${
          pointBottomRight.x - pointTopLeft.x
        }px`;
        elementRef.current.style.height = `${
          pointBottomRight.y - pointTopLeft.y
        }px`;

        prepareRay(event, selectionBoxRef.current.endPoint, size);
        prepareRay(event, edgeMeshSelectionBoxRef.current.endPoint, size);

        const allSelected = [];
        const edgesSelected = edgeMeshSelectionBoxRef.current
          .select()
          .sort(o => (o as any).uuid)
          .map(
            edge => edges[edgeMeshes.indexOf(edge as Mesh<TubeGeometry>)].id
          );
        allSelected.push(...edgesSelected);

        const selected = selectionBoxRef.current
          .select()
          .sort(o => (o as any).uuid)
          .filter(
            o =>
              o.isMesh &&
              o.userData?.id &&
              (o.userData?.type === type || type === 'all')
          )
          .map(o => o.userData.id);
        allSelected.push(...selected);

        // Handle instanced meshes selection
        if (type === 'node' || type === 'all') {
          const selectionBounds = new Box2(
            new Vector2(pointTopLeft.x, pointTopLeft.y),
            new Vector2(pointBottomRight.x, pointBottomRight.y)
          );

          instancedMeshesRef.current.forEach(instancedMesh => {
            const instanceIds = getInstancesInBounds(
              instancedMesh,
              selectionBounds,
              camera,
              size
            );
            allSelected.push(...instanceIds);
          });
        }

        // Note: This probably isn't the best solution but
        // it prevents the render thrashing and causing flickering
        requestAnimationFrame(() => {
          setActives(allSelected);
          onLasso?.(allSelected);
        });

        document.addEventListener('pointermove', onPointerMove, {
          passive: true,
          capture: true,
          once: true
        });
      }
    },
    [size, edges, edgeMeshes, type, setActives, onLasso, camera]
  );

  const onPointerUp = useCallback(() => {
    if (isDownRef.current) {
      setEvents({ enabled: oldRaycasterEnabledRef.current });
      isDownRef.current = false;
      elementRef.current.parentElement?.removeChild(elementRef.current);
      cameraControls.controls.enabled = oldControlsEnabledRef.current;
      onLassoEnd?.(actives);

      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
    }
  }, [setEvents, cameraControls.controls, onLassoEnd, actives, onPointerMove]);

  const onPointerDown = useCallback(
    event => {
      if (event.shiftKey) {
        // Let's capture the old props to restore them later
        oldRaycasterEnabledRef.current = get().events.enabled;
        oldControlsEnabledRef.current = cameraControls.controls?.enabled;

        // Collect instanced meshes from scene
        collectInstancedMeshes();

        // SelectionBox for all meshes
        selectionBoxRef.current = new SelectionBox(camera, scene);

        // SelectionBox for all Edge meshes (since they are combined into one geometry for rendering)
        const edgeScene = new Scene();
        if (edgeMeshes.length) {
          edgeScene.add(...edgeMeshes);
        }
        edgeMeshSelectionBoxRef.current = new SelectionBox(camera, edgeScene);

        vectorsRef.current = [
          // start point
          new Vector2(),
          // point top left
          new Vector2(),
          // point bottom right
          new Vector2()
        ];

        const [startPoint] = vectorsRef.current;

        cameraControls.controls.enabled = false;
        setEvents({ enabled: false });
        isDownRef.current = true;
        gl.domElement.parentElement?.appendChild(elementRef.current);
        elementRef.current.style.left = `${event.clientX}px`;
        elementRef.current.style.top = `${event.clientY}px`;
        elementRef.current.style.width = '0px';
        elementRef.current.style.height = '0px';
        startPoint.x = event.clientX;
        startPoint.y = event.clientY;

        prepareRay(event, selectionBoxRef.current.startPoint, size);
        prepareRay(event, edgeMeshSelectionBoxRef.current.startPoint, size);

        document.addEventListener('pointermove', onPointerMove, {
          passive: true,
          capture: true,
          once: true
        });
        document.addEventListener('pointerup', onPointerUp, { passive: true });
      }
    },
    [
      camera,
      cameraControls.controls,
      edgeMeshes,
      get,
      gl.domElement.parentElement,
      onPointerMove,
      onPointerUp,
      scene,
      setEvents,
      size,
      collectInstancedMeshes
    ]
  );

  useEffect(() => {
    if (disabled || type === 'none') {
      return;
    }

    if (typeof window !== 'undefined') {
      document.addEventListener('pointerdown', onPointerDown, {
        passive: true
      });
      document.addEventListener('pointermove', onPointerMove, {
        passive: true
      });
      document.addEventListener('pointerup', onPointerUp, { passive: true });
    }

    return () => {
      if (typeof window !== 'undefined') {
        document.removeEventListener('pointerdown', onPointerDown);
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
      }
    };
  }, [type, disabled, onPointerDown, onPointerMove, onPointerUp]);

  return <group>{children}</group>;
};
