import React, { FC, forwardRef, Ref, Suspense } from 'react';
import type { GraphSceneProps, GraphSceneRef } from './GraphScene';
import { isServerRender } from '../utils/visibility';

// Used lazy loading to avoid SSR issues with creating context for @react-three/fiber
const GraphScene = React.lazy(() =>
  import('./GraphScene').then(mod => ({
    default: mod.GraphScene
  }))
);

// Create a wrapper component that handles SSR
export const GraphSceneWrapper: FC<
  GraphSceneProps & { ref?: Ref<GraphSceneRef> }
> = forwardRef((props, ref) => {
  if (isServerRender) {
    return null;
  }

  return (
    <Suspense>
      <GraphScene {...props} ref={ref} />
    </Suspense>
  );
});
