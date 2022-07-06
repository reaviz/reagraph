import create, { StoreApi } from 'zustand';
import createContext from 'zustand/context';
import {
  InternalGraphEdge,
  InternalGraphNode,
  InternalGraphPosition
} from './types';
import ngraph, { Graph } from 'ngraph.graph';

export type DragReferences = { [key: string]: InternalGraphNode };

export interface GraphState {
  nodes: InternalGraphNode[];
  edges: InternalGraphEdge[];
  graph: Graph;
  selections?: string[];
  draggingId?: string | null;
  drags?: DragReferences;
  setDrags: (drags: DragReferences) => void;
  setDraggingId: (id: string | null) => void;
  setSelections: (selections: string[]) => void;
  setNodes: (nodes: InternalGraphNode[]) => void;
  setEdges: (edges: InternalGraphEdge[]) => void;
  setNodePosition: (id: string, position: InternalGraphPosition) => void;
}

export const { Provider, useStore } = createContext<StoreApi<GraphState>>();

export const createStore = () =>
  create<GraphState>(set => ({
    edges: [],
    nodes: [],
    draggingId: null,
    selections: [],
    drags: {},
    graph: ngraph(),
    setDrags: drags => set(state => ({ ...state, drags })),
    setDraggingId: draggingId => set(state => ({ ...state, draggingId })),
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
      })
  }));
