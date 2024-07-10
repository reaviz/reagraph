/// <reference types="react" />
import CameraControls from 'camera-controls';
export interface CameraControlsContextProps {
    /**
     * The camera controls object.
     */
    controls: CameraControls | null;
    /**
     * A function that resets the camera controls.
     * If the optional `animated` argument is true, the reset is animated.
     */
    resetControls: (animated?: boolean) => void;
    /**
     * A function that zooms in the camera.
     */
    zoomIn: () => void;
    /**
     * A function that zooms out the camera.
     */
    zoomOut: () => void;
    /**
     * A function that dollies in the camera.
     */
    dollyIn: (distance?: number) => void;
    /**
     * A function that dollies out the camera.
     */
    dollyOut: (distance?: number) => void;
    /**
     * A function that pans the camera to the left.
     */
    panLeft: () => void;
    /**
     * A function that pans the camera to the right.
     */
    panRight: () => void;
    /**
     * A function that pans the camera upwards.
     */
    panUp: () => void;
    /**
     * A function that pans the camera downwards.
     */
    panDown: () => void;
}
export declare const CameraControlsContext: import("react").Context<CameraControlsContextProps>;
export declare const useCameraControls: () => CameraControlsContextProps;
