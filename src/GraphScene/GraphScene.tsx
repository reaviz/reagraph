import React, { FC, forwardRef, Ref, Suspense } from 'react';
import type { GraphSceneProps, GraphSceneRef } from './GraphSceneContent';

const GraphSceneContent = React.lazy(() => import('./GraphSceneContent'));

const isServer = typeof window === 'undefined';
// Create a wrapper component that handles SSR
export const GraphScene: FC<GraphSceneProps & { ref?: Ref<GraphSceneRef> }> =
  forwardRef((props, ref) => {
    if (isServer) {
      return null;
    }

    return (
      <Suspense>
        <GraphSceneContent {...props} ref={ref} />
      </Suspense>
    );
  });
