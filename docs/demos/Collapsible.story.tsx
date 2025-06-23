import React, { useMemo, useState } from 'react';
import { getVisibleEntities, GraphCanvas, RadialMenu, useCollapse, lightTheme } from '../../src';
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

export const LargeDatasetWithInitialCollapse = () => {
  // Generate a larger hierarchical dataset
  const generateLargeHierarchicalData = () => {
    const nodes = [];
    const edges = [];
    
    // Create root node
    nodes.push({
      id: 'root',
      label: 'Root Organization',
      fill: '#1a1a1a',
      size: 30
    });

    // Create 5 main branches
    const branchColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
    for (let b = 0; b < 5; b++) {
      const branchId = `branch-${b}`;
      nodes.push({
        id: branchId,
        label: `Division ${b + 1}`,
        fill: branchColors[b],
        size: 25
      });
      edges.push({
        id: `edge-root-${branchId}`,
        source: 'root',
        target: branchId,
        fill: '#666666'
      });

      // Create 10 departments per branch
      for (let d = 0; d < 10; d++) {
        const deptId = `${branchId}-dept-${d}`;
        nodes.push({
          id: deptId,
          label: `Dept ${b + 1}-${d + 1}`,
          fill: `${branchColors[b]}cc`,
          size: 20
        });
        edges.push({
          id: `edge-${branchId}-${deptId}`,
          source: branchId,
          target: deptId,
          fill: '#666666'
        });

        // Create 5 teams per department
        for (let t = 0; t < 5; t++) {
          const teamId = `${deptId}-team-${t}`;
          nodes.push({
            id: teamId,
            label: `Team ${b + 1}-${d + 1}-${t + 1}`,
            fill: `${branchColors[b]}99`,
            size: 15
          });
          edges.push({
            id: `edge-${deptId}-${teamId}`,
            source: deptId,
            target: teamId,
            fill: '#666666'
          });

          // Create 3 members per team
          for (let m = 0; m < 3; m++) {
            const memberId = `${teamId}-member-${m}`;
            nodes.push({
              id: memberId,
              label: `Member ${m + 1}`,
              fill: `${branchColors[b]}66`,
              size: 10
            });
            edges.push({
              id: `edge-${teamId}-${memberId}`,
              source: teamId,
              target: memberId,
              fill: '#666666'
            });
          }
        }
      }
    }

    return { nodes, edges };
  };

  const { nodes, edges } = useMemo(() => {
    const data = generateLargeHierarchicalData();
    console.log('Generated data:', { nodes: data.nodes.length, edges: data.edges.length });
    return data;
  }, []);
  
  // Initially collapse all branch nodes to show only root and branches
  const initialCollapsed = nodes
    .filter(n => n.id.startsWith('branch-'))
    .map(n => n.id);
  
  const [collapsed, setCollapsed] = useState<string[]>(initialCollapsed);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  
  // Calculate visible entities based on collapsed state
  const { visibleNodes, visibleEdges } = useMemo(() => {
    // Find all descendants of collapsed nodes
    const hiddenNodes = new Set<string>();
    const hiddenEdges = new Set<string>();
    
    const findDescendants = (nodeId: string) => {
      edges.forEach(edge => {
        if (edge.source === nodeId && !hiddenNodes.has(edge.target)) {
          hiddenNodes.add(edge.target);
          hiddenEdges.add(edge.id);
          findDescendants(edge.target);
        }
      });
    };
    
    // For each collapsed node, hide all its descendants
    collapsed.forEach(nodeId => {
      findDescendants(nodeId);
    });
    
    // Filter out hidden nodes and edges
    const visibleNodes = nodes.filter(node => !hiddenNodes.has(node.id));
    const visibleEdges = edges.filter(edge => !hiddenEdges.has(edge.id) && !hiddenNodes.has(edge.source) && !hiddenNodes.has(edge.target));
    
    return { visibleNodes, visibleEdges };
  }, [nodes, edges, collapsed]);
  
  // Enhance visible nodes to show expandable state
  const enhancedNodes = useMemo(() => {
    return visibleNodes.map(node => {
      const hasChildren = edges.some(edge => edge.source === node.id);
      const isCollapsed = collapsed.includes(node.id);
      
      return {
        ...node,
        // Add expand/collapse indicator to label
        label: hasChildren ? `${isCollapsed ? '[+] ' : '[−] '}${node.label}` : node.label,
        // Make expandable nodes slightly larger
        size: hasChildren ? node.size * 1.2 : node.size,
        // Make collapsed nodes more opaque
        fill: hasChildren && isCollapsed ? `${node.fill}dd` : node.fill
      };
    });
  }, [visibleNodes, edges, collapsed]);

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    
    // Check if node has children (can be collapsed)
    const hasChildren = edges.some(edge => edge.source === node.id);
    if (hasChildren) {
      toggleCollapse(node.id);
    }
  };

  const toggleCollapse = (nodeId: string) => {
    if (collapsed.includes(nodeId)) {
      setCollapsed(collapsed.filter(id => id !== nodeId));
    } else {
      setCollapsed([...collapsed, nodeId]);
    }
  };

  const collapseAll = () => {
    // Collapse all nodes that have children
    const nodesWithChildren = new Set(edges.map(e => e.source));
    const collapsibleNodes = nodes
      .filter(n => nodesWithChildren.has(n.id) && n.id !== 'root')
      .map(n => n.id);
    setCollapsed(collapsibleNodes);
  };

  const expandAll = () => {
    setCollapsed([]);
  };

  const expandBranch = (branchId: string) => {
    // Remove branch and all its children from collapsed
    const toExpand = collapsed.filter(id => !id.startsWith(branchId.split('-')[0] + '-' + branchId.split('-')[1]));
    setCollapsed(toExpand);
  };

  return (
    <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, display: 'flex', minHeight: '600px' }}>
      <div style={{ flex: 1, position: 'relative', minHeight: '600px' }}>
        <GraphCanvas
          nodes={enhancedNodes}
          edges={visibleEdges}
          onNodeClick={handleNodeClick}
          theme={lightTheme}
          layoutType="forceDirected2d"
          layoutOverrides={{
            nodeStrength: -2000,
            linkDistance: 100
          }}
          animated
          draggable
          sizingType="none"
          labelType="auto"
        />
      </div>
      
      <div style={{ 
        width: '300px', 
        background: '#f0f0f0', 
        padding: '20px',
        overflowY: 'auto'
      }}>
        <h3>Large Dataset Collapse Demo</h3>
        <p>
          Total: {nodes.length} nodes, {edges.length} edges<br/>
          Visible: {visibleNodes.length} nodes, {visibleEdges.length} edges<br/>
          Collapsed nodes: {collapsed.length}
        </p>
        
        <div style={{ marginBottom: '20px' }}>
          <button 
            onClick={expandAll}
            style={{ marginRight: '10px', padding: '5px 10px' }}
          >
            Expand All
          </button>
          <button 
            onClick={collapseAll}
            style={{ padding: '5px 10px' }}
          >
            Collapse All
          </button>
        </div>

        <h4>Quick Actions</h4>
        <div style={{ marginBottom: '20px' }}>
          {[0, 1, 2, 3, 4].map(i => (
            <button
              key={i}
              onClick={() => expandBranch(`branch-${i}`)}
              style={{ 
                display: 'block',
                width: '100%',
                marginBottom: '5px',
                padding: '5px',
                background: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'][i],
                color: 'white',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Expand Division {i + 1}
            </button>
          ))}
        </div>

        {selectedNode && (
          <>
            <h4>Selected Node</h4>
            <p><strong>ID:</strong> {selectedNode.id}</p>
            <p><strong>Label:</strong> {selectedNode.label}</p>
            
            {/* Check if node has children */}
            {edges.some(e => e.source === selectedNode.id) && (
              <button
                onClick={() => toggleCollapse(selectedNode.id)}
                style={{ 
                  width: '100%',
                  padding: '8px',
                  marginTop: '10px',
                  background: collapsed.includes(selectedNode.id) ? '#2ecc71' : '#e74c3c',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {collapsed.includes(selectedNode.id) ? 'Expand' : 'Collapse'}
              </button>
            )}
          </>
        )}

        <h4>Performance Tips</h4>
        <ul style={{ fontSize: '14px', lineHeight: '1.6' }}>
          <li>Start with collapsed nodes for better performance</li>
          <li>Click any node with children to expand/collapse it</li>
          <li>Use the division buttons for quick navigation</li>
          <li>This demo shows how to handle up to 1,000+ nodes efficiently</li>
        </ul>
      </div>
    </div>
  );
};
