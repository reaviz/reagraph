import React, { useEffect, useState } from 'react';
import { AdaptivePerformanceManager, PerformanceMode } from '../../../src/performance/AdaptivePerformanceManager';
import { AdvancedMemoryManager } from '../../../src/rendering/MemoryManager';
import { formatMemorySize } from '../utils/performanceUtils';

interface PerformanceHUDProps {
  performanceManager?: AdaptivePerformanceManager;
  memoryManager?: AdvancedMemoryManager;
  className?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

interface HUDMetrics {
  fps: number;
  barnesHutTheta: number;
  performanceMode: PerformanceMode;
  memoryPools: {
    octreeNodes: {
      available: number;
      inUse: number;
      hitRate: number;
    };
    sphereGeometry: {
      available: number;
      inUse: number;
    };
    mesh: {
      available: number;
      inUse: number;
    };
  };
  totalMemory: number;
}

export const PerformanceHUD: React.FC<PerformanceHUDProps> = ({
  performanceManager,
  memoryManager,
  className = '',
  position = 'top-right'
}) => {
  const [metrics, setMetrics] = useState<HUDMetrics | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (!performanceManager && !memoryManager) return;

    const interval = setInterval(() => {
      const performanceSettings = performanceManager?.getPerformanceSettings();
      const memoryStats = memoryManager?.getMemoryStats();

      if (performanceSettings || memoryStats) {
        setMetrics({
          fps: performanceManager?.getCurrentFPS() || 0,
          barnesHutTheta: performanceSettings?.barnesHutTheta || 0.5,
          performanceMode: performanceManager?.getMode() || 'balanced',
          memoryPools: {
            octreeNodes: memoryStats?.pools.octreeNodes.nodes || {
              available: 0,
              inUse: 0,
              hitRate: 0
            },
            sphereGeometry: memoryStats?.pools.sphereGeometry || {
              available: 0,
              inUse: 0
            },
            mesh: memoryStats?.pools.mesh || {
              available: 0,
              inUse: 0
            }
          },
          totalMemory: memoryStats?.totalMemoryBytes || 0
        });
      }
    }, 100); // Update 10 times per second

    return () => clearInterval(interval);
  }, [performanceManager, memoryManager]);

  if (!metrics) return null;

  const positionStyles: Record<string, React.CSSProperties> = {
    'top-left': { top: 10, left: 10 },
    'top-right': { top: 10, right: 10 },
    'bottom-left': { bottom: 10, left: 10 },
    'bottom-right': { bottom: 10, right: 10 }
  };

  const getModeColor = (mode: PerformanceMode) => {
    switch (mode) {
      case 'quality': return '#4ECDC4';
      case 'balanced': return '#FFE66D';
      case 'performance': return '#FF6B6B';
      case 'ultra-performance': return '#C92A2A';
      default: return '#666';
    }
  };

  const getModeIcon = (mode: PerformanceMode) => {
    switch (mode) {
      case 'quality': return '⚡';
      case 'balanced': return '⚖️';
      case 'performance': return '🚀';
      case 'ultra-performance': return '🔥';
      default: return '❓';
    }
  };

  return (
    <div 
      className={`performance-hud ${className}`}
      style={{
        ...styles.container,
        ...positionStyles[position]
      }}
    >
      <div 
        style={styles.header}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <span style={styles.title}>Performance HUD</span>
        <span style={styles.collapseIcon}>{isCollapsed ? '▶' : '▼'}</span>
      </div>

      {!isCollapsed && (
        <>
          {/* Performance Mode */}
          <div style={styles.section}>
            <div style={styles.modeIndicator}>
              <span style={styles.modeIcon}>{getModeIcon(metrics.performanceMode)}</span>
              <span style={{...styles.modeText, color: getModeColor(metrics.performanceMode)}}>
                {metrics.performanceMode.toUpperCase()}
              </span>
              <span style={styles.fps}>{metrics.fps.toFixed(1)} FPS</span>
            </div>
          </div>

          {/* Barnes-Hut Theta */}
          <div style={styles.section}>
            <div style={styles.metric}>
              <span style={styles.label}>Barnes-Hut θ:</span>
              <span style={styles.value}>{metrics.barnesHutTheta.toFixed(2)}</span>
              <div style={styles.thetaBar}>
                <div 
                  style={{
                    ...styles.thetaFill,
                    width: `${(metrics.barnesHutTheta - 0.3) / 0.6 * 100}%`,
                    backgroundColor: `hsl(${120 - (metrics.barnesHutTheta - 0.3) / 0.6 * 120}, 70%, 50%)`
                  }}
                />
              </div>
            </div>
          </div>

          {/* Memory Pools */}
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Memory Pools</div>
            
            <div style={styles.poolMetric}>
              <span style={styles.poolLabel}>Octree Nodes:</span>
              <span style={styles.poolValue}>
                {metrics.memoryPools.octreeNodes.inUse}/{metrics.memoryPools.octreeNodes.available + metrics.memoryPools.octreeNodes.inUse}
              </span>
              <span style={styles.poolHitRate}>
                ({(metrics.memoryPools.octreeNodes.hitRate * 100).toFixed(1)}% hit)
              </span>
            </div>

            <div style={styles.poolMetric}>
              <span style={styles.poolLabel}>Geometries:</span>
              <span style={styles.poolValue}>
                {metrics.memoryPools.sphereGeometry.inUse}/{metrics.memoryPools.sphereGeometry.available + metrics.memoryPools.sphereGeometry.inUse}
              </span>
            </div>

            <div style={styles.poolMetric}>
              <span style={styles.poolLabel}>Meshes:</span>
              <span style={styles.poolValue}>
                {metrics.memoryPools.mesh.inUse}/{metrics.memoryPools.mesh.available + metrics.memoryPools.mesh.inUse}
              </span>
            </div>
          </div>

          {/* Total Memory */}
          <div style={styles.section}>
            <div style={styles.metric}>
              <span style={styles.label}>Total Memory:</span>
              <span style={styles.value}>{formatMemorySize(metrics.totalMemory)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    backgroundColor: 'rgba(20, 20, 20, 0.95)',
    color: '#fff',
    padding: 0,
    borderRadius: 8,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    fontFamily: 'monospace',
    fontSize: 12,
    minWidth: 280,
    zIndex: 1000,
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 15px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    cursor: 'pointer',
    userSelect: 'none'
  },
  title: {
    fontWeight: 'bold',
    fontSize: 14
  },
  collapseIcon: {
    fontSize: 10,
    opacity: 0.7
  },
  section: {
    padding: '10px 15px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
  },
  sectionTitle: {
    fontSize: 11,
    opacity: 0.7,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  modeIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: 10
  },
  modeIcon: {
    fontSize: 20
  },
  modeText: {
    fontWeight: 'bold',
    fontSize: 13,
    flex: 1
  },
  fps: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4ECDC4'
  },
  metric: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4
  },
  label: {
    opacity: 0.7,
    fontSize: 11
  },
  value: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#FFE66D'
  },
  thetaBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 4
  },
  thetaFill: {
    height: '100%',
    transition: 'width 0.2s ease, background-color 0.2s ease'
  },
  poolMetric: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
    fontSize: 11
  },
  poolLabel: {
    opacity: 0.7,
    flex: 1
  },
  poolValue: {
    fontWeight: 'bold',
    color: '#4ECDC4'
  },
  poolHitRate: {
    opacity: 0.7,
    fontSize: 10
  }
};