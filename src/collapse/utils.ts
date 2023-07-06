import { GraphEdge, GraphNode } from '../types';

interface GetHiddenChildrenInput {
  nodeId: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
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
  nodes,
  edges,
  currentHiddenNodes,
  currentHiddenEdges
}: GetHiddenChildrenInput) {
  const hiddenNodes: GraphNode[] = [];
  const hiddenEdges: GraphEdge[] = [];
  const curHiddenNodeIds = currentHiddenNodes.map(n => n.id);
  const curHiddenEdgeIds = currentHiddenEdges.map(e => e.id);

  const outboundEdges = edges.filter(l => l.source === nodeId);
  const outboundEdgeNodeIds = outboundEdges.map(l => l.target);

  hiddenEdges.push(...outboundEdges);
  for (const outboundEdgeNodeId of outboundEdgeNodeIds) {
    const incomingEdges = edges.filter(
      l => l.target === outboundEdgeNodeId && l.source !== nodeId
    );
    let hideNode = false;

    // Check to see if any other edge is coming into this node
    if (incomingEdges.length === 0) {
      hideNode = true;
    } else if (
      incomingEdges.length > 0 &&
      !curHiddenNodeIds.includes(outboundEdgeNodeId)
    ) {
      // If all inbound links are hidden, hide this node as well
      const inboundNodeLinkIds = incomingEdges.map(l => l.id);
      if (inboundNodeLinkIds.every(i => curHiddenEdgeIds.includes(i))) {
        hideNode = true;
      }
    }
    if (hideNode) {
      // Need to hide this node and any children of this node
      const node = nodes.find(n => n.id === outboundEdgeNodeId);
      if (node) {
        hiddenNodes.push(node);
      }
      const nested = getHiddenChildren({
        nodeId: outboundEdgeNodeId,
        nodes,
        edges,
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
  const curHiddenNodes = [];
  const curHiddenEdges = [];

  for (const collapsedId of collapsedIds) {
    const { hiddenEdges, hiddenNodes } = getHiddenChildren({
      nodeId: collapsedId,
      nodes,
      edges,
      currentHiddenEdges: curHiddenEdges,
      currentHiddenNodes: curHiddenNodes
    });

    curHiddenNodes.push(...hiddenNodes);
    curHiddenEdges.push(...hiddenEdges);
  }

  const hiddenNodeIds = curHiddenNodes.map(n => n.id);
  const hiddenEdgeIds = curHiddenEdges.map(e => e.id);
  const visibleNodes = nodes.filter(n => !hiddenNodeIds.includes(n.id));
  const visibleEdges = edges.filter(e => !hiddenEdgeIds.includes(e.id));

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
  const parentIds = [];
  const inboundEdges = edges.filter(l => l.target === nodeId);
  const inboundEdgeIds = inboundEdges.map(e => e.id);
  const hasVisibleInboundEdge = inboundEdgeIds.some(id =>
    visibleEdgeIds.includes(id)
  );

  if (hasVisibleInboundEdge) {
    // If there is a visible edge to this node, that means the node is
    // visible so no parents need to be expanded
    return parentIds;
  }

  const inboundEdgeNodeIds = inboundEdges.map(l => l.source);
  let addedParent = false;

  for (const inboundNodeId of inboundEdgeNodeIds) {
    if (!addedParent) {
      // Only want to expand a single path to the node, so if there
      // are multiple hidden incoming edges, only expand the first
      // to reduce how many nodes are expanded to get to the node
      parentIds.push(
        ...[
          inboundNodeId,
          ...getExpandPath({ nodeId: inboundNodeId, edges, visibleEdgeIds })
        ]
      );
      addedParent = true;
    }
  }

  return parentIds;
};
