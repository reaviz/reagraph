/**
 * CollapsibleGraphRenderer - Graph renderer with collapsible node support
 * 
 * Features:
 * - Supports animated edges
 * - Two-level nested node expansion/collapse
 * - Performance tracking for collapse operations
 * - Visual indicators for collapsible nodes
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GraphCanvas, useCollapse, getVisibleEntities } from '../../../src';
import { GraphData } from '../types/benchmark.types';

interface CollapsibleGraphRendererProps {
  data: GraphData;
  animated?: boolean;
  edgeInterpolation?: 'linear' | 'curved';
  initialCollapsedIds?: string[];
  workerEnabled?: boolean;
  cameraMode?: 'pan' | 'rotate' | 'orbit';
  onNodeCountChange?: (count: number) => void;
  onEdgeCountChange?: (count: number) => void;
  onCollapseChange?: (collapsedIds: string[]) => void;
  onPerformanceUpdate?: (metrics: any) => void;
  showControls?: boolean;
  className?: string;
}

export const CollapsibleGraphRenderer: React.FC<CollapsibleGraphRendererProps> = ({
  data,
  animated = false,
  edgeInterpolation = 'linear',
  initialCollapsedIds = [],
  workerEnabled = false,
  cameraMode = 'rotate',
  onNodeCountChange,
  onEdgeCountChange,
  onCollapseChange,
  onPerformanceUpdate,
  showControls = true,
  className = ''
}) => {
  // Collapse state management
  const [collapsedNodeIds, setCollapsedNodeIds] = useState<string[]>(initialCollapsedIds);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [visibleCounts, setVisibleCounts] = useState({ nodes: 0, edges: 0 });
  
  // Convert data format
  const graphData = useMemo(() => {
    const nodes = data.nodes.map(node => ({
      id: node.id,
      label: node.label || node.id,
      fill: node.color || '#4ecdc4',
      size: node.size || 1
    }));

    const edges = data.edges.map(edge => ({
      id: edge.id || `${edge.source}-${edge.target}`,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      fill: edge.color || '#666666',
      size: edge.size || 1
    }));

    return { nodes, edges };
  }, [data]);

  // Use the collapse hook
  const { getExpandPathIds } = useCollapse({ 
    collapsedNodeIds, 
    nodes: graphData.nodes, 
    edges: graphData.edges 
  });

  // Calculate visible entities
  const visibleEntities = useMemo(() => {
    return getVisibleEntities({
      collapsedIds: collapsedNodeIds,
      nodes: graphData.nodes,
      edges: graphData.edges
    });
  }, [collapsedNodeIds, graphData.nodes, graphData.edges]);

  // Update counts when visibility changes
  useEffect(() => {
    const counts = {
      nodes: visibleEntities.visibleNodes.length,
      edges: visibleEntities.visibleEdges.length
    };
    setVisibleCounts(counts);
    onNodeCountChange?.(counts.nodes);
    onEdgeCountChange?.(counts.edges);
  }, [visibleEntities, onNodeCountChange, onEdgeCountChange]);

  // Notify parent of collapse changes
  useEffect(() => {
    onCollapseChange?.(collapsedNodeIds);
  }, [collapsedNodeIds, onCollapseChange]);

  // Track performance of collapse operations
  const measureCollapsePerformance = useCallback((operation: () => void) => {
    const startTime = performance.now();
    operation();
    const endTime = performance.now();
    
    const metrics = {
      collapseOperationTime: endTime - startTime,
      visibleNodes: visibleCounts.nodes,
      visibleEdges: visibleCounts.edges,
      collapsedNodes: collapsedNodeIds.length,
      timestamp: Date.now()
    };
    
    onPerformanceUpdate?.(metrics);
  }, [visibleCounts, collapsedNodeIds, onPerformanceUpdate]);

  // Collapse/expand handlers
  const handleNodeClick = useCallback((node: any) => {
    setSelectedNode(node);
  }, []);

  const collapseNode = useCallback((nodeId: string) => {
    measureCollapsePerformance(() => {
      if (!collapsedNodeIds.includes(nodeId)) {
        setCollapsedNodeIds([...collapsedNodeIds, nodeId]);
      }
    });
  }, [collapsedNodeIds, measureCollapsePerformance]);

  const expandNode = useCallback((nodeId: string) => {
    measureCollapsePerformance(() => {
      setCollapsedNodeIds(collapsedNodeIds.filter(id => id !== nodeId));
    });
  }, [collapsedNodeIds, measureCollapsePerformance]);

  const expandAll = useCallback(() => {
    measureCollapsePerformance(() => {
      setCollapsedNodeIds([]);
    });
  }, [measureCollapsePerformance]);

  const collapseAll = useCallback(() => {
    measureCollapsePerformance(() => {
      // Find all nodes that have children
      const nodesWithChildren = new Set<string>();
      graphData.edges.forEach(edge => {
        nodesWithChildren.add(edge.source);
      });
      setCollapsedNodeIds(Array.from(nodesWithChildren));
    });
  }, [graphData.edges, measureCollapsePerformance]);

  // Check if a node can be collapsed (has children)
  const canCollapse = useCallback((nodeId: string) => {
    return graphData.edges.some(edge => edge.source === nodeId);
  }, [graphData.edges]);

  return (
    <div className={`collapsible-graph-renderer ${className}`} style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h3 style={styles.title}>Collapsible Graph Visualization</h3>
        <div style={styles.stats}>
          <span style={styles.stat}>
            {visibleCounts.nodes}/{data.nodes.length} nodes
          </span>
          <span style={styles.stat}>
            {visibleCounts.edges}/{data.edges.length} edges
          </span>
          <span style={styles.stat}>
            Collapsed: {collapsedNodeIds.length}
          </span>
          <span style={styles.stat}>
            Animated: {animated ? 'ON' : 'OFF'}
          </span>
        </div>
      </div>

      {/* Controls Panel */}
      {showControls && (
        <div style={styles.controlsPanel}>
          <div style={styles.controlSection}>
            <button onClick={expandAll} style={styles.button}>
              Expand All
            </button>
            <button onClick={collapseAll} style={styles.button}>
              Collapse All
            </button>
          </div>
          
          {selectedNode && (
            <div style={styles.controlSection}>
              <span style={styles.selectedNodeLabel}>
                Selected: {selectedNode.label || selectedNode.id}
              </span>
              {canCollapse(selectedNode.id) && (
                <>
                  {collapsedNodeIds.includes(selectedNode.id) ? (
                    <button 
                      onClick={() => expandNode(selectedNode.id)} 
                      style={styles.button}
                    >
                      Expand
                    </button>
                  ) : (
                    <button 
                      onClick={() => collapseNode(selectedNode.id)} 
                      style={styles.button}
                    >
                      Collapse
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Graph Container */}
      <div style={styles.graphContainer}>
        <GraphCanvas
          nodes={visibleEntities.visibleNodes}
          edges={visibleEntities.visibleEdges}
          collapsedNodeIds={collapsedNodeIds}
          layoutType="forceDirected2d"
          cameraMode={cameraMode}
          animated={animated}
          edgeInterpolation={edgeInterpolation}
          selections={selectedNode ? [selectedNode.id] : []}
          onNodeClick={handleNodeClick}
          onCanvasClick={() => setSelectedNode(null)}
        />
      </div>

      {/* Collapsed Nodes Info */}
      {showControls && collapsedNodeIds.length > 0 && (
        <div style={styles.collapsedInfo}>
          <h4 style={styles.collapsedTitle}>Collapsed Nodes:</h4>
          <div style={styles.collapsedList}>
            {collapsedNodeIds.map(nodeId => {
              const node = graphData.nodes.find(n => n.id === nodeId);
              return (
                <div key={nodeId} style={styles.collapsedItem}>
                  <span>{node?.label || nodeId}</span>
                  <button 
                    onClick={() => expandNode(nodeId)}
                    style={styles.smallButton}
                  >
                    Expand
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
    background: '#0a0a0a',
    border: '1px solid #333',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    background: '#1a1a1a',
    borderBottom: '1px solid #333'
  },
  title: {
    margin: 0,
    color: '#4ecdc4',
    fontSize: '1.1rem',
    fontWeight: 'bold' as const
  },
  stats: {
    display: 'flex',
    gap: '1rem',
    fontSize: '0.9rem'
  },
  stat: {
    color: '#aaaaaa',
    fontFamily: 'monospace'
  },
  controlsPanel: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    background: '#151515',
    borderBottom: '1px solid #333',
    flexWrap: 'wrap' as const,
    gap: '1rem'
  },
  controlSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  button: {
    padding: '0.25rem 0.75rem',
    background: '#2a2a2a',
    border: '1px solid #444',
    borderRadius: '4px',
    color: '#ffffff',
    fontSize: '0.9rem',
    cursor: 'pointer' as const,
    transition: 'all 0.2s',
    '&:hover': {
      background: '#3a3a3a',
      borderColor: '#555'
    }
  },
  smallButton: {
    padding: '0.15rem 0.5rem',
    background: '#2a2a2a',
    border: '1px solid #444',
    borderRadius: '3px',
    color: '#ffffff',
    fontSize: '0.8rem',
    cursor: 'pointer' as const
  },
  selectedNodeLabel: {
    color: '#4ecdc4',
    fontSize: '0.9rem',
    fontWeight: 'bold' as const
  },
  graphContainer: {
    flex: 1,
    position: 'relative' as const,
    minHeight: '400px'
  },
  collapsedInfo: {
    position: 'absolute' as const,
    top: '120px',
    right: '1rem',
    background: 'rgba(0,0,0,0.9)',
    color: 'white',
    padding: '1rem',
    borderRadius: '8px',
    fontSize: '12px',
    maxWidth: '200px',
    maxHeight: '300px',
    overflow: 'auto',
    border: '1px solid #4ecdc4'
  },
  collapsedTitle: {
    margin: '0 0 0.5rem 0',
    color: '#4ecdc4',
    fontSize: '13px',
    fontWeight: 'bold' as const
  },
  collapsedList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem'
  },
  collapsedItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '11px'
  }
};