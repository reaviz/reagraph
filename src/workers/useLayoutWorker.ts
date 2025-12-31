/**
 * Hook for using the layout web worker.
 * Manages worker lifecycle and provides async layout calculation.
 */

import { useCallback, useEffect, useRef } from 'react';

import type { ClusterGroup } from '../utils/cluster';
import type { DragReferences } from '../store';
import type { LayoutTypes } from '../layout';
import type { DagMode } from '../layout/forceUtils';
import type { GraphEdge, GraphNode, InternalVector3 } from '../types';

// Import worker as inline (bundled as base64, creates blob URL)
// This ensures the worker works correctly when consumed as an npm package
import LayoutWorkerInline from './layout.worker.ts?worker&inline';

export interface WorkerLayoutOptions {
  layoutType: LayoutTypes;
  clusterAttribute?: string;
  drags?: DragReferences;
  clusters?: Map<string, ClusterGroup>;
  // Layout-specific options
  nodeStrength?: number;
  linkDistance?: number;
  clusterStrength?: number;
  clusterType?: 'force' | 'treemap';
  mode?: DagMode;
  nodeLevelRatio?: number;
  linkStrengthInterCluster?: number;
  linkStrengthIntraCluster?: number;
  forceLinkDistance?: number;
  forceLinkStrength?: number;
  forceCharge?: number;
}

export interface WorkerLayoutResult {
  positions: Map<string, InternalVector3>;
}

type LayoutWorkerCallback = (result: WorkerLayoutResult) => void;

interface PendingRequest {
  resolve: (result: WorkerLayoutResult) => void;
  reject: (error: Error) => void;
}

/**
 * Hook that provides access to the layout web worker
 */
export function useLayoutWorker() {
  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef(0);
  const pendingRequestsRef = useRef<Map<number, PendingRequest>>(new Map());
  const isTerminatedRef = useRef(false);

  // Initialize worker on mount
  useEffect(() => {
    // Create worker using Vite's inline worker import
    // The worker code is bundled as a blob URL, ensuring it works
    // when consumed as an npm package without path resolution issues
    const worker = new LayoutWorkerInline();

    worker.onmessage = (event) => {
      const message = event.data;

      switch (message.type) {
        case 'LAYOUT_COMPLETE': {
          const pending = pendingRequestsRef.current.get(message.id);
          if (pending) {
            // Convert positions array back to Map
            const positions = new Map<string, InternalVector3>(
              message.positions.map(([id, pos]: [string, any]) => [
                id,
                { x: pos.x, y: pos.y, z: pos.z || 0 }
              ])
            );
            pending.resolve({ positions });
            pendingRequestsRef.current.delete(message.id);
          }
          break;
        }

        case 'LAYOUT_ERROR': {
          const pending = pendingRequestsRef.current.get(message.id);
          if (pending) {
            pending.reject(new Error(message.error));
            pendingRequestsRef.current.delete(message.id);
          }
          break;
        }

        case 'LAYOUT_CANCELLED': {
          const pending = pendingRequestsRef.current.get(message.id);
          if (pending) {
            pending.reject(new Error('Layout calculation cancelled'));
            pendingRequestsRef.current.delete(message.id);
          }
          break;
        }
      }
    };

    worker.onerror = (error) => {
      console.error('Layout worker error:', error);
      // Reject all pending requests
      pendingRequestsRef.current.forEach((pending) => {
        pending.reject(new Error('Worker error: ' + error.message));
      });
      pendingRequestsRef.current.clear();
    };

    workerRef.current = worker;
    isTerminatedRef.current = false;

    return () => {
      isTerminatedRef.current = true;
      worker.terminate();
      workerRef.current = null;
      // Reject any pending requests
      pendingRequestsRef.current.forEach((pending) => {
        pending.reject(new Error('Worker terminated'));
      });
      pendingRequestsRef.current.clear();
    };
  }, []);

  /**
   * Calculate layout using the worker
   */
  const calculateLayout = useCallback(
    async (
      nodes: GraphNode[],
      edges: GraphEdge[],
      options: WorkerLayoutOptions
    ): Promise<WorkerLayoutResult> => {
      if (!workerRef.current || isTerminatedRef.current) {
        throw new Error('Layout worker not available');
      }

      const requestId = ++requestIdRef.current;

      // Prepare nodes for worker (extract only serializable data)
      const workerNodes = nodes.map((node) => ({
        id: node.id,
        data: node.data,
        radius: (node as any).size || 5,
        // Include drag position if available
        dragPosition: options.drags?.[node.id]?.position
          ? {
              x: options.drags[node.id].position.x,
              y: options.drags[node.id].position.y,
              z: options.drags[node.id].position.z || 0
            }
          : undefined
      }));

      // Prepare edges for worker
      const workerEdges = edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target
      }));

      // Serialize cluster positions
      const clusterPositions: Record<string, { x: number; y: number; z?: number }> = {};
      if (options.clusters) {
        options.clusters.forEach((cluster, key) => {
          if (cluster.position) {
            clusterPositions[key] = {
              x: cluster.position.x,
              y: cluster.position.y,
              z: cluster.position.z
            };
          }
        });
      }

      // Create promise for this request
      const promise = new Promise<WorkerLayoutResult>((resolve, reject) => {
        pendingRequestsRef.current.set(requestId, { resolve, reject });
      });

      // Send message to worker
      workerRef.current.postMessage({
        type: 'CALCULATE_LAYOUT',
        id: requestId,
        layoutType: options.layoutType,
        nodes: workerNodes,
        edges: workerEdges,
        options: {
          dimensions: options.layoutType?.includes('3d') ? 3 : 2,
          nodeStrength: options.nodeStrength,
          linkDistance: options.linkDistance,
          clusterStrength: options.clusterStrength,
          clusterAttribute: options.clusterAttribute,
          clusterType: options.clusterType,
          mode: options.mode,
          nodeLevelRatio: options.nodeLevelRatio,
          linkStrengthInterCluster: options.linkStrengthInterCluster,
          linkStrengthIntraCluster: options.linkStrengthIntraCluster,
          forceLinkDistance: options.forceLinkDistance,
          forceLinkStrength: options.forceLinkStrength,
          forceCharge: options.forceCharge,
          forceLayout: options.layoutType,
          clusterPositions
        }
      });

      return promise;
    },
    []
  );

  /**
   * Cancel any pending layout calculation
   */
  const cancelLayout = useCallback(() => {
    if (workerRef.current && requestIdRef.current > 0) {
      workerRef.current.postMessage({
        type: 'CANCEL',
        id: requestIdRef.current
      });
    }
  }, []);

  /**
   * Check if the worker is available
   */
  const isWorkerAvailable = useCallback(() => {
    return workerRef.current !== null && !isTerminatedRef.current;
  }, []);

  return {
    calculateLayout,
    cancelLayout,
    isWorkerAvailable
  };
}

/**
 * Check if web workers are supported in the current environment
 */
export function supportsWebWorkers(): boolean {
  return typeof Worker !== 'undefined';
}
