import ThreeCameraControls from 'camera-controls';
import * as THREE from 'three';

declare module '@react-three/fiber' {
  interface ThreeElements {
    threeCameraControls: {
      ref?: (controls: ThreeCameraControls) => void;
      args?: [THREE.Camera, HTMLElement];
      smoothTime?: number;
      minDistance?: number;
      maxDistance?: number;
      dollyToCursor?: boolean;
    };
  }
}
