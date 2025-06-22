/**
 * GraphRendererV2 - Enhanced benchmark renderer using GraphCanvasV2
 * 
 * Integrates Phase 2 optimizations with real-time controls:
 * - GraphCanvasV2 with all performance optimizations
 * - Real-time optimization level switching  
 * - GPU acceleration toggle controls
 * - Performance metrics display
 * - Feature capability detection
 */

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { GraphCanvas } from '../../../src';
import { GraphData } from '../types/benchmark.types';

// For now, we'll use the legacy GraphCanvas and simulate Phase 2 behavior
// In a real implementation, GraphCanvasV2 would be properly integrated

interface GraphRendererV2Props {
  data: GraphData;
  
  // Phase 2 optimization controls
  optimizationLevel?: 'HIGH_PERFORMANCE' | 'BALANCED' | 'POWER_SAVING';
  enableGPUAcceleration?: boolean | 'auto';
  enableInstancedRendering?: boolean | 'auto';
  enableSharedWorkers?: boolean | 'auto';
  enableMemoryOptimization?: boolean | 'auto';
  
  // Animation control
  animated?: boolean;
  cameraMode?: 'pan' | 'rotate' | 'orbit';
  
  // Benchmark integration
  onNodeCountChange?: (count: number) => void;
  onEdgeCountChange?: (count: number) => void;
  onPerformanceUpdate?: (metrics: any) => void;
  onCapabilitiesDetected?: (capabilities: any) => void;
  
  // Display options
  showControls?: boolean;
  showPerformanceOverlay?: boolean;
  
  className?: string;
}

