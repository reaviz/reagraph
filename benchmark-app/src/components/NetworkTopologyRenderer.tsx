/**
 * NetworkTopologyRenderer - Specialized renderer for deep network hierarchies
 * 
 * Features:
 * - 8-level deep nesting support
 * - Curved animated edges
 * - Level-specific node styling
 * - Performance optimizations for large hierarchies
 * - Network-specific visualizations
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GraphCanvas, useCollapse, getVisibleEntities, darkTheme } from '../../../src';
import { GraphData } from '../types/benchmark.types';
import { NetworkNode } from '../utils/networkTopologyGenerator';

interface NetworkTopologyRendererProps {
  data: GraphData & {
    metadata?: {
      totalLevels: number;
      nodeCountByLevel: number[];
      defaultCollapsedIds: string[];
    };
  };
  animated?: boolean;
  edgeInterpolation?: 'linear' | 'curved';
  initialCollapsedIds?: string[];
  layoutType?: string;
  cameraMode?: 'pan' | 'rotate' | 'orbit';
  onNodeCountChange?: (count: number) => void;
  onEdgeCountChange?: (count: number) => void;
  onCollapseChange?: (collapsedIds: string[]) => void;
  onPerformanceUpdate?: (metrics: any) => void;
  showControls?: boolean;
  showNetworkMetrics?: boolean;
  className?: string;
}

export const NetworkTopologyRenderer: React.FC<NetworkTopologyRendererProps> = ({
  data,
  animated = true,
  edgeInterpolation = 'curved',
  initialCollapsedIds,
  layoutType = 'hierarchical',
  cameraMode = 'rotate',
  onNodeCountChange,
  onEdgeCountChange,
  onCollapseChange,
  onPerformanceUpdate,
  showControls = true,
  showNetworkMetrics = true,
  className = ''
}) => {
  // Use provided collapsed IDs or default from metadata
  // Temporarily disable default collapsed nodes to debug rendering issue
  const defaultCollapsed = []; // initialCollapsedIds || data.metadata?.defaultCollapsedIds || [];
  console.log('NetworkTopologyRenderer - Default collapsed nodes:', defaultCollapsed.length);
  const [collapsedNodeIds, setCollapsedNodeIds] = useState<string[]>(defaultCollapsed);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [showMinimap, setShowMinimap] = useState(false);
  const [pathHighlight, setPathHighlight] = useState<string[]>([]);
  
  // Performance tracking
  const [visibleCounts, setVisibleCounts] = useState({ nodes: 0, edges: 0 });
  const [renderTime, setRenderTime] = useState(0);

  // Convert data format
  const graphData = useMemo(() => {
    console.log('NetworkTopologyRenderer - Input data:', {
      nodeCount: data.nodes.length,
      edgeCount: data.edges.length,
      metadata: data.metadata,
      firstNode: data.nodes[0],
      sampleNodes: data.nodes.slice(0, 3)
    });
    
    const nodes = data.nodes.map(node => ({
      id: node.id,
      label: node.label || node.id,
      fill: node.color || '#4ecdc4',
      size: node.size || 30,
      data: node.data // Keep the original data for level information
    }));

    const edges = data.edges.map(edge => ({
      id: edge.id || `${edge.source}-${edge.target}`,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      fill: edge.color || '#666666',
      size: edge.size || 1,
      curved: edge.curved !== undefined ? edge.curved : true
    }));

    return { nodes, edges };
  }, [data]);

  // Use the collapse hook
  const { getExpandPathIds } = useCollapse({ 
    collapsedNodeIds, 
    nodes: graphData.nodes, 
    edges: graphData.edges 
  });

  // Calculate visible entities with performance tracking
  const visibleEntities = useMemo(() => {
    const startTime = performance.now();
    const entities = getVisibleEntities({
      collapsedIds: collapsedNodeIds,
      nodes: graphData.nodes,
      edges: graphData.edges
    });
    setRenderTime(performance.now() - startTime);
    
    console.log('NetworkTopologyRenderer - getVisibleEntities result:', {
      inputNodes: graphData.nodes.length,
      inputEdges: graphData.edges.length,
      collapsedIds: collapsedNodeIds.length,
      visibleNodes: entities.visibleNodes.length,
      visibleEdges: entities.visibleEdges.length
    });
    
    return entities;
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
    
    // Debug logging
    console.log('NetworkTopologyRenderer - Visible entities:', {
      nodes: visibleEntities.visibleNodes.length,
      edges: visibleEntities.visibleEdges.length,
      firstNode: visibleEntities.visibleNodes[0],
      firstEdge: visibleEntities.visibleEdges[0],
      totalNodes: data.nodes.length,
      totalEdges: data.edges.length,
      collapsedCount: collapsedNodeIds.length
    });
  }, [visibleEntities, onNodeCountChange, onEdgeCountChange]);

  // Notify parent of collapse changes
  useEffect(() => {
    onCollapseChange?.(collapsedNodeIds);
  }, [collapsedNodeIds, onCollapseChange]);

  // Track performance metrics
  useEffect(() => {
    const metrics = {
      visibleNodes: visibleCounts.nodes,
      visibleEdges: visibleCounts.edges,
      collapsedNodes: collapsedNodeIds.length,
      renderTime,
      timestamp: Date.now()
    };
    onPerformanceUpdate?.(metrics);
  }, [visibleCounts, collapsedNodeIds, renderTime, onPerformanceUpdate]);

  // Node click handler
  const handleNodeClick = useCallback((node: any) => {
    setSelectedNode(node);
    // Extract level from node data if available
    const nodeData = data.nodes.find(n => n.id === node.id);
    if (nodeData?.data?.level !== undefined) {
      setSelectedLevel(nodeData.data.level);
    }
  }, [data.nodes]);

  // Level-based operations
  const collapseLevel = useCallback((level: number) => {
    const nodesAtLevel = data.nodes.filter(n => n.data?.level === level);
    const nodeIds = nodesAtLevel.map(n => n.id);
    setCollapsedNodeIds(prev => [...new Set([...prev, ...nodeIds])]);
  }, [data.nodes]);

  const expandLevel = useCallback((level: number) => {
    const nodesAtLevel = data.nodes.filter(n => n.data?.level === level);
    const nodeIds = new Set(nodesAtLevel.map(n => n.id));
    setCollapsedNodeIds(prev => prev.filter(id => !nodeIds.has(id)));
  }, [data.nodes]);

  const collapseBelow = useCallback((level: number) => {
    const nodesToCollapse = data.nodes
      .filter(n => n.data?.level !== undefined && n.data.level >= level)
      .map(n => n.id);
    setCollapsedNodeIds(prev => [...new Set([...prev, ...nodesToCollapse])]);
  }, [data.nodes]);

  const expandToLevel = useCallback((level: number) => {
    const nodesToKeep = data.nodes
      .filter(n => n.data?.level !== undefined && n.data.level >= level)
      .map(n => n.id);
    const nodesToKeepSet = new Set(nodesToKeep);
    setCollapsedNodeIds(prev => prev.filter(id => nodesToKeepSet.has(id)));
  }, [data.nodes]);

  // Path operations
  const highlightPath = useCallback((fromId: string, toId: string) => {
    // Simple path finding - in real implementation would use graph traversal
    setPathHighlight([fromId, toId]);
  }, []);

  const clearHighlight = useCallback(() => {
    setPathHighlight([]);
  }, []);

  // Get network metrics
  const networkMetrics = useMemo(() => {
    if (!showNetworkMetrics || !data.metadata) return null;
    
    const activeNodes = data.nodes.filter(n => n.data?.status === 'active').length;
    const errorNodes = data.nodes.filter(n => n.data?.status === 'error').length;
    const warningNodes = data.nodes.filter(n => n.data?.status === 'warning').length;
    
    return {
      totalNodes: data.nodes.length,
      activeNodes,
      errorNodes,
      warningNodes,
      levels: data.metadata.totalLevels,
      nodesByLevel: data.metadata.nodeCountByLevel
    };
  }, [data, showNetworkMetrics]);

  return (
    <div className={`network-topology-renderer ${className}`} style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h3 style={styles.title}>Network Topology Visualization</h3>
        <div style={styles.stats}>
          <span style={styles.stat}>
            {visibleCounts.nodes}/{data.nodes.length} nodes
          </span>
          <span style={styles.stat}>
            {visibleCounts.edges}/{data.edges.length} edges
          </span>
          <span style={styles.stat}>
            Levels: {data.metadata?.totalLevels || 'N/A'}
          </span>
          <span style={styles.stat}>
            Render: {renderTime.toFixed(1)}ms
          </span>
        </div>
      </div>

      {/* Level Controls */}
      {showControls && data.metadata && (
        <div style={styles.levelControls}>
          <div style={styles.levelButtons}>
            <span style={styles.levelLabel}>Quick Actions:</span>
            <button onClick={() => expandToLevel(0)} style={styles.levelButton}>
              Show All
            </button>
            <button onClick={() => expandToLevel(4)} style={styles.levelButton}>
              Show to Servers
            </button>
            <button onClick={() => collapseBelow(3)} style={styles.levelButton}>
              Hide Below Racks
            </button>
            <button onClick={() => setCollapsedNodeIds(defaultCollapsed)} style={styles.levelButton}>
              Reset View
            </button>
          </div>
          
          <div style={styles.levelIndicators}>
            {Array.from({ length: data.metadata.totalLevels }, (_, i) => (
              <div
                key={i}
                style={{
                  ...styles.levelIndicator,
                  backgroundColor: selectedLevel === i ? '#4ecdc4' : '#2a2a2a',
                  cursor: 'pointer'
                }}
                onClick={() => expandToLevel(i + 1)}
                title={`Level ${i}: ${data.metadata!.nodeCountByLevel[i]} nodes`}
              >
                {i}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Network Metrics */}
      {showNetworkMetrics && networkMetrics && (
        <div style={styles.metricsPanel}>
          <div style={styles.metricItem}>
            <span style={styles.metricLabel}>Active:</span>
            <span style={{ ...styles.metricValue, color: '#4caf50' }}>
              {networkMetrics.activeNodes}
            </span>
          </div>
          <div style={styles.metricItem}>
            <span style={styles.metricLabel}>Errors:</span>
            <span style={{ ...styles.metricValue, color: '#f44336' }}>
              {networkMetrics.errorNodes}
            </span>
          </div>
          <div style={styles.metricItem}>
            <span style={styles.metricLabel}>Warnings:</span>
            <span style={{ ...styles.metricValue, color: '#ff9800' }}>
              {networkMetrics.warningNodes}
            </span>
          </div>
        </div>
      )}

      {/* Graph Container */}
      <div style={styles.graphContainer}>
        {console.log('[NetworkTopologyRenderer] Rendering GraphCanvas with:', {
          visibleNodesCount: visibleEntities.visibleNodes.length,
          visibleEdgesCount: visibleEntities.visibleEdges.length,
          firstNode: visibleEntities.visibleNodes[0],
          firstEdge: visibleEntities.visibleEdges[0],
          sampleNodes: visibleEntities.visibleNodes.slice(0, 5).map(n => ({
            id: n.id,
            label: n.label,
            fill: n.fill,
            size: n.size
          }))
        })}
        <GraphCanvas
          key={`graph-${data.nodes.length}-${collapsedNodeIds.length}`}
          nodes={visibleEntities.visibleNodes}
          edges={visibleEntities.visibleEdges}
          layoutType="forceDirected2d"
          layoutOverrides={{
            iterations: 300,
            repulsion: -100,
            attraction: 0.1,
            gravity: 0.1
          }}
          cameraMode={cameraMode}
          animated={animated}
          edgeInterpolation={edgeInterpolation}
          collapsedNodeIds={collapsedNodeIds}
          minDistance={1}
          maxDistance={5000}
          onNodeClick={(node) => {
            console.log('Node clicked:', node.id);
            handleNodeClick(node);
          }}
          onCanvasClick={() => {
            setSelectedNode(null);
            setSelectedLevel(null);
          }}
          theme={{
            ...darkTheme,
            canvas: { background: '#0a0a0a' },
            node: {
              ...darkTheme.node,
              fill: '#4ecdc4',
              activeFill: '#00ff88',
              opacity: 1,
              selectedOpacity: 1,
              inactiveOpacity: 0.2,
              label: {
                ...darkTheme.node.label,
                color: '#ffffff',
                stroke: '#000000',
                activeColor: '#ffffff'
              }
            },
            edge: {
              ...darkTheme.edge,
              fill: '#666666',
              activeFill: '#4ecdc4',
              opacity: 0.6,
              selectedOpacity: 1,
              inactiveOpacity: 0.1
            }
          }}
        />
      </div>

      {/* Selected Node Info */}
      {selectedNode && (
        <div style={styles.nodeInfo}>
          <h4 style={styles.nodeInfoTitle}>{selectedNode.label || selectedNode.id}</h4>
          {selectedNode.data && (
            <>
              <div>Level: {selectedNode.data.level}</div>
              <div>Type: {selectedNode.data.type}</div>
              <div>Status: <span style={{
                color: selectedNode.data.status === 'error' ? '#f44336' :
                       selectedNode.data.status === 'warning' ? '#ff9800' :
                       selectedNode.data.status === 'maintenance' ? '#9e9e9e' :
                       '#4caf50'
              }}>{selectedNode.data.status}</span></div>
              {selectedNode.data.metrics && (
                <>
                  <div>Latency: {selectedNode.data.metrics.latency.toFixed(1)}ms</div>
                  <div>Throughput: {selectedNode.data.metrics.throughput.toFixed(0)} Mbps</div>
                  <div>Utilization: {(selectedNode.data.metrics.utilization * 100).toFixed(0)}%</div>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

// Move styles outside component to ensure they're available when component renders
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
  levelControls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    background: '#151515',
    borderBottom: '1px solid #333'
  },
  levelButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  levelLabel: {
    color: '#888',
    fontSize: '0.9rem',
    marginRight: '0.5rem'
  },
  levelButton: {
    padding: '0.25rem 0.75rem',
    background: '#2a2a2a',
    border: '1px solid #444',
    borderRadius: '4px',
    color: '#ffffff',
    fontSize: '0.8rem',
    cursor: 'pointer' as const,
    transition: 'all 0.2s'
  },
  levelIndicators: {
    display: 'flex',
    gap: '0.25rem'
  },
  levelIndicator: {
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    color: '#ffffff',
    fontSize: '0.75rem',
    fontWeight: 'bold' as const,
    transition: 'all 0.2s'
  },
  metricsPanel: {
    display: 'flex',
    gap: '2rem',
    padding: '0.5rem 1rem',
    background: '#0f0f0f',
    borderBottom: '1px solid #333'
  },
  metricItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  metricLabel: {
    color: '#888',
    fontSize: '0.85rem'
  },
  metricValue: {
    fontWeight: 'bold' as const,
    fontSize: '0.9rem'
  },
  graphContainer: {
    flex: 1,
    position: 'relative' as const,
    minHeight: '400px'
  },
  nodeInfo: {
    position: 'absolute' as const,
    top: '120px',
    right: '1rem',
    background: 'rgba(0,0,0,0.95)',
    color: 'white',
    padding: '1rem',
    borderRadius: '8px',
    fontSize: '12px',
    minWidth: '200px',
    border: '1px solid #4ecdc4',
    lineHeight: '1.6'
  },
  nodeInfoTitle: {
    margin: '0 0 0.5rem 0',
    color: '#4ecdc4',
    fontSize: '14px',
    fontWeight: 'bold' as const
  }
};