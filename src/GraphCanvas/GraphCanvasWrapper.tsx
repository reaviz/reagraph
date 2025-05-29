import React, { FC, forwardRef, Ref, Suspense } from 'react';
import type { GraphCanvasProps, GraphCanvasRef } from './GraphCanvas';
import { isRenderOnServer } from '../utils/visibility';

// Used lazy loading to avoid SSR issues with creating context for @react-three/fiber
const GraphCanvas = React.lazy(() =>
  import('./GraphCanvas').then(mod => ({
    default: mod.GraphCanvas
  }))
);

import css from './GraphCanvas.module.css';

// Create a wrapper component that handles SSR
export const GraphCanvasWrapper: FC<
  GraphCanvasProps & { ref?: Ref<GraphCanvasRef> }
> = forwardRef((props, ref) => {
  if (isRenderOnServer) {
    return (
      <div
        title='This is a client side component. Please use "use client" directive.'
        className={css.canvas}
      />
    );
  }

  return (
    <Suspense>
      <GraphCanvas {...props} ref={ref} />
    </Suspense>
  );
});
