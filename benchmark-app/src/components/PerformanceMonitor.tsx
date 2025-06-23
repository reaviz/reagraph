import React from 'react';
import { PerformanceMetrics } from '../types/benchmark.types';
import { formatMemorySize, getPerformanceGrade } from '../utils/performanceUtils';

export interface MemoryPoolStats {
  name: string;
  available: number;
  inUse: number;
  total: number;
  hitRate: number;
  totalCreated: number;
  peakUsage: number;
}

interface PerformanceMonitorProps {
  metrics: PerformanceMetrics | null;
  averageMetrics: PerformanceMetrics | null;
  memoryPools?: MemoryPoolStats[];
  totalMemoryUsage?: number;
  className?: string;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  metrics,
  averageMetrics,
  memoryPools,
  totalMemoryUsage,
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

      {/* Memory Pools Panel */}
      {memoryPools && memoryPools.length > 0 && (
        <div style={styles.panel}>
          <h3 style={styles.title}>Memory Pools</h3>
          <div style={styles.poolsGrid}>
            {memoryPools.map((pool) => (
              <div key={pool.name} style={styles.poolCard}>
                <div style={styles.poolName}>{pool.name}</div>
                <div style={styles.poolMetrics}>
                  <div style={styles.poolMetric}>
                    <span style={styles.poolLabel}>In Use:</span>
                    <span style={styles.poolValue}>{pool.inUse}/{pool.total}</span>
                  </div>
                  <div style={styles.poolMetric}>
                    <span style={styles.poolLabel}>Hit Rate:</span>
                    <span style={{
                      ...styles.poolValue,
                      color: pool.hitRate > 0.8 ? '#00ff88' : pool.hitRate > 0.6 ? '#ffaa00' : '#ff6600'
                    }}>
                      {(pool.hitRate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div style={styles.poolMetric}>
                    <span style={styles.poolLabel}>Peak:</span>
                    <span style={styles.poolValue}>{pool.peakUsage}</span>
                  </div>
                  <div style={styles.poolMetric}>
                    <span style={styles.poolLabel}>Created:</span>
                    <span style={styles.poolValue}>{pool.totalCreated}</span>
                  </div>
                </div>
                <div style={styles.poolBar}>
                  <div 
                    style={{
                      ...styles.poolFill,
                      width: `${(pool.inUse / pool.total) * 100}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          {totalMemoryUsage && (
            <div style={styles.totalMemory}>
              <span style={styles.totalMemoryLabel}>Total Pool Memory:</span>
              <span style={styles.totalMemoryValue}>
                {formatMemorySize(totalMemoryUsage)}
              </span>
            </div>
          )}
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
  },
  poolsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '0.75rem'
  },
  poolCard: {
    background: '#1a1a1a',
    borderRadius: '4px',
    padding: '0.75rem',
    border: '1px solid #333'
  },
  poolName: {
    color: '#4ecdc4',
    fontSize: '0.9rem',
    fontWeight: 'bold' as const,
    marginBottom: '0.5rem'
  },
  poolMetrics: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
    marginBottom: '0.5rem'
  },
  poolMetric: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem'
  },
  poolLabel: {
    color: '#aaaaaa'
  },
  poolValue: {
    color: '#ffffff',
    fontWeight: 'bold' as const
  },
  poolBar: {
    height: '4px',
    background: '#333',
    borderRadius: '2px',
    overflow: 'hidden' as const
  },
  poolFill: {
    height: '100%',
    background: 'linear-gradient(to right, #4ecdc4, #44a08d)',
    transition: 'width 0.3s ease'
  },
  totalMemory: {
    marginTop: '1rem',
    padding: '0.75rem',
    background: '#0a0a0a',
    borderRadius: '4px',
    border: '1px solid #222',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  totalMemoryLabel: {
    color: '#aaaaaa',
    fontSize: '0.9rem'
  },
  totalMemoryValue: {
    color: '#4ecdc4',
    fontSize: '1.1rem',
    fontWeight: 'bold' as const
  }
};