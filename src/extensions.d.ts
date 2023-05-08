import { ReactThreeFiber } from 'react-three-fiber';
import CameraControls from 'camera-controls';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      threeCameraControls: ReactThreeFiber.Object3DNode<CameraControls, typeof CameraControls>;
    }
  }
}
