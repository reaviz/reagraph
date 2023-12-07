import { StoreApi, create } from 'zustand';
import createContext from 'zustand/context';
import {
  InternalGraphEdge,
  InternalGraphNode,
  InternalGraphPosition
} from './types';
import { BufferGeometry, Mesh, Vector3 } from 'three';
import { ClusterGroup, getVector, updateNodePosition } from './utils';
import Graph from 'graphology';
import { Theme } from './themes';

export type DragReferences = {
  [key: string]: InternalGraphNode;
};

export interface GraphState {
  nodes: InternalGraphNode[];
  edges: InternalGraphEdge[];
  graph: Graph;
  clusters: Map<string, ClusterGroup>;
  collapsedNodeIds?: string[];
  actives?: string[];
  selections?: string[];
  edgeContextMenus?: Set<string>;
  setEdgeContextMenus: (edges: Set<string>) => void;
  edgeMeshes: Array<Mesh<BufferGeometry>>;
  setEdgeMeshes: (edgeMeshes: Array<Mesh<BufferGeometry>>) => void;
  draggingId?: string | null;
  drags?: DragReferences;
  panning?: boolean;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  setClusters: (clusters: Map<string, ClusterGroup>) => void;
  setPanning: (panning: boolean) => void;
  setDrags: (drags: DragReferences) => void;
  setDraggingId: (id: string | null) => void;
  setActives: (actives: string[]) => void;
  setSelections: (selections: string[]) => void;
  setNodes: (nodes: InternalGraphNode[]) => void;
  setEdges: (edges: InternalGraphEdge[]) => void;
  setNodePosition: (id: string, position: InternalGraphPosition) => void;
  setCollapsedNodeIds: (nodeIds: string[]) => void;
}

export const { Provider, useStore } = createContext<StoreApi<GraphState>>();

export const createStore = ({
  actives = [],
  selections = [],
  collapsedNodeIds = [],
  theme
}: Partial<GraphState>) =>
  create<GraphState>(set => ({
    theme: {
      ...theme,
      edge: {
        ...theme.edge,
        label: {
          ...theme.edge.label,
          fontSize: theme.edge.label.fontSize ?? 6
        }
      }
    },
    edges: [],
    nodes: [],
    collapsedNodeIds,
    clusters: new Map(),
    panning: false,
    draggingId: null,
    actives,
    edgeContextMenus: new Set(),
    edgeMeshes: [],
    selections,
    drags: {},
    graph: new Graph(),
    setTheme: theme => set(state => ({ ...state, theme })),
    setClusters: clusters => set(state => ({ ...state, clusters })),
    setEdgeContextMenus: edgeContextMenus =>
      set(state => ({
        ...state,
        edgeContextMenus
      })),
    setEdgeMeshes: edgeMeshes => set(state => ({ ...state, edgeMeshes })),
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
        const originalVector = getVector(node);
        const newVector = new Vector3(position.x, position.y, position.z);
        const offset = newVector.sub(originalVector);
        const nodes = [...state.nodes];

        if (state.selections?.includes(id)) {
          state.selections?.forEach(id => {
            const node = state.nodes.find(n => n.id === id);
            // Selections can contain edges:
            if (node) {
              const nodeIndex = state.nodes.indexOf(node);
              nodes[nodeIndex] = updateNodePosition(node, offset);
            }
          });
        } else {
          const nodeIndex = state.nodes.indexOf(node);
          nodes[nodeIndex] = updateNodePosition(node, offset);
        }

        return {
          ...state,
          drags: {
            ...state.drags,
            [id]: node
          },
          nodes
        };
      }),
    setCollapsedNodeIds: (nodeIds = []) =>
      set(state => ({ ...state, collapsedNodeIds: nodeIds }))
  }));
