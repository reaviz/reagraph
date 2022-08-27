import create, { StoreApi } from 'zustand';
import createContext from 'zustand/context';
import {
  InternalGraphEdge,
  InternalGraphNode,
  InternalGraphPosition
} from './types';
import ngraph, { Graph } from 'ngraph.graph';

export type DragReferences = { [key: string]: InternalGraphNode };

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

export interface GraphState {
  nodes: InternalGraphNode[];
  edges: InternalGraphEdge[];
  graph: Graph;
  collapsedNodeIds?: string[];
  selections?: string[];
  actives?: string[];
  draggingId?: string | null;
  drags?: DragReferences;
  panning?: boolean;
  setPanning: (panning: boolean) => void;
  setDrags: (drags: DragReferences) => void;
  setDraggingId: (id: string | null) => void;
  setActives: (selections: string[]) => void;
  setSelections: (selections: string[]) => void;
  setNodes: (nodes: InternalGraphNode[]) => void;
  setEdges: (edges: InternalGraphEdge[]) => void;
  setNodePosition: (id: string, position: InternalGraphPosition) => void;
  setCollapsedNodeIds: (nodeIds: string[]) => void;
}

export const { Provider, useStore } = createContext<StoreApi<GraphState>>();

export const createStore = () =>
  create<GraphState>(set => ({
    edges: [],
    nodes: [],
    collapsedNodeIds: [],
    panning: false,
    draggingId: null,
    selections: [],
    actives: [],
    drags: {},
    graph: ngraph(),
    setPanning: panning => set(state => ({ ...state, panning })),
    setDrags: drags => set(state => ({ ...state, drags })),
    setDraggingId: draggingId => set(state => ({ ...state, draggingId })),
    setActives: actives => set(state => ({ ...state, actives })),
    setSelections: selections => set(state => ({ ...state, selections })),
    setNodes: nodes => set(state => ({ ...state, nodes })),
    setEdges: edges => set(state => ({ ...state, edges })),
    setNodePosition: (id, position) =>
      set(state => {
        const node = state.nodes.find(n => n.id === id);
        // TODO: Come back and fix this so we don't have to double project
        const newNode = { ...node, ...position, position };
        return {
          ...state,
          drags: { ...state.drags, [id]: newNode },
          nodes: [...state.nodes.filter(n => n.id !== id), newNode]
        };
      }),
    setCollapsedNodeIds: (nodeIds = []) =>
      set(state => {
        let collapsedNodeIds = [];

        // Add any node ids that are nested parents that had their parent collapsed
        // ie gradparent -> parent -> node and grandparent was collapsed
        for (const collapsedId of nodeIds) {
          collapsedNodeIds.push(...getNestedParents(collapsedId, state.nodes));
        }

        // Reset hidden state of edges/nodes
        let newEdges = [...state.edges].map(e => ({
          ...e,
          hidden: false
        }));
        let newNodes = [...state.nodes].map(n => ({
          ...n,
          hidden: false
        }));

        // Keep track of which edges and nodes were hidden from this change
        const curHiddenEdgeIds = [];
        const curHiddenNodeIds = [];

        for (const collapsedId of collapsedNodeIds) {
          const nodeLinks = state.graph.getLinks(collapsedId);
          const outboundEdges = [...nodeLinks].filter(
            l => l.data.source === collapsedId
          );
          const outboundEdgeIds = outboundEdges.map(l => l.data.id);
          const outboundEdgeNodeIds = outboundEdges.map(l => l.data.target);

          newEdges = newEdges.map(e => {
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
          newNodes = newNodes.map(n => {
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
            const curNodeLinks = state.graph.getLinks(n.id);
            const inboundNodeLinks = [...curNodeLinks].filter(
              l => l.data.target === n.id
            );
            if (
              inboundNodeLinks.length > 1 &&
              !curHiddenNodeIds.includes(n.id)
            ) {
              // If all inbound links are hidden, hide this node as well
              const inboundNodeLinkIds = inboundNodeLinks.map(l => l.data.id);
              if (
                !inboundNodeLinkIds.every(i => curHiddenEdgeIds.includes(i))
              ) {
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
          ...state,
          edges: newEdges,
          nodes: newNodes,
          collapsedNodeIds
        };
      })
  }));
