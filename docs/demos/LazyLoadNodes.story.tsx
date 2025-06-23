import React, { useState, useCallback, useMemo } from 'react';
import { GraphCanvas, lightTheme, darkTheme } from '../../src';

export default {
  title: 'Demos/Progressive Loading',
  component: GraphCanvas
};

// Generate a hierarchical dataset with expandable nodes
const generateHierarchicalData = (levels = 4, childrenPerNode = 3) => {
  const nodes = [];
  const edges = [];
  const hiddenNodes = new Map(); // Store children for each parent
  let nodeId = 0;

  // Helper to create a node
  const createNode = (level, parentId = null) => {
    const id = `node-${nodeId++}`;
    const node = {
      id,
      label: `${parentId ? 'Child' : 'Root'} ${nodeId}`,
      fill: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'][level % 5],
      size: 20 - (level * 2), // Larger nodes at higher levels
      data: {
        level,
        hasChildren: level < levels - 1,
        isExpanded: false,
        parentId
      }
    };

    if (parentId) {
      edges.push({
        id: `edge-${parentId}-${id}`,
        source: parentId,
        target: id,
        label: ''
      });
    }

    return node;
  };

  // Generate tree structure
  const generateSubtree = (parentId, currentLevel) => {
    if (currentLevel >= levels) return [];

    const children = [];
    for (let i = 0; i < childrenPerNode; i++) {
      const child = createNode(currentLevel, parentId);
      children.push(child);
      
      // Recursively generate children
      const grandchildren = generateSubtree(child.id, currentLevel + 1);
      if (grandchildren.length > 0) {
        if (!hiddenNodes.has(child.id)) {
          hiddenNodes.set(child.id, []);
        }
        hiddenNodes.get(child.id).push(...grandchildren);
      }
    }
    return children;
  };

  // Create root nodes
  const rootCount = 5;
  for (let i = 0; i < rootCount; i++) {
    const root = createNode(0);
    nodes.push(root);
    
    const children = generateSubtree(root.id, 1);
    if (children.length > 0) {
      hiddenNodes.set(root.id, children);
    }
  }

  return { initialNodes: nodes, initialEdges: edges, hiddenNodes };
};

