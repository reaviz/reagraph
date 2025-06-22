import React, { useState, useEffect } from 'react';
import { PerformanceMonitor } from './PerformanceMonitor';
import { GraphRenderer } from './GraphRenderer';
import { GraphRendererV2 } from './GraphRendererV2';
import { CollapsibleGraphRenderer } from './CollapsibleGraphRenderer';
import { NetworkTopologyRenderer } from './NetworkTopologyRenderer';
import { usePerformanceTracker } from '../hooks/usePerformanceTracker';
import { createBenchmarkTests } from '../utils/datasetGenerators';
import { createStorybookBenchmarkTests } from '../data/storybookDatasets';
import { BenchmarkTest } from '../types/benchmark.types';
import { getBrowserInfo, detectWorkerSupport } from '../utils/performanceUtils';
import { DiagnosticRunner } from '../utils/diagnosticRunner';
import { PerformanceValidationPanel } from './PerformanceValidationPanel';
import { SelectiveTestingInterface, TestConfiguration } from './SelectiveTestingInterface';
import { SelectiveTestRunner, TestResult, TestProgress } from './SelectiveTestRunner';
import { SelectiveTestResults } from './SelectiveTestResults';

export const BenchmarkDashboard: React.FC = () => {
  const [selectedTest, setSelectedTest] = useState<BenchmarkTest | null>(null);
  const [workerEnabled, setWorkerEnabled] = useState(true);
  const [autoStart, setAutoStart] = useState(false);
  const [diagnosticRunning, setDiagnosticRunning] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);
  const [usePhase2, setUsePhase2] = useState(false);
  const [showValidationPanel, setShowValidationPanel] = useState(false);
  
  // Selective testing state
  const [showSelectiveTesting, setShowSelectiveTesting] = useState(false);
  const [selectedConfigurations, setSelectedConfigurations] = useState<TestConfiguration[]>([]);
  const [selectiveTestResults, setSelectiveTestResults] = useState<TestResult[]>([]);
  const [isSelectiveTestRunning, setIsSelectiveTestRunning] = useState(false);
  const [isSelectiveTestPaused, setIsSelectiveTestPaused] = useState(false);
  const [selectiveTestProgress, setSelectiveTestProgress] = useState<TestProgress | null>(null);
  const [phase2Config, setPhase2Config] = useState({
    optimizationLevel: 'BALANCED' as 'HIGH_PERFORMANCE' | 'BALANCED' | 'POWER_SAVING',
    enableGPUAcceleration: 'auto' as boolean | 'auto',
    enableInstancedRendering: 'auto' as boolean | 'auto',
    enableSharedWorkers: 'auto' as boolean | 'auto',
    enableMemoryOptimization: 'auto' as boolean | 'auto'
  });
  
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

  // Selective testing handlers
  const handleSelectiveTestConfigurationChange = (configs: TestConfiguration[]) => {
    setSelectedConfigurations(configs);
  };

  const handleStartSelectiveTests = (configs: TestConfiguration[]) => {
    console.log('[BenchmarkDashboard] Starting selective tests:', configs);
    setSelectedConfigurations(configs);
    setSelectiveTestResults([]);
    setSelectiveTestProgress(null);
    setIsSelectiveTestRunning(true);
    setIsSelectiveTestPaused(false);
  };

  const handleSelectiveTestProgress = (progress: TestProgress) => {
    setSelectiveTestProgress(progress);
  };

  const handleSelectiveTestComplete = (result: TestResult) => {
    console.log('[BenchmarkDashboard] Selective test completed:', result);
    setSelectiveTestResults(prev => [...prev, result]);
  };

  const handleAllSelectiveTestsComplete = (results: TestResult[]) => {
    console.log('[BenchmarkDashboard] All selective tests completed:', results);
    setIsSelectiveTestRunning(false);
    setIsSelectiveTestPaused(false);
    setSelectiveTestProgress(null);
  };

  const handlePauseSelectiveTests = () => {
    setIsSelectiveTestPaused(true);
  };

  const handleResumeSelectiveTests = () => {
    setIsSelectiveTestPaused(false);
  };

  const handleStopSelectiveTests = () => {
    setIsSelectiveTestRunning(false);
    setIsSelectiveTestPaused(false);
    setSelectiveTestProgress(null);
  };

  const runPhase2Diagnostic = async () => {
    setDiagnosticRunning(true);
    setDiagnosticResults(null);
    
    try {
      const diagnosticRunner = new DiagnosticRunner();
      const results = await diagnosticRunner.runFullDiagnostic();
      setDiagnosticResults(results);
      
      // Export results to console for analysis
      console.log('Phase 2 Diagnostic Results:');
      console.log(diagnosticRunner.exportResults());
      
    } catch (error) {
      console.error('Diagnostic failed:', error);
    } finally {
      setDiagnosticRunning(false);
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

        <div style={styles.controlGroup}>
          <button
            style={diagnosticRunning ? styles.diagnosticRunningButton : styles.diagnosticButton}
            onClick={runPhase2Diagnostic}
            disabled={diagnosticRunning}
          >
            {diagnosticRunning ? 'Running Phase 2 Diagnostic...' : 'Run Phase 2 Diagnostic'}
          </button>
        </div>

        <div style={styles.controlGroup}>
          <button
            style={showValidationPanel ? styles.validationActiveButton : styles.validationButton}
            onClick={() => setShowValidationPanel(!showValidationPanel)}
          >
            {showValidationPanel ? 'Hide Performance Validation' : 'Phase 2C Performance Validation'}
          </button>
        </div>

        <div style={styles.controlGroup}>
          <button
            style={showSelectiveTesting ? styles.selectiveTestingActiveButton : styles.selectiveTestingButton}
            onClick={() => setShowSelectiveTesting(!showSelectiveTesting)}
          >
            {showSelectiveTesting ? 'Hide Selective Testing' : 'Selective Testing UI'}
          </button>
        </div>

        <div style={styles.controlGroup}>
          <label style={styles.label}>
            <input
              type="checkbox"
              checked={usePhase2}
              onChange={(e) => setUsePhase2(e.target.checked)}
              style={styles.checkbox}
            />
            Enable Phase 2 (GraphCanvasV2)
          </label>
        </div>

        {usePhase2 && (
          <div style={styles.controlGroup}>
            <label style={styles.label}>Optimization Level:</label>
            <select 
              style={styles.select}
              value={phase2Config.optimizationLevel}
              onChange={(e) => setPhase2Config(prev => ({
                ...prev, 
                optimizationLevel: e.target.value as any
              }))}
            >
              <option value="HIGH_PERFORMANCE">High Performance</option>
              <option value="BALANCED">Balanced</option>
              <option value="POWER_SAVING">Power Saving</option>
            </select>
          </div>
        )}
      </div>

      {/* Performance Validation Panel */}
      {showValidationPanel && (
        <div style={styles.validationSection}>
          <PerformanceValidationPanel
            datasets={benchmarkTests.map(test => ({
              name: test.name,
              data: test.dataset
            }))}
            onTestComplete={(results) => {
              console.log('Phase 2C Validation completed:', results);
            }}
          />
        </div>
      )}

      {/* Selective Testing Interface */}
      {showSelectiveTesting && (
        <div style={styles.selectiveTestingSection}>
          <SelectiveTestingInterface
            availableTests={benchmarkTests}
            onSelectionChange={handleSelectiveTestConfigurationChange}
            onStartTests={handleStartSelectiveTests}
            isRunning={isSelectiveTestRunning}
          />

          {isSelectiveTestRunning && (
            <SelectiveTestRunner
              configurations={selectedConfigurations}
              availableTests={benchmarkTests}
              onProgress={handleSelectiveTestProgress}
              onTestComplete={handleSelectiveTestComplete}
              onAllTestsComplete={handleAllSelectiveTestsComplete}
              isRunning={isSelectiveTestRunning}
              isPaused={isSelectiveTestPaused}
              onPause={handlePauseSelectiveTests}
              onResume={handleResumeSelectiveTests}
              onStop={handleStopSelectiveTests}
            />
          )}

          <SelectiveTestResults
            results={selectiveTestResults}
            progress={selectiveTestProgress || undefined}
            isRunning={isSelectiveTestRunning}
            onExportResults={() => {
              const data = JSON.stringify(selectiveTestResults, null, 2);
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `selective-test-results-${Date.now()}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            onRetestFailed={() => {
              const failedConfigs = selectiveTestResults
                .filter(r => !r.success)
                .map(r => r.configuration);
              if (failedConfigs.length > 0) {
                handleStartSelectiveTests(failedConfigs);
              }
            }}
          />
        </div>
      )}

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
                {selectedTest.animated && (
                  <span style={styles.featureBadge}>🎥 Animated</span>
                )}
                {selectedTest.interactive && (
                  <span style={styles.featureBadge}>🔄 Interactive</span>
                )}
                {selectedTest.edgeInterpolation === 'curved' && (
                  <span style={styles.featureBadge}>〰️ Curved</span>
                )}
                {selectedTest.id.includes('network-topology') && (
                  <span style={styles.featureBadge}>🌐 8-Level</span>
                )}
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

          {/* Phase 2 Diagnostic Results Panel */}
          {diagnosticResults && (
            <div style={styles.diagnosticPanel}>
              <h3 style={styles.diagnosticTitle}>
                Phase 2 Integration Readiness Report
              </h3>
              <div style={styles.diagnosticGrid}>
                <div style={styles.diagnosticSection}>
                  <h4 style={styles.diagnosticSectionTitle}>GPU Capabilities</h4>
                  <div style={styles.diagnosticItem}>
                    <span>WebGL2:</span>
                    <span style={{color: diagnosticResults.gpuCapabilities?.webgl2?.supported ? '#00ff88' : '#ff6b6b'}}>
                      {diagnosticResults.gpuCapabilities?.webgl2?.supported ? '✅' : '❌'}
                    </span>
                  </div>
                  <div style={styles.diagnosticItem}>
                    <span>SharedArrayBuffer:</span>
                    <span style={{color: diagnosticResults.gpuCapabilities?.sharedArrayBuffer?.supported ? '#00ff88' : '#ff6b6b'}}>
                      {diagnosticResults.gpuCapabilities?.sharedArrayBuffer?.supported ? '✅' : '❌'}
                    </span>
                  </div>
                  <div style={styles.diagnosticItem}>
                    <span>Cross-Origin:</span>
                    <span style={{color: diagnosticResults.gpuCapabilities?.sharedArrayBuffer?.crossOriginIsolated ? '#00ff88' : '#ffaa00'}}>
                      {diagnosticResults.gpuCapabilities?.sharedArrayBuffer?.crossOriginIsolated ? '✅' : '⚠️'}
                    </span>
                  </div>
                </div>
                
                <div style={styles.diagnosticSection}>
                  <h4 style={styles.diagnosticSectionTitle}>Current Performance</h4>
                  {diagnosticResults.baselinePerformance?.rendering?.fps && (
                    <div style={styles.diagnosticItem}>
                      <span>Current FPS:</span>
                      <span>{diagnosticResults.baselinePerformance.rendering.fps.toFixed(1)}</span>
                    </div>
                  )}
                  {diagnosticResults.baselinePerformance?.memory?.peakUsed && (
                    <div style={styles.diagnosticItem}>
                      <span>Memory Usage:</span>
                      <span>{diagnosticResults.baselinePerformance.memory.peakUsed.toFixed(2)}MB</span>
                    </div>
                  )}
                  {diagnosticResults.baselinePerformance?.interaction?.averageResponseTime && (
                    <div style={styles.diagnosticItem}>
                      <span>Response Time:</span>
                      <span>{diagnosticResults.baselinePerformance.interaction.averageResponseTime.toFixed(2)}ms</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div style={styles.diagnosticSummary}>
                <div style={styles.diagnosticItem}>
                  <span>Integration Readiness:</span>
                  <span style={{
                    color: diagnosticResults.summary?.readiness?.score >= 75 ? '#00ff88' : 
                           diagnosticResults.summary?.readiness?.score >= 50 ? '#ffaa00' : '#ff6b6b',
                    fontWeight: 'bold'
                  }}>
                    {diagnosticResults.summary?.readiness?.status || 'Analyzing...'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Graph Visualization */}
        <div style={styles.graphPanel}>
          {selectedTest ? (
            selectedTest.id.includes('network-topology') ? (
              <NetworkTopologyRenderer
                data={selectedTest.dataset}
                animated={selectedTest.animated || false}
                edgeInterpolation={selectedTest.edgeInterpolation || 'curved'}
                initialCollapsedIds={selectedTest.initialCollapsedNodeIds}
                layoutType={selectedTest.layoutType || 'hierarchical'}
                onNodeCountChange={updateNodeCount}
                onEdgeCountChange={updateEdgeCount}
                onCollapseChange={(collapsedIds) => {
                  console.log('Network topology collapsed nodes:', collapsedIds);
                }}
                onPerformanceUpdate={(metrics) => {
                  console.log('Network topology performance:', metrics);
                }}
              />
            ) : selectedTest.interactive ? (
              <CollapsibleGraphRenderer
                data={selectedTest.dataset}
                animated={selectedTest.animated || false}
                edgeInterpolation={selectedTest.edgeInterpolation || 'linear'}
                initialCollapsedIds={selectedTest.initialCollapsedNodeIds}
                workerEnabled={workerEnabled}
                onNodeCountChange={updateNodeCount}
                onEdgeCountChange={updateEdgeCount}
                onCollapseChange={(collapsedIds) => {
                  console.log('Collapsed nodes changed:', collapsedIds);
                }}
                onPerformanceUpdate={(metrics) => {
                  console.log('Collapsible graph performance:', metrics);
                }}
              />
            ) : usePhase2 ? (
              <GraphRendererV2
                data={selectedTest.dataset}
                animated={selectedTest.animated || false}
                optimizationLevel={phase2Config.optimizationLevel}
                enableGPUAcceleration={phase2Config.enableGPUAcceleration}
                enableInstancedRendering={phase2Config.enableInstancedRendering}
                enableSharedWorkers={phase2Config.enableSharedWorkers}
                enableMemoryOptimization={phase2Config.enableMemoryOptimization}
                onNodeCountChange={updateNodeCount}
                onEdgeCountChange={updateEdgeCount}
                onPerformanceUpdate={(metrics) => {
                  // Update performance tracker with Phase 2 metrics
                  console.log('Phase 2 Performance Update:', metrics);
                }}
                showControls={true}
                showPerformanceOverlay={true}
              />
            ) : (
              <GraphRenderer
                data={selectedTest.dataset}
                animated={selectedTest.animated || false}
                workerEnabled={workerEnabled}
                onNodeCountChange={updateNodeCount}
                onEdgeCountChange={updateEdgeCount}
                onWorkerStatusChange={updateWorkerStatus}
              />
            )
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
          Renderer: {usePhase2 ? 'GraphCanvasV2 (Phase 2)' : 'GraphCanvas (Legacy)'}
        </div>
        <div style={styles.statusItem}>
          Status: {isTracking ? 'Monitoring Active' : 'Monitoring Stopped'}
        </div>
        {usePhase2 && (
          <div style={styles.statusItem}>
            Optimization: {phase2Config.optimizationLevel}
          </div>
        )}
        {metrics && (
          <>
            <div style={styles.statusItem}>
              FPS: {metrics.fps.toFixed(1)}
            </div>
            <div style={styles.statusItem}>
              Memory: {(metrics.memoryUsage).toFixed(1)}MB
            </div>
            {!usePhase2 && (
              <div style={styles.statusItem}>
                Worker: {metrics.workerStatus}
              </div>
            )}
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
  diagnosticButton: {
    padding: '0.5rem 1rem',
    background: '#9945ff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontWeight: 'bold' as const,
    cursor: 'pointer' as const,
    fontSize: '0.9rem'
  },
  diagnosticRunningButton: {
    padding: '0.5rem 1rem',
    background: '#7035cc',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontWeight: 'bold' as const,
    cursor: 'not-allowed' as const,
    fontSize: '0.9rem',
    opacity: 0.7
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
  featureBadge: {
    display: 'inline-block',
    padding: '0.2rem 0.5rem',
    background: 'rgba(78, 205, 196, 0.2)',
    color: '#4ecdc4',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: 'bold' as const,
    marginLeft: '0.5rem'
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
  },
  diagnosticPanel: {
    background: '#1a1a1a',
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid #9945ff',
    marginTop: '1rem'
  },
  diagnosticTitle: {
    margin: '0 0 1rem 0',
    color: '#9945ff',
    fontSize: '1rem',
    fontWeight: 'bold' as const
  },
  diagnosticGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginBottom: '1rem'
  },
  diagnosticSection: {
    // No specific styles needed
  },
  diagnosticSectionTitle: {
    margin: '0 0 0.5rem 0',
    color: '#00d4ff',
    fontSize: '0.9rem',
    fontWeight: 'bold' as const
  },
  diagnosticItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.25rem 0',
    borderBottom: '1px solid #333',
    fontSize: '0.8rem'
  },
  diagnosticSummary: {
    borderTop: '1px solid #9945ff',
    paddingTop: '1rem',
    marginTop: '1rem'
  },
  validationButton: {
    padding: '0.5rem 1rem',
    background: '#00d4ff',
    color: '#000000',
    border: 'none',
    borderRadius: '4px',
    fontWeight: 'bold' as const,
    cursor: 'pointer' as const,
    fontSize: '0.9rem'
  },
  validationActiveButton: {
    padding: '0.5rem 1rem',
    background: '#0099cc',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontWeight: 'bold' as const,
    cursor: 'pointer' as const,
    fontSize: '0.9rem'
  },
  validationSection: {
    margin: '1rem',
    marginTop: 0
  },
  selectiveTestingButton: {
    padding: '0.5rem 1rem',
    background: '#ff6b35',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontWeight: 'bold' as const,
    cursor: 'pointer' as const,
    fontSize: '0.9rem'
  },
  selectiveTestingActiveButton: {
    padding: '0.5rem 1rem',
    background: '#cc5529',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontWeight: 'bold' as const,
    cursor: 'pointer' as const,
    fontSize: '0.9rem'
  },
  selectiveTestingSection: {
    margin: '1rem',
    marginTop: 0
  }
};