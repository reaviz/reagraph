import React from 'react';
import { GraphCanvasV2 } from '../../src';

export default {
  title: 'Demos/GraphCanvasV2 - Simple Test',
  component: GraphCanvasV2
};

// Minimal test with just a few nodes
export const MinimalTest = () => {
  console.log('[MinimalTest Story] Rendering with 3 nodes');
  
  const nodes = [
    {
      id: 'node1',
      label: 'Node 1',
      position: { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
      size: 10,
      fill: '#FF6B6B'
    },
    {
      id: 'node2',
      label: 'Node 2',
      position: { x: 100, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
      size: 10,
      fill: '#4ECDC4'
    },
    {
      id: 'node3',
      label: 'Node 3',
      position: { x: 50, y: 100, z: 0, vx: 0, vy: 0, vz: 0 },
      size: 10,
      fill: '#45B7D1'
    }
  ];

  const edges = [
    {
      id: 'edge1',
      source: 'node1',
      target: 'node2',
      label: 'Edge 1',
      fill: '#999999',
      size: 2
    },
    {
      id: 'edge2',
      source: 'node2',
      target: 'node3',
      label: 'Edge 2',
      fill: '#999999',
      size: 2
    },
    {
      id: 'edge3',
      source: 'node3',
      target: 'node1',
      label: 'Edge 3',
      fill: '#999999',
      size: 2
    }
  ];

  return (
    <div style={{ width: '100%', height: '600px', background: '#f0f0f0' }}>
      <h3>GraphCanvasV2 - Minimal Test (3 nodes)</h3>
      <GraphCanvasV2
        nodes={nodes}
        edges={edges}
        optimizationLevel="BALANCED" // Use balanced to enable instancing
        enableGPUAcceleration="auto"
        enableInstancedRendering="auto" // Let it use instancing
        enableSharedWorkers="auto"
        enableMemoryOptimization="auto"
        enablePerformanceMonitor={true}
        width={800}
        height={500}
        backgroundColor="#222222"
        cameraMode="pan"
      />
    </div>
  );
};

// Test with standard rendering fallback
export const FallbackRenderingTest = () => {
  const nodes = Array.from({ length: 10 }, (_, i) => ({
    id: `node${i}`,
    label: `Node ${i}`,
    position: {
      x: Math.cos((i / 10) * Math.PI * 2) * 200,
      y: Math.sin((i / 10) * Math.PI * 2) * 200,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0
    },
    size: 8,
    fill: `hsl(${(i / 10) * 360}, 70%, 50%)`
  }));

  const edges = Array.from({ length: 15 }, (_, i) => ({
    id: `edge${i}`,
    source: nodes[Math.floor(Math.random() * nodes.length)].id,
    target: nodes[Math.floor(Math.random() * nodes.length)].id,
    fill: '#cccccc',
    size: 1
  }));

  return (
    <div style={{ width: '100%', height: '600px', background: '#f0f0f0' }}>
      <h3>GraphCanvasV2 - Fallback Rendering Test (10 nodes)</h3>
      <p>This test uses fallback rendering without optimizations</p>
      <GraphCanvasV2
        nodes={nodes}
        edges={edges}
        optimizationLevel="POWER_SAVING"
        enableGPUAcceleration={false}
        enableInstancedRendering={false}
        enableSharedWorkers={false}
        enableMemoryOptimization={false}
        enablePerformanceMonitor={false}
        width={800}
        height={500}
        backgroundColor="#fafafa"
        cameraMode="pan"
      />
    </div>
  );
};

// Test progressive enhancement
export const ProgressiveEnhancementTest = () => {
  const [optimizationLevel, setOptimizationLevel] = React.useState<'POWER_SAVING' | 'BALANCED' | 'HIGH_PERFORMANCE'>('POWER_SAVING');
  
  const nodes = Array.from({ length: 50 }, (_, i) => ({
    id: `node${i}`,
    label: `N${i}`,
    position: {
      x: (Math.random() - 0.5) * 500,
      y: (Math.random() - 0.5) * 500,
      z: (Math.random() - 0.5) * 100,
      vx: 0,
      vy: 0,
      vz: 0
    },
    size: Math.random() * 5 + 5,
    fill: `hsl(${Math.random() * 360}, 70%, 50%)`
  }));

  const edges = Array.from({ length: 75 }, (_, i) => ({
    id: `edge${i}`,
    source: nodes[Math.floor(Math.random() * nodes.length)].id,
    target: nodes[Math.floor(Math.random() * nodes.length)].id,
    fill: '#999999',
    size: 1
  }));

  return (
    <div style={{ width: '100%', height: '700px', background: '#f0f0f0' }}>
      <h3>GraphCanvasV2 - Progressive Enhancement Test (50 nodes)</h3>
      <div style={{ padding: '10px' }}>
        <label>
          Optimization Level: 
          <select 
            value={optimizationLevel} 
            onChange={(e) => setOptimizationLevel(e.target.value as any)}
            style={{ marginLeft: '10px' }}
          >
            <option value="POWER_SAVING">Power Saving</option>
            <option value="BALANCED">Balanced</option>
            <option value="HIGH_PERFORMANCE">High Performance</option>
          </select>
        </label>
      </div>
      <GraphCanvasV2
        nodes={nodes}
        edges={edges}
        optimizationLevel={optimizationLevel}
        enableGPUAcceleration="auto"
        enableInstancedRendering="auto"
        enableSharedWorkers="auto"
        enableMemoryOptimization="auto"
        enablePerformanceMonitor={true}
        width={800}
        height={500}
        backgroundColor="#ffffff"
        cameraMode="orbit"
      />
    </div>
  );
};