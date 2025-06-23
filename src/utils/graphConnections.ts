/**
 * Graph traversal utilities for finding connected elements
 * Used for highlighting connected nodes and edges when selecting nodes
 */

import Graph from 'graphology';

export interface ConnectionInfo {
  connectedNodes: Set<string>;
  connectedEdges: Set<string>;
  degreeMap: Map<string, number>; // For variable highlighting based on connection depth
}

/**
 * Get all nodes and edges connected to the specified nodes up to a certain depth
 * Uses breadth-first search for efficient traversal
 *
 * @param graph - The graphology graph instance
 * @param nodeIds - Array of starting node IDs
 * @param depth - Maximum depth to traverse (default: 1)
 * @returns ConnectionInfo with connected nodes, edges, and degree map
 */
export function getConnectedElements(
  graph: Graph,
  nodeIds: string[],
  depth: number = 1
): ConnectionInfo {
  const connectedNodes = new Set<string>();
  const connectedEdges = new Set<string>();
  const degreeMap = new Map<string, number>();

  if (!graph || nodeIds.length === 0) {
    return { connectedNodes, connectedEdges, degreeMap };
  }

  // BFS to find connected elements up to specified depth
  const queue: Array<{ nodeId: string; currentDepth: number }> = nodeIds.map(
    id => ({ nodeId: id, currentDepth: 0 })
  );

  const visited = new Set<string>(nodeIds);

  while (queue.length > 0) {
    const { nodeId, currentDepth } = queue.shift()!;

    if (currentDepth >= depth) continue;

    try {
      // Get all edges connected to this node
      graph.edges(nodeId).forEach(edgeId => {
        const edge = graph.getEdgeAttributes(edgeId);
        const source = graph.source(edgeId);
        const target = graph.target(edgeId);
        const neighborId = source === nodeId ? target : source;

        connectedEdges.add(edgeId);

        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          connectedNodes.add(neighborId);
          degreeMap.set(neighborId, currentDepth + 1);

          if (currentDepth + 1 < depth) {
            queue.push({ nodeId: neighborId, currentDepth: currentDepth + 1 });
          }
        }
      });
    } catch (error) {
      // Node might not exist in graph
      console.warn(`Node ${nodeId} not found in graph`, error);
    }
  }

  return { connectedNodes, connectedEdges, degreeMap };
}

/**
 * Optimized version for getting directly connected elements (depth = 1)
 * Uses graphology's efficient neighbor iteration
 *
 * @param graph - The graphology graph instance
 * @param nodeId - The node ID to get connections for
 * @returns ConnectionInfo with directly connected nodes and edges
 */
export function getDirectlyConnectedElements(
  graph: Graph,
  nodeId: string
): ConnectionInfo {
  const connectedNodes = new Set<string>();
  const connectedEdges = new Set<string>();
  const degreeMap = new Map<string, number>();

  if (!graph || !nodeId) {
    return { connectedNodes, connectedEdges, degreeMap };
  }

  try {
    // Use graphology's efficient neighbor iteration
    graph.forEachNeighbor(nodeId, neighborId => {
      connectedNodes.add(neighborId);
      degreeMap.set(neighborId, 1);
    });

    // Get all edges connected to this node
    graph.forEachEdge(nodeId, edge => {
      connectedEdges.add(edge);
    });
  } catch (error) {
    // Node might not exist in graph
    console.warn(`Node ${nodeId} not found in graph`, error);
  }

  return { connectedNodes, connectedEdges, degreeMap };
}

/**
 * Get all nodes and edges connected to the edge's source and target nodes
 * Useful for highlighting when hovering over edges
 *
 * @param graph - The graphology graph instance
 * @param edgeId - The edge ID to get connections for
 * @param includeSourceTarget - Whether to include the source and target nodes in the result
 * @returns ConnectionInfo with connected nodes and edges
 */
