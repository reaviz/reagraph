import React, { useState, useEffect } from 'react';
import { PerformanceMonitor } from './PerformanceMonitor';
import { GraphRenderer } from './GraphRenderer';
import { usePerformanceTracker } from '@/hooks/usePerformanceTracker';
import { createBenchmarkTests } from '@/utils/datasetGenerators';
import { createStorybookBenchmarkTests } from '@/data/storybookDatasets';
import { BenchmarkTest } from '@/types/benchmark.types';
import { getBrowserInfo, detectWorkerSupport } from '@/utils/performanceUtils';

export const BenchmarkDashboard: React.FC = () => {
  const [selectedTest, setSelectedTest] = useState<BenchmarkTest | null>(null);
  const [workerEnabled, setWorkerEnabled] = useState(true);
  const [autoStart, setAutoStart] = useState(false);
  
  // Combine generated tests and Storybook tests
  const [benchmarkTests] = useState(() => {
    const generatedTests = createBenchmarkTests();
    const storybookTests = createStorybookBenchmarkTests();
    return [...storybookTests, ...generatedTests];
  });

  const {
    metrics,
    averageMetrics,
    isTracking,
    start,
    stop,
    reset,
    updateNodeCount,
    updateEdgeCount,
    updateWorkerStatus,
    getPerformanceValidation
  } = usePerformanceTracker();

  // Initialize with first test
  useEffect(() => {
    if (benchmarkTests.length > 0 && !selectedTest) {
      setSelectedTest(benchmarkTests[0]);
    }
  }, [benchmarkTests, selectedTest]);

  // Auto-start tracking when test changes
  useEffect(() => {
    if (selectedTest && autoStart) {
      reset();
      setTimeout(() => start(), 100); // Small delay to ensure graph is rendered
    }
  }, [selectedTest, autoStart, reset, start]);

  // Check worker support
  const workerSupported = detectWorkerSupport();
  const browserInfo = getBrowserInfo();

  const handleTestChange = (testId: string) => {
    const test = benchmarkTests.find(t => t.id === testId);
    if (test) {
      setSelectedTest(test);
      if (isTracking) {
        reset();
        setTimeout(() => start(), 100);
      }
    }
  };

  const handleWorkerToggle = () => {
    setWorkerEnabled(!workerEnabled);
    if (isTracking) {
      reset();
      setTimeout(() => start(), 100);
    }
  };

  const handleTrackingToggle = () => {
    if (isTracking) {
      stop();
    } else {
      reset();
      start();
    }
  };

  // Get performance validation
  const performanceValidation = getPerformanceValidation();

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>ReaGraph Performance Benchmark</h1>
          <p style={styles.subtitle}>
            Real-time performance testing for web worker validation
          </p>
        </div>
        <div style={styles.browserInfo}>
          <div>{browserInfo.name} {browserInfo.version}</div>
          <div style={{fontSize: '0.8rem', color: '#888'}}>
            {browserInfo.platform}
          </div>
        </div>
      </header>

      {/* Controls */}
      <div style={styles.controls}>
        <div style={styles.controlGroup}>
          <label style={styles.label}>Benchmark Test:</label>
          <select 
            style={styles.select}
            value={selectedTest?.id || ''}
            onChange={(e) => handleTestChange(e.target.value)}
          >
            {benchmarkTests.map(test => (
              <option key={test.id} value={test.id}>
                {test.name} ({test.nodeCount.toLocaleString()} nodes)
              </option>
            ))}
          </select>
        </div>

        <div style={styles.controlGroup}>
          <label style={styles.label}>
            <input
              type="checkbox"
              checked={workerEnabled}
              onChange={handleWorkerToggle}
              disabled={!workerSupported}
              style={styles.checkbox}
            />
            Enable Web Workers
            {!workerSupported && (
              <span style={styles.warning}> (Not Supported)</span>
            )}
          </label>
        </div>

        <div style={styles.controlGroup}>
          <label style={styles.label}>
            <input
              type="checkbox"
              checked={autoStart}
              onChange={(e) => setAutoStart(e.target.checked)}
              style={styles.checkbox}
            />
            Auto-start monitoring
          </label>
        </div>

        <div style={styles.controlGroup}>
          <button
            style={isTracking ? styles.stopButton : styles.startButton}
            onClick={handleTrackingToggle}
          >
            {isTracking ? 'Stop Monitoring' : 'Start Monitoring'}
          </button>
          <button
            style={styles.resetButton}
            onClick={reset}
            disabled={isTracking}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Performance Monitor */}
        <div style={styles.monitorPanel}>
          <PerformanceMonitor 
            metrics={metrics}
            averageMetrics={averageMetrics}
          />
          
          {selectedTest && (
            <div style={styles.testInfo}>
              <h3 style={styles.testTitle}>{selectedTest.name}</h3>
              <p style={styles.testDescription}>{selectedTest.description}</p>
              <div style={styles.testStats}>
                <span>Category: {selectedTest.category}</span>
                <span>Nodes: {selectedTest.nodeCount.toLocaleString()}</span>
                <span>Edges: {selectedTest.edgeCount.toLocaleString()}</span>
              </div>
            </div>
          )}
          
          {/* Performance Validation Panel */}
          {performanceValidation && selectedTest && selectedTest.nodeCount >= 5000 && (
            <div style={styles.validationPanel}>
              <h3 style={styles.validationTitle}>
                Performance Target Validation (5K+ Nodes @ 60fps)
              </h3>
              <div style={styles.validationGrid}>
                <div style={styles.validationItem}>
                  <span>Average FPS:</span>
                  <span style={{
                    color: performanceValidation.targetMet ? '#00ff88' : '#ff6b6b',
                    fontWeight: 'bold'
                  }}>
                    {performanceValidation.avgFps.toFixed(1)}
                  </span>
                </div>
                <div style={styles.validationItem}>
                  <span>Minimum FPS:</span>
                  <span style={{color: performanceValidation.minFps >= 55 ? '#00ff88' : '#ffaa00'}}>
                    {performanceValidation.minFps.toFixed(1)}
                  </span>
                </div>
                <div style={styles.validationItem}>
                  <span>60fps Target:</span>
                  <span style={{
                    color: performanceValidation.targetMet ? '#00ff88' : '#ff6b6b',
                    fontWeight: 'bold'
                  }}>
                    {performanceValidation.targetMet ? '✓ ACHIEVED' : '✗ NOT MET'}
                  </span>
                </div>
                <div style={styles.validationItem}>
                  <span>Stable Performance:</span>
                  <span style={{color: performanceValidation.stable60fps ? '#00ff88' : '#ffaa00'}}>
                    {performanceValidation.stable60fps ? '✓ STABLE' : '⚠ UNSTABLE'}
                  </span>
                </div>
                <div style={styles.validationItem}>
                  <span>Workers:</span>
                  <span style={{color: performanceValidation.workerEnabled ? '#00ff88' : '#888'}}>
                    {performanceValidation.workerEnabled ? 'ENABLED' : 'DISABLED'}
                  </span>
                </div>
                <div style={styles.validationItem}>
                  <span>Node Count:</span>
                  <span>{performanceValidation.nodeCount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Graph Visualization */}
        <div style={styles.graphPanel}>
          {selectedTest ? (
            <GraphRenderer
              data={selectedTest.dataset}
              workerEnabled={workerEnabled}
              onNodeCountChange={updateNodeCount}
              onEdgeCountChange={updateEdgeCount}
              onWorkerStatusChange={updateWorkerStatus}
            />
          ) : (
            <div style={styles.placeholder}>
              Select a benchmark test to begin
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div style={styles.statusBar}>
        <div style={styles.statusItem}>
          Status: {isTracking ? 'Monitoring Active' : 'Monitoring Stopped'}
        </div>
        {metrics && (
          <>
            <div style={styles.statusItem}>
              FPS: {metrics.fps.toFixed(1)}
            </div>
            <div style={styles.statusItem}>
              Memory: {(metrics.memoryUsage).toFixed(1)}MB
            </div>
            <div style={styles.statusItem}>
              Worker: {metrics.workerStatus}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100vh',
    background: '#0a0a0a',
    color: '#ffffff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    background: '#1a1a1a',
    borderBottom: '1px solid #333'
  },
  title: {
    margin: 0,
    fontSize: '1.8rem',
    fontWeight: 'bold' as const,
    color: '#00d4ff'
  },
  subtitle: {
    margin: '0.25rem 0 0 0',
    color: '#aaaaaa',
    fontSize: '0.9rem'
  },
  browserInfo: {
    textAlign: 'right' as const,
    fontSize: '0.9rem',
    color: '#aaaaaa'
  },
  controls: {
    display: 'flex',
    gap: '2rem',
    padding: '1rem 2rem',
    background: '#151515',
    borderBottom: '1px solid #333',
    flexWrap: 'wrap' as const,
    alignItems: 'center'
  },
  controlGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem'
  },
  label: {
    fontSize: '0.9rem',
    color: '#cccccc',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  select: {
    padding: '0.5rem',
    background: '#2a2a2a',
    border: '1px solid #444',
    borderRadius: '4px',
    color: '#ffffff',
    fontSize: '0.9rem'
  },
  checkbox: {
    accentColor: '#00d4ff'
  },
  warning: {
    color: '#ff6b6b',
    fontSize: '0.8rem'
  },
  startButton: {
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
  resetButton: {
    padding: '0.5rem 1rem',
    background: '#666666',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer' as const,
    marginLeft: '0.5rem'
  },
  mainContent: {
    display: 'flex',
    flex: 1,
    gap: '1rem',
    padding: '1rem'
  },
  monitorPanel: {
    width: '400px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem'
  },
  graphPanel: {
    flex: 1,
    minHeight: '500px'
  },
  testInfo: {
    background: '#1a1a1a',
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid #333'
  },
  testTitle: {
    margin: '0 0 0.5rem 0',
    color: '#00d4ff',
    fontSize: '1.1rem'
  },
  testDescription: {
    margin: '0 0 1rem 0',
    color: '#aaaaaa',
    fontSize: '0.9rem'
  },
  testStats: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
    fontSize: '0.8rem',
    color: '#888888'
  },
  placeholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '8px',
    color: '#666666',
    fontSize: '1.1rem'
  },
  statusBar: {
    display: 'flex',
    gap: '2rem',
    padding: '0.75rem 2rem',
    background: '#1a1a1a',
    borderTop: '1px solid #333',
    fontSize: '0.8rem',
    color: '#aaaaaa',
    fontFamily: 'monospace'
  },
  statusItem: {
    // No specific styles needed
  },
  validationPanel: {
    background: '#1a1a1a',
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid #333',
    marginTop: '1rem'
  },
  validationTitle: {
    margin: '0 0 1rem 0',
    color: '#00d4ff',
    fontSize: '1rem',
    fontWeight: 'bold' as const
  },
  validationGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.5rem',
    fontSize: '0.9rem'
  },
  validationItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.25rem 0',
    borderBottom: '1px solid #333'
  }
};