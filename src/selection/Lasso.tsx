import React, {
  FC,
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef
} from 'react';
import { useThree } from '@react-three/fiber';
import { SelectionBox } from 'three-stdlib';
import {
  BufferGeometry,
  Material,
  Mesh,
  Scene,
  TubeBufferGeometry,
  Vector2
} from 'three';
import shallow from 'zustand/shallow';
import { useCameraControls } from '../CameraControls';
import { useStore } from '../store';
import { Theme } from '../themes';
import { createElement, prepareRay } from './utils';

export type LassoType = 'none' | 'all' | 'node' | 'edge';

export type LassoProps = PropsWithChildren<{
  theme: Theme;
  disabled?: boolean;
  type?: LassoType;
  onLasso?: (selections: string[]) => void;
  onLassoEnd?: (selections: string[]) => void;
}>;

export const Lasso: FC<LassoProps> = ({
  children,
  theme,
  type = 'none',
  onLasso,
  onLassoEnd,
  disabled
}) => {
  const { setEvents, camera, gl, size, get, scene } = useThree();
  const cameraControls = useCameraControls();
  const [actives, setActives, edges, edgeMeshes] = useStore(state => [
    state.actives,
    state.setActives,
    state.edges,
    state.edgeMeshes
  ]);

  const mountedRef = useRef<boolean>(false);
  const nodeSelectionBoxRef = useRef<SelectionBox | null>(null);
  const edgeSelectionBoxRef = useRef<SelectionBox | null>(null);
  const elementRef = useRef<HTMLDivElement>(createElement(theme));
  const vectorsRef = useRef<[Vector2, Vector2, Vector2] | null>(null);
  const isDownRef = useRef(false);
  const prevRef = useRef<Mesh<BufferGeometry, Material | Material[]>[]>([]);
  const oldRaycasterEnabledRef = useRef<boolean>(get().events.enabled);
  const oldControlsEnabledRef = useRef<boolean>(
    cameraControls.controls?.enabled
  );

  useEffect(() => {
    if (mountedRef.current) {
      onLasso?.(actives);
    }

    mountedRef.current = true;
  }, [actives, onLasso]);

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

        prepareRay(event, nodeSelectionBoxRef.current.endPoint, size);
        prepareRay(event, edgeSelectionBoxRef.current.endPoint, size);

        const allSelected = [];
        if (type === 'all' || type === 'node') {
          const nodesSelected = nodeSelectionBoxRef.current
            .select()
            .sort(o => (o as any).uuid)
            .filter(
              o =>
                o.isMesh &&
                o.userData?.id &&
                (o.userData?.type === type || type === 'all')
            )
            .map(o => o.userData.id);
          allSelected.push(...nodesSelected);
        }

        if (type === 'all' || type === 'edge') {
          const edgesSelected = edgeSelectionBoxRef.current
            .select()
            .sort(o => (o as any).uuid)
            .map(
              edge =>
                edges[edgeMeshes.indexOf(edge as Mesh<TubeBufferGeometry>)].id
            );
          allSelected.push(...edgesSelected);
        }

        if (!shallow(allSelected, prevRef.current)) {
          prevRef.current = allSelected;
          setActives(allSelected);
        }

        document.addEventListener('pointermove', onPointerMove, {
          passive: true,
          capture: true,
          once: true
        });
      }
    },
    [edges, edgeMeshes, setActives, size, type]
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

        // SelectionBox for all Node meshes
        nodeSelectionBoxRef.current = new SelectionBox(camera, scene);

        // SelectionBox for all Edge meshes (since they are combined into one geometry for rendering)
        const edgeScene = new Scene();
        edgeScene.add(...edgeMeshes);
        edgeSelectionBoxRef.current = new SelectionBox(camera, edgeScene);

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

        prepareRay(event, nodeSelectionBoxRef.current.startPoint, size);
        prepareRay(event, edgeSelectionBoxRef.current.startPoint, size);

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
      size
    ]
  );

  useEffect(() => {
    if (disabled || type === 'none') {
      return;
    }

    document.addEventListener('pointerdown', onPointerDown, { passive: true });

    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [type, disabled, onPointerDown, onPointerMove, onPointerUp]);

  return <group>{children}</group>;
};
