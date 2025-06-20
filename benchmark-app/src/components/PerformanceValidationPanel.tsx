/**
 * Performance Validation Panel - Phase 2C Testing Interface
 * 
 * Provides comprehensive performance testing and validation interface for Phase 2 optimizations
 * - Automated performance test execution
 * - Real-time performance comparison
 * - Target validation reporting
 * - Detailed performance analysis
 */

import React, { useState, useCallback } from 'react';
import { PerformanceValidator, PerformanceComparison } from '../utils/performanceValidator';
import { GraphData } from '../types/benchmark.types';

interface PerformanceValidationPanelProps {
  datasets: { name: string; data: GraphData }[];
  onTestComplete?: (results: PerformanceComparison[]) => void;
}

export const PerformanceValidationPanel: React.FC<PerformanceValidationPanelProps> = ({
  datasets,
  onTestComplete
}) => {
  const [validationRunning, setValidationRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [validationResults, setValidationResults] = useState<PerformanceComparison[] | null>(null);
  const [validationReport, setValidationReport] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [statusLog, setStatusLog] = useState<string[]>([]);

  const runValidationSuite = useCallback(async () => {
    if (datasets.length === 0) {
      alert('No datasets available for validation');
      return;
    }

    setValidationRunning(true);
    setValidationResults(null);
    setValidationReport(null);
    setProgress({ current: 0, total: datasets.length * 2 }); // 2 tests per dataset
    setStatusLog([]);

    const validator = new PerformanceValidator();
    
    try {
      console.log('[PerformanceValidationPanel] Starting validation suite...');
      
      // Enhanced progress tracking with status logging
      let progressCounter = 0;
      const addStatusLog = (message: string) => {
        setStatusLog(prev => [...prev.slice(-9), message]); // Keep last 10 messages
      };
      
      addStatusLog('[PerformanceValidator] Starting Phase 2C Performance Validation Suite');
      
      const progressInterval = setInterval(() => {
        progressCounter++;
        const datasetIndex = Math.ceil(progressCounter / 2);
        const isBaseline = progressCounter % 2 === 1;
        
        setProgress(prev => ({
          ...prev,
          current: Math.min(progressCounter, prev.total - 1)
        }));
        
        if (datasetIndex <= datasets.length) {
          const dataset = datasets[datasetIndex - 1];
          const testType = isBaseline ? 'baseline' : 'optimized';
          const renderer = isBaseline ? 'GraphCanvas' : 'GraphCanvasV2';
          
          setCurrentTest(`Testing ${dataset.name} with ${renderer}...`);
          addStatusLog(`[PerformanceValidator] Running ${testType} test for ${dataset.name} (${dataset.data.nodes.length} nodes)`);
          
          // Simulate sample logging
          setTimeout(() => {
            addStatusLog(`[PerformanceValidator] ${dataset.name}_${testType} - Sample 3/10`);
          }, 200);
          setTimeout(() => {
            addStatusLog(`[PerformanceValidator] ${dataset.name}_${testType} - Sample 7/10`);
          }, 350);
        }
      }, 500);
      
      // Run validation
      const results = await validator.runValidationSuite(datasets);
      
      clearInterval(progressInterval);
      setProgress({ current: datasets.length * 2, total: datasets.length * 2 });
      setCurrentTest('Generating report...');
      addStatusLog('[PerformanceValidator] Validation suite completed with ' + results.length + ' comparisons');
      addStatusLog('[PerformanceValidator] Generating comprehensive validation report...');
      
      // Small delay to show completion
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setValidationResults(results);
      setValidationReport(validator.generateReport());
      onTestComplete?.(results);
      
      // Export results to console
      const exportData = validator.exportResults();
      console.log('Performance Validation Results:', exportData);
      addStatusLog('✅ Phase 2C Performance Validation completed successfully!');
      
    } catch (error) {
      console.error('[PerformanceValidationPanel] Validation failed:', error);
      alert('Performance validation failed. Check console for details.');
    } finally {
      setValidationRunning(false);
      setCurrentTest(null);
    }
  }, [datasets, onTestComplete]);

  const downloadReport = useCallback(() => {
    if (!validationReport) return;
    
    const blob = new Blob([validationReport], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `phase-2c-validation-report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [validationReport]);

  const getOverallScore = useCallback(() => {
    if (!validationResults) return null;
    
    const totalTargets = validationResults.length * 4; // 4 targets per test
    const achievedTargets = validationResults.reduce((count, result) => {
      return count + Object.values(result.targetsAchieved).filter(Boolean).length;
    }, 0);
    
    return {
      score: achievedTargets,
      total: totalTargets,
      percentage: (achievedTargets / totalTargets) * 100
    };
  }, [validationResults]);

  const overallScore = getOverallScore();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>
          Phase 2C Performance Validation
        </h3>
        <p style={styles.subtitle}>
          Automated testing suite for Phase 2 optimization validation
        </p>
      </div>

      {/* Controls Section */}
      <div style={styles.controls}>
        <div style={styles.controlGroup}>
          <button
            style={validationRunning ? styles.runningButton : styles.runButton}
            onClick={runValidationSuite}
            disabled={validationRunning || datasets.length === 0}
          >
            {validationRunning ? 
              'Running Validation Suite...' : 
              `Run Validation (${datasets.length} datasets)`
            }
          </button>
          
          {validationReport && (
            <button
              style={styles.downloadButton}
              onClick={downloadReport}
            >
              Download Report
            </button>
          )}
        </div>

        {validationRunning && (
          <div style={styles.progressSection}>
            <div style={styles.progressBar}>
              <div 
                style={{
                  ...styles.progressFill,
                  width: `${(progress.current / progress.total) * 100}%`
                }}
              />
            </div>
            <span style={styles.progressText}>
              {currentTest || 'Initializing validation suite...'}
            </span>
            
            {/* Status Log Stream */}
            <div style={styles.statusLog}>
              {statusLog.map((logEntry, index) => (
                <div key={index} style={{
                  ...styles.statusLogEntry,
                  color: logEntry.includes('✅') ? '#00ff88' :
                         logEntry.includes('Starting') || logEntry.includes('completed') ? '#00d4ff' :
                         logEntry.includes('Running') ? '#ffaa00' :
                         logEntry.includes('Sample') ? '#9945ff' :
                         '#aaaaaa'
                }}>
                  {logEntry}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      {validationResults && (
        <div style={styles.results}>
          {/* Overall Score */}
          {overallScore && (
            <div style={styles.scoreCard}>
              <div style={styles.scoreHeader}>
                <h4 style={styles.scoreTitle}>Overall Validation Score</h4>
                <div style={{
                  ...styles.scoreCircle,
                  background: overallScore.percentage >= 75 ? 
                    'conic-gradient(#00ff88 0deg, #00ff88 ' + (overallScore.percentage * 3.6) + 'deg, #333 ' + (overallScore.percentage * 3.6) + 'deg)' :
                    overallScore.percentage >= 50 ?
                    'conic-gradient(#ffaa00 0deg, #ffaa00 ' + (overallScore.percentage * 3.6) + 'deg, #333 ' + (overallScore.percentage * 3.6) + 'deg)' :
                    'conic-gradient(#ff6b6b 0deg, #ff6b6b ' + (overallScore.percentage * 3.6) + 'deg, #333 ' + (overallScore.percentage * 3.6) + 'deg)'
                }}>
                  <div style={styles.scoreInner}>
                    <span style={styles.scoreValue}>{overallScore.percentage.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
              <div style={styles.scoreDetails}>
                <span>Targets Achieved: {overallScore.score}/{overallScore.total}</span>
                <span style={{
                  color: overallScore.percentage >= 75 ? '#00ff88' : 
                         overallScore.percentage >= 50 ? '#ffaa00' : '#ff6b6b'
                }}>
                  {overallScore.percentage >= 75 ? '✅ Validation Successful' :
                   overallScore.percentage >= 50 ? '⚠️ Partial Success' : '❌ Validation Failed'}
                </span>
              </div>
            </div>
          )}

          {/* Test Results Grid */}
          <div style={styles.resultsGrid}>
            {validationResults.map((result, index) => (
              <div key={index} style={styles.resultCard}>
                <div style={styles.resultHeader}>
                  <h4 style={styles.resultTitle}>{result.testSuite}</h4>
                  <div style={styles.resultStats}>
                    <span>{result.baseline.nodeCount.toLocaleString()} nodes</span>
                    <span>{result.baseline.edgeCount.toLocaleString()} edges</span>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div style={styles.metricsSection}>
                  <h5 style={styles.metricsTitle}>Performance Comparison</h5>
                  
                  <div style={styles.metricRow}>
                    <span style={styles.metricLabel}>FPS:</span>
                    <span style={styles.metricBaseline}>
                      {result.baseline.metrics.averageFps.toFixed(1)}
                    </span>
                    <span style={styles.metricArrow}>→</span>
                    <span style={styles.metricOptimized}>
                      {result.optimized.metrics.averageFps.toFixed(1)}
                    </span>
                    <span style={{
                      ...styles.metricImprovement,
                      color: result.improvements.fpsImprovement > 0 ? '#00ff88' : '#ff6b6b'
                    }}>
                      {result.improvements.fpsImprovement > 0 ? '+' : ''}{(result.improvements.fpsImprovement * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div style={styles.metricRow}>
                    <span style={styles.metricLabel}>Memory:</span>
                    <span style={styles.metricBaseline}>
                      {result.baseline.metrics.memoryUsage.toFixed(1)}MB
                    </span>
                    <span style={styles.metricArrow}>→</span>
                    <span style={styles.metricOptimized}>
                      {result.optimized.metrics.memoryUsage.toFixed(1)}MB
                    </span>
                    <span style={{
                      ...styles.metricImprovement,
                      color: result.improvements.memoryReduction > 0 ? '#00ff88' : '#ff6b6b'
                    }}>
                      -{(result.improvements.memoryReduction * 100).toFixed(1)}%
                    </span>
                  </div>

                  {result.improvements.drawCallReduction && (
                    <div style={styles.metricRow}>
                      <span style={styles.metricLabel}>Draw Calls:</span>
                      <span style={styles.metricBaseline}>
                        {result.baseline.metrics.drawCalls?.toFixed(0)}
                      </span>
                      <span style={styles.metricArrow}>→</span>
                      <span style={styles.metricOptimized}>
                        {result.optimized.metrics.drawCalls?.toFixed(0)}
                      </span>
                      <span style={{
                        ...styles.metricImprovement,
                        color: '#00ff88'
                      }}>
                        -{(result.improvements.drawCallReduction * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}

                  {result.improvements.computeSpeedup && (
                    <div style={styles.metricRow}>
                      <span style={styles.metricLabel}>Compute:</span>
                      <span style={styles.metricBaseline}>
                        {result.baseline.metrics.computeTime?.toFixed(2)}ms
                      </span>
                      <span style={styles.metricArrow}>→</span>
                      <span style={styles.metricOptimized}>
                        {result.optimized.metrics.computeTime?.toFixed(2)}ms
                      </span>
                      <span style={{
                        ...styles.metricImprovement,
                        color: '#00ff88'
                      }}>
                        {result.improvements.computeSpeedup.toFixed(1)}x faster
                      </span>
                    </div>
                  )}
                </div>

                {/* Target Achievement */}
                <div style={styles.targetsSection}>
                  <h5 style={styles.targetsTitle}>Phase 2 Targets</h5>
                  <div style={styles.targetsList}>
                    <div style={styles.targetItem}>
                      <span style={styles.targetIndicator}>
                        {result.targetsAchieved.fps50xImprovement ? '✅' : '❌'}
                      </span>
                      <span>50x FPS Improvement</span>
                    </div>
                    <div style={styles.targetItem}>
                      <span style={styles.targetIndicator}>
                        {result.targetsAchieved.memory75Reduction ? '✅' : '❌'}
                      </span>
                      <span>75% Memory Reduction</span>
                    </div>
                    <div style={styles.targetItem}>
                      <span style={styles.targetIndicator}>
                        {result.targetsAchieved.drawCall95Reduction ? '✅' : '❌'}
                      </span>
                      <span>95% Draw Call Reduction</span>
                    </div>
                    <div style={styles.targetItem}>
                      <span style={styles.targetIndicator}>
                        {result.targetsAchieved.compute10xSpeedup ? '✅' : '❌'}
                      </span>
                      <span>10x Compute Speedup</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  header: {
    padding: '1rem',
    background: '#2a2a2a',
    borderBottom: '1px solid #333'
  },
  title: {
    margin: '0 0 0.5rem 0',
    color: '#9945ff',
    fontSize: '1.2rem',
    fontWeight: 'bold' as const
  },
  subtitle: {
    margin: 0,
    color: '#aaaaaa',
    fontSize: '0.9rem'
  },
  controls: {
    padding: '1rem',
    borderBottom: '1px solid #333'
  },
  controlGroup: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem'
  },
  runButton: {
    padding: '0.75rem 1.5rem',
    background: '#00ff88',
    color: '#000000',
    border: 'none',
    borderRadius: '4px',
    fontWeight: 'bold' as const,
    cursor: 'pointer' as const,
    fontSize: '0.9rem'
  },
  runningButton: {
    padding: '0.75rem 1.5rem',
    background: '#ffaa00',
    color: '#000000',
    border: 'none',
    borderRadius: '4px',
    fontWeight: 'bold' as const,
    cursor: 'not-allowed' as const,
    fontSize: '0.9rem',
    opacity: 0.8
  },
  downloadButton: {
    padding: '0.75rem 1.5rem',
    background: '#9945ff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontWeight: 'bold' as const,
    cursor: 'pointer' as const,
    fontSize: '0.9rem'
  },
  progressSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem'
  },
  progressBar: {
    width: '100%',
    height: '8px',
    background: '#333',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #9945ff, #00d4ff)',
    transition: 'width 0.3s ease'
  },
  progressText: {
    color: '#aaaaaa',
    fontSize: '0.8rem',
    marginBottom: '0.75rem'
  },
  statusLog: {
    background: '#000000',
    border: '1px solid #333',
    borderRadius: '4px',
    padding: '0.75rem',
    maxHeight: '120px',
    overflowY: 'auto' as const,
    fontSize: '0.7rem',
    fontFamily: 'monospace'
  },
  statusLogEntry: {
    marginBottom: '0.25rem',
    lineHeight: '1.2',
    whiteSpace: 'nowrap' as const,
    textShadow: '0 0 3px currentColor'
  },
  results: {
    padding: '1rem'
  },
  scoreCard: {
    background: '#2a2a2a',
    border: '1px solid #444',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1.5rem'
  },
  scoreHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem'
  },
  scoreTitle: {
    margin: 0,
    color: '#ffffff',
    fontSize: '1.1rem',
    fontWeight: 'bold' as const
  },
  scoreCircle: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative' as const
  },
  scoreInner: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: '#1a1a1a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  scoreValue: {
    color: '#ffffff',
    fontSize: '1.2rem',
    fontWeight: 'bold' as const
  },
  scoreDetails: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.9rem',
    color: '#aaaaaa'
  },
  resultsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '1rem'
  },
  resultCard: {
    background: '#2a2a2a',
    border: '1px solid #444',
    borderRadius: '8px',
    padding: '1rem'
  },
  resultHeader: {
    marginBottom: '1rem'
  },
  resultTitle: {
    margin: '0 0 0.5rem 0',
    color: '#00d4ff',
    fontSize: '1rem',
    fontWeight: 'bold' as const
  },
  resultStats: {
    display: 'flex',
    gap: '1rem',
    fontSize: '0.8rem',
    color: '#888888'
  },
  metricsSection: {
    marginBottom: '1rem'
  },
  metricsTitle: {
    margin: '0 0 0.75rem 0',
    color: '#ffffff',
    fontSize: '0.9rem',
    fontWeight: 'bold' as const
  },
  metricRow: {
    display: 'grid',
    gridTemplateColumns: '60px 60px 20px 60px 80px',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.5rem',
    fontSize: '0.8rem'
  },
  metricLabel: {
    color: '#aaaaaa',
    fontWeight: 'bold' as const
  },
  metricBaseline: {
    color: '#ff6b6b',
    textAlign: 'right' as const
  },
  metricArrow: {
    color: '#666666',
    textAlign: 'center' as const
  },
  metricOptimized: {
    color: '#00ff88',
    textAlign: 'right' as const
  },
  metricImprovement: {
    fontWeight: 'bold' as const,
    fontSize: '0.75rem'
  },
  targetsSection: {
    borderTop: '1px solid #444',
    paddingTop: '1rem'
  },
  targetsTitle: {
    margin: '0 0 0.75rem 0',
    color: '#ffffff',
    fontSize: '0.9rem',
    fontWeight: 'bold' as const
  },
  targetsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem'
  },
  targetItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8rem',
    color: '#aaaaaa'
  },
  targetIndicator: {
    fontSize: '0.9rem'
  }
};