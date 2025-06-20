import React, { useEffect, useRef, useMemo } from 'react';
import { GraphCanvas } from 'reagraph';
import { GraphData } from '@/types/benchmark.types';

interface GraphRendererProps {
  data: GraphData;
  workerEnabled: boolean;
  onNodeCountChange?: (count: number) => void;
  onEdgeCountChange?: (count: number) => void;
  onWorkerStatusChange?: (status: 'enabled' | 'disabled' | 'failed' | 'initializing') => void;
  className?: string;
}

export const GraphRenderer: React.FC<GraphRendererProps> = ({
  data,
  workerEnabled,
  onNodeCountChange,
  onEdgeCountChange,
  onWorkerStatusChange,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

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
  }, [data.nodes.length, data.edges.length, onNodeCountChange, onEdgeCountChange]);

  // Monitor worker status
  useEffect(() => {
    if (workerEnabled) {
      onWorkerStatusChange?.('initializing');
      // Simulate worker initialization
      const timer = setTimeout(() => {
        onWorkerStatusChange?.('enabled');
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      onWorkerStatusChange?.('disabled');
    }
  }, [workerEnabled, onWorkerStatusChange]);

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

  const cameraConfig = useMemo(() => ({
    mode: 'orbit' as const,
    defaultPosition: {
      x: 0,
      y: 0,
      z: 100
    }
  }), []);

  return (
    <div 
      ref={containerRef}
      className={`graph-renderer ${className}`}
      style={styles.container}
    >
      <div style={styles.header}>
        <h3 style={styles.title}>
          Graph Visualization
        </h3>
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
        </div>
      </div>
      
      <div style={styles.graphContainer}>
        <GraphCanvas
          nodes={graphData.nodes}
          edges={graphData.edges}
          layoutType={layoutConfig.type}
          cameraMode={cameraConfig.mode}
          // Disable animations for performance testing
          animated={false}
          // Selection disabled for performance
          selections={[]}
          onNodeClick={() => {}} // Disable interactions for pure performance testing
          onCanvasClick={() => {}}
        />
      </div>
      
      {/* Performance overlay */}
      <div style={styles.overlay}>
        <div style={styles.overlayContent}>
          {workerEnabled ? (
            <div style={{...styles.indicator, background: '#00ff88'}}>
              Web Worker Active
            </div>
          ) : (
            <div style={{...styles.indicator, background: '#ff6600'}}>
              Main Thread Only
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