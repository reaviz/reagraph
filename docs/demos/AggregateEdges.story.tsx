import React, { useState, useMemo } from 'react';
import { GraphCanvas } from '../../src';

export default {
  title: 'Demos/AggregateEdges',
  component: GraphCanvas
};

export const AggregateEdges = () => {
  const [aggregateEdges, setAggregateEdges] = useState(true);

  const edges = [
    {
      source: '1',
      target: '2',
      id: '1-2-1',
      label: 'Edge 1'
    },
    {
      source: '1',
      target: '2',
      id: '1-2-2',
      label: 'Edge 2'
    },
    {
      source: '1',
      target: '2',
      id: '1-2-3',
      label: 'Edge 3'
    },
    {
      source: '2',
      target: '1',
      id: '2-1-1',
      label: 'Edge 4'
    },
    {
      source: '2',
      target: '1',
      id: '2-1-2',
      label: 'Edge 5'
    },
    {
      source: '2',
      target: '1',
      id: '2-1-3',
      label: 'Edge 6'
    }
  ];

  // Calculate how many visual edges would be displayed when aggregated
  const aggregatedCount = useMemo(() => {
    const sourceTargetPairs = new Set();
    edges.forEach(edge => {
      sourceTargetPairs.add(`${edge.source}-${edge.target}`);
    });
    return sourceTargetPairs.size;
  }, [edges]);

  return (
    <div>
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 100,
          background: 'rgba(255, 255, 255, 0.8)',
          padding: '8px',
          borderRadius: '4px'
        }}
      >
        <div style={{ marginBottom: '8px' }}>
          <strong>Edges:</strong>{' '}
          {aggregateEdges ? aggregatedCount : edges.length}
          {aggregateEdges && ` (aggregated from ${edges.length})`}
        </div>
        <button
          onClick={() => setAggregateEdges(!aggregateEdges)}
          style={{
            padding: '6px 12px',
            cursor: 'pointer',
            background: '#4285f4',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold'
          }}
        >
          {aggregateEdges ? 'Ungroup Edges' : 'Group Edges'}
        </button>
      </div>
      <GraphCanvas
        nodes={[
          {
            id: '1',
            label: 'Node 1'
          },
          {
            id: '2',
            label: 'Node 2'
          }
        ]}
        edges={edges}
        aggregateEdges={aggregateEdges}
        layoutType="forceDirected2d"
        layoutOverrides={{
          linkDistance: 200,
          nodeStrength: -1000
        }}
      />
    </div>
  );
};

export const CompareWithoutAggregation = () => (
  <GraphCanvas
    nodes={[
      {
        id: '1',
        label: 'Node 1'
      },
      {
        id: '2',
        label: 'Node 2'
      }
    ]}
    edges={[
      {
        source: '1',
        target: '2',
        id: '1-2-1',
        label: 'Edge 1'
      },
      {
        source: '1',
        target: '2',
        id: '1-2-2',
        label: 'Edge 2'
      },
      {
        source: '1',
        target: '2',
        id: '1-2-3',
        label: 'Edge 3'
      },
      {
        source: '2',
        target: '1',
        id: '2-1-1',
        label: 'Edge 4'
      },
      {
        source: '2',
        target: '1',
        id: '2-1-2',
        label: 'Edge 5'
      },
      {
        source: '2',
        target: '1',
        id: '2-1-3',
        label: 'Edge 6'
      }
    ]}
    aggregateEdges={false}
  />
);

export const ComplexExample = () => {
  const [aggregateEdges, setAggregateEdges] = useState(true);

  const edges = [
    // Multiple edges between A and B
    { id: 'A-B-1', source: 'A', target: 'B', label: 'A to B 1' },
    { id: 'A-B-2', source: 'A', target: 'B', label: 'A to B 2' },
    { id: 'A-B-3', source: 'A', target: 'B', label: 'A to B 3' },
    { id: 'A-B-4', source: 'A', target: 'B', label: 'A to B 4' },

    // Multiple edges between B and A (reverse direction)
    { id: 'B-A-1', source: 'B', target: 'A', label: 'B to A 1' },
    { id: 'B-A-2', source: 'B', target: 'A', label: 'B to A 2' },

    // Multiple edges between B and C
    { id: 'B-C-1', source: 'B', target: 'C', label: 'B to C 1' },
    { id: 'B-C-2', source: 'B', target: 'C', label: 'B to C 2' },
    { id: 'B-C-3', source: 'B', target: 'C', label: 'B to C 3' },

    // Single edge between C and D
    { id: 'C-D-1', source: 'C', target: 'D', label: 'C to D' },

    // Multiple edges between D and E
    { id: 'D-E-1', source: 'D', target: 'E', label: 'D to E 1' },
    { id: 'D-E-2', source: 'D', target: 'E', label: 'D to E 2' },

    // Multiple edges between E and A (completing the cycle)
    { id: 'E-A-1', source: 'E', target: 'A', label: 'E to A 1' },
    { id: 'E-A-2', source: 'E', target: 'A', label: 'E to A 2' },
    { id: 'E-A-3', source: 'E', target: 'A', label: 'E to A 3' }
  ];

  // Calculate how many visual edges would be displayed when aggregated
  const aggregatedCount = useMemo(() => {
    const sourceTargetPairs = new Set();
    edges.forEach(edge => {
      sourceTargetPairs.add(`${edge.source}-${edge.target}`);
    });
    return sourceTargetPairs.size;
  }, [edges]);

  return (
    <div>
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 100,
          background: 'rgba(255, 255, 255, 0.8)',
          padding: '8px',
          borderRadius: '4px'
        }}
      >
        <div style={{ marginBottom: '8px' }}>
          <strong>Edges:</strong>{' '}
          {aggregateEdges ? aggregatedCount : edges.length}
          {aggregateEdges && ` (aggregated from ${edges.length})`}
        </div>
        <button
          onClick={() => setAggregateEdges(!aggregateEdges)}
          style={{
            padding: '6px 12px',
            cursor: 'pointer',
            background: '#4285f4',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold'
          }}
        >
          {aggregateEdges ? 'Ungroup Edges' : 'Group Edges'}
        </button>
      </div>
      <GraphCanvas
        nodes={[
          { id: 'A', label: 'Node A' },
          { id: 'B', label: 'Node B' },
          { id: 'C', label: 'Node C' },
          { id: 'D', label: 'Node D' },
          { id: 'E', label: 'Node E' }
        ]}
        edges={edges}
        aggregateEdges={aggregateEdges}
        layoutType="forceDirected2d"
        layoutOverrides={{
          linkDistance: 300,
          nodeStrength: -2000
        }}
      />
    </div>
  );
};
