import { FC, ReactNode, Ref } from 'react';
import { GraphSceneProps, GraphSceneRef } from './GraphScene';
import { CameraMode, CameraControlsRef } from './CameraControls';
import { Theme } from './themes';
import Graph from 'graphology';
import { LassoType } from './selection';
import ThreeCameraControls from 'camera-controls';
export interface GraphCanvasProps extends Omit<GraphSceneProps, 'theme'> {
    /**
     * Theme to use for the graph.
     */
    theme?: Theme;
    /**
     * Type of camera interaction.
     */
    cameraMode?: CameraMode;
    /**
     * The maximum distance for the camera. Default is 50000.
     */
    maxDistance?: number;
    /**
     * The minimum distance for the camera. Default is 1000.
     */
    minDistance?: number;
    /**
     * The type of lasso selection.
     */
    lassoType?: LassoType;
    /**
     * Children to render in the canvas. Useful for things like lights.
     */
    children?: ReactNode;
    /**
     * Ability to extend Cavas gl options. For example { preserveDrawingBuffer: true }
     */
    glOptions?: Object;
    /**
     * When the canvas had a lasso selection.
     */
    onLasso?: (selections: string[]) => void;
    /**
     * When the canvas had a lasso selection end.
     */
    onLassoEnd?: (selections: string[]) => void;
    /**
     * When the canvas was clicked but didn't hit a node/edge.
     */
    onCanvasClick?: (event: MouseEvent) => void;
}
export type GraphCanvasRef = Omit<GraphSceneRef, 'graph' | 'renderScene'> & Omit<CameraControlsRef, 'controls'> & {
    /**
     * Get the graph object.
     */
    getGraph: () => Graph;
    /**
     * Get the camera controls.
     */
    getControls: () => ThreeCameraControls;
    /**
     * Export the canvas as a data URL.
     */
    exportCanvas: () => string;
};
export declare const GraphCanvas: FC<GraphCanvasProps & {
    ref?: Ref<GraphCanvasRef>;
}>;
