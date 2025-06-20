import React, { useState, useCallback, useMemo } from 'react';
import { GraphCanvas, GraphCanvasV2, lightTheme } from '../../src';
import { range } from 'd3-array';

export default {
  title: 'Demos/Performance',
  component: GraphCanvas
};

// Generate large datasets for performance testing
const generateLargeDataset = (nodeCount: number, edgeRatio = 0.5) => {
  const nodes = range(nodeCount).map(i => ({
    id: `n-${i}`,
    label: `Node ${i}`,
    // Add initial position to prevent undefined errors
    position: {
      x: (Math.random() - 0.5) * 1000,
      y: (Math.random() - 0.5) * 1000,
      z: (Math.random() - 0.5) * 1000
    },
    data: {
      priority: Math.floor(Math.random() * 10) + 1,
      category: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)]
    }
  }));

  const edgeCount = Math.floor(nodeCount * edgeRatio);
  const edges = range(edgeCount).map(i => {
    const sourceIndex = Math.floor(Math.random() * nodeCount);
    const targetIndex = Math.floor(Math.random() * nodeCount);
    
    return {
      id: `e-${i}`,
      source: `n-${sourceIndex}`,
      target: `n-${targetIndex}`,
      label: `Edge ${i}`
    };
  });

  return { nodes, edges };
};

// Small dataset (should work fine with default settings)
const smallData = generateLargeDataset(50, 0.3);

// Medium dataset (triggers auto-optimization)
const mediumData = generateLargeDataset(1200, 0.4);

// Large dataset (needs high performance)
const largeData = generateLargeDataset(5000, 0.3);

export const StandardGraphCanvas = () => {
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);

  return (
    <div>
      <h3>Standard GraphCanvas (Small Dataset - 50 nodes)</h3>
      <p>Regular GraphCanvas with small dataset. Performance should be smooth.</p>
      <GraphCanvas
        nodes={smallData.nodes}
        edges={smallData.edges}
        theme={lightTheme}
        layoutType="forceDirected2d"
        sizingType="none"
        labelType="auto"
      />
    </div>
  );
};

export const AutoOptimizedGraphCanvas = () => {
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);

  const handlePerformanceUpdate = useCallback((metrics: any) => {
    setPerformanceMetrics(metrics);
  }, []);

  return (
    <div>
      <h3>Auto-Optimized GraphCanvas (Medium Dataset - 1,200 nodes)</h3>
      <p>GraphCanvas with auto-optimization enabled. Should automatically detect large dataset and optimize.</p>
      
      {performanceMetrics && (
        <div style={{ 
          background: '#f0f0f0', 
          padding: '10px', 
          marginBottom: '10px', 
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '12px'
        }}>
          <strong>Performance Metrics:</strong><br/>
          FPS: {performanceMetrics.fps || 'N/A'}<br/>
          Memory Optimization: {performanceMetrics.memoryOptimized ? 'Enabled' : 'Disabled'}<br/>
          Instanced Rendering: {performanceMetrics.instancedRendering ? 'Enabled' : 'Disabled'}
        </div>
      )}

      <GraphCanvas
        nodes={mediumData.nodes}
        edges={mediumData.edges}
        theme={lightTheme}
        layoutType="forceDirected2d"
        sizingType="none"
        labelType="auto"
        // Auto-optimization props (should auto-enable for large datasets)
        enableMemoryOptimization="auto"
        enableInstancedRendering="auto"
        enablePerformanceMonitor={true}
        onPerformanceUpdate={handlePerformanceUpdate}
      />
    </div>
  );
};

export const HighPerformanceGraphCanvas = () => {
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);

  const handlePerformanceUpdate = useCallback((metrics: any) => {
    setPerformanceMetrics(metrics);
  }, []);

  return (
    <div>
      <h3>High-Performance GraphCanvas (Large Dataset - 5,000 nodes)</h3>
      <p>GraphCanvas with all performance optimizations explicitly enabled.</p>
      
      {performanceMetrics && (
        <div style={{ 
          background: '#e8f5e8', 
          padding: '10px', 
          marginBottom: '10px', 
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '12px'
        }}>
          <strong>Performance Metrics:</strong><br/>
          FPS: {performanceMetrics.fps || 'N/A'}<br/>
          Draw Calls: {performanceMetrics.drawCalls || 'N/A'}<br/>
          Memory Usage: {performanceMetrics.totalMemoryUsage ? `${Math.round(performanceMetrics.totalMemoryUsage / 1024 / 1024)}MB` : 'N/A'}<br/>
          Nodes Rendered: {performanceMetrics.nodeCount || 'N/A'}<br/>
          Edges Rendered: {performanceMetrics.edgeCount || 'N/A'}
        </div>
      )}

      <GraphCanvas
        nodes={largeData.nodes}
        edges={largeData.edges}
        theme={lightTheme}
        layoutType="forceDirected2d"
        sizingType="none"
        labelType="auto"
        // Explicit performance optimization
        optimizationLevel="HIGH_PERFORMANCE"
        enableMemoryOptimization={true}
        enableInstancedRendering={true}
        enablePerformanceMonitor={true}
        onPerformanceUpdate={handlePerformanceUpdate}
      />
    </div>
  );
};

