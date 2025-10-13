import { Canvas } from '@react-three/fiber';
import type ThreeCameraControls from 'camera-controls';
import type Graph from 'graphology';
import type { ReactNode, Ref } from 'react';
import React, {
  forwardRef,
  Suspense,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef
} from 'react';

import type { CameraControlsRef, CameraMode } from '../CameraControls';
import { CameraControls } from '../CameraControls';
import type { GraphSceneProps, GraphSceneRef } from '../GraphScene';
import { GraphScene } from '../GraphScene';
import type { LassoType } from '../selection/Lasso';
import { Lasso } from '../selection/Lasso';
import { createStore, Provider } from '../store';
import type { Theme } from '../themes';
import { lightTheme } from '../themes';
import css from './GraphCanvas.module.css';

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
   * The minimum zoom level for the camera. Default is 1.
   */
  minZoom?: number;

  /**
   * The maximum zoom level for the camera. Default is 100.
   */
  maxZoom?: number;

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
  glOptions?: object;

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

  /**
   * Whether to aggregate edges with the same source and target.
   */
  aggregateEdges?: boolean;
}

export type GraphCanvasRef = Omit<GraphSceneRef, 'graph' | 'renderScene'> &
  Omit<CameraControlsRef, 'controls'> & {
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

const GL_DEFAULTS = {
  alpha: true,
  antialias: true
};

// TODO: Fix type
const CAMERA_DEFAULTS: any = {
  position: [0, 0, 1000],
  near: 5,
  far: 50000,
  fov: 10
};

export const GraphCanvas = forwardRef<GraphCanvasRef, GraphCanvasProps>(
  (
    {
      cameraMode = 'pan',
      layoutType = 'forceDirected2d',
      sizingType = 'default',
      labelType = 'auto',
      theme = lightTheme,
      animated = true,
      defaultNodeSize = 7,
      minNodeSize = 5,
      maxNodeSize = 15,
      lassoType = 'none',
      glOptions = {},
      edges,
      children,
      nodes,
      minDistance,
      maxDistance,
      minZoom,
      maxZoom,
      onCanvasClick,
      disabled,
      onLasso,
      onLassoEnd,
      aggregateEdges,
      ...rest
    },
    ref: Ref<GraphCanvasRef>
  ) => {
    const rendererRef = useRef<GraphSceneRef | null>(null);
    const controlsRef = useRef<CameraControlsRef | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useImperativeHandle(ref, () => ({
      centerGraph: (nodeIds, opts) =>
        rendererRef.current?.centerGraph(nodeIds, opts),
      fitNodesInView: (nodeIds, opts) =>
        rendererRef.current?.fitNodesInView(nodeIds, opts),
      zoomIn: () => {
        const controls = controlsRef.current?.controls;
        if (!controls) return;

        const currentDistance = controls.distance;
        const currentZoom = controls.camera.zoom;

        // Calculate what the new zoom would be has to match CameraControls logic
        const newZoom = currentZoom + currentZoom / 2;
        const newEffectiveDistance = currentDistance / newZoom;

        // Check if zooming in would violate minDistance constraint
        if (!minDistance || newEffectiveDistance >= minDistance) {
          controlsRef.current?.zoomIn();
        }
      },
      zoomOut: () => {
        const controls = controlsRef.current?.controls;
        if (!controls) return;

        const currentDistance = controls.distance;
        const currentZoom = controls.camera.zoom;

        // Calculate what the new zoom would be (matches CameraControls logic)
        const newZoom = currentZoom - currentZoom / 2;
        const newEffectiveDistance = currentDistance / newZoom;

        // Check if zooming out would violate maxDistance constraint
        if (!maxDistance || newEffectiveDistance <= maxDistance) {
          controlsRef.current?.zoomOut();
        }
      },
      dollyIn: distance => controlsRef.current?.dollyIn(distance),
      dollyOut: distance => controlsRef.current?.dollyOut(distance),
      panLeft: () => controlsRef.current?.panLeft(),
      panRight: () => controlsRef.current?.panRight(),
      panDown: () => controlsRef.current?.panDown(),
      panUp: () => controlsRef.current?.panUp(),
      resetControls: (animated?: boolean) =>
        controlsRef.current?.resetControls(animated),
      getControls: () => controlsRef.current?.controls,
      getGraph: () => rendererRef.current?.graph,
      exportCanvas: () => {
        rendererRef.current.renderScene();
        return canvasRef.current.toDataURL();
      },
      freeze: () => controlsRef.current?.freeze(),
      unFreeze: () => controlsRef.current?.unFreeze()
    }));

    // Defaults to pass to the store
    const { selections, actives, collapsedNodeIds } = rest;

    // It's pretty hard to get good animation performance with large n of edges/nodes
    const finalAnimated = edges.length + nodes.length > 400 ? false : animated;

    const gl = useMemo(() => ({ ...glOptions, ...GL_DEFAULTS }), [glOptions]);
    // zustand/context migration (https://github.com/pmndrs/zustand/discussions/1180)
    const store = useRef(
      createStore({
        selections,
        actives,
        theme,
        collapsedNodeIds
      })
    ).current;

    // Update store theme when theme prop changes
    useEffect(() => {
      store.getState().setTheme(theme);
    }, [theme, store]);

    // NOTE: The legacy/linear/flat flags are for color issues
    // Reference: https://github.com/protectwise/troika/discussions/213#discussioncomment-3086666
    return (
      <div className={css.canvas}>
        <Canvas
          orthographic={cameraMode === 'orthographic'}
          legacy
          linear
          ref={canvasRef}
          flat
          gl={gl}
          camera={CAMERA_DEFAULTS}
          onPointerMissed={onCanvasClick}
        >
          <Provider store={store}>
            {theme.canvas?.background && (
              <color attach="background" args={[theme.canvas.background]} />
            )}
            <ambientLight intensity={1} />
            {children}
            {theme.canvas?.fog && (
              <fog attach="fog" args={[theme.canvas.fog, 4000, 9000]} />
            )}
            <CameraControls
              mode={cameraMode}
              ref={controlsRef}
              disabled={disabled}
              minDistance={minDistance}
              maxDistance={maxDistance}
              minZoom={minZoom}
              maxZoom={maxZoom}
              animated={animated}
            >
              <Lasso
                disabled={disabled}
                type={lassoType}
                onLasso={onLasso}
                onLassoEnd={onLassoEnd}
              >
                <Suspense>
                  <GraphScene
                    ref={rendererRef as any}
                    disabled={disabled}
                    animated={finalAnimated}
                    edges={edges}
                    nodes={nodes}
                    layoutType={layoutType}
                    sizingType={sizingType}
                    labelType={labelType}
                    defaultNodeSize={defaultNodeSize}
                    minNodeSize={minNodeSize}
                    maxNodeSize={maxNodeSize}
                    aggregateEdges={aggregateEdges}
                    {...rest}
                  />
                </Suspense>
              </Lasso>
            </CameraControls>
          </Provider>
        </Canvas>
      </div>
    );
  }
);
