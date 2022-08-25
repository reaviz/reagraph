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
  const childNodes = nodes.filter(n => n.parent === nodeId);
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

        // Dynamically add/remove edges from state
        const baseEdges = state.edges.filter(e => !e.id.includes('expanded'));
        const curNodes = state.nodes;
        const newEdges = [...baseEdges];
        const childrenNodes = state.nodes.filter(n => n.parent);
        for (const child of childrenNodes) {
          if (!collapsedNodeIds.includes(child.parent)) {
            newEdges.push({
              id: `expanded-${child.parent}-${child.id}`,
              fromId: child.parent,
              toId: child.id,
              label: `Edge ${child.parent}-${child.id}`
            });
          }
        }

        return {
          ...state,
          edges: newEdges,
          collapsedNodeIds
        };
      })
  }));
