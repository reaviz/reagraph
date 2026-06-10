import Graph from 'graphology';

import type { GraphEdge, GraphNode } from '../types';
import { buildGraph } from '../utils/graph';

interface GetHiddenChildrenInput {
  nodeId: string;
  graph: Graph;
  currentHiddenNodes: GraphNode[];
  currentHiddenEdges: GraphEdge[];
}

interface GetVisibleIdsInput {
  collapsedIds: string[];
  nodes: GraphNode[];
  edges: GraphEdge[];
  /**
   * Optional prebuilt graphology graph of the FULL node/edge set (e.g. built
   * once by the caller and reused across collapse/expand interactions).
   * Must contain the same nodes/edges passed above. Note the store's graph
   * is NOT suitable here: it holds the post-collapse visible subgraph.
   */
  graph?: Graph;
}

interface GetExpandPathInput {
  nodeId: string;
  edges: GraphEdge[];
  visibleEdgeIds: string[];
}

/**
 * Get a node's outbound edges in O(degree) via graphology's adjacency index.
 */
const getOutboundEdges = (graph: Graph, nodeId: string): GraphEdge[] =>
  graph.hasNode(nodeId)
    ? graph.mapOutEdges(nodeId, (_key, attributes) => attributes as GraphEdge)
    : [];

/**
 * Get a node's inbound edges in O(degree) via graphology's adjacency index.
 */
const getInboundEdges = (graph: Graph, nodeId: string): GraphEdge[] =>
  graph.hasNode(nodeId)
    ? graph.mapInEdges(nodeId, (_key, attributes) => attributes as GraphEdge)
    : [];

/**
 * Get the children of a node id that is hidden.
 */
function getHiddenChildren({
  nodeId,
  graph,
  currentHiddenNodes,
  currentHiddenEdges
}: GetHiddenChildrenInput) {
  const hiddenNodes: GraphNode[] = [];
  const hiddenEdges: GraphEdge[] = [];
  const curHiddenNodeIds = new Set(currentHiddenNodes.map(n => n.id));
  const curHiddenEdgeIds = new Set(currentHiddenEdges.map(e => e.id));

  const outboundEdges = getOutboundEdges(graph, nodeId);
  const outboundEdgeNodeIds = outboundEdges.map(l => l.target);

  hiddenEdges.push(...outboundEdges);
  for (const outboundEdgeNodeId of outboundEdgeNodeIds) {
    const incomingEdges = getInboundEdges(graph, outboundEdgeNodeId).filter(
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
      if (graph.hasNode(outboundEdgeNodeId)) {
        hiddenNodes.push(
          graph.getNodeAttributes(outboundEdgeNodeId) as GraphNode
        );
      }
      const nested = getHiddenChildren({
        nodeId: outboundEdgeNodeId,
        graph,
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
  edges,
  graph: providedGraph
}: GetVisibleIdsInput) => {
  // Nothing collapsed means nothing hidden. This runs on every nodes/edges
  // change, so skip the graph construction entirely in the common case.
  if (!collapsedIds?.length) {
    return { visibleNodes: nodes, visibleEdges: edges };
  }

  // Use the caller's prebuilt graph when supplied; otherwise build one
  // (same builder the store uses) so traversal gets O(degree) neighbor
  // access from graphology's adjacency indices instead of scanning the
  // edge array per node.
  const graph =
    providedGraph ?? buildGraph(new Graph({ multi: true }), nodes, edges);
  const curHiddenNodes: GraphNode[] = [];
  const curHiddenEdges: GraphEdge[] = [];

  for (const collapsedId of collapsedIds) {
    const { hiddenEdges, hiddenNodes } = getHiddenChildren({
      nodeId: collapsedId,
      graph,
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
  // Only edges are available here, so let graphology create the endpoints
  // implicitly via mergeNode and use its inbound adjacency for the walk.
  const graph = new Graph({ multi: true });
  for (const edge of edges) {
    graph.mergeNode(edge.source);
    graph.mergeNode(edge.target);
    graph.addEdge(edge.source, edge.target, edge);
  }
  const visibleEdgeIdSet = new Set(visibleEdgeIds);

  const walk = (id: string): string[] => {
    const parentIds: string[] = [];
    const inboundEdges = getInboundEdges(graph, id);
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
