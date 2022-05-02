import React, { FC, useRef, useEffect, useCallback } from 'react';
import { useThree, useFrame, extend } from '@react-three/fiber';
import * as THREE from 'three';
import CameraControls from 'camera-controls';
import { useControls } from './useControls';
import { useEvent } from 'react-use';
import { useHotkeys } from 'reakeys';
import * as holdEvent from 'hold-event';

// Install the camera controls
CameraControls.install({ THREE });

// Extend r3f with the new controls
extend({ CameraControls });

const KEY_CODES = {
  ARROW_LEFT: 37,
  ARROW_UP: 38,
  ARROW_RIGHT: 39,
  ARROW_DOWN: 40
};

const leftKey = new holdEvent.KeyboardKeyHold(KEY_CODES.ARROW_LEFT, 100);
const rightKey = new holdEvent.KeyboardKeyHold(KEY_CODES.ARROW_RIGHT, 100);
const upKey = new holdEvent.KeyboardKeyHold(KEY_CODES.ARROW_UP, 100);
const downKey = new holdEvent.KeyboardKeyHold(KEY_CODES.ARROW_DOWN, 100);

export type CameraMode = 'pan' | 'rotate';

export interface ControlsProps {
  mode?: CameraMode;
}

export const Controls: FC<ControlsProps> = ({ mode = 'rotate' }) => {
  const { controls, setControls } = useControls();
  const ref = useRef<CameraControls | null>(null);
  const { camera, gl, invalidate } = useThree();

  useFrame((_state, delta) => ref.current?.update(delta));
  useEffect(() => () => ref.current?.dispose(), []);

  const zoomIn = useCallback(() => {
    ref.current?.zoom(camera.zoom / 2, true);
    invalidate();
  }, [camera, invalidate]);

  const zoomOut = useCallback(() => {
    ref.current?.zoom(-camera.zoom / 2, true);
    invalidate();
  }, [camera, invalidate]);

  const panRight = useCallback(
    event => {
      ref.current?.truck(-0.03 * event.deltaTime, 0, true);
    },
    [ref]
  );

  const panLeft = useCallback(event => {
    ref.current?.truck(0.03 * event.deltaTime, 0, true);
  }, []);

  const panUp = useCallback(event => {
    ref.current?.truck(0, 0.03 * event.deltaTime, true);
  }, []);

  const panDown = useCallback(event => {
    ref.current?.truck(0, -0.03 * event.deltaTime, true);
  }, []);

  useEffect(() => {
    leftKey.addEventListener('holding', panLeft);
    rightKey.addEventListener('holding', panRight);
    upKey.addEventListener('holding', panUp);
    downKey.addEventListener('holding', panDown);

    return () => {
      leftKey.removeEventListener('holding', panLeft);
      rightKey.removeEventListener('holding', panRight);
      upKey.removeEventListener('holding', panUp);
      downKey.removeEventListener('holding', panDown);
    };
  }, [panDown, panLeft, panRight, panUp]);

  useEffect(() => {
    if (!controls) {
      setControls(ref.current);
      ref.current.addEventListener('update', invalidate);
      ref.current.addEventListener('control', invalidate);
      // ref.current.addEventListener('zoomIn', zoomIn);
      // ref.current.addEventListener('zoomOut', zoomOut);
    }

    return () => {
      if (controls) {
        controls.removeEventListener('update', invalidate);
        controls.removeEventListener('control', invalidate);
        // controls.removeEventListener('zoomIn', zoomIn);
        // controls.removeEventListener('zoomOut', zoomOut);
      }
    };
  }, [ref, invalidate, setControls, controls, zoomIn, zoomOut]);

  useEvent('keydown', event => {
    if (event.code === 'Space') {
      if (mode === 'rotate') {
        ref.current.mouseButtons.left = CameraControls.ACTION.TRUCK;
      } else {
        ref.current.mouseButtons.left = CameraControls.ACTION.ROTATE;
      }
    }
  });

  useEvent('keyup', event => {
    if (event.code === 'Space') {
      if (mode === 'rotate') {
        ref.current.mouseButtons.left = CameraControls.ACTION.ROTATE;
      } else {
        ref.current.mouseButtons.left = CameraControls.ACTION.TRUCK;
      }
    }
  });

  useEffect(() => {
    if (mode === 'rotate') {
      ref.current.mouseButtons.left = CameraControls.ACTION.ROTATE;
    } else {
      ref.current.mouseButtons.left = CameraControls.ACTION.TRUCK;
    }
  }, [mode]);

  useHotkeys([
    {
      name: 'Zoom In',
      keys: 'command+shift+i',
      callback: zoomIn
    },
    {
      name: 'Zoom Out',
      keys: 'command+shift+o',
      callback: zoomOut
    }
  ]);

  return <cameraControls ref={ref} args={[camera, gl.domElement]} />;
};
