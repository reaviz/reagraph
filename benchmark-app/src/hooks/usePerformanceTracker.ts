import { useState, useEffect, useRef, useCallback } from 'react';
import { PerformanceMetrics } from '@/types/benchmark.types';
import { PerformanceTrackerImpl } from '@/utils/performanceUtils';

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
  isTracking: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
  updateNodeCount: (count: number) => void;
  updateEdgeCount: (count: number) => void;
  updateWorkerStatus: (status: PerformanceMetrics['workerStatus']) => void;
  getMetricsHistory: () => PerformanceMetrics[];
  getPerformanceValidation: () => PerformanceValidation | null;
}

export function usePerformanceTracker(): UsePerformanceTrackerReturn {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [averageMetrics, setAverageMetrics] = useState<PerformanceMetrics | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  
  const trackerRef = useRef<PerformanceTrackerImpl | null>(null);
  const nodeCountRef = useRef(0);
  const edgeCountRef = useRef(0);
  const workerStatusRef = useRef<PerformanceMetrics['workerStatus']>('disabled');

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
    isTracking,
    start,
    stop,
    reset,
    updateNodeCount,
    updateEdgeCount,
    updateWorkerStatus,
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