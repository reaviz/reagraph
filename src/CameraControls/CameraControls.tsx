import React, {
  FC,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  Ref,
  useImperativeHandle,
  useMemo,
  ReactNode,
  useState,
  useLayoutEffect
} from 'react';
import { useThree, useFrame, extend } from '@react-three/fiber';
import {
  MOUSE,
  Vector2,
  Vector3,
  Vector4,
  Quaternion,
  Matrix4,
  Spherical,
  Box3,
  Sphere,
  Raycaster,
  MathUtils
} from 'three';
import ThreeCameraControls from 'camera-controls';
import {
  CameraControlsContext,
  CameraControlsContextProps
} from './useCameraControls';
import * as holdEvent from 'hold-event';
import { useStore } from '../store';

// Install the camera controls
// Use a subset for better three shaking
ThreeCameraControls.install({
  THREE: {
    MOUSE: MOUSE,
    Vector2: Vector2,
    Vector3: Vector3,
    Vector4: Vector4,
    Quaternion: Quaternion,
    Matrix4: Matrix4,
    Spherical: Spherical,
    Box3: Box3,
    Sphere: Sphere,
    Raycaster: Raycaster,
    MathUtils: {
      DEG2RAD: MathUtils?.DEG2RAD,
      clamp: MathUtils?.clamp
    }
  }
});

// Extend r3f with the new controls
extend({ ThreeCameraControls });

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

export type CameraMode = 'pan' | 'rotate' | 'orbit';

export interface CameraControlsProps {
  /**
   * Mode of the camera.
   */
  mode?: CameraMode;

  /**
   * Children symbols.
   */
  children?: ReactNode;

  /**
   * Animate transitions to centering.
   */
  animated?: boolean;

  /**
   * Whether the controls are enabled.
   */
  disabled?: boolean;

  /**
   * The maximum distance for the camera.
   */
  maxDistance?: number;

  /**
   * The minimum distance for the camera.
   */
  minDistance?: number;
}

export type CameraControlsRef = CameraControlsContextProps;

export const CameraControls: FC<
  CameraControlsProps & { ref?: Ref<CameraControlsRef> }
