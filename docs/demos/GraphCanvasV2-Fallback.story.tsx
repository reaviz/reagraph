import React from 'react';
import { GraphCanvasV2 } from '../../src';

export default {
  title: 'Demos/GraphCanvasV2 - Fallback Test',
  component: GraphCanvasV2
};

// Force fallback rendering to verify nodes display correctly
export const ForcedFallbackTest = () => {
  const nodes = [
    {
      id: 'node1',
      label: 'Node 1',
      position: { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
      size: 20,
      fill: '#FF6B6B'
    },
    {
      id: 'node2', 
      label: 'Node 2',
      position: { x: 100, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
      size: 20,
      fill: '#4ECDC4'
    },
    {
      id: 'node3',
      label: 'Node 3', 
      position: { x: 50, y: 100, z: 0, vx: 0, vy: 0, vz: 0 },
      size: 20,
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
    }
  ];

  return (
    <div style={{ width: '100%', height: '600px', background: '#f0f0f0' }}>
      <h3>GraphCanvasV2 - Forced Fallback Test</h3>
      <p>This should show 3 nodes using standard React Three Fiber components</p>
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
        backgroundColor="#1a1a1a"
        cameraMode="pan"
        minDistance={10}
        maxDistance={1000}
      />
    </div>
  );
};