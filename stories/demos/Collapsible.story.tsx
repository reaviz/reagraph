import React, { useMemo, useState } from 'react';
import { getVisibleEntities, GraphCanvas, RadialMenu, useCollapse } from '../../src';
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

export const ExpandToHiddenNode = () => {
  const [active, setActive] = useState<any>(null);
  const [collapsed, setCollapsed] = useState<string[]>(['n-2']);
  const { getExpandPathIds } = useCollapse({ collapsedNodeIds: collapsed, nodes: parentNodes, edges: parentEdges });
  const hiddenNodeIds = useMemo(() => {
    const { visibleNodes } = getVisibleEntities({
      collapsedIds: collapsed,
      nodes: parentNodes,
      edges: parentEdges
    });
    const visibleNodeIds = visibleNodes.map(n => n.id);
    const hiddenNodes = parentNodes.filter(n => !visibleNodeIds.includes(n.id));

    return hiddenNodes.map(n => n.id);
  }, [collapsed]);

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
      <h3>Hidden Nodes</h3>
      <ul>
        {hiddenNodeIds.map(id => (
          <li key={id}>
            {id}
            <button
              style={{ display: 'block', width: '100%' }}
              onClick={() => {
                const toExpandIds = getExpandPathIds(id);
                const newCollapsed = collapsed.filter(id => !toExpandIds.includes(id));
                setCollapsed(newCollapsed);
              }}
            >
              View Node
            </button>
          </li>
        ))}
      </ul>
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
