import React, { FC, Suspense } from 'react';
import type { LassoProps } from './Lasso';
import { isServerRender } from '../utils/visibility';

// Used lazy loading to avoid SSR issues with creating context for @react-three/fiber
const Lasso = React.lazy(() =>
  import('./Lasso').then(mod => ({ default: mod.Lasso }))
);

// Create a wrapper component that handles SSR
export const LassoWrapper: FC<LassoProps> = props => {
  if (isServerRender) {
    return null;
  }

  return (
    <Suspense>
      <Lasso {...props} />
    </Suspense>
  );
};
