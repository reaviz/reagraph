import { StoreApi, create } from 'zustand';
import createContext from 'zustand/context';
import {
  InternalGraphEdge,
  InternalGraphNode,
  InternalGraphPosition
} from './types';
import { BufferGeometry, Mesh, Vector3 } from 'three';
import {
  CenterPositionVector,
  ClusterGroup,
  getLayoutCenter,
  getVector,
  updateNodePosition
} from './utils';
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
  centerPosition?: CenterPositionVector;
  actives?: string[];
  selections?: string[];
  // The node that is currently hovered, used to disable cluster dragging
  hoveredNodeId?: string;
  edgeContextMenus?: Set<string>;
  setEdgeContextMenus: (edges: Set<string>) => void;
  edgeMeshes: Array<Mesh<BufferGeometry>>;
  setEdgeMeshes: (edgeMeshes: Array<Mesh<BufferGeometry>>) => void;
  draggingIds?: string[];
  drags?: DragReferences;
  panning?: boolean;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  setClusters: (clusters: Map<string, ClusterGroup>) => void;
  setPanning: (panning: boolean) => void;
  setDrags: (drags: DragReferences) => void;
  addDraggingId: (id: string) => void;
  removeDraggingId: (id: string) => void;
  setActives: (actives: string[]) => void;
  setSelections: (selections: string[]) => void;
  setHoveredNodeId: (hoveredNodeId: string | null) => void;
  setNodes: (nodes: InternalGraphNode[]) => void;
  setEdges: (edges: InternalGraphEdge[]) => void;
  setNodePosition: (id: string, position: InternalGraphPosition) => void;
  setCollapsedNodeIds: (nodeIds: string[]) => void;
  setClusterPosition: (id: string, position: CenterPositionVector) => void;
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
    draggingIds: [],
    actives,
    edgeContextMenus: new Set(),
    edgeMeshes: [],
    selections,
    hoveredNodeId: null,
    drags: {},
    graph: new Graph({ multi: true }),
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
    addDraggingId: id =>
      set(state => ({ ...state, draggingIds: [...state.draggingIds, id] })),
    removeDraggingId: id =>
      set(state => ({
        ...state,
        draggingIds: state.draggingIds.filter(drag => drag !== id)
      })),
    setActives: actives => set(state => ({ ...state, actives })),
    setSelections: selections => set(state => ({ ...state, selections })),
    setHoveredNodeId: hoveredNodeId =>
      set(state => ({ ...state, hoveredNodeId })),
    setNodes: nodes =>
      set(state => ({
        ...state,
        nodes,
        centerPosition: getLayoutCenter(nodes)
      })),
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
      set(state => ({ ...state, collapsedNodeIds: nodeIds })),
    // Update the position of a cluster with nodes inside it
    setClusterPosition: (id, position) =>
      set(state => {
        const clusters = new Map<string, any>(state.clusters);
        const cluster = clusters.get(id);

        if (cluster) {
          // Calculate the offset between old and new position
          const oldPos = cluster.position;
          const offset = new Vector3(
            position.x - oldPos.x,
            position.y - oldPos.y,
            position.z - (oldPos.z ?? 0)
          );

          // Update all nodes in the cluster
          const nodes: InternalGraphNode[] = [...state.nodes];
          const drags: DragReferences = { ...state.drags };
          nodes.forEach((node, index) => {
            if (node.cluster === id) {
              nodes[index] = {
                ...node,
                position: {
                  ...node.position,
                  x: node.position.x + offset.x,
                  y: node.position.y + offset.y,
                  z: node.position.z + (offset.z ?? 0)
                } as InternalGraphPosition
              };
              // Update node in drag reference
              drags[node.id] = node;
            }
          });

          const clusterNodes: InternalGraphNode[] = nodes.filter(
            node => node.cluster === id
          );
          const newClusterPosition = getLayoutCenter(clusterNodes);
          // Update cluster position
          clusters.set(id, {
            ...cluster,
            position: newClusterPosition
          });

          return {
            ...state,
            drags: {
              ...drags,
              [id]: cluster
            },
            clusters,
            nodes
          };
        }

        return state;
      })
  }));
