import React, { useEffect, useRef, useMemo, useState } from 'react';
import { GraphCanvas, GraphCanvasV2 } from 'reagraph';
import { GraphData } from '../types/benchmark.types';
import { WorkerManager, PositionUpdate } from '../utils/WorkerManager';
import { AdaptivePerformanceManager } from '../../../src/performance/AdaptivePerformanceManager';
import { AdvancedMemoryManager } from '../../../src/rendering/MemoryManager';
import { PerformanceHUD } from './PerformanceHUD';

interface GraphRendererProps {
  data: GraphData;
  workerEnabled: boolean;
  animated?: boolean;
  cameraMode?: 'pan' | 'rotate' | 'orbit';
  onNodeCountChange?: (count: number) => void;
  onEdgeCountChange?: (count: number) => void;
  onWorkerStatusChange?: (
    status: 'enabled' | 'disabled' | 'failed' | 'initializing'
  ) => void;
  className?: string;
  showPerformanceHUD?: boolean;
  targetFPS?: number;
}

export const GraphRenderer: React.FC<GraphRendererProps> = ({
  data,
  workerEnabled,
  animated = false,
  cameraMode = 'rotate',
  onNodeCountChange,
  onEdgeCountChange,
  onWorkerStatusChange,
  className = '',
  showPerformanceHUD = false,
  targetFPS = 60
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [workerManager, setWorkerManager] = useState<WorkerManager | null>(
    null
  );
  const [realWorkerStatus, setRealWorkerStatus] = useState<
    'enabled' | 'disabled' | 'failed' | 'initializing'
  >('disabled');
  const [positionUpdates, setPositionUpdates] = useState<PositionUpdate[]>([]);
  
  // Phase 3 optimization managers
  const [performanceManager] = useState(() => new AdaptivePerformanceManager(targetFPS));
  const graphCanvasRef = useRef<any>(null);

  // Convert our data format to ReaGraph format
  const graphData = useMemo(() => {
    const nodes = data.nodes.map(node => ({
      id: node.id,
      label: node.label || node.id,
      fill: node.color || '#4ecdc4',
      size: node.size || 1
    }));

    const edges = data.edges.map(edge => ({
      id: edge.id || `${edge.source}-${edge.target}`,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      fill: edge.color || '#666666',
      size: edge.size || 1
    }));

    return { nodes, edges };
  }, [data]);

  // Update parent component with current counts
  useEffect(() => {
    onNodeCountChange?.(data.nodes.length);
    onEdgeCountChange?.(data.edges.length);
  }, [
    data.nodes.length,
    data.edges.length,
    onNodeCountChange,
    onEdgeCountChange
  ]);

  // Real worker initialization and management
  useEffect(() => {
    let manager: WorkerManager | null = null;

    const initializeWorker = async () => {
      if (workerEnabled) {
        console.log('[GraphRenderer] Initializing real WorkerManager...');
        setRealWorkerStatus('initializing');
        onWorkerStatusChange?.('initializing');

        try {
          manager = new WorkerManager({
            nodeCount: data.nodes.length,
            onPositionUpdate: positions => {
              // Log only occasionally to avoid console spam
              if (Math.random() < 0.1) {
                // Log ~10% of updates
                console.log(
                  `[GraphRenderer] Received position update for ${positions.length} nodes from worker`
                );
              }
              setPositionUpdates(positions);
            },
            onStatusChange: status => {
              console.log(
                `[GraphRenderer] Worker status changed to: ${status}`
              );
              setRealWorkerStatus(status);
              onWorkerStatusChange?.(status);
            }
          });

          await manager.initialize();
          setWorkerManager(manager);

          console.log('[GraphRenderer] WorkerManager initialized successfully');
        } catch (error) {
          console.error(
            '[GraphRenderer] Failed to initialize WorkerManager:',
            error
          );
          setRealWorkerStatus('failed');
          onWorkerStatusChange?.('failed');
        }
      } else {
        // Clean up existing worker if disabled
        if (workerManager) {
          console.log('[GraphRenderer] Disposing WorkerManager...');
          workerManager.dispose();
          setWorkerManager(null);
        }
        setRealWorkerStatus('disabled');
        onWorkerStatusChange?.('disabled');
      }
    };

    initializeWorker();

    // Cleanup on unmount
    return () => {
      if (manager) {
        console.log('[GraphRenderer] Cleanup: Disposing WorkerManager...');
        manager.dispose();
      }
    };
  }, [workerEnabled, data.nodes.length, onWorkerStatusChange]);

  const layoutConfig = useMemo(() => {
    return {
      type: 'forceDirected2d' as const,
      settings: {
        // Force worker usage based on prop
        useWorker: workerEnabled,
        // Optimize for performance
        iterations: workerEnabled ? 300 : 100,
        repulsion: -10,
        attraction: 0.1,
        damping: 0.1
      }
    };
  }, [workerEnabled]);

  const cameraConfig = useMemo(
    () => ({
      mode: cameraMode,
      defaultPosition: {
        x: 0,
        y: 0,
        z: 100
      }
    }),
    [cameraMode]
  );

  return (
    <div
      ref={containerRef}
      className={`graph-renderer ${className}`}
      style={styles.container}
    >
      <div style={styles.header}>
        <h3 style={styles.title}>Graph Visualization</h3>
        <div style={styles.stats}>
          <span style={styles.stat}>
            {data.nodes.length.toLocaleString()} nodes
          </span>
          <span style={styles.stat}>
            {data.edges.length.toLocaleString()} edges
          </span>
          <span style={styles.stat}>
            Worker: {workerEnabled ? 'ON' : 'OFF'}
          </span>
          <span style={styles.stat}>
            Animated: {animated ? 'ON' : 'OFF'}
          </span>
        </div>
      </div>

      <div style={styles.graphContainer}>
        <GraphCanvasV2
          ref={graphCanvasRef}
          nodes={graphData.nodes}
          edges={graphData.edges}
          layoutType={layoutConfig.type}
          cameraMode={cameraConfig.mode}
          // Animation prop now configurable
          animated={animated}
          // Phase 2 performance optimizations
          optimizationLevel="HIGH_PERFORMANCE"
          enableGPUAcceleration="auto"
          enableInstancedRendering="auto"
          enableSharedWorkers={workerEnabled ? "auto" : false}
          enableMemoryOptimization="auto"
          enablePerformanceMonitor={true}
          onPerformanceUpdate={(metrics) => {
            // Update performance manager with metrics
            if (performanceManager && metrics) {
              const fps = metrics.recentStats?.averageFps || 60;
              performanceManager.updateMetrics({
                fps: fps,
                frameTime: 1000 / fps,
                nodeCount: data.nodes.length,
                edgeCount: data.edges.length
              });
            }
          }}
          // Disable interactions for pure performance testing
          onNodeClick={() => {}}
          onCanvasClick={() => {}}
          // Dimensions
          width={800}
          height={600}
          backgroundColor="#000000"
        />
        
        {/* Performance HUD overlay */}
        {showPerformanceHUD && (
          <PerformanceHUD
            performanceManager={performanceManager}
            position="top-right"
          />
        )}
      </div>

      {/* Performance overlay */}
      <div style={styles.overlay}>
        <div style={styles.overlayContent}>
          {workerEnabled ? (
            <div
              style={{
                ...styles.indicator,
                background:
                  realWorkerStatus === 'enabled'
                    ? '#00ff88'
                    : realWorkerStatus === 'initializing'
                      ? '#ffaa00'
                      : realWorkerStatus === 'failed'
                        ? '#ff0000'
                        : '#666666'
              }}
            >
              {realWorkerStatus === 'enabled'
                ? '✓ Web Worker Active'
                : realWorkerStatus === 'initializing'
                  ? '⟳ Initializing Worker...'
                  : realWorkerStatus === 'failed'
                    ? '✗ Worker Failed'
                    : 'Worker Disabled'}
            </div>
          ) : (
            <div style={{ ...styles.indicator, background: '#ff6600' }}>
              Main Thread Only
            </div>
          )}

          {/* Worker debug info */}
          {workerManager && realWorkerStatus === 'enabled' && (
            <div
              style={{
                ...styles.indicator,
                background: '#333333',
                fontSize: '0.7rem'
              }}
            >
              {positionUpdates.length > 0
                ? `${positionUpdates.length} positions received`
                : 'WorkerManager Ready'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
    background: '#0a0a0a',
    border: '1px solid #333',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    background: '#1a1a1a',
    borderBottom: '1px solid #333'
  },
  title: {
    margin: 0,
    color: '#ffffff',
    fontSize: '1.1rem',
    fontWeight: 'bold' as const
  },
  stats: {
    display: 'flex',
    gap: '1rem',
    fontSize: '0.9rem'
  },
  stat: {
    color: '#aaaaaa',
    fontFamily: 'monospace'
  },
  graphContainer: {
    flex: 1,
    position: 'relative' as const,
    minHeight: '400px'
  },
  overlay: {
    position: 'absolute' as const,
    top: '60px',
    left: '1rem',
    pointerEvents: 'none' as const,
    zIndex: 1000
  },
  overlayContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem'
  },
  indicator: {
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    color: '#ffffff',
    fontSize: '0.8rem',
    fontWeight: 'bold' as const,
    textAlign: 'center' as const,
    minWidth: '120px'
  }
};
