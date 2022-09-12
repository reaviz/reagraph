import React, { useState } from 'react';
import { GraphCanvas, RadialMenu } from '../../src';
import { parentEdges, parentNodes } from '../assets/demo';

export default {
  title: 'Demos/Collapsible',
  component: GraphCanvas
};

export const Basic = () => {
  const [active, setActive] = useState<any>(null);
  const [collapsed, setCollapsed] = useState<string[]>(['n-2']);

  return (
    <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}>
    <div style={{ zIndex: 9, position: 'absolute', top: 15, right: 15, background: 'rgba(0, 0, 0, .5)', padding: 10, color: 'white' }}>
      <h3>Node Actions</h3>
      {active ? (
        <>
          Selected: {active.node.id}
          <br />
          <button
            style={{ display: 'block', width: '100%' }}
            onClick={() => {
              if (!collapsed.includes(active.node.id)) {
                setCollapsed([...collapsed, active.node.id]);
              }
            }}
          >
            Collapse Node
          </button>
          <button
            style={{ display: 'block', width: '100%' }}
            onClick={() => {
              if (collapsed.includes(active.node.id)) {
                setCollapsed(collapsed.filter(n => n !== active.node.id));
              }
            }}
          >
            Expand Node
          </button>
        </>
      ) : (
        <>
          Click a node to see options
        </>
      )}
      <h3>Collapsed Nodes</h3>
      <code>
        <pre>
          {JSON.stringify(collapsed, null, 2)}
        </pre>
      </code>
    </div>
    <GraphCanvas
      collapsedNodeIds={collapsed}
      nodes={parentNodes}
      edges={parentEdges}
      onNodeClick={(node, props) => setActive({ node, props })}
    />
    </div>
  );
};

export const RadialContextMenu = () => (
  <GraphCanvas
    nodes={parentNodes}
    edges={parentEdges}
    contextMenu={({ data, canCollapse, isCollapsed, onCollapse, onClose }) => (
      <RadialMenu
        onClose={onClose}
        items={[
          {
            label: 'Add Node',
            onClick: () => {
              alert('Add a node');
              onClose();
            }
          },
          {
            label: 'Remove',
            onClick: () => {
              alert('Remove the node');
              onClose();
            }
          },
          ...(canCollapse
            ? [{
              label: isCollapsed ? 'Expand' : 'Collapse',
              onClick: onCollapse
            }]
            : [])
        ]}
      />
    )}
  />
);