> = forwardRef(
  (
    {
      mode = 'rotate',
      children,
      animated,
      disabled,
      minDistance = 1000,
      maxDistance = 50000
    },
    ref: Ref<CameraControlsRef>
  ) => {
    const cameraRef = useRef<ThreeCameraControls | null>(null);
    const camera = useThree(state => state.camera);
    const gl = useThree(state => state.gl);
    const isOrbiting = mode === 'orbit';
    const setPanning = useStore(state => state.setPanning);
    const isDragging = useStore(state => state.draggingIds.length > 0);
    const cameraSpeedRef = useRef(0);
    const [controlMounted, setControlMounted] = useState<boolean>(false);

    useFrame((_state, delta) => {
      if (cameraRef.current?.enabled) {
        cameraRef.current?.update(delta);
      }

      if (isOrbiting) {
        cameraRef.current.azimuthAngle += 20 * delta * MathUtils.DEG2RAD;
      }
    }, -1);

    useEffect(() => () => cameraRef.current?.dispose(), []);

    const zoomIn = useCallback(() => {
      cameraRef.current?.zoom(camera.zoom / 2, animated);
    }, [animated, camera.zoom]);

    const zoomOut = useCallback(() => {
      cameraRef.current?.zoom(-camera.zoom / 2, animated);
    }, [animated, camera.zoom]);

    const dollyIn = useCallback(
      distance => {
        cameraRef.current?.dolly(distance, animated);
      },
      [animated]
    );

    const dollyOut = useCallback(
      distance => {
        cameraRef.current?.dolly(distance, animated);
      },
      [animated]
    );

    const panRight = useCallback(
      event => {
        if (!isOrbiting) {
          cameraRef.current?.truck(-0.03 * event.deltaTime, 0, animated);
        }
      },
      [animated, isOrbiting]
    );

    const panLeft = useCallback(
      event => {
        if (!isOrbiting) {
          cameraRef.current?.truck(0.03 * event.deltaTime, 0, animated);
        }
      },
      [animated, isOrbiting]
    );

    const panUp = useCallback(
      event => {
        if (!isOrbiting) {
          cameraRef.current?.truck(0, 0.03 * event.deltaTime, animated);
        }
      },
      [animated, isOrbiting]
    );

    const panDown = useCallback(
      event => {
        if (!isOrbiting) {
          cameraRef.current?.truck(0, -0.03 * event.deltaTime, animated);
        }
      },
      [animated, isOrbiting]
    );

    const onKeyDown = useCallback(
      event => {
        if (event.code === 'Space') {
          if (mode === 'rotate') {
            cameraRef.current.mouseButtons.left =
              ThreeCameraControls.ACTION.TRUCK;
          } else {
            cameraRef.current.mouseButtons.left =
              ThreeCameraControls.ACTION.ROTATE;
          }
        }
      },
      [mode]
    );

    const onKeyUp = useCallback(
      event => {
        if (event.code === 'Space') {
          if (mode === 'rotate') {
            cameraRef.current.mouseButtons.left =
              ThreeCameraControls.ACTION.ROTATE;
          } else {
            cameraRef.current.mouseButtons.left =
              ThreeCameraControls.ACTION.TRUCK;
          }
        }
      },
      [mode]
    );

    useEffect(() => {
      if (!disabled) {
        leftKey.addEventListener('holding', panLeft);
        rightKey.addEventListener('holding', panRight);
        upKey.addEventListener('holding', panUp);
        downKey.addEventListener('holding', panDown);

        if (typeof window !== 'undefined') {
          window.addEventListener('keydown', onKeyDown);
          window.addEventListener('keyup', onKeyUp);
        }
      }

      return () => {
        leftKey.removeEventListener('holding', panLeft);
        rightKey.removeEventListener('holding', panRight);
        upKey.removeEventListener('holding', panUp);
        downKey.removeEventListener('holding', panDown);

        if (typeof window !== 'undefined') {
          window.removeEventListener('keydown', onKeyDown);
          window.removeEventListener('keyup', onKeyUp);
        }
      };
    }, [disabled, onKeyDown, onKeyUp, panDown, panLeft, panRight, panUp]);

    useEffect(() => {
      if (disabled) {
        cameraRef.current.mouseButtons.left = ThreeCameraControls.ACTION.NONE;
        cameraRef.current.mouseButtons.middle = ThreeCameraControls.ACTION.NONE;
        cameraRef.current.mouseButtons.wheel = ThreeCameraControls.ACTION.NONE;
      } else {
        cameraRef.current.mouseButtons.left = ThreeCameraControls.ACTION.TRUCK;
        cameraRef.current.mouseButtons.middle =
          ThreeCameraControls.ACTION.TRUCK;
        cameraRef.current.mouseButtons.wheel = ThreeCameraControls.ACTION.DOLLY;
      }
    }, [disabled]);

    useEffect(() => {
      const onControl = () => setPanning(true);
      const onControlEnd = () => setPanning(false);

      const ref = cameraRef.current;
      if (ref) {
        ref.addEventListener('control', onControl);
        ref.addEventListener('controlend', onControlEnd);
      }

      return () => {
        if (ref) {
          ref.removeEventListener('control', onControl);
          ref.removeEventListener('controlend', onControlEnd);
        }
      };
    }, [cameraRef, setPanning]);

    useEffect(() => {
      // If a node is being dragged, disable the camera controls
      if (isDragging) {
        cameraRef.current.mouseButtons.left = ThreeCameraControls.ACTION.NONE;
        cameraRef.current.touches.one = ThreeCameraControls.ACTION.NONE;
      } else {
        if (mode === 'rotate') {
          cameraRef.current.mouseButtons.left =
            ThreeCameraControls.ACTION.ROTATE;
          cameraRef.current.touches.one =
            ThreeCameraControls.ACTION.TOUCH_ROTATE;
        } else {
          cameraRef.current.touches.one =
            ThreeCameraControls.ACTION.TOUCH_TRUCK;
          cameraRef.current.mouseButtons.left =
            ThreeCameraControls.ACTION.TRUCK;
        }
      }
    }, [isDragging, mode]);

    const values = useMemo(
      () => ({
        controls: cameraRef.current,
        zoomIn: () => zoomIn(),
        zoomOut: () => zoomOut(),
        dollyIn: (distance = 1000) => dollyIn(distance),
        dollyOut: (distance = -1000) => dollyOut(distance),
        panLeft: (deltaTime = 100) => panLeft({ deltaTime }),
        panRight: (deltaTime = 100) => panRight({ deltaTime }),
        panDown: (deltaTime = 100) => panDown({ deltaTime }),
        panUp: (deltaTime = 100) => panUp({ deltaTime }),
        resetControls: (animated?: boolean) =>
          cameraRef.current?.reset(animated),
        freeze: () => {
          // Save the current speed
          if (cameraRef.current.truckSpeed) {
            cameraSpeedRef.current = cameraRef.current.truckSpeed;
          }
          cameraRef.current.truckSpeed = 0;
        },
        unFreeze: () => (cameraRef.current.truckSpeed = cameraSpeedRef.current)
      }),
      // eslint-disable-next-line
      [zoomIn, zoomOut, panLeft, panRight, panDown, panUp, cameraRef.current]
    );

    useImperativeHandle(ref, () => values);

    return (
      <CameraControlsContext.Provider value={values}>
        <threeCameraControls
          ref={controls => {
            cameraRef.current = controls;
            if (!controlMounted) {
              // Update the state when the controls are mounted to notify about it component that using that controls
              setControlMounted(true);
            }
          }}
          args={[camera, gl.domElement]}
          smoothTime={0.1}
          minDistance={minDistance}
          dollyToCursor
          maxDistance={maxDistance}
        />
        {children}
      </CameraControlsContext.Provider>
    );
  }
);
