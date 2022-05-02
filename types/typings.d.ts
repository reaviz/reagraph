declare module '*.json';
declare module '*.css';
declare module '*.scss';
declare module '*.md';

declare global {
  import { ReactThreeFiber } from 'react-three-fiber';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
  import CameraControls from 'camera-controls';

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
