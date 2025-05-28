import React, { FC, forwardRef, Ref, Suspense } from 'react';
import type { CameraControlsProps, CameraControlsRef } from './CameraControls';

const CameraControlsComponent = React.lazy(() => import('./CameraControls'));

const isServer = typeof window === 'undefined';
// Create a wrapper component that handles SSR
export const CameraControls: FC<
  CameraControlsProps & { ref?: Ref<CameraControlsRef> }
> = forwardRef((props, ref) => {
  if (isServer) {
    return null;
  }

  return (
    <Suspense>
      <CameraControlsComponent {...props} ref={ref} />
    </Suspense>
  );
});
