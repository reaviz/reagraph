import React, { useState } from 'react';
import { TestResult, TestProgress } from './SelectiveTestRunner';
import { TestConfiguration } from './SelectiveTestingInterface';

interface SelectiveTestResultsProps {
  results: TestResult[];
  progress?: TestProgress;
  isRunning: boolean;
  onExportResults?: () => void;
  onRetestFailed?: () => void;
}

export const SelectiveTestResults: React.FC<SelectiveTestResultsProps> = ({
  results,
  progress,
  isRunning,
  onExportResults,
  onRetestFailed
}) => {
  const [sortBy, setSortBy] = useState<'index' | 'performance' | 'fps' | 'memory'>('index');
  const [filterBy, setFilterBy] = useState<'all' | 'passed' | 'failed'>('all');

  // Calculate summary statistics
  const summary = React.useMemo(() => {
    if (results.length === 0) return null;

    const passed = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    const avgPerformanceScore = passed.length > 0 ? 
      passed.reduce((sum, r) => sum + r.metrics.performanceScore, 0) / passed.length : 0;
    
    const avgFPS = passed.length > 0 ? 
      passed.reduce((sum, r) => sum + r.metrics.averageFPS, 0) / passed.length : 0;
    
    const avgMemory = passed.length > 0 ? 
      passed.reduce((sum, r) => sum + r.metrics.memoryUsage, 0) / passed.length : 0;

    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

    return {
      total: results.length,
      passed: passed.length,
      failed: failed.length,
      passRate: results.length > 0 ? (passed.length / results.length) * 100 : 0,
      avgPerformanceScore,
      avgFPS,
      avgMemory,
      totalDuration: totalDuration / 1000 // Convert to seconds
    };
  }, [results]);

  // Filter and sort results
  const filteredAndSortedResults = React.useMemo(() => {
    let filtered = results;
    
    if (filterBy === 'passed') {
      filtered = results.filter(r => r.success);
    } else if (filterBy === 'failed') {
      filtered = results.filter(r => !r.success);
    }

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'performance':
          return b.metrics.performanceScore - a.metrics.performanceScore;
        case 'fps':
          return b.metrics.averageFPS - a.metrics.averageFPS;
        case 'memory':
          return a.metrics.memoryUsage - b.metrics.memoryUsage; // Lower memory is better
        default:
          return 0; // Keep original order for 'index'
      }
    });
  }, [results, filterBy, sortBy]);

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return '#00ff88';
    if (score >= 60) return '#ffaa00';
    return '#ff6b6b';
  };

  const getConfigurationKey = (config: TestConfiguration) => {
    return `${config.size}-${config.layoutType}`;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Test Results</h2>
        <div style={styles.controls}>
          <select 
            value={filterBy} 
            onChange={(e) => setFilterBy(e.target.value as any)}
            style={styles.select}
          >
            <option value="all">All Tests</option>
            <option value="passed">Passed Only</option>
            <option value="failed">Failed Only</option>
          </select>
          
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as any)}
            style={styles.select}
          >
            <option value="index">Original Order</option>
            <option value="performance">Performance Score</option>
            <option value="fps">Average FPS</option>
            <option value="memory">Memory Usage</option>
          </select>

          {onExportResults && (
            <button style={styles.exportButton} onClick={onExportResults}>
              Export Results
            </button>
          )}
        </div>
      </div>

      {/* Progress indicator when running */}
      {isRunning && progress && (
        <div style={styles.progressSection}>
          <div style={styles.progressHeader}>
            <span style={styles.progressTitle}>
              Test {progress.currentTestIndex + 1} of {progress.totalTests}: {progress.currentTestName}
            </span>
            <span style={styles.progressPhase}>
              {progress.phase.toUpperCase()}
            </span>
          </div>
          <div style={styles.progressBar}>
            <div 
              style={{
                ...styles.progressFill,
                width: `${progress.progress}%`
              }}
            />
          </div>
          <div style={styles.progressDetails}>
            <span>Elapsed: {Math.round(progress.elapsedTime / 1000)}s</span>
            <span>Remaining: ~{Math.round(progress.estimatedTimeRemaining / 1000)}s</span>
          </div>
        </div>
      )}

      {/* Summary Statistics */}
      {summary && results.length > 0 && (
        <div style={styles.summary}>
          <h3 style={styles.summaryTitle}>Summary</h3>
          <div style={styles.summaryGrid}>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Total Tests:</span>
              <span style={styles.summaryValue}>{summary.total}</span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Pass Rate:</span>
              <span style={{
                ...styles.summaryValue,
                color: summary.passRate >= 80 ? '#00ff88' : summary.passRate >= 60 ? '#ffaa00' : '#ff6b6b'
              }}>
                {summary.passRate.toFixed(1)}%
              </span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Avg Performance:</span>
              <span style={{
                ...styles.summaryValue,
                color: getPerformanceColor(summary.avgPerformanceScore)
              }}>
                {summary.avgPerformanceScore.toFixed(1)}
              </span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Avg FPS:</span>
              <span style={styles.summaryValue}>{summary.avgFPS.toFixed(1)}</span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Avg Memory:</span>
              <span style={styles.summaryValue}>{summary.avgMemory.toFixed(1)}MB</span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Total Duration:</span>
              <span style={styles.summaryValue}>{Math.round(summary.totalDuration)}s</span>
            </div>
          </div>

          {summary.failed > 0 && onRetestFailed && (
            <button style={styles.retestButton} onClick={onRetestFailed}>
              Retest {summary.failed} Failed Tests
            </button>
          )}
        </div>
      )}

      {/* Results Table */}
      {results.length > 0 ? (
        <div style={styles.resultsTable}>
          <div style={styles.tableHeader}>
            <div style={styles.headerCell}>Test Configuration</div>
            <div style={styles.headerCell}>Performance Score</div>
            <div style={styles.headerCell}>FPS (Avg/Min/Max)</div>
            <div style={styles.headerCell}>Memory Usage</div>
            <div style={styles.headerCell}>Duration</div>
            <div style={styles.headerCell}>Status</div>
          </div>

          {filteredAndSortedResults.map((result, index) => (
            <div 
              key={index} 
              style={{
                ...styles.tableRow,
                ...(result.success ? {} : styles.tableRowFailed)
              }}
            >
              <div style={styles.tableCell}>
                <div style={styles.configInfo}>
                  <div style={styles.configKey}>
                    {getConfigurationKey(result.configuration)}
                  </div>
                  <div style={styles.configDetails}>
                    {result.configuration.layoutType} • Priority: {result.configuration.priority}
                  </div>
                </div>
              </div>

              <div style={styles.tableCell}>
                <span style={{
                  ...styles.performanceScore,
                  color: getPerformanceColor(result.metrics.performanceScore)
                }}>
                  {result.metrics.performanceScore}
                </span>
              </div>

              <div style={styles.tableCell}>
                {result.success ? (
                  <div style={styles.fpsData}>
                    <div style={styles.fpsMain}>{result.metrics.averageFPS.toFixed(1)}</div>
                    <div style={styles.fpsRange}>
                      {result.metrics.minFPS.toFixed(1)} - {result.metrics.maxFPS.toFixed(1)}
                    </div>
                  </div>
                ) : (
                  <span style={styles.errorText}>N/A</span>
                )}
              </div>

              <div style={styles.tableCell}>
                {result.success ? (
                  `${result.metrics.memoryUsage.toFixed(1)}MB`
                ) : (
                  <span style={styles.errorText}>N/A</span>
                )}
              </div>

              <div style={styles.tableCell}>
                {(result.duration / 1000).toFixed(1)}s
              </div>

              <div style={styles.tableCell}>
                {result.success ? (
                  <span style={styles.successStatus}>✓ PASSED</span>
                ) : (
                  <div style={styles.failedStatus}>
                    <span>✗ FAILED</span>
                    {result.error && (
                      <div style={styles.errorMessage}>{result.error}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.noResults}>
          {isRunning ? 
            'Tests are running. Results will appear here as they complete.' : 
            'No test results available. Run some tests to see results here.'
          }
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
    padding: '1.5rem'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem'
  },
  title: {
    margin: 0,
    color: '#00d4ff',
    fontSize: '1.4rem',
    fontWeight: 'bold' as const
  },
  controls: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center'
  },
  select: {
    padding: '0.5rem',
    background: '#2a2a2a',
    border: '1px solid #444',
    borderRadius: '4px',
    color: '#ffffff',
    fontSize: '0.9rem'
  },
  exportButton: {
    padding: '0.5rem 1rem',
    background: '#00d4ff',
    color: '#000000',
    border: 'none',
    borderRadius: '4px',
    fontWeight: 'bold' as const,
    cursor: 'pointer' as const,
    fontSize: '0.9rem'
  },
  progressSection: {
    background: '#2a2a2a',
    border: '1px solid #444',
    borderRadius: '6px',
    padding: '1rem',
    marginBottom: '1.5rem'
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem'
  },
  progressTitle: {
    color: '#ffffff',
    fontWeight: 'bold' as const
  },
  progressPhase: {
    color: '#00ff88',
    fontSize: '0.9rem',
    fontWeight: 'bold' as const
  },
  progressBar: {
    width: '100%',
    height: '6px',
    background: '#333',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '0.5rem'
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #00d4ff, #00ff88)',
    transition: 'width 0.3s ease'
  },
  progressDetails: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
    color: '#aaaaaa'
  },
  summary: {
    background: '#2a2a2a',
    border: '1px solid #444',
    borderRadius: '6px',
    padding: '1rem',
    marginBottom: '1.5rem'
  },
  summaryTitle: {
    margin: '0 0 1rem 0',
    color: '#ffffff',
    fontSize: '1.1rem'
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1rem',
    marginBottom: '1rem'
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem'
  },
  summaryLabel: {
    fontSize: '0.8rem',
    color: '#aaaaaa'
  },
  summaryValue: {
    fontSize: '1.1rem',
    fontWeight: 'bold' as const,
    color: '#ffffff'
  },
  retestButton: {
    padding: '0.5rem 1rem',
    background: '#ffaa00',
    color: '#000000',
    border: 'none',
    borderRadius: '4px',
    fontWeight: 'bold' as const,
    cursor: 'pointer' as const,
    fontSize: '0.9rem'
  },
  resultsTable: {
    border: '1px solid #333',
    borderRadius: '6px',
    overflow: 'hidden'
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1.5fr 1fr 1fr 1fr',
    background: '#2a2a2a',
    borderBottom: '1px solid #333'
  },
  headerCell: {
    padding: '0.75rem',
    fontWeight: 'bold' as const,
    fontSize: '0.9rem',
    color: '#cccccc',
    borderRight: '1px solid #333'
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1.5fr 1fr 1fr 1fr',
    background: '#1a1a1a',
    borderBottom: '1px solid #333',
    transition: 'background-color 0.2s ease'
  },
  tableRowFailed: {
    background: '#2a1a1a'
  },
  tableCell: {
    padding: '0.75rem',
    borderRight: '1px solid #333',
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.9rem'
  },
  configInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem'
  },
  configKey: {
    fontWeight: 'bold' as const,
    color: '#ffffff'
  },
  configDetails: {
    fontSize: '0.8rem',
    color: '#aaaaaa'
  },
  performanceScore: {
    fontSize: '1.1rem',
    fontWeight: 'bold' as const
  },
  fpsData: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem'
  },
  fpsMain: {
    fontWeight: 'bold' as const,
    color: '#ffffff'
  },
  fpsRange: {
    fontSize: '0.8rem',
    color: '#aaaaaa'
  },
  successStatus: {
    color: '#00ff88',
    fontWeight: 'bold' as const
  },
  failedStatus: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem'
  },
  errorText: {
    color: '#ff6b6b'
  },
  errorMessage: {
    fontSize: '0.8rem',
    color: '#ff6b6b',
    fontStyle: 'italic' as const
  },
  noResults: {
    textAlign: 'center' as const,
    padding: '2rem',
    color: '#aaaaaa',
    fontSize: '1rem',
    fontStyle: 'italic' as const
  }
};