export const LazyLoadNodes = () => {
  const { initialNodes, initialEdges, hiddenNodes } = useMemo(
    () => generateHierarchicalData(4, 3),
    []
  );

  const [visibleNodes, setVisibleNodes] = useState(initialNodes);
  const [visibleEdges, setVisibleEdges] = useState(initialEdges);
  const [expandedNodes, setExpandedNodes] = useState(new Set());

  const handleNodeClick = useCallback((node) => {
    if (!node.data?.hasChildren) return;

    const nodeId = node.id;
    const isExpanded = expandedNodes.has(nodeId);

    if (isExpanded) {
      // Collapse: Remove all descendants
      const nodesToRemove = new Set();
      const edgesToRemove = new Set();
      
      // Find all descendants
      const findDescendants = (parentId) => {
        const children = hiddenNodes.get(parentId) || [];
        children.forEach(child => {
          nodesToRemove.add(child.id);
          edgesToRemove.add(`edge-${parentId}-${child.id}`);
          if (expandedNodes.has(child.id)) {
            findDescendants(child.id);
          }
        });
      };
      
      findDescendants(nodeId);
      
      // Update visible nodes and edges
      setVisibleNodes(prev => prev.filter(n => !nodesToRemove.has(n.id)));
      setVisibleEdges(prev => prev.filter(e => !edgesToRemove.has(e.id)));
      
      // Update expanded state
      setExpandedNodes(prev => {
        const next = new Set(prev);
        next.delete(nodeId);
        nodesToRemove.forEach(id => next.delete(id));
        return next;
      });
    } else {
      // Expand: Add immediate children
      const children = hiddenNodes.get(nodeId) || [];
      if (children.length > 0) {
        const newNodes = [...visibleNodes];
        const newEdges = [...visibleEdges];
        
        children.forEach(child => {
          if (!visibleNodes.find(n => n.id === child.id)) {
            newNodes.push(child);
            newEdges.push({
              id: `edge-${nodeId}-${child.id}`,
              source: nodeId,
              target: child.id,
              label: ''
            });
          }
        });
        
        setVisibleNodes(newNodes);
        setVisibleEdges(newEdges);
        setExpandedNodes(prev => new Set([...prev, nodeId]));
      }
    }
  }, [expandedNodes, hiddenNodes, visibleNodes]);

  const enhancedNodes = useMemo(() => 
    visibleNodes.map(node => ({
      ...node,
      icon: node.data?.hasChildren
        ? expandedNodes.has(node.id) ? '−' : '+'
        : undefined,
      fill: node.data?.hasChildren
        ? expandedNodes.has(node.id)
          ? node.fill
          : `${node.fill}aa` // Slightly transparent when collapsed
        : node.fill
    })),
    [visibleNodes, expandedNodes]
  );

  return (
    <div>
      <h3>Lazy Load Nodes - Progressive Expansion</h3>
      <p>
        Click nodes with + to expand and reveal children. Click − to collapse.
        This pattern allows handling very large graphs by only rendering visible portions.
      </p>
      
      <div style={{ 
        background: '#f0f0f0', 
        padding: '10px', 
        marginBottom: '10px',
        borderRadius: '4px'
      }}>
        <strong>Stats:</strong> {visibleNodes.length} nodes visible 
        ({expandedNodes.size} expanded) | {visibleEdges.length} edges
      </div>
      
      <div style={{ height: '600px' }}>
        <GraphCanvas
          nodes={enhancedNodes}
          edges={visibleEdges}
          theme={lightTheme}
          layoutType="forceDirected2d"
          layoutOverrides={{
            nodeStrength: -1000,
            linkDistance: 100
          }}
          onNodeClick={handleNodeClick}
          animated
          draggable
        />
      </div>
    </div>
  );
};

