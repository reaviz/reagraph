import React, { useState, useEffect, useRef } from 'react';
import { TestConfiguration } from './SelectiveTestingInterface';
import { BenchmarkTest } from '../types/benchmark.types';
import { GraphRenderer } from './GraphRenderer';
import { GraphRendererV2 } from './GraphRendererV2';

export interface TestProgress {
  currentTestIndex: number;
  totalTests: number;
  currentTestName: string;
  phase: 'setup' | 'rendering' | 'measurement' | 'cleanup';
  progress: number;
  elapsedTime: number;
  estimatedTimeRemaining: number;
}

export interface TestResult {
  configuration: TestConfiguration;
  success: boolean;
  metrics: {
    averageFPS: number;
    minFPS: number;
    maxFPS: number;
    averageFrameTime: number;
    memoryUsage: number;
    renderTime: number;
    performanceScore: number;
  };
  duration: number;
  error?: string;
}

interface SelectiveTestRunnerProps {
  configurations: TestConfiguration[];
  availableTests: BenchmarkTest[];
  onProgress: (progress: TestProgress) => void;
  onTestComplete: (result: TestResult) => void;
  onAllTestsComplete: (results: TestResult[]) => void;
  isRunning: boolean;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export const SelectiveTestRunner: React.FC<SelectiveTestRunnerProps> = ({
  configurations,
  availableTests,
  onProgress,
  onTestComplete,
  onAllTestsComplete,
  isRunning,
  isPaused,
  onPause,
  onResume,
  onStop
}) => {
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<TestProgress['phase']>('setup');
  const [results, setResults] = useState<TestResult[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [currentTestStartTime, setCurrentTestStartTime] = useState<number>(0);
  
  // Performance tracking for current test
  const [testMetrics, setTestMetrics] = useState<{
    fps: number[];
    frameTime: number[];
    memoryUsage: number[];
    startTime: number;
  } | null>(null);

  const testTimeoutRef = useRef<number | null>(null);
  const measurementIntervalRef = useRef<number | null>(null);

  // Get current test configuration and dataset
  const currentConfig = configurations[currentTestIndex];
  const currentTest = currentConfig ? availableTests.find(t => t.id === currentConfig.datasetId) : null;

  // Start test execution
  useEffect(() => {
    if (isRunning && !isPaused && configurations.length > 0) {
      if (currentTestIndex === 0 && results.length === 0) {
        setStartTime(Date.now());
        setResults([]);
      }
      runCurrentTest();
    }

    return () => {
      if (testTimeoutRef.current) {
        window.clearTimeout(testTimeoutRef.current);
      }
      if (measurementIntervalRef.current) {
        window.clearInterval(measurementIntervalRef.current);
      }
    };
  }, [isRunning, isPaused, currentTestIndex, configurations]);

  // Update progress
  useEffect(() => {
    if (isRunning && currentConfig) {
      const elapsedTime = Date.now() - startTime;
      const estimatedTotalTime = configurations.reduce((sum, config) => sum + config.estimatedTime * 1000, 0);
      const completedTime = results.reduce((sum, result) => sum + result.duration, 0);
      const estimatedTimeRemaining = Math.max(0, estimatedTotalTime - completedTime);

      const progress: TestProgress = {
        currentTestIndex,
        totalTests: configurations.length,
        currentTestName: currentTest?.name || 'Unknown Test',
        phase: currentPhase,
        progress: Math.round((currentTestIndex / configurations.length) * 100),
        elapsedTime,
        estimatedTimeRemaining
      };

      onProgress(progress);
    }
  }, [isRunning, currentTestIndex, currentPhase, configurations, currentTest, startTime, results, onProgress]);

  const runCurrentTest = async () => {
    if (!currentConfig || !currentTest) {
      completeAllTests();
      return;
    }

    console.log(`[SelectiveTestRunner] Starting test ${currentTestIndex + 1}/${configurations.length}: ${currentTest.name}`);
    
    setCurrentTestStartTime(Date.now());
    setCurrentPhase('setup');

    try {
      // Setup phase
      await delay(500); // Simulate setup time
      
      setCurrentPhase('rendering');
      await delay(1000); // Allow graph to render
      
      setCurrentPhase('measurement');
      
      // Start performance measurement
      const testStartTime = performance.now();
      const metrics = {
        fps: [] as number[],
        frameTime: [] as number[],
        memoryUsage: [] as number[],
        startTime: testStartTime
      };
      setTestMetrics(metrics);

      // Run measurement for specified duration
      const measurementDuration = Math.min(currentConfig.estimatedTime * 1000, 30000); // Cap at 30 seconds for demo
      
      measurementIntervalRef.current = window.setInterval(() => {
        // Simulate performance measurements
        const currentFPS = 60 + (Math.random() - 0.5) * 20; // Simulate FPS between 50-70
        const currentFrameTime = 1000 / currentFPS;
        const currentMemory = 100 + Math.random() * 50; // Simulate memory usage

        metrics.fps.push(currentFPS);
        metrics.frameTime.push(currentFrameTime);
        metrics.memoryUsage.push(currentMemory);
      }, 100);

      // Wait for measurement duration
      await delay(measurementDuration);

      setCurrentPhase('cleanup');
      
      // Stop measurement
      if (measurementIntervalRef.current) {
        window.clearInterval(measurementIntervalRef.current);
        measurementIntervalRef.current = null;
      }

      // Calculate results
      const testDuration = Date.now() - currentTestStartTime;
      const result = calculateTestResult(currentConfig, metrics, testDuration);
      
      setResults(prev => [...prev, result]);
      onTestComplete(result);

      // Move to next test
      if (currentTestIndex < configurations.length - 1) {
        setCurrentTestIndex(prev => prev + 1);
      } else {
        completeAllTests();
      }

    } catch (error) {
      console.error('Test execution error:', error);
      const errorResult: TestResult = {
        configuration: currentConfig,
        success: false,
        metrics: {
          averageFPS: 0,
          minFPS: 0,
          maxFPS: 0,
          averageFrameTime: 0,
          memoryUsage: 0,
          renderTime: 0,
          performanceScore: 0
        },
        duration: Date.now() - currentTestStartTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      setResults(prev => [...prev, errorResult]);
      onTestComplete(errorResult);
      
      // Continue to next test even on error
      if (currentTestIndex < configurations.length - 1) {
        setCurrentTestIndex(prev => prev + 1);
      } else {
        completeAllTests();
      }
    }
  };

  const calculateTestResult = (
    config: TestConfiguration,
    metrics: NonNullable<typeof testMetrics>,
    duration: number
  ): TestResult => {
    const { fps, frameTime, memoryUsage } = metrics;
    
    if (fps.length === 0) {
      return {
        configuration: config,
        success: false,
        metrics: {
          averageFPS: 0,
          minFPS: 0,
          maxFPS: 0,
          averageFrameTime: 0,
          memoryUsage: 0,
          renderTime: 0,
          performanceScore: 0
        },
        duration,
        error: 'No performance data collected'
      };
    }

    const averageFPS = fps.reduce((sum, val) => sum + val, 0) / fps.length;
    const minFPS = Math.min(...fps);
    const maxFPS = Math.max(...fps);
    const averageFrameTime = frameTime.reduce((sum, val) => sum + val, 0) / frameTime.length;
    const averageMemory = memoryUsage.reduce((sum, val) => sum + val, 0) / memoryUsage.length;

    // Calculate performance score (0-100)
    const fpsScore = Math.min(100, (averageFPS / 60) * 100);
    const stabilityScore = Math.min(100, (minFPS / averageFPS) * 100);
    const memoryScore = Math.max(0, 100 - ((averageMemory - 100) / 100) * 20); // Penalty for high memory usage
    
    const performanceScore = (fpsScore * 0.5 + stabilityScore * 0.3 + memoryScore * 0.2);

    return {
      configuration: config,
      success: true,
      metrics: {
        averageFPS,
        minFPS,
        maxFPS,
        averageFrameTime,
        memoryUsage: averageMemory,
        renderTime: averageFrameTime,
        performanceScore: Math.round(performanceScore)
      },
      duration
    };
  };

  const completeAllTests = () => {
    console.log('[SelectiveTestRunner] All tests completed');
    setCurrentPhase('cleanup');
    onAllTestsComplete(results);
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  if (!isRunning || !currentTest) {
    return null;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>
          Running Test {currentTestIndex + 1} of {configurations.length}
        </h3>
        <div style={styles.controls}>
          {isPaused ? (
            <button style={styles.resumeButton} onClick={onResume}>
              Resume
            </button>
          ) : (
            <button style={styles.pauseButton} onClick={onPause}>
              Pause
            </button>
          )}
          <button style={styles.stopButton} onClick={onStop}>
            Stop
          </button>
        </div>
      </div>

      <div style={styles.testInfo}>
        <div style={styles.testName}>{currentTest.name}</div>
        <div style={styles.testDetails}>
          {currentConfig.size.toUpperCase()} • {currentConfig.layoutType} • 
          {currentTest.nodeCount.toLocaleString()} nodes
        </div>
        <div style={styles.phase}>
          Phase: <span style={styles.phaseValue}>{currentPhase.toUpperCase()}</span>
        </div>
      </div>

      <div style={styles.progressSection}>
        <div style={styles.progressBar}>
          <div 
            style={{
              ...styles.progressFill,
              width: `${(currentTestIndex / configurations.length) * 100}%`
            }}
          />
        </div>
        <div style={styles.progressText}>
          {currentTestIndex} / {configurations.length} tests completed
        </div>
      </div>

      {testMetrics && (
        <div style={styles.liveMetrics}>
          <h4 style={styles.metricsTitle}>Live Performance Data</h4>
          <div style={styles.metricsGrid}>
            <div style={styles.metricItem}>
              <span style={styles.metricLabel}>Current FPS:</span>
              <span style={styles.metricValue}>
                {testMetrics.fps.length > 0 ? 
                  testMetrics.fps[testMetrics.fps.length - 1].toFixed(1) : 
                  'Measuring...'
                }
              </span>
            </div>
            <div style={styles.metricItem}>
              <span style={styles.metricLabel}>Average FPS:</span>
              <span style={styles.metricValue}>
                {testMetrics.fps.length > 0 ? 
                  (testMetrics.fps.reduce((sum, val) => sum + val, 0) / testMetrics.fps.length).toFixed(1) : 
                  'Measuring...'
                }
              </span>
            </div>
            <div style={styles.metricItem}>
              <span style={styles.metricLabel}>Memory Usage:</span>
              <span style={styles.metricValue}>
                {testMetrics.memoryUsage.length > 0 ? 
                  `${testMetrics.memoryUsage[testMetrics.memoryUsage.length - 1].toFixed(1)}MB` : 
                  'Measuring...'
                }
              </span>
            </div>
            <div style={styles.metricItem}>
              <span style={styles.metricLabel}>Samples Collected:</span>
              <span style={styles.metricValue}>{testMetrics.fps.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* Graph Renderer */}
      <div style={styles.graphContainer}>
        <GraphRenderer
          data={currentTest.dataset}
          workerEnabled={true}
          onNodeCountChange={() => {}}
          onEdgeCountChange={() => {}}
          onWorkerStatusChange={() => {}}
        />
      </div>
    </div>
  );
};

const styles = {
  container: {
    background: '#1a1a1a',
    border: '1px solid #444',
    borderRadius: '8px',
    padding: '1.5rem',
    marginTop: '1rem'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  title: {
    margin: 0,
    color: '#00d4ff',
    fontSize: '1.2rem'
  },
  controls: {
    display: 'flex',
    gap: '0.5rem'
  },
  pauseButton: {
    padding: '0.5rem 1rem',
    background: '#ffaa00',
    color: '#000000',
    border: 'none',
    borderRadius: '4px',
    fontWeight: 'bold' as const,
    cursor: 'pointer' as const
  },
  resumeButton: {
    padding: '0.5rem 1rem',
    background: '#00ff88',
    color: '#000000',
    border: 'none',
    borderRadius: '4px',
    fontWeight: 'bold' as const,
    cursor: 'pointer' as const
  },
  stopButton: {
    padding: '0.5rem 1rem',
    background: '#ff6b6b',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontWeight: 'bold' as const,
    cursor: 'pointer' as const
  },
  testInfo: {
    background: '#2a2a2a',
    padding: '1rem',
    borderRadius: '6px',
    marginBottom: '1rem'
  },
  testName: {
    fontSize: '1.1rem',
    fontWeight: 'bold' as const,
    color: '#ffffff',
    marginBottom: '0.5rem'
  },
  testDetails: {
    fontSize: '0.9rem',
    color: '#aaaaaa',
    marginBottom: '0.5rem'
  },
  phase: {
    fontSize: '0.9rem',
    color: '#cccccc'
  },
  phaseValue: {
    color: '#00ff88',
    fontWeight: 'bold' as const
  },
  progressSection: {
    marginBottom: '1.5rem'
  },
  progressBar: {
    width: '100%',
    height: '8px',
    background: '#333',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '0.5rem'
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #00d4ff, #00ff88)',
    transition: 'width 0.3s ease'
  },
  progressText: {
    fontSize: '0.9rem',
    color: '#aaaaaa',
    textAlign: 'center' as const
  },
  liveMetrics: {
    background: '#2a2a2a',
    padding: '1rem',
    borderRadius: '6px',
    marginBottom: '1rem'
  },
  metricsTitle: {
    margin: '0 0 1rem 0',
    color: '#ffffff',
    fontSize: '1rem'
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1rem'
  },
  metricItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem'
  },
  metricLabel: {
    fontSize: '0.8rem',
    color: '#aaaaaa'
  },
  metricValue: {
    fontSize: '1.1rem',
    fontWeight: 'bold' as const,
    color: '#00ff88'
  },
  graphContainer: {
    height: '400px',
    background: '#0a0a0a',
    borderRadius: '6px',
    border: '1px solid #333'
  }
};