import React, { FC, forwardRef, Ref, Suspense } from 'react';
import type { CameraControlsProps, CameraControlsRef } from './CameraControls';
import { isServerRender } from '../utils/visibility';

// Used lazy loading to avoid SSR issues with creating context for @react-three/fiber
const CameraControls = React.lazy(() =>
  import('./CameraControls').then(mod => ({
    default: mod.CameraControls
  }))
);

// Create a wrapper component that handles SSR
export const CameraControlsWrapper: FC<
  CameraControlsProps & { ref?: Ref<CameraControlsRef> }
> = forwardRef((props, ref) => {
  if (isServerRender) {
    return null;
  }

  return (
    <Suspense>
      <CameraControls {...props} ref={ref} />
    </Suspense>
  );
});
