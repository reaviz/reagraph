import React, { FC, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { GraphRenderer, GraphRendererProps } from './GraphRenderer';
import { CameraMode, Controls } from './controls/CameraControls';
import css from './GraphCanvas.module.css';

export interface GraphCanvasProps extends GraphRendererProps {
  backgroundColor?: string;
  cameraMode?: CameraMode;
  onCanvasClick?: () => void;
}

export const GraphCanvas: FC<GraphCanvasProps> = ({
  cameraMode,
  backgroundColor,
  onCanvasClick,
  ...rest
}) => (
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
        <GraphRenderer {...rest} />
      </Suspense>
    </Canvas>
  </div>
);

GraphCanvas.defaultProps = {
  backgroundColor: '#FFF',
  cameraMode: 'pan',
  layoutType: 'forceDirected2d',
  sizingType: 'none',
  labelType: 'auto'
};
