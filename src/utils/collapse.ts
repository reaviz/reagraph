import { Graph } from 'ngraph.graph';
import { InternalGraphEdge, InternalGraphNode } from '../types';

interface UpdateCollapsedStateInput {
  nodeIds: string[];
  nodes: InternalGraphNode[];
  edges: InternalGraphEdge[];
  graph: Graph;
}

function getNestedParents(nodeId: string, nodes: InternalGraphNode[]) {
  const parentNodeIds = [];
  const childNodes = nodes.filter(n => n.parents?.includes(nodeId));
  if (childNodes.length > 0) {
    parentNodeIds.push(nodeId);
    for (const child of childNodes) {
      parentNodeIds.push(...getNestedParents(child.id, nodes));
    }
  }

  return parentNodeIds;
}

export const getUpdatedCollapsedState = ({
  nodeIds,
  nodes,
  edges,
  graph
}: UpdateCollapsedStateInput) => {
  let collapsedNodeIds = [];

  // Add any node ids that are nested parents that had their parent collapsed
  // ie gradparent -> parent -> node and grandparent was collapsed
  for (const collapsedId of nodeIds) {
    collapsedNodeIds.push(...getNestedParents(collapsedId, nodes));
  }

  // Reset hidden state of edges/nodes
  let updatedEdges = edges.map(e => ({
    ...e,
    hidden: false
  }));

  let updatedNodes = nodes.map(n => ({
    ...n,
    hidden: false
  }));

  // Keep track of which edges and nodes were hidden from this change
  const curHiddenEdgeIds = [];
  const curHiddenNodeIds = [];

  for (const collapsedId of collapsedNodeIds) {
    const nodeLinks = graph.getLinks(collapsedId);
    const outboundEdges = [...nodeLinks].filter(
      l => l.data.source === collapsedId
    );
    const outboundEdgeIds = outboundEdges.map(l => l.data.id);
    const outboundEdgeNodeIds = outboundEdges.map(l => l.data.target);

    updatedEdges = updatedEdges.map(e => {
      if (outboundEdgeIds.includes(e.id)) {
        curHiddenEdgeIds.push(e.id);
        return {
          ...e,
          hidden: true
        };
      } else if (curHiddenEdgeIds.includes(e.id)) {
        return e;
      }

      return {
        ...e,
        hidden: false
      };
    });

    updatedNodes = updatedNodes.map(n => {
      if (
        !outboundEdgeNodeIds.includes(n.id) &&
        !curHiddenNodeIds.includes(n.id)
      ) {
        return {
          ...n,
          hidden: false
        };
      }

      // Determine if there is another edge going to this node
      const curNodeLinks = graph.getLinks(n.id);
      const inboundNodeLinks = [...curNodeLinks].filter(
        l => l.data.target === n.id
      );

      if (inboundNodeLinks.length > 1 && !curHiddenNodeIds.includes(n.id)) {
        // If all inbound links are hidden, hide this node as well
        const inboundNodeLinkIds = inboundNodeLinks.map(l => l.data.id);
        if (!inboundNodeLinkIds.every(i => curHiddenEdgeIds.includes(i))) {
          return {
            ...n,
            hidden: false
          };
        }
      }

      if (!curHiddenNodeIds.includes(n.id)) {
        curHiddenNodeIds.push(n.id);
        return {
          ...n,
          hidden: true
        };
      }

      return n;
    });
  }

  return {
    updatedEdges,
    updatedNodes,
    collapsedNodeIds
  };
};
