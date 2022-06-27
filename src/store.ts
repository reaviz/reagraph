import create, { StoreApi } from 'zustand';
import createContext from 'zustand/context';
import { InternalGraphEdge, InternalGraphNode } from './types';
import ngraph from 'ngraph.graph';

export interface GraphState {
  nodes: InternalGraphNode[];
  edges: InternalGraphEdge[];
  graph: any;
  selections?: string[];
  draggingId?: string | null;
  setDraggingId: (id: string) => void;
  setSelections: (selections: string[]) => void;
  setNodes: (nodes: InternalGraphNode[]) => void;
  setEdges: (edges: InternalGraphEdge[]) => void;
  setNodePosition: (id: string, position) => void;
}

export const { Provider, useStore } = createContext<StoreApi<GraphState>>();

export const createStore = () =>
  create<GraphState>(set => ({
    edges: [],
    nodes: [],
    draggingId: undefined,
    selections: [],
    graph: ngraph(),
    setDraggingId: draggingId => set(state => ({ ...state, draggingId })),
    setSelections: selections => set(state => ({ ...state, selections })),
    setNodes: nodes => set(state => ({ ...state, nodes })),
    setEdges: edges => set(state => ({ ...state, edges })),
    setNodePosition: (id, position) =>
      set(state => {
        const node = state.nodes.find(n => n.id === id);
        return {
          ...state,
          nodes: [
            ...state.nodes.filter(n => n.id !== id),
            { ...node, position }
          ]
        };
      })
  }));
