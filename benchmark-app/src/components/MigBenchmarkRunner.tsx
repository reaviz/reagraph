import React, { useState, useCallback, useMemo } from 'react';
import { GraphCanvas, GraphCanvasRef } from 'reagraph';
import { createMigBenchmarkTests } from '../utils/migBenchmarkGenerator';
import { BenchmarkTest, PerformanceMetrics } from '../types/benchmark.types';
import { usePerformanceTracker } from '../hooks/usePerformanceTracker';

interface MigBenchmarkRunnerProps {
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}

export const MigBenchmarkRunner: React.FC<MigBenchmarkRunnerProps> = ({ onMetricsUpdate }) => {
  const [selectedPhase, setSelectedPhase] = useState<'phase1' | 'phase2' | 'phase3'>('phase1');
  const [selectedScale, setSelectedScale] = useState<'small' | 'medium' | 'large' | 'extreme'>('small');
  const [showPerformanceMetrics, setShowPerformanceMetrics] = useState(true);
  const [enableOptimizations, setEnableOptimizations] = useState(true);
  
  // Feature toggles for different phases
  const [features, setFeatures] = useState({
    clustering: true,
    edgeAggregation: false,
    animatedFlows: false,
    hierarchicalLayout: false,
    collapsible: false,
    contextualBoundaries: false
  });

  const performanceTracker = usePerformanceTracker({
    onUpdate: onMetricsUpdate
  });

  // Get benchmark tests
  const benchmarkTests = useMemo(() => createMigBenchmarkTests(), []);

  // Select current test based on phase and scale
  const currentTest = useMemo(() => {
    const testId = `mig-${selectedPhase}-${selectedScale}`;
    return benchmarkTests.find(test => test.id === testId) || benchmarkTests[0];
  }, [selectedPhase, selectedScale, benchmarkTests]);

  // Update features based on phase
  const handlePhaseChange = useCallback((phase: 'phase1' | 'phase2' | 'phase3') => {
    setSelectedPhase(phase);
    
    // Update features based on phase
    if (phase === 'phase1') {
      setFeatures({
        clustering: true,
        edgeAggregation: false,
        animatedFlows: false,
        hierarchicalLayout: false,
        collapsible: false,
        contextualBoundaries: false
      });
    } else if (phase === 'phase2') {
      setFeatures({
        clustering: true,
        edgeAggregation: true,
        animatedFlows: true,
        hierarchicalLayout: true,
        collapsible: false,
        contextualBoundaries: true
      });
    } else if (phase === 'phase3') {
      setFeatures({
        clustering: true,
        edgeAggregation: true,
        animatedFlows: true,
        hierarchicalLayout: true,
        collapsible: true,
        contextualBoundaries: true
      });
    }
  }, []);

  // Performance metrics display
  const renderMetrics = () => {
    const metrics = performanceTracker.getCurrentMetrics();
    if (!metrics || !showPerformanceMetrics) return null;

    return (
      <div style={{
        position: 'absolute',
        top: 10,
        right: 10,
        background: 'rgba(0, 0, 0, 0.8)',
        color: '#fff',
        padding: '10px',
        borderRadius: '4px',
        fontFamily: 'monospace',
        fontSize: '12px',
        zIndex: 1000
      }}>
        <div>FPS: {metrics.fps.toFixed(1)}</div>
        <div>Nodes: {metrics.nodeCount}</div>
        <div>Edges: {metrics.edgeCount}</div>
        <div>Memory: {(metrics.memoryUsage / 1024 / 1024).toFixed(1)} MB</div>
        <div>Render Time: {metrics.renderTime.toFixed(1)} ms</div>
        <div>Worker: {metrics.workerStatus}</div>
      </div>
    );
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Control Panel */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        zIndex: 1000,
        maxWidth: '300px'
      }}>
        <h3 style={{ margin: '0 0 15px 0' }}>Mig Benchmark Controls</h3>
        
        {/* Phase Selection */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
            Phase Selection:
          </label>
          <select
            value={selectedPhase}
            onChange={(e) => handlePhaseChange(e.target.value as 'phase1' | 'phase2' | 'phase3')}
            style={{ width: '100%', padding: '5px' }}
          >
            <option value="phase1">Phase 1 - Baseline Features</option>
            <option value="phase2">Phase 2 - Advanced Features</option>
            <option value="phase3">Phase 3 - Complex Features</option>
          </select>
        </div>

        {/* Scale Selection */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
            Dataset Scale:
          </label>
          <select
            value={selectedScale}
            onChange={(e) => setSelectedScale(e.target.value as 'small' | 'medium' | 'large' | 'extreme')}
            style={{ width: '100%', padding: '5px' }}
          >
            <option value="small">Small ({selectedPhase === 'phase1' ? '100' : '1,000'} nodes)</option>
            <option value="medium">Medium ({selectedPhase === 'phase1' ? '500' : '2,500'} nodes)</option>
            {selectedPhase !== 'phase1' && (
              <>
                <option value="large">Large (5,000 nodes)</option>
                <option value="extreme">Extreme (10,000 nodes)</option>
              </>
            )}
          </select>
        </div>

        {/* Feature Toggles */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
            Features:
          </label>
          <div style={{ fontSize: '12px' }}>
            <label style={{ display: 'block', marginBottom: '3px' }}>
              <input
                type="checkbox"
                checked={features.clustering}
                onChange={(e) => setFeatures({ ...features, clustering: e.target.checked })}
              />
              {' '}Clustering by Type
            </label>
            <label style={{ display: 'block', marginBottom: '3px' }}>
              <input
                type="checkbox"
                checked={features.edgeAggregation}
                onChange={(e) => setFeatures({ ...features, edgeAggregation: e.target.checked })}
                disabled={selectedPhase === 'phase1'}
              />
              {' '}Edge Aggregation
            </label>
            <label style={{ display: 'block', marginBottom: '3px' }}>
              <input
                type="checkbox"
                checked={features.animatedFlows}
                onChange={(e) => setFeatures({ ...features, animatedFlows: e.target.checked })}
              />
              {' '}Animated Flows
            </label>
            <label style={{ display: 'block', marginBottom: '3px' }}>
              <input
                type="checkbox"
                checked={features.hierarchicalLayout}
                onChange={(e) => setFeatures({ ...features, hierarchicalLayout: e.target.checked })}
                disabled={selectedPhase === 'phase1'}
              />
              {' '}Hierarchical Layout
            </label>
            <label style={{ display: 'block', marginBottom: '3px' }}>
              <input
                type="checkbox"
                checked={features.collapsible}
                onChange={(e) => setFeatures({ ...features, collapsible: e.target.checked })}
                disabled={selectedPhase !== 'phase3'}
              />
              {' '}Collapsible Nodes
            </label>
            <label style={{ display: 'block', marginBottom: '3px' }}>
              <input
                type="checkbox"
                checked={features.contextualBoundaries}
                onChange={(e) => setFeatures({ ...features, contextualBoundaries: e.target.checked })}
                disabled={selectedPhase === 'phase1'}
              />
              {' '}Contextual Boundaries
            </label>
          </div>
        </div>

        {/* Performance Options */}
        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
            Performance:
          </label>
          <label style={{ display: 'block', marginBottom: '3px', fontSize: '12px' }}>
            <input
              type="checkbox"
              checked={showPerformanceMetrics}
              onChange={(e) => setShowPerformanceMetrics(e.target.checked)}
            />
            {' '}Show Metrics
          </label>
          <label style={{ display: 'block', fontSize: '12px' }}>
            <input
              type="checkbox"
              checked={enableOptimizations}
              onChange={(e) => setEnableOptimizations(e.target.checked)}
            />
            {' '}Enable Optimizations
          </label>
        </div>

        {/* Test Info */}
        <div style={{ marginTop: '15px', fontSize: '11px', color: '#666' }}>
          <div>Current Test: {currentTest.name}</div>
          <div>Nodes: {currentTest.nodeCount}</div>
          <div>Edges: {currentTest.edgeCount}</div>
        </div>
      </div>

      {/* Performance Metrics */}
      {renderMetrics()}

      {/* Graph Canvas */}
      <GraphCanvas
        nodes={currentTest.dataset.nodes}
        edges={currentTest.dataset.edges}
        // Layout
        layoutType={features.hierarchicalLayout ? 'hierarchicalTd' : 'forceDirected2d'}
        // Features
        clusterAttribute={features.clustering ? 'type' : undefined}
        enableEdgeBundling={features.edgeAggregation}
        animated={features.animatedFlows}
        collapsedNodeIds={features.collapsible ? currentTest.initialCollapsedNodeIds : undefined}
        // Performance
        optimizationLevel={enableOptimizations ? 'HIGH_PERFORMANCE' : 'BALANCED'}
        enableMemoryOptimization={enableOptimizations && currentTest.nodeCount > 1000}
        enableInstancedRendering={enableOptimizations && currentTest.nodeCount > 500}
        enablePerformanceMonitor={showPerformanceMetrics}
        onPerformanceUpdate={performanceTracker.updateMetrics}
        // Styling
        edgeInterpolation="curved"
        sizingType="centrality"
        minNodeSize={10}
        maxNodeSize={30}
        draggable
        // Labels
        labelType={currentTest.nodeCount < 500 ? 'auto' : 'none'}
      />
    </div>
  );
};