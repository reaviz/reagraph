import type { GraphEdge, GraphNode } from '../types';

interface Adjacency {
  /** node id -> nodes's outbound edges */
  outEdges: Map<string, GraphEdge[]>;
  /** node id -> node's inbound edges */
  inEdges: Map<string, GraphEdge[]>;
  /** node id -> node */
  nodeMap: Map<string, GraphNode>;
}

/**
 * Build outbound/inbound adjacency lookups once so traversal can use
 * O(degree) neighbor access instead of scanning the full edge list (O(e))
 * on every step.
 */
function buildAdjacency(nodes: GraphNode[], edges: GraphEdge[]): Adjacency {
  const outEdges = new Map<string, GraphEdge[]>();
  const inEdges = new Map<string, GraphEdge[]>();
  const nodeMap = new Map<string, GraphNode>();

  for (const node of nodes) {
    nodeMap.set(node.id, node);
  }

  for (const edge of edges) {
    let out = outEdges.get(edge.source);
    if (!out) {
      out = [];
      outEdges.set(edge.source, out);
    }
    out.push(edge);

    let inbound = inEdges.get(edge.target);
    if (!inbound) {
      inbound = [];
      inEdges.set(edge.target, inbound);
    }
    inbound.push(edge);
  }

  return { outEdges, inEdges, nodeMap };
}

interface GetHiddenChildrenInput {
  nodeId: string;
  adjacency: Adjacency;
  currentHiddenNodes: GraphNode[];
  currentHiddenEdges: GraphEdge[];
}

interface GetVisibleIdsInput {
  collapsedIds: string[];
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface GetExpandPathInput {
  nodeId: string;
  edges: GraphEdge[];
  visibleEdgeIds: string[];
}

/**
 * Get the children of a node id that is hidden.
 */
function getHiddenChildren({
  nodeId,
  adjacency,
  currentHiddenNodes,
  currentHiddenEdges
}: GetHiddenChildrenInput) {
  const { outEdges, inEdges, nodeMap } = adjacency;
  const hiddenNodes: GraphNode[] = [];
  const hiddenEdges: GraphEdge[] = [];
  const curHiddenNodeIds = new Set(currentHiddenNodes.map(n => n.id));
  const curHiddenEdgeIds = new Set(currentHiddenEdges.map(e => e.id));

  const outboundEdges = outEdges.get(nodeId) ?? [];
  const outboundEdgeNodeIds = outboundEdges.map(l => l.target);

  hiddenEdges.push(...outboundEdges);
  for (const outboundEdgeNodeId of outboundEdgeNodeIds) {
    const incomingEdges = (inEdges.get(outboundEdgeNodeId) ?? []).filter(
      l => l.source !== nodeId
    );
    let hideNode = false;

    // Check to see if any other edge is coming into this node
    if (incomingEdges.length === 0) {
      hideNode = true;
    } else if (
      incomingEdges.length > 0 &&
      !curHiddenNodeIds.has(outboundEdgeNodeId)
    ) {
      // If all inbound links are hidden, hide this node as well
      if (incomingEdges.every(l => curHiddenEdgeIds.has(l.id))) {
        hideNode = true;
      }
    }
    if (hideNode) {
      // Need to hide this node and any children of this node
      const node = nodeMap.get(outboundEdgeNodeId);
      if (node) {
        hiddenNodes.push(node);
      }
      const nested = getHiddenChildren({
        nodeId: outboundEdgeNodeId,
        adjacency,
        currentHiddenEdges: hiddenEdges,
        currentHiddenNodes: hiddenNodes
      });
      hiddenEdges.push(...nested.hiddenEdges);
      hiddenNodes.push(...nested.hiddenNodes);
    }
  }

  const uniqueEdges: GraphEdge[] = Object.values(
    hiddenEdges.reduce(
      (acc, next) => ({
        ...acc,
        [next.id]: next
      }),
      {}
    )
  );

  const uniqueNodes: GraphNode[] = Object.values(
    hiddenNodes.reduce(
      (acc, next) => ({
        ...acc,
        [next.id]: next
      }),
      {}
    )
  );

  return {
    hiddenEdges: uniqueEdges,
    hiddenNodes: uniqueNodes
  };
}

/**
 * Get the visible nodes and edges given a collapsed set of ids.
 */
export const getVisibleEntities = ({
  collapsedIds,
  nodes,
  edges
}: GetVisibleIdsInput) => {
  const adjacency = buildAdjacency(nodes, edges);
  const curHiddenNodes: GraphNode[] = [];
  const curHiddenEdges: GraphEdge[] = [];

  for (const collapsedId of collapsedIds) {
    const { hiddenEdges, hiddenNodes } = getHiddenChildren({
      nodeId: collapsedId,
      adjacency,
      currentHiddenEdges: curHiddenEdges,
      currentHiddenNodes: curHiddenNodes
    });

    curHiddenNodes.push(...hiddenNodes);
    curHiddenEdges.push(...hiddenEdges);
  }

  const hiddenNodeIds = new Set(curHiddenNodes.map(n => n.id));
  const hiddenEdgeIds = new Set(curHiddenEdges.map(e => e.id));
  const visibleNodes = nodes.filter(n => !hiddenNodeIds.has(n.id));
  const visibleEdges = edges.filter(e => !hiddenEdgeIds.has(e.id));

  return {
    visibleNodes,
    visibleEdges
  };
};

/**
 * Get the path to expand a node.
 */
export const getExpandPath = ({
  nodeId,
  edges,
  visibleEdgeIds
}: GetExpandPathInput) => {
  // Build the inbound adjacency + visible set once, then walk it.
  const inEdges = new Map<string, GraphEdge[]>();
  for (const edge of edges) {
    let inbound = inEdges.get(edge.target);
    if (!inbound) {
      inbound = [];
      inEdges.set(edge.target, inbound);
    }
    inbound.push(edge);
  }
  const visibleEdgeIdSet = new Set(visibleEdgeIds);

  const walk = (id: string): string[] => {
    const parentIds: string[] = [];
    const inboundEdges = inEdges.get(id) ?? [];
    const hasVisibleInboundEdge = inboundEdges.some(edge =>
      visibleEdgeIdSet.has(edge.id)
    );

    if (hasVisibleInboundEdge) {
      // If there is a visible edge to this node, that means the node is
      // visible so no parents need to be expanded
      return parentIds;
    }

    let addedParent = false;
    for (const edge of inboundEdges) {
      if (!addedParent) {
        // Only want to expand a single path to the node, so if there
        // are multiple hidden incoming edges, only expand the first
        // to reduce how many nodes are expanded to get to the node
        parentIds.push(...[edge.source, ...walk(edge.source)]);
        addedParent = true;
      }
    }

    return parentIds;
  };

  return walk(nodeId);
};
