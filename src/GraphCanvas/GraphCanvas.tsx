import React, { FC, forwardRef, Ref, Suspense } from 'react';
import type { GraphCanvasProps, GraphCanvasRef } from './GraphCanvasContent';

// Used lazy loading to avoid SSR issues with creating context for @react-three/fiber
const GraphCanvasContent = React.lazy(() => import('./GraphCanvasContent'));

import css from './GraphCanvas.module.css';

const isServer = typeof window === 'undefined';
// Create a wrapper component that handles SSR
export const GraphCanvas: FC<GraphCanvasProps & { ref?: Ref<GraphCanvasRef> }> =
  forwardRef((props, ref) => {
    if (isServer) {
      return (
        <div
          title='This is a client side component. Please use "use client" directive.'
          className={css.canvas}
        />
      );
    }

    return (
      <Suspense>
        <GraphCanvasContent {...props} ref={ref} />
      </Suspense>
    );
  });
