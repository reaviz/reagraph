import { ReactThreeFiber } from 'react-three-fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import CameraControls from 'camera-controls';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      orbitControls: ReactThreeFiber.Object3DNode<
        OrbitControls,
        typeof OrbitControls
      >;
      cameraControls: ReactThreeFiber.Object3DNode<
        CameraControls,
        typeof CameraControls
      >;
    }
  }
}

declare module '*.json';
declare module '*.css';
declare module '*.md';
declare module '*.svg';
