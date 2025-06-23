import React, { useState, useCallback, useMemo } from 'react';
import { GraphCanvasV2 } from '../../src';
import { range } from 'd3-array';

export default {
  title: 'Demos/GraphCanvasV2 - Next Generation',
  component: GraphCanvasV2
};

// Generate datasets for GraphCanvasV2 testing
const generateDataset = (nodeCount: number, edgeRatio = 0.5, withClusters = false) => {
  const nodes = range(nodeCount).map(i => {
    const clusterInfo = withClusters ? {
      cluster: `cluster-${Math.floor(i / 100)}`,
      clusterColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][Math.floor(i / 100) % 5]
    } : {};

    return {
      id: `n-${i}`,
      label: `Node ${i}`,
      size: Math.random() * 10 + 5,
      fill: clusterInfo.clusterColor || '#4ECDC4',
      // Add initial position in InternalGraphNode format
      position: {
        x: (Math.random() - 0.5) * 1000,
        y: (Math.random() - 0.5) * 1000,
        z: (Math.random() - 0.5) * 200,
        vx: 0,
        vy: 0,
        vz: 0
      },
      data: {
        priority: Math.floor(Math.random() * 10) + 1,
        category: ['A', 'B', 'C', 'D', 'E'][Math.floor(Math.random() * 5)],
        ...clusterInfo
      }
    };
  });

  const edgeCount = Math.floor(nodeCount * edgeRatio);
  const edges = range(edgeCount).map(i => {
    const sourceIndex = Math.floor(Math.random() * nodeCount);
    const targetIndex = Math.floor(Math.random() * nodeCount);
    
    return {
      id: `e-${i}`,
      source: `n-${sourceIndex}`,
      target: `n-${targetIndex}`,
      label: `Edge ${i}`,
      size: Math.random() * 3 + 1
    };
  });

  return { nodes, edges };
};

