/**
 * GraphSceneV2 - High-performance graph scene using Phase 2 optimizations
 *
 * This component integrates with the optimization systems provided by PerformanceContext
 * to render graphs using GPU instancing, shared memory, and adaptive performance.
 */

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { usePerformanceContext } from '../contexts/PerformanceContext';
import { useStore } from '../store';
import { Node } from './Node';
import { Edge } from './Edge';
import { Cluster } from './Cluster';
import { ForceParams } from '../workers';
import { AdvancedInstancedRenderer } from '../rendering';

export interface GraphSceneV2Props {
  /**
   * Whether to use standard rendering as fallback
   */
  useFallback?: boolean;

  /**
   * Force calculation parameters
   */
  forceParams?: Partial<ForceParams>;

  /**
   * Node component to render (for fallback mode)
   */
  nodeComponent?: React.ComponentType<any>;

  /**
   * Edge component to render (for fallback mode)
   */
  edgeComponent?: React.ComponentType<any>;

  /**
   * Additional children to render
   */
  children?: React.ReactNode;
}

export const GraphSceneV2: React.FC<GraphSceneV2Props> = ({
  useFallback = false,
  forceParams = {},
  nodeComponent: NodeComponent = Node,
  edgeComponent: EdgeComponent = Edge,
  children
}) => {
  const { camera, scene } = useThree();
  const {
    memoryManager,
    instancedRenderer: contextInstancedRenderer,
    computePipeline,
    performanceMonitor,
    isInitialized,
    profile
  } = usePerformanceContext();

  const nodes = useStore(state => state.nodes);
  const edges = useStore(state => state.edges);
  const clusters = useStore(state => state.clusters);

  const nodeIndexMapRef = useRef<Map<string, number>>(new Map());
  const [localInstancedRenderer, setLocalInstancedRenderer] =
    useState<AdvancedInstancedRenderer | null>(null);

  // Use either context renderer or create local one
  const instancedRenderer = contextInstancedRenderer || localInstancedRenderer;

  // Initialize instanced renderer if needed
  useEffect(() => {
    if (
      !contextInstancedRenderer &&
      memoryManager &&
      profile?.rendering?.enableInstancing &&
      scene
    ) {
      console.log(
        '[GraphSceneV2] Creating local AdvancedInstancedRenderer...',
        {
          scene,
          memoryManager,
          renderConfig: profile.rendering
        }
      );
      const renderer = new AdvancedInstancedRenderer(
        scene,
        memoryManager,
        profile.rendering
      );
      setLocalInstancedRenderer(renderer);
      console.log(
        '[GraphSceneV2] AdvancedInstancedRenderer created successfully'
      );

      return () => {
        renderer.dispose();
      };
    }
  }, [contextInstancedRenderer, memoryManager, profile, scene]);

  // Default force parameters
  const defaultForceParams: ForceParams = {
    attraction: 0.1,
    repulsion: 1000,
    damping: 0.1,
    centeringForce: 0.02,
    timeStep: 0.016,
    maxDistance: 2000,
    minDistance: 1,
    ...forceParams
  };

  // Register nodes and edges with memory manager
  const updateGraphData = useCallback(() => {
    if (!memoryManager || !isInitialized) return;

    console.log('[GraphSceneV2] Updating graph data:', {
      nodes: nodes.length,
      edges: edges.length,
      memoryManager: !!memoryManager,
      isInitialized
    });

    // Clear previous data
    memoryManager.clear();
    nodeIndexMapRef.current.clear();

    // Register nodes
    nodes.forEach(node => {
      const index = memoryManager.registerNode(node);
      nodeIndexMapRef.current.set(node.id, index);
    });

    // Register edges
    edges.forEach(edge => {
      const sourceIndex = nodeIndexMapRef.current.get(edge.source);
      const targetIndex = nodeIndexMapRef.current.get(edge.target);
      if (sourceIndex !== undefined && targetIndex !== undefined) {
        memoryManager.registerEdge(edge, sourceIndex, targetIndex);
      }
    });

    const stats = memoryManager.getMemoryStats();
    console.log('[GraphSceneV2] Memory stats after registration:', {
      nodes: stats.nodes,
      edges: stats.edges,
      totalMemoryBytes: stats.totalMemoryBytes
    });
  }, [memoryManager, nodes, edges, isInitialized]);

  useEffect(() => {
    updateGraphData();
  }, [updateGraphData]);

  // Debug: Log renderer state periodically
  useEffect(() => {
    if (!instancedRenderer) return;

    const interval = setInterval(() => {
      const stats = instancedRenderer.getRenderingStats();
      console.log('[GraphSceneV2] Renderer stats:', {
        nodeStats: stats.nodeStats,
        frameStats: stats.frameStats,
        memoryStats: stats.memoryStats
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [instancedRenderer]);

  // Track if we've logged initial state
  const hasLoggedRef = useRef(false);

  // Animation loop for optimized rendering
  useFrame(() => {
    if (!memoryManager || !instancedRenderer || !isInitialized) {
      if (!hasLoggedRef.current) {
        console.log('[GraphSceneV2] Waiting for initialization:', {
          hasMemoryManager: !!memoryManager,
          hasInstancedRenderer: !!instancedRenderer,
          isInitialized
        });
        hasLoggedRef.current = true;
      }
      return;
    }

    // Start performance monitoring
    performanceMonitor?.startFrame();

    try {
      // GPU compute step for physics
      if (computePipeline && profile.compute.enableGPUCompute) {
        computePipeline.computeStep(
          memoryManager.nodeBuffer,
          defaultForceParams
        );
      }

      // Update instanced rendering
      instancedRenderer.render(camera);

      // Collect performance metrics
      const stats = instancedRenderer.getRenderingStats();
      const metrics = {
        nodeCount: nodes.length,
        edgeCount: edges.length,
        visibleNodes: stats.nodeStats.totalInstances,
        visibleEdges: stats.edgeStats.totalEdges,
        drawCalls: stats.frameStats.averageDrawCalls,
        instancesRendered: stats.nodeStats.totalInstances,
        memoryUsage: memoryManager.getMemoryStats().totalMemoryBytes,
        gpuComputeTime: (() => {
          if (!computePipeline) return 0;
          const stats = computePipeline.getStats();
          return (
            stats.gpuStats?.computeTime || stats.cpuStats?.computeTime || 0
          );
        })()
      };

      performanceMonitor?.endFrame(metrics);
    } catch (error) {
      console.error('[GraphSceneV2] Render loop error:', error);
    }
  });

  // Fallback rendering using standard components
  if (useFallback || !isInitialized || !instancedRenderer) {
    console.log('[GraphSceneV2] Using fallback rendering', {
      useFallback,
      isInitialized,
      hasInstancedRenderer: !!instancedRenderer,
      nodeCount: nodes.length,
      edgeCount: edges.length
    });

    return (
      <>
        {/* Render clusters */}
        {Array.from(clusters.values()).map(cluster => (
          <Cluster key={cluster.label} {...cluster} />
        ))}

        {/* Render edges */}
        {edges.map(edge => (
          <EdgeComponent
            key={edge.id}
            id={edge.id}
            animated={false}
            interpolation="linear"
          />
        ))}

        {/* Render nodes */}
        {nodes.map(node => (
          <NodeComponent key={node.id} id={node.id} animated={false} />
        ))}

        {children}
      </>
    );
  }

  // When using instanced rendering, the instancedRenderer handles all visuals
  // We only render additional children here
  return <>{children}</>;
};

export default GraphSceneV2;
