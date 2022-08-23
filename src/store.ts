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
  expandedParents?: string[];
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
  setExpandedParents: (nodeIds: string[]) => void;
}

export const { Provider, useStore } = createContext<StoreApi<GraphState>>();

export const createStore = () =>
  create<GraphState>(set => ({
    edges: [],
    nodes: [],
    expandedParents: [],
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
    setExpandedParents: nodeIds =>
      set(state => {
        const expandedParents = nodeIds || [];
        // Dynamically add/remove edges from state
        const baseEdges = state.edges.filter(e => !e.id.includes('expanded'));
        const curNodes = state.nodes;
        const newEdges = [...baseEdges];
        for (const parent of expandedParents) {
          const childNodes = curNodes.filter(n => n.parent === parent);
          newEdges.push(
            ...childNodes.map(c => ({
              id: `expanded-${parent}-${c.id}`,
              fromId: parent,
              toId: c.id,
              label: `Edge ${parent}-${c.id}`
            }))
          );
        }

        return {
          ...state,
          edges: newEdges,
          expandedParents
        };
      })
  }));