export const HighPerformanceMode = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const largeData = useMemo(() => generateDataset(5000, 0.3), []); // Reduced from 10k to 5k for stability

  const handlePerformanceUpdate = useCallback((metrics: any) => {
    setMetrics(metrics);
  }, []);

  return (
    <div>
      <h3>GraphCanvasV2 - High Performance Mode</h3>
      <p>5,000 nodes with full GPU acceleration and optimization</p>
      
      {metrics && (
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          color: 'white',
          padding: '15px', 
          marginBottom: '15px', 
          borderRadius: '8px',
          fontFamily: 'monospace',
          fontSize: '12px'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            <div>
              <strong>Rendering</strong><br/>
              FPS: {metrics.fps || 'N/A'}<br/>
              Draw Calls: {metrics.drawCalls || 'N/A'}<br/>
              Triangles: {metrics.triangles || 'N/A'}
            </div>
            <div>
              <strong>Memory</strong><br/>
              Total: {metrics.totalMemoryUsage ? `${Math.round(metrics.totalMemoryUsage / 1024 / 1024)}MB` : 'N/A'}<br/>
              GPU: {metrics.gpuMemoryUsage ? `${Math.round(metrics.gpuMemoryUsage / 1024 / 1024)}MB` : 'N/A'}<br/>
              Nodes: {metrics.nodeBufferSize || 'N/A'}
            </div>
            <div>
              <strong>Compute</strong><br/>
              Layout: {metrics.layoutComputeTime ? `${metrics.layoutComputeTime.toFixed(2)}ms` : 'N/A'}<br/>
              Forces: {metrics.forceComputeTime ? `${metrics.forceComputeTime.toFixed(2)}ms` : 'N/A'}<br/>
              GPU: {metrics.gpuComputeTime ? `${metrics.gpuComputeTime.toFixed(2)}ms` : 'N/A'}
            </div>
            <div>
              <strong>Graph</strong><br/>
              Nodes: {metrics.nodeCount || 'N/A'}<br/>
              Edges: {metrics.edgeCount || 'N/A'}<br/>
              Visible: {metrics.visibleNodes || 'N/A'}
            </div>
          </div>
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
        backgroundColor="#f8f9fa"
        layoutType="forceDirected2d"
        cameraMode="orbit"
        enableInteraction={true}
      />
    </div>
  );
};

export const BalancedMode = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const mediumData = useMemo(() => generateDataset(2500, 0.4, true), []); // Reduced from 5k to 2.5k

  return (
    <div>
      <h3>GraphCanvasV2 - Balanced Mode</h3>
      <p>2,500 nodes with balanced performance and power consumption</p>
      
      {metrics && (
        <div style={{ 
          background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)', 
          color: 'white',
          padding: '12px', 
          marginBottom: '12px', 
          borderRadius: '6px',
          fontFamily: 'monospace',
          fontSize: '11px'
        }}>
          <strong>Balanced Performance Metrics:</strong><br/>
          FPS: {metrics.fps || 'N/A'} | 
          Memory: {metrics.totalMemoryUsage ? `${Math.round(metrics.totalMemoryUsage / 1024 / 1024)}MB` : 'N/A'} | 
          GPU Acceleration: {metrics.gpuAccelerated ? 'On' : 'Off'} |
          Shared Workers: {metrics.sharedWorkers ? 'Active' : 'Inactive'}
        </div>
      )}

      <GraphCanvasV2
        nodes={mediumData.nodes}
        edges={mediumData.edges}
        optimizationLevel="BALANCED"
        enableGPUAcceleration="auto"
        enableInstancedRendering="auto"
        enableSharedWorkers="auto"
        enableMemoryOptimization="auto"
        enablePerformanceMonitor={true}
        onPerformanceUpdate={setMetrics}
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

export const PowerSavingMode = () => {
  const smallData = useMemo(() => generateDataset(1000, 0.3), []);

  return (
    <div>
      <h3>GraphCanvasV2 - Power Saving Mode</h3>
      <p>1,000 nodes optimized for low-power devices and battery life</p>
      
      <GraphCanvasV2
        nodes={smallData.nodes}
        edges={smallData.edges}
        optimizationLevel="POWER_SAVING"
        enableGPUAcceleration={false}
        enableInstancedRendering={false}
        enableSharedWorkers={false}
        enableMemoryOptimization={true}
        enablePerformanceMonitor={false}
        width={800}
        height={600}
        backgroundColor="#f8f9fa"
        layoutType="forceDirected2d"
        cameraMode="orbit"
        enableInteraction={true}
      />
    </div>
  );
};

export const FeatureShowcase = () => {
  const showcaseData = useMemo(() => generateDataset(2000, 0.4, true), []);

  return (
    <div>
      <h3>GraphCanvasV2 - Feature Showcase</h3>
      <p>Demonstrating advanced GraphCanvasV2 features with 2,000 clustered nodes</p>
      
      <div style={{ 
        background: '#e3f2fd', 
        padding: '15px', 
        marginBottom: '15px', 
        borderRadius: '8px',
        border: '1px solid #90caf9'
      }}>
        <strong>Features Enabled:</strong>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>🚀 GPU-accelerated force calculations</li>
          <li>🧮 Instanced rendering for massive draw call reduction</li>
          <li>🧠 Shared web workers for layout computation</li>
          <li>💾 Advanced memory management with TypedArrays</li>
          <li>📊 Real-time performance monitoring</li>
          <li>🎯 Automatic LOD (Level of Detail) management</li>
          <li>👁️ Viewport culling for off-screen elements</li>
        </ul>
      </div>

      <GraphCanvasV2
        nodes={showcaseData.nodes}
        edges={showcaseData.edges}
        optimizationLevel="HIGH_PERFORMANCE"
        enableGPUAcceleration={true}
        enableInstancedRendering={true}
        enableSharedWorkers={true}
        enableMemoryOptimization={true}
        enablePerformanceMonitor={true}
        width={800}
        height={600}
        backgroundColor="#ffffff"
        layoutType="forceDirected2d"
        cameraMode="orbit"
        enableInteraction={true}
        onNodeClick={(node) => console.log('Node clicked:', node)}
        onEdgeClick={(edge) => console.log('Edge clicked:', edge)}
        onCanvasClick={() => console.log('Canvas clicked')}
      />
    </div>
  );
};

export const StressTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [stressMetrics, setStressMetrics] = useState<any>(null);
  const [nodeCount, setNodeCount] = useState(2000); // Start with smaller default

  const stressData = useMemo(() => {
    setIsLoading(true);
    const data = generateDataset(nodeCount, 0.3);
    setTimeout(() => setIsLoading(false), 100);
    return data;
  }, [nodeCount]);

  return (
    <div>
      <h3>GraphCanvasV2 - Stress Test</h3>
      <p>Test GraphCanvasV2 performance limits</p>
      
      <div style={{ marginBottom: '15px' }}>
        <label>
          Node Count: 
          <select 
            value={nodeCount} 
            onChange={(e) => setNodeCount(Number(e.target.value))}
            style={{ marginLeft: '10px', padding: '5px' }}
          >
            <option value={500}>500 nodes</option>
            <option value={1000}>1,000 nodes</option>
            <option value={2000}>2,000 nodes</option>
            <option value={5000}>5,000 nodes</option>
            <option value={10000}>10,000 nodes (High-end)</option>
          </select>
        </label>
      </div>

      {stressMetrics && (
        <div style={{ 
          background: nodeCount > 5000 ? '#ffebee' : '#e8f5e8', 
          padding: '12px', 
          marginBottom: '12px', 
          borderRadius: '6px',
          fontFamily: 'monospace',
          fontSize: '11px'
        }}>
          <strong>Stress Test Results ({nodeCount.toLocaleString()} nodes):</strong><br/>
          FPS: {stressMetrics.fps || 'N/A'} | 
          Memory: {stressMetrics.totalMemoryUsage ? `${Math.round(stressMetrics.totalMemoryUsage / 1024 / 1024)}MB` : 'N/A'} | 
          Draw Calls: {stressMetrics.drawCalls || 'N/A'} |
          Performance: {stressMetrics.fps > 30 ? '🟢 Excellent' : stressMetrics.fps > 15 ? '🟡 Good' : '🔴 Challenging'}
        </div>
      )}

      {isLoading ? (
        <div style={{ 
          height: '600px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: '#f5f5f5',
          borderRadius: '8px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div>🔄 Generating {nodeCount.toLocaleString()} nodes...</div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
              This may take a moment for large datasets
            </div>
          </div>
        </div>
      ) : (
        <GraphCanvasV2
          nodes={stressData.nodes}
          edges={stressData.edges}
          optimizationLevel="HIGH_PERFORMANCE"
          enableGPUAcceleration={true}
          enableInstancedRendering={true}
          enableSharedWorkers={true}
          enableMemoryOptimization={true}
          enablePerformanceMonitor={true}
          onPerformanceUpdate={setStressMetrics}
          width={800}
          height={600}
          backgroundColor="#ffffff"
          layoutType="forceDirected2d"
          cameraMode="orbit"
          enableInteraction={true}
        />
      )}
    </div>
  );
};