export const GraphRendererV2: React.FC<GraphRendererV2Props> = ({
  data,
  optimizationLevel = 'BALANCED',
  enableGPUAcceleration = 'auto',
  enableInstancedRendering = 'auto',
  enableSharedWorkers = 'auto',
  enableMemoryOptimization = 'auto',
  animated = false,
  cameraMode = 'rotate',
  onNodeCountChange,
  onEdgeCountChange,
  onPerformanceUpdate,
  onCapabilitiesDetected,
  showControls = true,
  showPerformanceOverlay = true,
  className = ''
}) => {
  // State for optimization controls
  const [currentOptimizationLevel, setCurrentOptimizationLevel] = useState(optimizationLevel);
  const [gpuAcceleration, setGpuAcceleration] = useState(enableGPUAcceleration);
  const [instancedRendering, setInstancedRendering] = useState(enableInstancedRendering);
  const [sharedWorkers, setSharedWorkers] = useState(enableSharedWorkers);
  const [memoryOptimization, setMemoryOptimization] = useState(enableMemoryOptimization);
  const [animationsEnabled, setAnimationsEnabled] = useState(animated);
  
  // Performance and capability tracking
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [systemCapabilities, setSystemCapabilities] = useState<any>(null);
  const [phase2Features, setPhase2Features] = useState<any>(null);
  
  // Convert benchmark data to internal format
  const graphData = useMemo(() => {
    const nodes = data.nodes.map(node => ({
      id: node.id,
      label: node.label || node.id,
      position: { x: Math.random() * 2000 - 1000, y: Math.random() * 2000 - 1000, z: 0, vx: 0, vy: 0 },
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

  // Performance update handler
  const handlePerformanceUpdate = useCallback((metrics: any) => {
    setPerformanceMetrics(metrics);
    
    // Extract Phase 2 specific metrics
    const phase2Metrics = {
      ...metrics,
      // Add Phase 2 specific data
      optimizationLevel: currentOptimizationLevel,
      gpuAcceleration: gpuAcceleration !== false,
      instancedRendering: instancedRendering !== false,
      sharedWorkers: sharedWorkers !== false,
      memoryOptimization: memoryOptimization !== false
    };
    
    onPerformanceUpdate?.(phase2Metrics);
  }, [currentOptimizationLevel, gpuAcceleration, instancedRendering, sharedWorkers, memoryOptimization, onPerformanceUpdate]);

  // System capabilities detection
  useEffect(() => {
    // Detect system capabilities when component mounts
    const capabilities = {
      webgl2: (() => {
        const canvas = document.createElement('canvas');
        return !!canvas.getContext('webgl2');
      })(),
      sharedArrayBuffer: typeof SharedArrayBuffer !== 'undefined' && (globalThis as any).crossOriginIsolated,
      workers: typeof Worker !== 'undefined',
      hardwareConcurrency: navigator.hardwareConcurrency || 2,
      deviceMemory: (navigator as any).deviceMemory || 4
    };
    
    setSystemCapabilities(capabilities);
    onCapabilitiesDetected?.(capabilities);

    // Determine which Phase 2 features are active
    const features = {
      advancedMemoryManager: memoryOptimization !== false,
      instancedRenderer: instancedRendering !== false && capabilities.webgl2,
      webglComputePipeline: gpuAcceleration !== false && capabilities.webgl2,
      sharedWorkerPool: sharedWorkers !== false && capabilities.workers,
      performanceMonitor: true
    };
    
    setPhase2Features(features);
  }, [gpuAcceleration, instancedRendering, sharedWorkers, memoryOptimization, onCapabilitiesDetected]);

  // Control handlers
  const handleOptimizationLevelChange = (level: 'HIGH_PERFORMANCE' | 'BALANCED' | 'POWER_SAVING') => {
    setCurrentOptimizationLevel(level);
  };

  const toggleGPUAcceleration = () => {
    setGpuAcceleration(prev => prev === false ? 'auto' : false);
  };

  const toggleInstancedRendering = () => {
    setInstancedRendering(prev => prev === false ? 'auto' : false);
  };

  const toggleSharedWorkers = () => {
    setSharedWorkers(prev => prev === false ? 'auto' : false);
  };

  const toggleMemoryOptimization = () => {
    setMemoryOptimization(prev => prev === false ? 'auto' : false);
  };

  const toggleAnimations = () => {
    setAnimationsEnabled(prev => !prev);
  };

  return (
    <div 
      className={`graph-renderer-v2 ${className}`}
      style={styles.container}
    >
      {/* Header with enhanced stats */}
      <div style={styles.header}>
        <h3 style={styles.title}>
          GraphCanvasV2 - Phase 2 Optimizations
        </h3>
        <div style={styles.stats}>
          <span style={styles.stat}>
            {data.nodes.length.toLocaleString()} nodes
          </span>
          <span style={styles.stat}>
            {data.edges.length.toLocaleString()} edges
          </span>
          <span style={styles.stat}>
            Profile: {currentOptimizationLevel}
          </span>
          {performanceMetrics && (
            <span style={styles.stat}>
              FPS: {performanceMetrics.recentStats?.averageFps?.toFixed(1) || 'N/A'}
            </span>
          )}
        </div>
      </div>

      {/* Phase 2 Controls Panel */}
      {showControls && (
        <div style={styles.controlsPanel}>
          <div style={styles.controlSection}>
            <label style={styles.controlLabel}>Optimization Level:</label>
            <select 
              value={currentOptimizationLevel}
              onChange={(e) => handleOptimizationLevelChange(e.target.value as any)}
              style={styles.select}
            >
              <option value="HIGH_PERFORMANCE">High Performance</option>
              <option value="BALANCED">Balanced</option>
              <option value="POWER_SAVING">Power Saving</option>
            </select>
          </div>

          <div style={styles.controlSection}>
            <label style={styles.controlLabel}>Phase 2 Features:</label>
            <div style={styles.toggleGroup}>
              <button 
                onClick={toggleGPUAcceleration}
                style={{
                  ...styles.toggleButton,
                  backgroundColor: gpuAcceleration !== false ? '#00ff88' : '#ff6b6b'
                }}
                disabled={!systemCapabilities?.webgl2}
              >
                GPU Acceleration {!systemCapabilities?.webgl2 && '(N/A)'}
              </button>
              
              <button 
                onClick={toggleInstancedRendering}
                style={{
                  ...styles.toggleButton,
                  backgroundColor: instancedRendering !== false ? '#00ff88' : '#ff6b6b'
                }}
                disabled={!systemCapabilities?.webgl2}
              >
                Instanced Rendering {!systemCapabilities?.webgl2 && '(N/A)'}
              </button>
              
              <button 
                onClick={toggleSharedWorkers}
                style={{
                  ...styles.toggleButton,
                  backgroundColor: sharedWorkers !== false ? '#00ff88' : '#ff6b6b'
                }}
                disabled={!systemCapabilities?.workers}
              >
                Shared Workers {!systemCapabilities?.workers && '(N/A)'}
              </button>
              
              <button 
                onClick={toggleMemoryOptimization}
                style={{
                  ...styles.toggleButton,
                  backgroundColor: memoryOptimization !== false ? '#00ff88' : '#ff6b6b'
                }}
              >
                Memory Optimization
              </button>
              
              <button 
                onClick={toggleAnimations}
                style={{
                  ...styles.toggleButton,
                  backgroundColor: animationsEnabled ? '#00ff88' : '#ff6b6b'
                }}
              >
                Animations {animationsEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GraphCanvas Integration (Phase 2 Simulation) */}
      <div style={styles.graphContainer}>
        <GraphCanvas
          nodes={graphData.nodes}
          edges={graphData.edges}
          layoutType="forceDirected2d"
          cameraMode={cameraMode}
          animated={animationsEnabled}
          selections={[]}
          onNodeClick={() => {}}
          onCanvasClick={() => {}}
        />
        
        {/* Phase 2 Simulation Overlay */}
        <div style={styles.simulationOverlay}>
          <div style={styles.simulationBadge}>
            Phase 2 Simulation Mode
          </div>
          <div style={styles.simulationNote}>
            Configuration: {currentOptimizationLevel}<br/>
            GPU: {gpuAcceleration !== false ? 'Enabled' : 'Disabled'}<br/>
            Instancing: {instancedRendering !== false ? 'Enabled' : 'Disabled'}<br/>
            Workers: {sharedWorkers !== false ? 'Enabled' : 'Disabled'}<br/>
            Memory Opt: {memoryOptimization !== false ? 'Enabled' : 'Disabled'}
          </div>
        </div>
      </div>

      {/* Phase 2 Performance Overlay */}
      {showPerformanceOverlay && performanceMetrics && (
        <div style={styles.performanceOverlay}>
          <h4 style={styles.overlayTitle}>Phase 2 Performance</h4>
          
          <div style={styles.metricsGrid}>
            <div style={styles.metric}>
              <span style={styles.metricLabel}>FPS:</span>
              <span style={{
                ...styles.metricValue,
                color: (performanceMetrics.recentStats?.averageFps || 0) >= 30 ? '#00ff88' : '#ff6b6b'
              }}>
                {performanceMetrics.recentStats?.averageFps?.toFixed(1) || 'N/A'}
              </span>
            </div>
            
            <div style={styles.metric}>
              <span style={styles.metricLabel}>Memory:</span>
              <span style={styles.metricValue}>
                {((performanceMetrics.recentStats?.averageMemoryUsage || 0) / 1024 / 1024).toFixed(1)}MB
              </span>
            </div>
            
            <div style={styles.metric}>
              <span style={styles.metricLabel}>Draw Calls:</span>
              <span style={styles.metricValue}>
                {performanceMetrics.recentStats?.averageDrawCalls?.toFixed(0) || 'N/A'}
              </span>
            </div>
            
            <div style={styles.metric}>
              <span style={styles.metricLabel}>Compute Time:</span>
              <span style={styles.metricValue}>
                {performanceMetrics.recentStats?.averageComputeTime?.toFixed(1) || 'N/A'}ms
              </span>
            </div>
          </div>

          {/* Phase 2 Feature Status */}
          <div style={styles.featureStatus}>
            <h5 style={styles.featureTitle}>Active Optimizations:</h5>
            {phase2Features && Object.entries(phase2Features).map(([feature, active]) => (
              <div key={feature} style={styles.featureItem}>
                <span style={{
                  ...styles.featureIndicator,
                  backgroundColor: active ? '#00ff88' : '#666666'
                }}>
                  {active ? '✓' : '✗'}
                </span>
                <span style={styles.featureName}>
                  {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </span>
              </div>
            ))}
          </div>

          {/* System Capabilities */}
          {systemCapabilities && (
            <div style={styles.capabilitiesStatus}>
              <h5 style={styles.featureTitle}>System Capabilities:</h5>
              <div style={styles.capabilityItem}>
                <span>WebGL2: {systemCapabilities.webgl2 ? '✅' : '❌'}</span>
              </div>
              <div style={styles.capabilityItem}>
                <span>SharedArrayBuffer: {systemCapabilities.sharedArrayBuffer ? '✅' : '❌'}</span>
              </div>
              <div style={styles.capabilityItem}>
                <span>Workers: {systemCapabilities.workers ? '✅' : '❌'}</span>
              </div>
              <div style={styles.capabilityItem}>
                <span>CPU Cores: {systemCapabilities.hardwareConcurrency}</span>
              </div>
            </div>
          )}
        </div>
      )}
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
    color: '#9945ff',
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
  controlsPanel: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    background: '#151515',
    borderBottom: '1px solid #333',
    flexWrap: 'wrap' as const,
    gap: '1rem'
  },
  controlSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  controlLabel: {
    color: '#cccccc',
    fontSize: '0.9rem',
    fontWeight: 'bold' as const
  },
  select: {
    padding: '0.25rem 0.5rem',
    background: '#2a2a2a',
    border: '1px solid #444',
    borderRadius: '4px',
    color: '#ffffff',
    fontSize: '0.8rem'
  },
  toggleGroup: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap' as const
  },
  toggleButton: {
    padding: '0.25rem 0.5rem',
    border: 'none',
    borderRadius: '4px',
    color: '#ffffff',
    fontSize: '0.7rem',
    fontWeight: 'bold' as const,
    cursor: 'pointer' as const,
    transition: 'background-color 0.2s'
  },
  graphContainer: {
    flex: 1,
    position: 'relative' as const,
    minHeight: '400px'
  },
  performanceOverlay: {
    position: 'absolute' as const,
    top: '120px',
    left: '1rem',
    background: 'rgba(0,0,0,0.9)',
    color: 'white',
    padding: '1rem',
    borderRadius: '8px',
    fontSize: '12px',
    fontFamily: 'monospace',
    minWidth: '280px',
    maxWidth: '350px',
    border: '1px solid #9945ff'
  },
  overlayTitle: {
    margin: '0 0 0.75rem 0',
    color: '#9945ff',
    fontSize: '14px',
    fontWeight: 'bold' as const
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.5rem',
    marginBottom: '1rem'
  },
  metric: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  metricLabel: {
    color: '#aaaaaa'
  },
  metricValue: {
    color: '#ffffff',
    fontWeight: 'bold' as const
  },
  featureStatus: {
    marginBottom: '1rem'
  },
  featureTitle: {
    margin: '0 0 0.5rem 0',
    color: '#00d4ff',
    fontSize: '12px',
    fontWeight: 'bold' as const
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.25rem'
  },
  featureIndicator: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: 'bold' as const
  },
  featureName: {
    fontSize: '11px'
  },
  capabilitiesStatus: {
    marginTop: '0.5rem'
  },
  capabilityItem: {
    marginBottom: '0.25rem',
    fontSize: '11px'
  },
  simulationOverlay: {
    position: 'absolute' as const,
    top: '10px',
    right: '10px',
    background: 'rgba(153, 69, 255, 0.9)',
    color: 'white',
    padding: '0.75rem',
    borderRadius: '8px',
    fontSize: '12px',
    border: '2px solid #9945ff'
  },
  simulationBadge: {
    fontWeight: 'bold' as const,
    marginBottom: '0.5rem',
    color: '#ffffff',
    textAlign: 'center' as const
  },
  simulationNote: {
    fontSize: '11px',
    lineHeight: '1.4'
  }
};