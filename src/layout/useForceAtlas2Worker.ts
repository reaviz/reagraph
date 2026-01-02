/**
 * Hook for using graphology's built-in ForceAtlas2 web worker.
 * This uses the production-ready worker implementation from graphology-layout-forceatlas2.
 */

import { useCallback, useEffect, useRef } from 'react';
import type Graph from 'graphology';
import random from 'graphology-layout/random.js';
import FA2Layout from 'graphology-layout-forceatlas2/worker';
import type { ForceAtlas2LayoutInputs } from './forceatlas2';

export interface FA2WorkerResult {
  /** Whether the layout completed successfully */
  success: boolean;
}

/**
 * Hook that provides access to graphology's ForceAtlas2 web worker.
 * The FA2Layout worker runs the layout algorithm off the main thread,
 * updating node positions directly on the graph object.
 */
export function useForceAtlas2Worker() {
  const layoutRef = useRef<any | null>(null);
  const isRunningRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (layoutRef.current) {
        layoutRef.current.kill();
        layoutRef.current = null;
      }
    };
  }, []);

  /**
   * Run ForceAtlas2 layout using web worker.
   * Returns a promise that resolves when layout runs for sufficient time.
   */
  const runLayout = useCallback(
    async (
      graph: Graph,
      options: Omit<ForceAtlas2LayoutInputs, 'graph' | 'drags'>
    ): Promise<FA2WorkerResult> => {
      // Kill any existing layout
      if (layoutRef.current) {
        layoutRef.current.kill();
        layoutRef.current = null;
      }

      return new Promise((resolve) => {
        const { iterations = 50, ...settings } = options;

        // FA2 requires nodes to have initial x,y positions
        // Assign random positions if not present
        random.assign(graph);

        // Create the FA2Layout worker
        const layout = new FA2Layout(graph, {
          settings
        });

        layoutRef.current = layout;
        isRunningRef.current = true;

        // FA2Layout worker runs continuously, we need to stop it after sufficient iterations
        // Each requestAnimationFrame is roughly one "tick" - we'll run for iterations * 16ms
        const runTimeMs = Math.max(500, iterations * 10); // At least 500ms, or 10ms per iteration

        // Start the layout
        layout.start();

        // Stop after the calculated run time
        setTimeout(() => {
          if (layoutRef.current && isRunningRef.current) {
            layout.stop();
            isRunningRef.current = false;
            resolve({ success: true });
          } else {
            resolve({ success: false });
          }
        }, runTimeMs);
      });
    },
    []
  );

  /**
   * Stop the current layout calculation
   */
  const stopLayout = useCallback(() => {
    if (layoutRef.current) {
      layoutRef.current.stop();
      isRunningRef.current = false;
    }
  }, []);

  /**
   * Kill the layout and release resources
   */
  const killLayout = useCallback(() => {
    if (layoutRef.current) {
      layoutRef.current.kill();
      layoutRef.current = null;
      isRunningRef.current = false;
    }
  }, []);

  /**
   * Check if layout is currently running
   */
  const isRunning = useCallback(() => {
    return isRunningRef.current && layoutRef.current?.isRunning();
  }, []);

  return {
    runLayout,
    stopLayout,
    killLayout,
    isRunning
  };
}

/**
 * Check if ForceAtlas2 worker is supported
 */
export function supportsFA2Worker(): boolean {
  return typeof Worker !== 'undefined';
}
