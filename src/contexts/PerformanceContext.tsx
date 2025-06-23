/**
 * Performance Context for GraphCanvasV2
 *
 * Provides access to all Phase 2 optimization systems throughout the component tree
 */

import React, { createContext, useContext } from 'react';
import { AdvancedMemoryManager, AdvancedInstancedRenderer } from '../rendering';
import { WebGLComputePipeline, SharedWorkerPool } from '../workers';
import { AdvancedPerformanceMonitor } from '../performance/PerformanceMonitor';
import { OptimizationProfile } from '../GraphCanvas/GraphCanvasV2';

export interface PerformanceContextValue {
  memoryManager: AdvancedMemoryManager | null;
  instancedRenderer: AdvancedInstancedRenderer | null;
  computePipeline: WebGLComputePipeline | null;
  performanceMonitor: AdvancedPerformanceMonitor | null;
  workerPool: SharedWorkerPool | null;
  profile: OptimizationProfile;
  isInitialized: boolean;
  errors: string[];
}

const PerformanceContext = createContext<PerformanceContextValue | null>(null);

export const usePerformanceContext = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error(
      'usePerformanceContext must be used within PerformanceProvider'
    );
  }
  return context;
};

export const PerformanceProvider = PerformanceContext.Provider;

export default PerformanceContext;
