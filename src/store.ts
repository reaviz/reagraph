import create, { StoreApi } from 'zustand';
import createContext from 'zustand/context';
import { InternalGraphEdge, InternalGraphNode } from './types';
import ngraph from 'ngraph.graph';

export interface GraphState {
  nodes: InternalGraphNode[];
  edges: InternalGraphEdge[];
  graph: any;
  selections: string[];
  setSelections: (selections: string[]) => void;
  setNodes: (nodes: InternalGraphNode[]) => void;
  setEdges: (edges: InternalGraphEdge[]) => void;
}

export const { Provider, useStore } = createContext<StoreApi<GraphState>>();

export const createStore = () =>
  create<GraphState>(set => ({
    edges: [],
    nodes: [],
    selections: [],
    graph: ngraph(),
    setSelections: selections => set(state => ({ ...state, selections })),
    setNodes: nodes => set(state => ({ ...state, nodes })),
    setEdges: edges => set(state => ({ ...state, edges }))
  }));
