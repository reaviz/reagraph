import React, {
  FC,
  forwardRef,
  Ref,
  Suspense,
  useImperativeHandle,
  useRef
} from 'react';
import { Canvas } from '@react-three/fiber';
import {
  GraphRenderer,
  GraphRendererProps,
  GraphRendererRef
} from './GraphRenderer';
import {
  CameraMode,
  Controls,
  ControlsRef
} from './CameraControls/CameraControls';
import css from './GraphCanvas.module.css';
import { Theme, lightTheme } from './utils/themes';

export interface GraphCanvasProps extends Omit<GraphRendererProps, 'theme'> {
  theme?: Theme;
  cameraMode?: CameraMode;
  onCanvasClick?: (event: MouseEvent) => void;
}

export type GraphCanvasRef = GraphRendererRef & ControlsRef;

export const GraphCanvas: FC<GraphCanvasProps & { ref?: Ref<GraphCanvasRef> }> =
  forwardRef(
    (
      { cameraMode, theme, onCanvasClick, animated, ...rest },
      ref: Ref<GraphCanvasRef>
    ) => {
      const rendererRef = useRef<GraphRendererRef | null>(null);
      const controlsRef = useRef<ControlsRef | null>(null);

      useImperativeHandle(ref, () => ({
        centerGraph: (n?: string[]) => rendererRef.current?.centerGraph(n),
        zoomIn: () => controlsRef.current?.zoomIn(),
        zoomOut: () => controlsRef.current?.zoomOut(),
        panLeft: () => controlsRef.current?.panLeft(),
        panRight: () => controlsRef.current?.panRight(),
        panDown: () => controlsRef.current?.panDown(),
        panUp: () => controlsRef.current?.panUp(),
        controls: controlsRef.current?.controls
      }));

      return (
        <div className={css.canvas}>
          <Canvas
            gl={{ alpha: true, antialias: true }}
            camera={{ position: [0, 0, 1000], near: 5, far: 10000, fov: 75 }}
            onPointerMissed={onCanvasClick}
          >
            <Controls mode={cameraMode} ref={controlsRef} animated={animated}>
              <Suspense>
                <GraphRenderer
                  ref={rendererRef}
                  theme={theme}
                  animated={animated}
                  {...rest}
                />
              </Suspense>
            </Controls>
            <color attach="background" args={[theme.backgroundColor]} />
            <ambientLight intensity={0.5} />
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
  animated: true
};
