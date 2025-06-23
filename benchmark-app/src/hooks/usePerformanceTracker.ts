import { useState, useEffect, useRef, useCallback } from 'react';
import { PerformanceMetrics } from '../types/benchmark.types';
import { PerformanceTrackerImpl } from '../utils/performanceUtils';
import { MemoryPoolStats } from '../components/PerformanceMonitor';

interface PerformanceValidation {
  avgFps: number;
  minFps: number;
  targetMet: boolean;
  stable60fps: boolean;
  nodeCount: number;
  workerEnabled: boolean;
  sampleCount: number;
}

interface UsePerformanceTrackerReturn {
  metrics: PerformanceMetrics | null;
  averageMetrics: PerformanceMetrics | null;
  memoryPools: MemoryPoolStats[] | null;
  totalMemoryUsage: number | null;
  isTracking: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
  updateNodeCount: (count: number) => void;
  updateEdgeCount: (count: number) => void;
  updateWorkerStatus: (status: PerformanceMetrics['workerStatus']) => void;
  updateMemoryPools: (pools: MemoryPoolStats[]) => void;
  getMetricsHistory: () => PerformanceMetrics[];
  getPerformanceValidation: () => PerformanceValidation | null;
}

export function usePerformanceTracker(): UsePerformanceTrackerReturn {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [averageMetrics, setAverageMetrics] = useState<PerformanceMetrics | null>(null);
  const [memoryPools, setMemoryPools] = useState<MemoryPoolStats[] | null>(null);
  const [totalMemoryUsage, setTotalMemoryUsage] = useState<number | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  
  const trackerRef = useRef<PerformanceTrackerImpl | null>(null);
  const nodeCountRef = useRef(0);
  const edgeCountRef = useRef(0);
  const workerStatusRef = useRef<PerformanceMetrics['workerStatus']>('disabled');

  const updateMemoryPools = useCallback((pools: MemoryPoolStats[]) => {
    setMemoryPools(pools);
    
    // Calculate total memory usage from all pools
    const totalMemory = pools.reduce((sum, pool) => {
      // Estimate memory usage: assume each object is ~1KB for calculation
      const estimatedPoolMemory = pool.total * 1024; // 1KB per object
      return sum + estimatedPoolMemory;
    }, 0);
    
    setTotalMemoryUsage(totalMemory);
  }, []);

  // Function to collect memory pool statistics from global pools
  const collectPoolStats = useCallback(() => {
    try {
      // Try to access global ReaGraph pools
      const globalPools: any[] = [];
      
      // Check for global octree pool
      if ((globalThis as any).__REAGRAPH_OCTREE_POOL__) {
        const octreePool = (globalThis as any).__REAGRAPH_OCTREE_POOL__;
        if (octreePool.getStats) {
          const stats = octreePool.getStats();
          
          // Convert octree pool stats to our interface
          if (stats.nodes) {
            globalPools.push({
              name: 'Octree Nodes',
              available: stats.nodes.available,
              inUse: stats.nodes.inUse,
              total: stats.nodes.total,
              hitRate: stats.nodes.hitRate,
              totalCreated: stats.nodes.totalCreated,
              peakUsage: stats.nodes.peakUsage
            });
          }
          
          if (stats.childArrays) {
            globalPools.push({
              name: 'Octree Child Arrays',
              available: stats.childArrays.available,
              inUse: stats.childArrays.inUse,
              total: stats.childArrays.total,
              hitRate: stats.childArrays.hitRate,
              totalCreated: stats.childArrays.totalCreated,
              peakUsage: stats.childArrays.peakUsage
            });
          }
        }
      }
      
      // Check for PoolFactory pools
      if ((globalThis as any).__REAGRAPH_POOL_FACTORY__) {
        const poolFactory = (globalThis as any).__REAGRAPH_POOL_FACTORY__;
        if (poolFactory.getStats) {
          const factoryStats = poolFactory.getStats();
          for (const [name, stats] of Object.entries(factoryStats)) {
            globalPools.push({
              name: name,
              available: (stats as any).available,
              inUse: (stats as any).inUse,
              total: (stats as any).total,
              hitRate: (stats as any).hitRate,
              totalCreated: (stats as any).totalCreated,
              peakUsage: (stats as any).peakUsage
            });
          }
        }
      }
      
      if (globalPools.length > 0) {
        updateMemoryPools(globalPools);
      }
    } catch (error) {
      // Silently handle errors - pools might not be available
      console.debug('[PerformanceTracker] Pool stats collection failed:', error);
    }
  }, [updateMemoryPools]);

  // Initialize tracker
  useEffect(() => {
    const handleMetricsUpdate = (newMetrics: PerformanceMetrics) => {
      // Update with current node/edge counts and worker status
      const updatedMetrics = {
        ...newMetrics,
        nodeCount: nodeCountRef.current,
        edgeCount: edgeCountRef.current,
        workerStatus: workerStatusRef.current
      };
      
      setMetrics(updatedMetrics);
    };

    trackerRef.current = new PerformanceTrackerImpl(handleMetricsUpdate);

    return () => {
      if (trackerRef.current) {
        trackerRef.current.stop();
      }
    };
  }, []);

  // Update average metrics periodically
  useEffect(() => {
    if (!isTracking || !trackerRef.current) return;

    const interval = setInterval(() => {
      const avgMetrics = trackerRef.current?.getAverageMetrics(60); // 1 second average at 60fps
      if (avgMetrics) {
        setAverageMetrics({
          ...avgMetrics,
          nodeCount: nodeCountRef.current,
          edgeCount: edgeCountRef.current,
          workerStatus: workerStatusRef.current
        });
      }
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [isTracking]);

  // Collect memory pool stats periodically
  useEffect(() => {
    if (!isTracking) return;

    const interval = setInterval(() => {
      collectPoolStats();
    }, 2000); // Update pool stats every 2 seconds

    return () => clearInterval(interval);
  }, [isTracking, collectPoolStats]);

  const start = useCallback(() => {
    if (trackerRef.current && !isTracking) {
      trackerRef.current.start();
      setIsTracking(true);
    }
  }, [isTracking]);

  const stop = useCallback(() => {
    if (trackerRef.current && isTracking) {
      trackerRef.current.stop();
      setIsTracking(false);
    }
  }, [isTracking]);

  const reset = useCallback(() => {
    if (trackerRef.current) {
      trackerRef.current.reset();
      setMetrics(null);
      setAverageMetrics(null);
      setMemoryPools(null);
      setTotalMemoryUsage(null);
    }
  }, []);

  const updateNodeCount = useCallback((count: number) => {
    nodeCountRef.current = count;
  }, []);

  const updateEdgeCount = useCallback((count: number) => {
    edgeCountRef.current = count;
  }, []);

  const updateWorkerStatus = useCallback((status: PerformanceMetrics['workerStatus']) => {
    workerStatusRef.current = status;
  }, []);

  const getMetricsHistory = useCallback(() => {
    return trackerRef.current?.getMetricsHistory() || [];
  }, []);

  const getPerformanceValidation = useCallback(() => {
    const history = getMetricsHistory();
    if (history.length < 30) return null; // Need at least 30 samples for validation
    
    const recentMetrics = history.slice(-60); // Last 60 samples (roughly 1-2 seconds)
    const avgFps = recentMetrics.reduce((sum, m) => sum + m.fps, 0) / recentMetrics.length;
    const minFps = Math.min(...recentMetrics.map(m => m.fps));
    const fpsStability = recentMetrics.filter(m => m.fps >= 55).length / recentMetrics.length;
    
    return {
      avgFps,
      minFps,
      targetMet: avgFps >= 60,
      stable60fps: fpsStability >= 0.9, // 90% of frames above 55fps
      nodeCount: nodeCountRef.current,
      workerEnabled: workerStatusRef.current === 'enabled',
      sampleCount: recentMetrics.length
    };
  }, [getMetricsHistory]);

  return {
    metrics,
    averageMetrics,
    memoryPools,
    totalMemoryUsage,
    isTracking,
    start,
    stop,
    reset,
    updateNodeCount,
    updateEdgeCount,
    updateWorkerStatus,
    updateMemoryPools,
    getMetricsHistory,
    getPerformanceValidation
  };
}

// Hook for benchmark test execution
export function useBenchmarkRunner() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);

  const runBenchmark = useCallback(async (
    testId: string,
    workerEnabled: boolean,
    duration: number = 30000 // 30 seconds default
  ) => {
    setIsRunning(true);
    setCurrentTest(testId);

    // Implementation will be completed when we integrate with ReaGraph
    // For now, return a placeholder result
    
    setTimeout(() => {
      const result = {
        testId,
        workerEnabled,
        duration,
        avgFps: 45 + Math.random() * 15,
        timestamp: Date.now(),
        success: true
      };
      
      setResults(prev => [...prev, result]);
      setIsRunning(false);
      setCurrentTest(null);
    }, duration);
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  return {
    isRunning,
    currentTest,
    results,
    runBenchmark,
    clearResults
  };
}