import React, { FC, Suspense } from 'react';
import type { LassoProps } from './LassoContent';

const LassoContent = React.lazy(() => import('./LassoContent'));

const isServer = typeof window === 'undefined';
// Create a wrapper component that handles SSR
export const Lasso: FC<LassoProps> = props => {
  if (isServer) {
    return null;
  }

  return (
    <Suspense>
      <LassoContent {...props} />
    </Suspense>
  );
};