export function getEdgeConnectedElements(
  graph: Graph,
  edgeId: string,
  includeSourceTarget: boolean = true
): ConnectionInfo {
  const connectedNodes = new Set<string>();
  const connectedEdges = new Set<string>();
  const degreeMap = new Map<string, number>();

  if (!graph || !edgeId) {
    return { connectedNodes, connectedEdges, degreeMap };
  }

  try {
    // Get source and target nodes of the edge
    const source = graph.source(edgeId);
    const target = graph.target(edgeId);

    if (includeSourceTarget) {
      connectedNodes.add(source);
      connectedNodes.add(target);
      degreeMap.set(source, 0);
      degreeMap.set(target, 0);
    }

    // Always include the edge itself
    connectedEdges.add(edgeId);

    // Get connections for both source and target
    const sourceConnections = getDirectlyConnectedElements(graph, source);
    const targetConnections = getDirectlyConnectedElements(graph, target);

    // Merge connections
    sourceConnections.connectedNodes.forEach(node => {
      if (node !== target) {
        // Don't duplicate the other end of the edge
        connectedNodes.add(node);
        degreeMap.set(node, 1);
      }
    });

    targetConnections.connectedNodes.forEach(node => {
      if (node !== source) {
        // Don't duplicate the other end of the edge
        connectedNodes.add(node);
        degreeMap.set(node, 1);
      }
    });

    sourceConnections.connectedEdges.forEach(edge => connectedEdges.add(edge));
    targetConnections.connectedEdges.forEach(edge => connectedEdges.add(edge));
  } catch (error) {
    console.warn(`Edge ${edgeId} not found in graph`, error);
  }

  return { connectedNodes, connectedEdges, degreeMap };
}

/**
 * Cache for connection calculations to improve performance
 * Useful for large graphs where connection calculations are expensive
 */
export class ConnectionCache {
  private cache = new Map<string, ConnectionInfo>();
  private graph: Graph;
  private maxCacheSize: number;

  constructor(graph: Graph, maxCacheSize: number = 1000) {
    this.graph = graph;
    this.maxCacheSize = maxCacheSize;
  }

  /**
   * Get connections with caching
   */
  getConnections(nodeId: string, depth: number = 1): ConnectionInfo {
    const cacheKey = `${nodeId}-${depth}`;

    if (!this.cache.has(cacheKey)) {
      // Evict oldest entries if cache is full
      if (this.cache.size >= this.maxCacheSize) {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }

      const connections =
        depth === 1
          ? getDirectlyConnectedElements(this.graph, nodeId)
          : getConnectedElements(this.graph, [nodeId], depth);

      this.cache.set(cacheKey, connections);
    }

    return this.cache.get(cacheKey)!;
  }

  /**
   * Clear the cache (e.g., when graph structure changes)
   */
  invalidate() {
    this.cache.clear();
  }

  /**
   * Partially invalidate cache for specific nodes
   */
  invalidateNode(nodeId: string) {
    // Remove all cache entries that include this node
    const keysToDelete: string[] = [];

    this.cache.forEach((value, key) => {
      if (key.startsWith(`${nodeId}-`) || value.connectedNodes.has(nodeId)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
  }
}

/**
 * Utility to determine visual priority for graph elements
 * Higher number = higher visual priority
 */
export enum VisualState {
  Normal = 0,
  Connected = 1,
  Hovered = 2,
  Selected = 3
}

/**
 * Get the visual state of an element based on current graph state
 */
export function getElementVisualState(
  elementId: string,
  hoveredNodeId?: string,
  hoveredEdgeId?: string,
  selections?: string[],
  connectedNodeIds?: Set<string>,
  connectedEdgeIds?: Set<string>
): VisualState {
  // Selected state has highest priority
  if (selections?.includes(elementId)) {
    return VisualState.Selected;
  }

  // Hovered state has second highest priority
  if (hoveredNodeId === elementId || hoveredEdgeId === elementId) {
    return VisualState.Hovered;
  }

  // Connected state
  if (connectedNodeIds?.has(elementId) || connectedEdgeIds?.has(elementId)) {
    return VisualState.Connected;
  }

  // Normal state
  return VisualState.Normal;
}
