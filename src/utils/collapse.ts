import uniqBy from 'lodash/uniqBy';
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
        currentHiddenEdges,
        currentHiddenNodes
      });
      hiddenEdges.push(...nested.hiddenEdges);
      hiddenNodes.push(...nested.hiddenNodes);
    }
  }

  return {
    hiddenEdges: uniqBy(hiddenEdges, 'id'),
    hiddenNodes: uniqBy(hiddenNodes, 'id')
  };
}

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