export const LazyLoadWithMetadata = () => {
  // Generate a larger dataset with metadata
  const generateDataWithMetadata = () => {
    const departments = ['Engineering', 'Sales', 'Marketing', 'Support', 'HR'];
    const { initialNodes, initialEdges, hiddenNodes } = generateHierarchicalData(3, 4);
    
    // Add metadata to nodes
    const enhancedNodes = initialNodes.map((node, i) => ({
      ...node,
      data: {
        ...node.data,
        department: departments[i % departments.length],
        employees: Math.floor(Math.random() * 50) + 10,
        budget: Math.floor(Math.random() * 1000000) + 100000
      }
    }));

    return { initialNodes: enhancedNodes, initialEdges, hiddenNodes };
  };

  const { initialNodes, initialEdges, hiddenNodes } = useMemo(
    () => generateDataWithMetadata(),
    []
  );

  const [visibleNodes, setVisibleNodes] = useState(initialNodes);
  const [visibleEdges, setVisibleEdges] = useState(initialEdges);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [selectedNode, setSelectedNode] = useState(null);

  const handleNodeClick = useCallback((node) => {
    setSelectedNode(node);
    
    if (!node.data?.hasChildren) return;

    const nodeId = node.id;
    const isExpanded = expandedNodes.has(nodeId);

    if (isExpanded) {
      // Collapse logic (same as above)
      const nodesToRemove = new Set();
      const edgesToRemove = new Set();
      
      const findDescendants = (parentId) => {
        const children = hiddenNodes.get(parentId) || [];
        children.forEach(child => {
          nodesToRemove.add(child.id);
          edgesToRemove.add(`edge-${parentId}-${child.id}`);
          if (expandedNodes.has(child.id)) {
            findDescendants(child.id);
          }
        });
      };
      
      findDescendants(nodeId);
      
      setVisibleNodes(prev => prev.filter(n => !nodesToRemove.has(n.id)));
      setVisibleEdges(prev => prev.filter(e => !edgesToRemove.has(e.id)));
      
      setExpandedNodes(prev => {
        const next = new Set(prev);
        next.delete(nodeId);
        nodesToRemove.forEach(id => next.delete(id));
        return next;
      });
    } else {
      // Expand logic
      const children = hiddenNodes.get(nodeId) || [];
      if (children.length > 0) {
        // Add metadata to children
        const enhancedChildren = children.map(child => ({
          ...child,
          data: {
            ...child.data,
            department: node.data.department,
            employees: Math.floor(Math.random() * 20) + 5,
            budget: Math.floor(node.data.budget * 0.3)
          }
        }));

        const newNodes = [...visibleNodes, ...enhancedChildren];
        const newEdges = [...visibleEdges];
        
        enhancedChildren.forEach(child => {
          newEdges.push({
            id: `edge-${nodeId}-${child.id}`,
            source: nodeId,
            target: child.id,
            label: ''
          });
        });
        
        setVisibleNodes(newNodes);
        setVisibleEdges(newEdges);
        setExpandedNodes(prev => new Set([...prev, nodeId]));
      }
    }
  }, [expandedNodes, hiddenNodes, visibleNodes]);

  const enhancedNodes = useMemo(() => 
    visibleNodes.map(node => ({
      ...node,
      label: `${node.label} (${node.data?.employees || 0})`,
      icon: node.data?.hasChildren
        ? expandedNodes.has(node.id) ? '−' : '+'
        : undefined,
      size: node.data?.budget ? Math.log(node.data.budget) * 2 : 10,
      fill: {
        'Engineering': '#ff6b6b',
        'Sales': '#4ecdc4',
        'Marketing': '#45b7d1',
        'Support': '#96ceb4',
        'HR': '#feca57'
      }[node.data?.department] || '#999999'
    })),
    [visibleNodes, expandedNodes]
  );

  return (
    <div>
      <h3>Lazy Load with Rich Metadata</h3>
      <p>
        Nodes sized by budget, colored by department, labeled with employee count.
        Click to expand/collapse and view details.
      </p>
      
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ height: '600px' }}>
            <GraphCanvas
              nodes={enhancedNodes}
              edges={visibleEdges}
              theme={darkTheme}
              layoutType="forceDirected2d"
              layoutOverrides={{
                nodeStrength: -1500,
                linkDistance: 80
              }}
              onNodeClick={handleNodeClick}
              animated
              draggable
            />
          </div>
        </div>
        
        <div style={{ width: '300px' }}>
          <div style={{ 
            background: '#f0f0f0', 
            padding: '15px',
            borderRadius: '4px',
            height: '600px',
            overflow: 'auto'
          }}>
            <h4>Node Details</h4>
            {selectedNode ? (
              <div>
                <p><strong>ID:</strong> {selectedNode.id}</p>
                <p><strong>Label:</strong> {selectedNode.label}</p>
                <p><strong>Department:</strong> {selectedNode.data?.department}</p>
                <p><strong>Employees:</strong> {selectedNode.data?.employees}</p>
                <p><strong>Budget:</strong> ${selectedNode.data?.budget?.toLocaleString()}</p>
                <p><strong>Level:</strong> {selectedNode.data?.level}</p>
                <p><strong>Has Children:</strong> {selectedNode.data?.hasChildren ? 'Yes' : 'No'}</p>
                <p><strong>Expanded:</strong> {expandedNodes.has(selectedNode.id) ? 'Yes' : 'No'}</p>
              </div>
            ) : (
              <p>Click a node to see details</p>
            )}
            
            <hr style={{ margin: '20px 0' }} />
            
            <h4>Graph Stats</h4>
            <p><strong>Visible Nodes:</strong> {visibleNodes.length}</p>
            <p><strong>Visible Edges:</strong> {visibleEdges.length}</p>
            <p><strong>Expanded Nodes:</strong> {expandedNodes.size}</p>
            <p><strong>Total Potential Nodes:</strong> ~{Math.pow(4, 3) * 5}</p>
          </div>
        </div>
      </div>
    </div>
  );
};