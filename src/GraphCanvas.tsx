import React, {
  FC,
  forwardRef,
  Ref,
  Suspense,
  useImperativeHandle,
  useRef
} from 'react';
import { Canvas } from '@react-three/fiber';
import { GraphScene, GraphSceneProps, GraphSceneRef } from './GraphScene';
import {
  CameraMode,
  CameraControls,
  CameraControlsRef
} from './CameraControls';
import { Theme, lightTheme } from './themes';
import { createStore, Provider } from './store';
import { Graph } from 'ngraph.graph';
import { Lasso, LassoType } from './selection';
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
   * When the canvas was clicked but didn't hit a node/edge.
   */
  onCanvasClick?: (event: MouseEvent) => void;

  /**
   * The type of lasso selection.
   */
  lassoType?: LassoType;

  /**
   * When the canvas had a lasso selection.
   */
  onLasso?: (selections: string[]) => void;

  /**
   * When the canvas had a lasso selection end.
   */
  onLassoEnd?: (selections: string[]) => void;
}

export type GraphCanvasRef = Omit<GraphSceneRef, 'graph'> &
  Omit<CameraControlsRef, 'controls'> & {
    /**
     * Get the ngraph object.
     */
    getGraph: () => Graph;

    /**
     * Get the camera controls.
     */
    getControls: () => any;
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

export const GraphCanvas: FC<GraphCanvasProps & { ref?: Ref<GraphCanvasRef> }> =
  forwardRef(
    (
      {
        cameraMode,
        edges,
        nodes,
        theme,
        onCanvasClick,
        animated,
        disabled,
        lassoType,
        onLasso,
        onLassoEnd,
        ...rest
      },
      ref: Ref<GraphCanvasRef>
    ) => {
      const rendererRef = useRef<GraphSceneRef | null>(null);
      const controlsRef = useRef<CameraControlsRef | null>(null);

      useImperativeHandle(ref, () => ({
        centerGraph: (n?: string[]) => rendererRef.current?.centerGraph(n),
        zoomIn: () => controlsRef.current?.zoomIn(),
        zoomOut: () => controlsRef.current?.zoomOut(),
        panLeft: () => controlsRef.current?.panLeft(),
        panRight: () => controlsRef.current?.panRight(),
        panDown: () => controlsRef.current?.panDown(),
        panUp: () => controlsRef.current?.panUp(),
        getControls: () => controlsRef.current?.controls,
        getGraph: () => rendererRef.current?.graph
      }));

      // Defaults to pass to the store
      const { selections, actives, collapsedNodeIds } = rest;

      // It's pretty hard to get good animation performance with large n of edges/nodes
      const finalAnimated =
        edges.length + nodes.length > 400 ? false : animated;

      // NOTE: The legacy/linear/flat flags are for color issues
      // Reference: https://github.com/protectwise/troika/discussions/213#discussioncomment-3086666
      return (
        <div className={css.canvas}>
          <Canvas
            legacy
            linear
            flat
            gl={GL_DEFAULTS}
            camera={CAMERA_DEFAULTS}
            onPointerMissed={onCanvasClick}
          >
            <Provider
              createStore={() =>
                createStore({
                  selections,
                  actives,
                  collapsedNodeIds
                })
              }
            >
              <color attach="background" args={[theme.canvas.background]} />
              <ambientLight intensity={1} />
              {theme.canvas.fog && (
                <fog attach="fog" args={[theme.canvas.fog, 4000, 9000]} />
              )}
              <CameraControls
                mode={cameraMode}
                ref={controlsRef}
                animated={animated}
                disabled={disabled}
              >
                <Lasso
                  theme={theme}
                  disabled={disabled}
                  type={lassoType}
                  onLasso={onLasso}
                  onLassoEnd={onLassoEnd}
                >
                  <Suspense>
                    <GraphScene
                      ref={rendererRef as any}
                      theme={theme}
                      disabled={disabled}
                      animated={finalAnimated}
                      edges={edges}
                      nodes={nodes}
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

GraphCanvas.defaultProps = {
  cameraMode: 'pan',
  layoutType: 'forceDirected2d',
  sizingType: 'none',
  labelType: 'auto',
  theme: lightTheme,
  animated: true,
  defaultNodeSize: 7,
  minNodeSize: 5,
  maxNodeSize: 15,
  lassoType: 'none'
};
