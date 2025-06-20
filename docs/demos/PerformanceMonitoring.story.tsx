import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { GraphCanvas, usePerformanceContext, lightTheme } from '../../src';
import { range } from 'd3-array';

export default {
  title: 'Demos/Performance Monitoring',
  component: GraphCanvas
};

// Generate datasets for monitoring demos
const generateMonitoringDataset = (nodeCount: number, edgeRatio = 0.4) => {
  const nodes = range(nodeCount).map(i => ({
    id: `n-${i}`,
    label: `Node ${i}`,
    size: Math.random() * 15 + 5,
    // Add initial position to prevent undefined errors
    position: {
      x: (Math.random() - 0.5) * 1000,
      y: (Math.random() - 0.5) * 1000,
      z: (Math.random() - 0.5) * 1000
    },
    data: {
      priority: Math.floor(Math.random() * 10) + 1,
      category: ['Critical', 'High', 'Medium', 'Low'][Math.floor(Math.random() * 4)],
      load: Math.random() * 100
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
      label: `Connection ${i}`,
      size: Math.random() * 3 + 1
    };
  });

  return { nodes, edges };
};

// Real-time performance dashboard component
const PerformanceDashboard = ({ metrics }: { metrics: any }) => {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (metrics) {
      setHistory(prev => [...prev.slice(-19), { ...metrics, timestamp: Date.now() }]);
    }
  }, [metrics]);

  if (!metrics) return null;

  const averageFps = history.length > 0 ? 
    history.reduce((sum, m) => sum + (m.fps || 0), 0) / history.length : 0;

  const getPerformanceStatus = (fps: number) => {
    if (fps >= 50) return { status: 'Excellent', color: '#4caf50', emoji: '🟢' };
    if (fps >= 30) return { status: 'Good', color: '#ff9800', emoji: '🟡' };
    if (fps >= 15) return { status: 'Fair', color: '#f44336', emoji: '🟠' };
    return { status: 'Poor', color: '#d32f2f', emoji: '🔴' };
  };

  const perfStatus = getPerformanceStatus(metrics.fps || 0);

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
      color: 'white',
      padding: '20px', 
      marginBottom: '20px', 
      borderRadius: '12px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h4 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>
        📊 Real-Time Performance Dashboard
      </h4>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
        {/* FPS Section */}
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px' }}>
          <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '5px' }}>FRAME RATE</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {perfStatus.emoji} {metrics.fps?.toFixed(1) || 'N/A'} FPS
          </div>
          <div style={{ fontSize: '11px', opacity: 0.7 }}>
            Avg: {averageFps.toFixed(1)} | Status: {perfStatus.status}
          </div>
        </div>

        {/* Memory Section */}
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px' }}>
          <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '5px' }}>MEMORY USAGE</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
            {metrics.totalMemoryUsage ? `${Math.round(metrics.totalMemoryUsage / 1024 / 1024)}MB` : 'N/A'}
          </div>
          <div style={{ fontSize: '11px', opacity: 0.7 }}>
            GPU: {metrics.gpuMemoryUsage ? `${Math.round(metrics.gpuMemoryUsage / 1024 / 1024)}MB` : 'N/A'}
          </div>
        </div>

        {/* Rendering Section */}
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px' }}>
          <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '5px' }}>RENDERING</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
            {metrics.drawCalls || 'N/A'} Calls
          </div>
          <div style={{ fontSize: '11px', opacity: 0.7 }}>
            Triangles: {metrics.triangles ? metrics.triangles.toLocaleString() : 'N/A'}
          </div>
        </div>

        {/* Graph Stats */}
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px' }}>
          <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '5px' }}>GRAPH DATA</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
            {metrics.nodeCount || 'N/A'} Nodes
          </div>
          <div style={{ fontSize: '11px', opacity: 0.7 }}>
            Edges: {metrics.edgeCount || 'N/A'} | Visible: {metrics.visibleNodes || 'N/A'}
          </div>
        </div>
      </div>

      {/* Performance Timeline */}
      {history.length > 5 && (
        <div style={{ marginTop: '15px' }}>
          <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '8px' }}>FPS TIMELINE</div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'end', 
            height: '40px', 
            background: 'rgba(255,255,255,0.1)', 
            borderRadius: '4px',
            padding: '5px'
          }}>
            {history.slice(-20).map((h, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${Math.min((h.fps || 0) / 60 * 100, 100)}%`,
                  background: getPerformanceStatus(h.fps || 0).color,
                  marginRight: '1px',
                  borderRadius: '1px'
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const RealTimeMonitoring = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const data = useMemo(() => generateMonitoringDataset(2000, 0.4), []);

  const handlePerformanceUpdate = useCallback((newMetrics: any) => {
    if (isMonitoring) {
      setMetrics(newMetrics);
    }
  }, [isMonitoring]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3>Real-Time Performance Monitoring</h3>
        <button 
          onClick={() => setIsMonitoring(!isMonitoring)}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: isMonitoring ? '#f44336' : '#4caf50',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          {isMonitoring ? '⏸️ Pause' : '▶️ Resume'} Monitoring
        </button>
      </div>
      
      <p>Live performance metrics with historical data and status indicators</p>
      
      <PerformanceDashboard metrics={metrics} />

      <GraphCanvas
        nodes={data.nodes}
        edges={data.edges}
        theme={lightTheme}
        layoutType="forceDirected2d"
        sizingType="none"
        labelType="auto"
        optimizationLevel="BALANCED"
        enableMemoryOptimization={true}
        enableInstancedRendering={true}
        enablePerformanceMonitor={true}
        onPerformanceUpdate={handlePerformanceUpdate}
      />
    </div>
  );
};

export const AutoOptimizationDemo = () => {
  const [currentSize, setCurrentSize] = useState(500);
  const [metrics, setMetrics] = useState<any>(null);
  const [optimizations, setOptimizations] = useState<any>({});

  const data = useMemo(() => generateMonitoringDataset(currentSize, 0.4), [currentSize]);

  const handlePerformanceUpdate = useCallback((newMetrics: any) => {
    setMetrics(newMetrics);
    // Track which optimizations are active
    setOptimizations({
      memoryOptimized: newMetrics.memoryOptimized || false,
      instancedRendering: newMetrics.instancedRendering || false,
      autoDetected: currentSize > 1000
    });
  }, [currentSize]);

  const sizingOptions = [
    { value: 100, label: '100 nodes (Small)', color: '#4caf50' },
    { value: 500, label: '500 nodes (Medium)', color: '#ff9800' },
    { value: 1200, label: '1,200 nodes (Large - Auto-Opt)', color: '#f44336' },
    { value: 3000, label: '3,000 nodes (Very Large)', color: '#9c27b0' }
  ];

  const currentOption = sizingOptions.find(opt => opt.value === currentSize);

  return (
    <div>
      <h3>Auto-Optimization Detection Demo</h3>
      <p>Watch how GraphCanvas automatically enables optimizations for larger datasets</p>
      
      <div style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          <strong>Dataset Size:</strong>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {sizingOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setCurrentSize(option.value)}
              style={{
                padding: '10px 15px',
                borderRadius: '6px',
                border: currentSize === option.value ? '2px solid #333' : '1px solid #ddd',
                background: currentSize === option.value ? option.color : 'white',
                color: currentSize === option.value ? 'white' : '#333',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Optimization Status */}
      <div style={{ 
        background: optimizations.autoDetected ? 
          'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)' : 
          'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '15px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '20px', marginRight: '10px' }}>
            {optimizations.autoDetected ? '🚀' : '💡'}
          </span>
          <div>
            <strong>
              {optimizations.autoDetected ? 
                'Auto-Optimization ACTIVE' : 
                'Standard Performance Mode'}
            </strong>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>
              {optimizations.autoDetected ? 
                'Large dataset detected - performance optimizations enabled' :
                'Small dataset - running in standard mode for best compatibility'}
            </div>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '12px' }}>
          <div>
            <strong>Memory Optimization:</strong><br/>
            {optimizations.memoryOptimized ? '✅ Enabled' : '⭕ Disabled'}
          </div>
          <div>
            <strong>Instanced Rendering:</strong><br/>
            {optimizations.instancedRendering ? '✅ Enabled' : '⭕ Disabled'}
          </div>
          <div>
            <strong>Current FPS:</strong><br/>
            {metrics?.fps ? `${metrics.fps.toFixed(1)} FPS` : 'Measuring...'}
          </div>
        </div>
      </div>

      <GraphCanvas
        nodes={data.nodes}
        edges={data.edges}
        theme={lightTheme}
        layoutType="forceDirected2d"
        sizingType="none"
        labelType="auto"
        // Auto-optimization settings
        enableMemoryOptimization="auto"
        enableInstancedRendering="auto"
        enablePerformanceMonitor={true}
        onPerformanceUpdate={handlePerformanceUpdate}
      />
    </div>
  );
};

export const OptimizationComparison = () => {
  const [standardMetrics, setStandardMetrics] = useState<any>(null);
  const [optimizedMetrics, setOptimizedMetrics] = useState<any>(null);
  
  const comparisonData = useMemo(() => generateMonitoringDataset(2500, 0.4), []);

  const MetricsCard = ({ title, metrics, color }: { title: string, metrics: any, color: string }) => (
    <div style={{ 
      background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      height: '120px'
    }}>
      <h4 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>{title}</h4>
      {metrics ? (
        <div style={{ fontSize: '12px' }}>
          <div><strong>FPS:</strong> {metrics.fps?.toFixed(1) || 'N/A'}</div>
          <div><strong>Memory:</strong> {metrics.totalMemoryUsage ? `${Math.round(metrics.totalMemoryUsage / 1024 / 1024)}MB` : 'N/A'}</div>
          <div><strong>Draw Calls:</strong> {metrics.drawCalls || 'N/A'}</div>
          <div><strong>Visible Nodes:</strong> {metrics.visibleNodes || 'N/A'}</div>
        </div>
      ) : (
        <div style={{ fontSize: '12px', opacity: 0.8 }}>Measuring performance...</div>
      )}
    </div>
  );

  const improvement = standardMetrics && optimizedMetrics ? {
    fps: ((optimizedMetrics.fps - standardMetrics.fps) / standardMetrics.fps * 100).toFixed(1),
    memory: standardMetrics.totalMemoryUsage && optimizedMetrics.totalMemoryUsage ? 
      ((standardMetrics.totalMemoryUsage - optimizedMetrics.totalMemoryUsage) / standardMetrics.totalMemoryUsage * 100).toFixed(1) : null,
    drawCalls: standardMetrics.drawCalls && optimizedMetrics.drawCalls ?
      ((standardMetrics.drawCalls - optimizedMetrics.drawCalls) / standardMetrics.drawCalls * 100).toFixed(1) : null
  } : null;

  return (
    <div>
      <h3>Performance Optimization Comparison</h3>
      <p>Side-by-side comparison of standard vs optimized GraphCanvas performance (2,500 nodes)</p>
      
      {improvement && (
        <div style={{ 
          background: 'linear-gradient(135deg, #00b894 0%, #00a085 100%)',
          color: 'white',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <strong>🎯 Performance Improvements</strong><br/>
          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '10px', fontSize: '14px' }}>
            <div>FPS: +{improvement.fps}%</div>
            {improvement.memory && <div>Memory: -{improvement.memory}%</div>}
            {improvement.drawCalls && <div>Draw Calls: -{improvement.drawCalls}%</div>}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <MetricsCard 
          title="📊 Standard GraphCanvas" 
          metrics={standardMetrics} 
          color="#e74c3c" 
        />
        <MetricsCard 
          title="🚀 Optimized GraphCanvas" 
          metrics={optimizedMetrics} 
          color="#27ae60" 
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <h4 style={{ textAlign: 'center', marginBottom: '10px' }}>Standard Performance</h4>
          <div style={{ height: '400px', border: '2px solid #e74c3c', borderRadius: '8px' }}>
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
          <h4 style={{ textAlign: 'center', marginBottom: '10px' }}>Optimized Performance</h4>
          <div style={{ height: '400px', border: '2px solid #27ae60', borderRadius: '8px' }}>
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
    </div>
  );
};

export const PerformanceContextDemo = () => {
  const data = useMemo(() => generateMonitoringDataset(1500, 0.4), []);

  // Component that uses the performance context
  const PerformanceConsumer = () => {
    const performanceContext = usePerformanceContext();
    
    return (
      <div style={{ 
        background: '#f8f9fa',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '15px',
        border: '1px solid #dee2e6'
      }}>
        <h4 style={{ margin: '0 0 10px 0' }}>🔗 Performance Context Status</h4>
        <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
          <div><strong>Memory Manager:</strong> {performanceContext.memoryManager ? '✅ Active' : '❌ Inactive'}</div>
          <div><strong>Instanced Renderer:</strong> {performanceContext.instancedRenderer ? '✅ Active' : '❌ Inactive'}</div>
          <div style={{ marginTop: '8px', fontSize: '11px', color: '#666' }}>
            Performance context allows components to access shared optimization systems
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h3>Performance Context Integration</h3>
      <p>Demonstrates how components can access shared performance systems via React Context</p>
      
      <PerformanceConsumer />

      <GraphCanvas
        nodes={data.nodes}
        edges={data.edges}
        theme={lightTheme}
        layoutType="forceDirected2d"
        sizingType="none"
        labelType="auto"
        optimizationLevel="BALANCED"
        enableMemoryOptimization={true}
        enableInstancedRendering={true}
        enablePerformanceMonitor={true}
      />
    </div>
  );
};

export const PerformanceBudgeting = () => {
  const [targetFps, setTargetFps] = useState(30);
  const [metrics, setMetrics] = useState<any>(null);
  const [nodeCount, setNodeCount] = useState(2000);
  
  const data = useMemo(() => generateMonitoringDataset(nodeCount, 0.4), [nodeCount]);

  const budgetStatus = metrics ? {
    withinBudget: metrics.fps >= targetFps,
    utilization: (metrics.fps / targetFps * 100).toFixed(1)
  } : null;

  return (
    <div>
      <h3>Performance Budgeting</h3>
      <p>Set performance targets and monitor if your graph stays within budget</p>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '15px',
        marginBottom: '20px'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
            Target FPS:
          </label>
          <select 
            value={targetFps} 
            onChange={(e) => setTargetFps(Number(e.target.value))}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value={15}>15 FPS (Minimum)</option>
            <option value={30}>30 FPS (Standard)</option>
            <option value={60}>60 FPS (High)</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
            Node Count:
          </label>
          <select 
            value={nodeCount} 
            onChange={(e) => setNodeCount(Number(e.target.value))}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value={1000}>1,000 nodes</option>
            <option value={2000}>2,000 nodes</option>
            <option value={4000}>4,000 nodes</option>
            <option value={8000}>8,000 nodes</option>
          </select>
        </div>
      </div>

      {budgetStatus && (
        <div style={{ 
          background: budgetStatus.withinBudget ? 
            'linear-gradient(135deg, #4caf50 0%, #45a049 100%)' : 
            'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
          color: 'white',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '15px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '18px', marginBottom: '5px' }}>
            {budgetStatus.withinBudget ? '✅ WITHIN BUDGET' : '⚠️ OVER BUDGET'}
          </div>
          <div style={{ fontSize: '14px' }}>
            Current: {metrics.fps?.toFixed(1)} FPS | 
            Target: {targetFps} FPS | 
            Utilization: {budgetStatus.utilization}%
          </div>
        </div>
      )}

      <GraphCanvas
        nodes={data.nodes}
        edges={data.edges}
        theme={lightTheme}
        layoutType="forceDirected2d"
        sizingType="none"
        labelType="auto"
        optimizationLevel="BALANCED"
        enableMemoryOptimization="auto"
        enableInstancedRendering="auto"
        enablePerformanceMonitor={true}
        onPerformanceUpdate={setMetrics}
      />
    </div>
  );
};