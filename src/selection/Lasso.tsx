import React, { FC, useCallback, useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { SelectionBox } from 'three-stdlib';
import { BufferGeometry, Group, Material, Mesh, Scene, Vector2 } from 'three';
import shallow from 'zustand/shallow';
import { useCameraControls } from '../CameraControls';
import { useStore } from '../store';
import { Theme } from '../utils/themes';

export type LassoType = 'none' | 'all' | 'node' | 'edge';

export interface LassoProps {
  children: any;
  theme: Theme;
  disabled?: boolean;
  type?: LassoType;
  onLasso?: (selections: string[]) => void;
  onLassoEnd?: (selections: string[]) => void;
}

function prepareRay(event, vec, size) {
  const { offsetX, offsetY } = event;
  const { width, height } = size;
  vec.set((offsetX / width) * 2 - 1, -(offsetY / height) * 2 + 1);
}

function createElement(theme: Theme) {
  const element = document.createElement('div');
  element.style.pointerEvents = 'none';
  element.style.border = theme.lasso.border;
  element.style.backgroundColor = theme.lasso.background;
  element.style.position = 'fixed';
  return element;
}

export const Lasso: FC<LassoProps> = ({
  children,
  theme,
  type = 'none',
  onLasso,
  onLassoEnd,
  disabled
}) => {
  const { setEvents, camera, gl, size, get } = useThree();
  const cameraControls = useCameraControls();
  const ref = useRef<Group | null>(null!);
  const [actives, setActives] = useStore(state => [
    state.actives,
    state.setActives
  ]);
  const mountedRef = useRef<boolean>(false);
  const selectionBoxRef = useRef<SelectionBox | null>(null);
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

  const onPointerDown = useCallback(
    event => {
      if (event.shiftKey) {
        // Let's capture the old props to restore them later
        oldRaycasterEnabledRef.current = get().events.enabled;
        oldControlsEnabledRef.current = cameraControls.controls?.enabled;

        // initalize some new vectors
        selectionBoxRef.current = new SelectionBox(
          camera,
          ref.current as unknown as Scene
        );

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
      }
    },
    [
      camera,
      cameraControls.controls,
      get,
      gl.domElement.parentElement,
      setEvents,
      size
    ]
  );

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

        const allSelected = selectionBoxRef.current
          .select()
          .sort(o => (o as any).uuid)
          .filter(
            o =>
              o.isMesh &&
              o.userData?.id &&
              (o.userData?.type === type || type === 'all')
          );

        if (!shallow(allSelected, prevRef.current)) {
          prevRef.current = allSelected;
          setActives(allSelected.map(o => o.userData.id));
        }
      }
    },
    [setActives, size, type]
  );

  const onPointerUp = useCallback(() => {
    if (isDownRef.current) {
      setEvents({ enabled: oldRaycasterEnabledRef.current });
      isDownRef.current = false;
      elementRef.current.parentElement?.removeChild(elementRef.current);
      cameraControls.controls.enabled = oldControlsEnabledRef.current;
      onLassoEnd?.(actives);
    }
  }, [setEvents, cameraControls.controls, onLassoEnd, actives]);

  useEffect(() => {
    if (disabled || type === 'none') {
      return;
    }

    document.addEventListener('pointerdown', onPointerDown, { passive: true });
    document.addEventListener('pointermove', onPointerMove, {
      passive: true,
      capture: true
    });
    document.addEventListener('pointerup', onPointerUp, { passive: true });

    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
    };
  }, [type, disabled, onPointerDown, onPointerMove, onPointerUp]);

  return <group ref={ref}>{children}</group>;
};
