import React from 'react';
import { PerformanceMetrics } from '../types/benchmark.types';
import { formatMemorySize, getPerformanceGrade } from '../utils/performanceUtils';

interface PerformanceMonitorProps {
  metrics: PerformanceMetrics | null;
  averageMetrics: PerformanceMetrics | null;
  className?: string;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  metrics,
  averageMetrics,
  className = ''
}) => {
  if (!metrics) {
    return (
      <div className={`performance-monitor ${className}`}>
        <div className="monitor-panel">
          <h3>Performance Monitor</h3>
          <p>Waiting for performance data...</p>
        </div>
      </div>
    );
  }

  const currentGrade = getPerformanceGrade(metrics.fps);
  const avgGrade = averageMetrics ? getPerformanceGrade(averageMetrics.fps) : currentGrade;

  return (
    <div className={`performance-monitor ${className}`} style={styles.container}>
      {/* Real-time Metrics */}
      <div style={styles.panel}>
        <h3 style={styles.title}>Real-time Performance</h3>
        <div style={styles.metricsGrid}>
          <div style={styles.metric}>
            <div style={styles.metricLabel}>FPS</div>
            <div style={styles.metricValue} data-grade={currentGrade.grade}>
              {metrics.fps.toFixed(1)}
            </div>
            <div style={{...styles.metricGrade, color: currentGrade.color}}>
              {currentGrade.grade}
            </div>
          </div>
          
          <div style={styles.metric}>
            <div style={styles.metricLabel}>Memory</div>
            <div style={styles.metricValue}>
              {formatMemorySize(metrics.memoryUsage * 1024 * 1024)}
            </div>
            <div style={styles.metricSubtext}>Heap</div>
          </div>
          
          <div style={styles.metric}>
            <div style={styles.metricLabel}>Render Time</div>
            <div style={styles.metricValue}>
              {metrics.renderTime.toFixed(1)}ms
            </div>
            <div style={styles.metricSubtext}>Frame</div>
          </div>
          
          <div style={styles.metric}>
            <div style={styles.metricLabel}>Worker</div>
            <div style={styles.metricValue}>
              <WorkerStatusIndicator status={metrics.workerStatus} />
            </div>
            <div style={styles.metricSubtext}>{metrics.workerStatus}</div>
          </div>
        </div>
      </div>

      {/* Average Metrics */}
      {averageMetrics && (
        <div style={styles.panel}>
          <h3 style={styles.title}>Average Performance (1s)</h3>
          <div style={styles.metricsGrid}>
            <div style={styles.metric}>
              <div style={styles.metricLabel}>Avg FPS</div>
              <div style={styles.metricValue} data-grade={avgGrade.grade}>
                {averageMetrics.fps.toFixed(1)}
              </div>
              <div style={{...styles.metricGrade, color: avgGrade.color}}>
                {avgGrade.grade}
              </div>
            </div>
            
            <div style={styles.metric}>
              <div style={styles.metricLabel}>Avg Memory</div>
              <div style={styles.metricValue}>
                {formatMemorySize(averageMetrics.memoryUsage * 1024 * 1024)}
              </div>
              <div style={styles.metricSubtext}>Heap</div>
            </div>
            
            <div style={styles.metric}>
              <div style={styles.metricLabel}>Avg Render</div>
              <div style={styles.metricValue}>
                {averageMetrics.renderTime.toFixed(1)}ms
              </div>
              <div style={styles.metricSubtext}>Frame</div>
            </div>
            
            <div style={styles.metric}>
              <div style={styles.metricLabel}>Graph Size</div>
              <div style={styles.metricValue}>
                {metrics.nodeCount.toLocaleString()}
              </div>
              <div style={styles.metricSubtext}>nodes</div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Grade Legend */}
      <div style={styles.legend}>
        <div style={styles.legendTitle}>Performance Grades:</div>
        <div style={styles.legendItems}>
          <span style={{color: '#00ff88'}}>A: 55+ FPS</span>
          <span style={{color: '#88ff00'}}>B: 45+ FPS</span>
          <span style={{color: '#ffaa00'}}>C: 30+ FPS</span>
          <span style={{color: '#ff6600'}}>D: 20+ FPS</span>
          <span style={{color: '#ff0000'}}>F: &lt;20 FPS</span>
        </div>
      </div>
    </div>
  );
};

const WorkerStatusIndicator: React.FC<{status: PerformanceMetrics['workerStatus']}> = ({status}) => {
  const statusConfig = {
    enabled: { color: '#00ff88', symbol: '●' },
    disabled: { color: '#666666', symbol: '○' },
    failed: { color: '#ff0000', symbol: '✕' },
    initializing: { color: '#ffaa00', symbol: '⟳' }
  };

  const config = statusConfig[status];
  
  return (
    <span style={{color: config.color}}>
      {config.symbol}
    </span>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
    padding: '1rem',
    background: '#1a1a1a',
    borderRadius: '8px',
    border: '1px solid #333',
    fontFamily: 'monospace'
  },
  panel: {
    background: '#0f0f0f',
    borderRadius: '6px',
    padding: '1rem',
    border: '1px solid #333'
  },
  title: {
    margin: '0 0 1rem 0',
    color: '#ffffff',
    fontSize: '1rem',
    fontWeight: 'bold' as const
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '1rem'
  },
  metric: {
    textAlign: 'center' as const
  },
  metricLabel: {
    color: '#aaaaaa',
    fontSize: '0.8rem',
    marginBottom: '0.25rem'
  },
  metricValue: {
    color: '#ffffff',
    fontSize: '1.5rem',
    fontWeight: 'bold' as const,
    marginBottom: '0.25rem'
  },
  metricGrade: {
    fontSize: '0.9rem',
    fontWeight: 'bold' as const
  },
  metricSubtext: {
    color: '#888888',
    fontSize: '0.7rem'
  },
  legend: {
    marginTop: '0.5rem',
    padding: '0.75rem',
    background: '#0a0a0a',
    borderRadius: '4px',
    border: '1px solid #222'
  },
  legendTitle: {
    color: '#aaaaaa',
    fontSize: '0.8rem',
    marginBottom: '0.5rem'
  },
  legendItems: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap' as const,
    fontSize: '0.75rem'
  }
};