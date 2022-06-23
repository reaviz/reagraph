import create, { StoreApi } from 'zustand';
import createContext from 'zustand/context';
import { InternalGraphEdge, InternalGraphNode } from './types';
import ngraph from 'ngraph.graph';

export interface GraphState {
  nodes: InternalGraphNode[];
  edges: InternalGraphEdge[];
  graph: any;
  selections: string[];
  dragging: boolean;
  setDragging: (dragging: boolean) => void;
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
    dragging: false,
    selections: [],
    graph: ngraph(),
    setDragging: dragging => set(state => ({ ...state, dragging })),
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
