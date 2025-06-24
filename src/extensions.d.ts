import type CameraControlsLib from 'camera-controls';
import * as THREE from 'three';

declare module '@react-three/fiber' {
  interface ThreeElements {
    cameraControls: {
      ref?: (controls: CameraControlsLib) => void;
      args?: [THREE.Camera, HTMLElement];
      smoothTime?: number;
      minDistance?: number;
      maxDistance?: number;
      dollyToCursor?: boolean;
    };
  }
}
