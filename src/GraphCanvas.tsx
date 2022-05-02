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
import { CameraMode, Controls } from './controls/CameraControls';
import css from './GraphCanvas.module.css';

export interface GraphCanvasProps extends GraphRendererProps {
  backgroundColor?: string;
  cameraMode?: CameraMode;
  onCanvasClick?: () => void;
}

export interface GraphCanvasRef extends GraphRendererRef {}

export const GraphCanvas: FC<GraphCanvasProps & { ref?: Ref<GraphCanvasRef> }> =
  forwardRef(
    (
      { cameraMode, backgroundColor, onCanvasClick, ...rest },
      ref: Ref<GraphCanvasRef>
    ) => {
      const rendererRef = useRef<GraphRendererRef | null>(null);

      useImperativeHandle(ref, () => ({
        centerGraph: () => rendererRef.current?.centerGraph()
      }));

      return (
        <div className={css.canvas}>
          <Canvas
            invalidateFrameloop={true}
            gl={{ alpha: true, antialias: true }}
            camera={{ position: [0, 0, 1000], near: 5, far: 10000, fov: 75 }}
            onPointerMissed={onCanvasClick}
          >
            <Controls mode={cameraMode} />
            <color attach="background" args={[backgroundColor]} />
            <ambientLight intensity={0.5} />
            <Suspense>
              <GraphRenderer ref={rendererRef} {...rest} />
            </Suspense>
          </Canvas>
        </div>
      );
    }
  );

GraphCanvas.defaultProps = {
  backgroundColor: '#FFF',
  cameraMode: 'pan',
  layoutType: 'forceDirected2d',
  sizingType: 'none',
  labelType: 'auto'
};
