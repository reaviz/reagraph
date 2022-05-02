import React, {
  FC,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  Ref,
  useImperativeHandle
} from 'react';
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

export interface ControlsRef {
  zoomIn: () => void;
  zoomOut: () => void;
  panLeft: () => void;
  panRight: () => void;
  panUp: () => void;
  panDown: () => void;
}

export const Controls: FC<ControlsProps & { ref?: Ref<ControlsRef> }> =
  forwardRef(({ mode }, ref: Ref<ControlsRef>) => {
    const { controls, setControls } = useControls();
    const cameraRef = useRef<CameraControls | null>(null);
    const { camera, gl, invalidate } = useThree();

    useFrame((_state, delta) => cameraRef.current?.update(delta));
    useEffect(() => () => cameraRef.current?.dispose(), []);

    const zoomIn = useCallback(() => {
      cameraRef.current?.zoom(camera.zoom / 2, true);
      invalidate();
    }, [camera, invalidate]);

    const zoomOut = useCallback(() => {
      cameraRef.current?.zoom(-camera.zoom / 2, true);
      invalidate();
    }, [camera, invalidate]);

    const panRight = useCallback(
      event => {
        cameraRef.current?.truck(-0.03 * event.deltaTime, 0, true);
        invalidate();
      },
      [invalidate]
    );

    const panLeft = useCallback(
      event => {
        cameraRef.current?.truck(0.03 * event.deltaTime, 0, true);
        invalidate();
      },
      [invalidate]
    );

    const panUp = useCallback(
      event => {
        cameraRef.current?.truck(0, 0.03 * event.deltaTime, true);
        invalidate();
      },
      [invalidate]
    );

    const panDown = useCallback(
      event => {
        cameraRef.current?.truck(0, -0.03 * event.deltaTime, true);
        invalidate();
      },
      [invalidate]
    );

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
        setControls(cameraRef.current);
        cameraRef.current.addEventListener('update', invalidate);
        cameraRef.current.addEventListener('control', invalidate);
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
    }, [cameraRef, invalidate, setControls, controls, zoomIn, zoomOut]);

    useEvent('keydown', event => {
      if (event.code === 'Space') {
        if (mode === 'rotate') {
          cameraRef.current.mouseButtons.left = CameraControls.ACTION.TRUCK;
        } else {
          cameraRef.current.mouseButtons.left = CameraControls.ACTION.ROTATE;
        }
      }
    });

    useEvent('keyup', event => {
      if (event.code === 'Space') {
        if (mode === 'rotate') {
          cameraRef.current.mouseButtons.left = CameraControls.ACTION.ROTATE;
        } else {
          cameraRef.current.mouseButtons.left = CameraControls.ACTION.TRUCK;
        }
      }
    });

    useEffect(() => {
      if (mode === 'rotate') {
        cameraRef.current.mouseButtons.left = CameraControls.ACTION.ROTATE;
      } else {
        cameraRef.current.mouseButtons.left = CameraControls.ACTION.TRUCK;
      }
    }, [mode]);

    useHotkeys([
      {
        name: 'Zoom In',
        keys: 'command+shift+i',
        callback: event => {
          event.preventDefault();
          zoomIn();
        }
      },
      {
        name: 'Zoom Out',
        keys: 'command+shift+o',
        callback: event => {
          event.preventDefault();
          zoomOut();
        }
      }
    ]);

    useImperativeHandle(ref, () => ({
      zoomIn: () => zoomIn(),
      zoomOut: () => zoomOut(),
      panLeft: () => panLeft({ deltaTime: 1 }),
      panRight: () => panRight({ deltaTime: 1 }),
      panDown: () => panDown({ deltaTime: 1 }),
      panUp: () => panUp({ deltaTime: 1 })
    }));

    return <cameraControls ref={cameraRef} args={[camera, gl.domElement]} />;
  });

Controls.defaultProps = {
  mode: 'rotate'
};
