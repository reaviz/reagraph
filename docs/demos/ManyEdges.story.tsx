import React, { useMemo, useState } from 'react';
import { GraphCanvas, lightTheme } from '../../src';

export default {
  title: 'Demos/edges/ManyEdges',
  component: GraphCanvas
};

type NodeType = { id: string; label: string; fill: string };
type EdgeType = { id: string; source: string; target: string; label: string };

function generateGraph(nodeCount = 500, edgeCount = 5000): { nodes: NodeType[]; edges: EdgeType[] } {
  const nodes: NodeType[] = [];
  for (let i = 0; i < nodeCount; i++) {
    nodes.push({
      id: `n-${i}`,
      label: `Node ${i}`,
      fill: `hsl(${(i * 137.5) % 360}, 60%, 60%)`
    });
  }
  const edges: EdgeType[] = [];
  for (let i = 0; i < edgeCount; i++) {
    const source = `n-${Math.floor(Math.random() * nodeCount)}`;
    let target = `n-${Math.floor(Math.random() * nodeCount)}`;
    // Ensure no self-loop
    if (target === source) {
      target = `n-${(parseInt(source.slice(2)) + 1) % nodeCount}`;
    }
    edges.push({
      id: `e-${i}`,
      source,
      target,
      label: `Edge ${i}`
    });
  }
  return { nodes, edges };
}

export const ThousandsOfEdges = () => {
  const { nodes, edges } = useMemo(() => generateGraph(50, 1200), []);
  const [selections, setSelections] = useState<string[]>([]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <GraphCanvas
        nodes={nodes}
        edges={edges}
        selections={selections}
        draggable
        theme={lightTheme}
        onNodeClick={node => {
          setSelections(sel =>
            sel.includes(node.id)
              ? sel.filter(id => id !== node.id)
              : [...sel, node.id]
          );
        }}
        clusterAttribute={undefined}
        constrainDragging={false}
      />
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10, background: '#fff', padding: 8, borderRadius: 4 }}>
        <strong>Nodes:</strong> {nodes.length} &nbsp; <strong>Edges:</strong> {edges.length}
        <br />
        <span>Click nodes to select/deselect and trigger edge animation.</span>
      </div>
    </div>
  );
};