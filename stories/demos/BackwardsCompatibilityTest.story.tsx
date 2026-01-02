import React, { useMemo } from 'react';
import { range } from 'd3-array';

import type { GraphEdge, GraphNode } from '../../src';
import { GraphCanvas, darkTheme, lightTheme } from '../../src';

export default {
  title: 'Tests/Backwards Compatibility',
  component: GraphCanvas
};

// Create test data
const generateTestData = () => {
  const nodes: GraphNode[] = range(20).map(i => ({
    id: `node-${i}`,
    label: `Node ${i}`,
    data: { type: i % 3 === 0 ? 'primary' : 'secondary' }
  }));

  const edges: GraphEdge[] = [];
  for (let i = 0; i < 15; i++) {
    const source = Math.floor(Math.random() * 20);
    const target = Math.floor(Math.random() * 20);
    if (source !== target) {
      edges.push({
        id: `edge-${i}`,
        source: `node-${source}`,
        target: `node-${target}`,
        label: `Edge ${i}`,
        interpolation: Math.random() > 0.5 ? 'curved' : 'linear',
        arrowPlacement: Math.random() > 0.3 ? 'end' : 'none',
        dashed: Math.random() > 0.8
      });
    }
  }

  return { nodes, edges };
};

// Test 1: Simple test with just 2 nodes and 1 edge
export const SimpleTest = () => {
  const { nodes, edges } = useMemo(() => {
    const nodes = [
      { id: 'node-1', label: 'Node 1' },
      { id: 'node-2', label: 'Node 2' }
    ];
    const edges = [
      { id: 'edge-1', source: 'node-1', target: 'node-2', interpolation: 'linear' as const }
    ];
    return { nodes, edges };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          fontSize: '12px'
        }}
      >
        <h3>Simple Test</h3>
        <div>Nodes: {nodes.length}</div>
        <div>Edges: {edges.length}</div>
        <div>Should use unified edge system</div>
      </div>

      <GraphCanvas
        nodes={nodes}
        edges={edges}
        theme={darkTheme}
        animated={true}
        draggable={true}
        edgeInterpolation="linear"
        edgeLabelPosition="inline"
        edgeArrowPosition="end"
        layoutType="forceDirected2d"
      />
    </div>
  );
};

// Test 2: Default behavior (legacy edge system)
export const DefaultBehavior = () => {
  const { nodes, edges } = useMemo(() => generateTestData(), []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          fontSize: '12px'
        }}
      >
        <h3>Default Edge Behavior</h3>
        <div>Nodes: {nodes.length}</div>
        <div>Edges: {edges.length}</div>
        <div>Uses: Legacy edge system (unifiedEdges=false)</div>
      </div>

      <GraphCanvas
        nodes={nodes}
        edges={edges}
        theme={darkTheme}
        animated={true}
        draggable={true}
        edgeInterpolation="curved"
        edgeLabelPosition="inline"
        edgeArrowPosition="end"
        layoutType="forceDirected2d"
        // Legacy system for comparison
        legacyEdges={true}
      />
    </div>
  );
};

// Test 2: Unified edge system
export const UnifiedBehavior = () => {
  const { nodes, edges } = useMemo(() => generateTestData(), []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          fontSize: '12px'
        }}
      >
        <h3>Unified Edge Behavior</h3>
        <div>Nodes: {nodes.length}</div>
        <div>Edges: {edges.length}</div>
        <div>Uses: New unified edge system (unifiedEdges=true)</div>
      </div>

      <GraphCanvas
        nodes={nodes}
        edges={edges}
        theme={darkTheme}
        animated={true}
        draggable={true}
        edgeInterpolation="curved"
        edgeLabelPosition="inline"
        edgeArrowPosition="end"
        layoutType="forceDirected2d"
        // Default behavior now uses unified edges
      />
    </div>
  );
};

// Test 3: Side-by-side comparison
export const SideBySideComparison = () => {
  const { nodes, edges } = useMemo(() => generateTestData(), []);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex' }}>
      {/* Legacy System */}
      <div style={{ width: '50%', height: '100%', position: 'relative', borderRight: '2px solid #444' }}>
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            fontSize: '12px'
          }}
        >
          <h3>Legacy Edge System</h3>
          <div>Nodes: {nodes.length}</div>
          <div>Edges: {edges.length}</div>
        </div>

        <GraphCanvas
          nodes={nodes}
          edges={edges}
          theme={lightTheme}
          animated={true}
          draggable={true}
          edgeInterpolation="curved"
          layoutType="forceDirected2d"
          // Legacy system
        />
      </div>

      {/* Unified System */}
      <div style={{ width: '50%', height: '100%', position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            fontSize: '12px'
          }}
        >
          <h3>Unified Edge System</h3>
          <div>Nodes: {nodes.length}</div>
          <div>Edges: {edges.length}</div>
        </div>

        <GraphCanvas
          nodes={nodes}
          edges={edges}
          theme={darkTheme}
          animated={true}
          draggable={true}
          edgeInterpolation="curved"
          layoutType="forceDirected2d"
          // Default behavior now uses unified edges
        />
      </div>
    </div>
  );
};

// Test 4: Large dataset to test threshold switching
export const LargeDatasetTest = () => {
  const { nodes, edges } = useMemo(() => {
    const nodes: GraphNode[] = range(50).map(i => ({
      id: `node-${i}`,
      label: `Node ${i}`
    }));

    const edges: GraphEdge[] = [];
    for (let i = 0; i < 450; i++) {
      const source = Math.floor(Math.random() * 50);
      const target = Math.floor(Math.random() * 50);
      if (source !== target) {
        edges.push({
          id: `edge-${i}`,
          source: `node-${source}`,
          target: `node-${target}`,
          interpolation: 'linear'
        });
      }
    }


    return { nodes, edges };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          fontSize: '12px'
        }}
      >
        <h3>Large Dataset Test</h3>
        <div>Nodes: {nodes.length}</div>
        <div>Edges: {edges.length}</div>
        <div>Unified system should automatically use batched rendering</div>
        <div>Animation should be disabled for performance</div>
      </div>

      <GraphCanvas
        nodes={nodes}
        edges={edges}
        theme={darkTheme}
        animated={true} // Should be auto-disabled by unified system
        draggable={true}
        edgeInterpolation="linear"
        layoutType="forceDirected2d"
        // Default behavior now uses unified edges
      />
    </div>
  );
};

// Test 5: API compatibility test
export const APICompatibilityTest = () => {
  const { nodes, edges } = useMemo(() => generateTestData(), []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          fontSize: '12px'
        }}
      >
        <h3>API Compatibility Test</h3>
        <div>Nodes: {nodes.length}</div>
        <div>Edges: {edges.length}</div>
        <div>All edge properties should work identically</div>
      </div>

      <GraphCanvas
        nodes={nodes}
        edges={edges}
        theme={darkTheme}
        animated={true}
        draggable={true}
        edgeInterpolation="curved"
        edgeLabelPosition="above"
        edgeArrowPosition="end"
        layoutType="forceDirected2d"
        // Default behavior now uses unified edges
        onEdgeClick={(edge, event) => {
          console.log('Edge clicked:', edge.id, event);
          alert(`Edge clicked: ${edge.id}`);
        }}
        onEdgePointerOver={(edge, event) => {
          console.log('Edge hovered:', edge.id, event);
        }}
        onEdgePointerOut={(edge, event) => {
          console.log('Edge unhovered:', edge.id, event);
        }}
        contextMenu={(event) => (
          <div style={{ background: 'white', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}>
            Context Menu for: {event.data?.id}
          </div>
        )}
      />
    </div>
  );
};