export const GraphCanvasV2NextGen = () => {
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);

  const handlePerformanceUpdate = useCallback((metrics: any) => {
    setPerformanceMetrics(metrics);
  }, []);

  return (
    <div>
      <h3>GraphCanvasV2 - Next Generation (Large Dataset - 5,000 nodes)</h3>
      <p>GraphCanvasV2 with full Phase 2 optimizations for maximum performance.</p>
      
      {performanceMetrics && (
        <div style={{ 
          background: '#fff3cd', 
          padding: '10px', 
          marginBottom: '10px', 
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '12px'
        }}>
          <strong>GraphCanvasV2 Metrics:</strong><br/>
          FPS: {performanceMetrics.fps || 'N/A'}<br/>
          GPU Acceleration: {performanceMetrics.gpuAccelerated ? 'Enabled' : 'Disabled'}<br/>
          Shared Workers: {performanceMetrics.sharedWorkers ? 'Enabled' : 'Disabled'}<br/>
          Memory Budget: {performanceMetrics.memoryBudget || 'N/A'}
        </div>
      )}

      <GraphCanvasV2
        nodes={largeData.nodes}
        edges={largeData.edges}
        optimizationLevel="HIGH_PERFORMANCE"
        enableGPUAcceleration={true}
        enableInstancedRendering={true}
        enableSharedWorkers={true}
        enableMemoryOptimization={true}
        enablePerformanceMonitor={true}
        onPerformanceUpdate={handlePerformanceUpdate}
        width={800}
        height={600}
        backgroundColor="#ffffff"
        layoutType="forceDirected2d"
        cameraMode="orbit"
        enableInteraction={true}
      />
    </div>
  );
};

export const PerformanceComparison = () => {
  const [standardMetrics, setStandardMetrics] = useState<any>(null);
  const [optimizedMetrics, setOptimizedMetrics] = useState<any>(null);

  // Use medium dataset for fair comparison
  const comparisonData = useMemo(() => generateLargeDataset(2000, 0.4), []);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <div>
        <h3>Standard GraphCanvas</h3>
        <p>No performance optimizations</p>
        
        {standardMetrics && (
          <div style={{ 
            background: '#ffebee', 
            padding: '8px', 
            marginBottom: '10px', 
            borderRadius: '4px',
            fontSize: '11px'
          }}>
            FPS: {standardMetrics.fps || 'N/A'}<br/>
            Memory: {standardMetrics.totalMemoryUsage ? `${Math.round(standardMetrics.totalMemoryUsage / 1024 / 1024)}MB` : 'N/A'}
          </div>
        )}

        <div style={{ height: '400px' }}>
          <GraphCanvas
            nodes={comparisonData.nodes}
            edges={comparisonData.edges}
            theme={lightTheme}
            layoutType="forceDirected2d"
            sizingType="none"
            labelType="auto"
            enablePerformanceMonitor={true}
            onPerformanceUpdate={setStandardMetrics}
          />
        </div>
      </div>

      <div>
        <h3>Optimized GraphCanvas</h3>
        <p>Full performance optimizations enabled</p>
        
        {optimizedMetrics && (
          <div style={{ 
            background: '#e8f5e8', 
            padding: '8px', 
            marginBottom: '10px', 
            borderRadius: '4px',
            fontSize: '11px'
          }}>
            FPS: {optimizedMetrics.fps || 'N/A'}<br/>
            Memory: {optimizedMetrics.totalMemoryUsage ? `${Math.round(optimizedMetrics.totalMemoryUsage / 1024 / 1024)}MB` : 'N/A'}
          </div>
        )}

        <div style={{ height: '400px' }}>
          <GraphCanvas
            nodes={comparisonData.nodes}
            edges={comparisonData.edges}
            theme={lightTheme}
            layoutType="forceDirected2d"
            sizingType="none"
            labelType="auto"
            optimizationLevel="HIGH_PERFORMANCE"
            enableMemoryOptimization={true}
            enableInstancedRendering={true}
            enablePerformanceMonitor={true}
            onPerformanceUpdate={setOptimizedMetrics}
          />
        </div>
      </div>
    </div>
  );
};

export const OptimizationLevels = () => {
  const testData = useMemo(() => generateLargeDataset(1500, 0.4), []);

  return (
    <div>
      <h3>Optimization Level Comparison</h3>
      <p>Compare different optimization levels on the same dataset (1,500 nodes).</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px' }}>
        <div>
          <h4>Power Saving</h4>
          <p>Minimal optimizations for low-power devices</p>
          <div style={{ height: '300px' }}>
            <GraphCanvas
              nodes={testData.nodes}
              edges={testData.edges}
              theme={lightTheme}
              layoutType="forceDirected2d"
              optimizationLevel="POWER_SAVING"
              enablePerformanceMonitor={true}
            />
          </div>
        </div>

        <div>
          <h4>Balanced</h4>
          <p>Good performance with reasonable resource usage</p>
          <div style={{ height: '300px' }}>
            <GraphCanvas
              nodes={testData.nodes}
              edges={testData.edges}
              theme={lightTheme}
              layoutType="forceDirected2d"
              optimizationLevel="BALANCED"
              enablePerformanceMonitor={true}
            />
          </div>
        </div>

        <div>
          <h4>High Performance</h4>
          <p>Maximum performance optimizations</p>
          <div style={{ height: '300px' }}>
            <GraphCanvas
              nodes={testData.nodes}
              edges={testData.edges}
              theme={lightTheme}
              layoutType="forceDirected2d"
              optimizationLevel="HIGH_PERFORMANCE"
              enablePerformanceMonitor={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};