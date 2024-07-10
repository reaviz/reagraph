import { FC, Ref, ReactNode } from 'react';
import { CameraControlsContextProps } from './useCameraControls';
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
export declare const CameraControls: FC<CameraControlsProps & {
    ref?: Ref<CameraControlsRef>;
}>;
