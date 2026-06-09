import Graph from 'graphology';
import type { FC, ReactNode } from 'react';
import { createContext, useContext } from 'react';
import React from 'react';
import type { BufferGeometry, Mesh } from 'three';
import { Vector3 } from 'three';
import type { StoreApi } from 'zustand';
import { create, useStore as useZustandStore } from 'zustand';
import { useShallow } from 'zustand/shallow';

import type { Theme } from './themes';
import type {
  InternalGraphEdge,
  InternalGraphNode,
  InternalGraphPosition
} from './types';
import type { CenterPositionVector, ClusterGroup } from './utils';
import { getLayoutCenter, getVector, updateNodePosition } from './utils';
import { isServerRender } from './utils/visibility';

export type DragReferences = {
  [key: string]: InternalGraphNode;
};

/**
 * Build the id -> node lookup map used for O(1) node access.
 */
const buildNodeMap = (
  nodes: InternalGraphNode[]
): Map<string, InternalGraphNode> => {
  const map = new Map<string, InternalGraphNode>();
  for (const node of nodes) {
    map.set(node.id, node);
  }
  return map;
};

/**
 * Build the set of node ids that have at least one outbound edge.
 */
const buildOutboundSet = (edges: InternalGraphEdge[]): Set<string> => {
  const set = new Set<string>();
  for (const edge of edges) {
    set.add(edge.source);
  }
  return set;
};

/**
 * Build the id -> edge lookup map used for O(1) edge access.
 */
const buildEdgeMap = (
  edges: InternalGraphEdge[]
): Map<string, InternalGraphEdge> => {
  const map = new Map<string, InternalGraphEdge>();
  for (const edge of edges) {
    map.set(edge.id, edge);
  }
  return map;
};

export interface GraphState {
  nodes: InternalGraphNode[];
  edges: InternalGraphEdge[];
  /**
   * O(1) lookup of a node by its id. Kept in sync with `nodes`.
   * Avoids O(n) `nodes.find` scans inside per-node components, which
   * otherwise make rendering/dragging O(n^2) on large graphs.
   */
  nodeMap: Map<string, InternalGraphNode>;
  /**
   * Set of node ids that have at least one outbound edge. Kept in sync
   * with `edges`. Lets a node determine `canCollapse` in O(1) instead of
   * filtering the entire edge list (O(n*e)) on every render.
   */
  nodesWithOutboundEdges: Set<string>;
  /**
   * O(1) lookup of an edge by its id. Kept in sync with `edges`.
   */
  edgeMap: Map<string, InternalGraphEdge>;
  graph: Graph;
  clusters: Map<string, ClusterGroup>;
  collapsedNodeIds?: string[];
  centerPosition?: CenterPositionVector;
  actives?: string[];
  selections?: string[];
  // The node that is currently hovered, used to disable cluster dragging
  hoveredNodeId?: string;
  // The edges that are currently hovered over, required for cases when animation is disabled
  hoveredEdgeIds?: string[];
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
  setHoveredEdgeIds: (hoveredEdgeIds: string[] | null) => void;
  setNodes: (nodes: InternalGraphNode[]) => void;
  setEdges: (edges: InternalGraphEdge[]) => void;
  setNodePosition: (id: string, position: InternalGraphPosition) => void;
  setCollapsedNodeIds: (nodeIds: string[]) => void;
  setClusterPosition: (id: string, position: CenterPositionVector) => void;
}

// Create a store factory function
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
        ...theme?.edge,
        label: {
          ...theme?.edge?.label,
          fontSize: theme?.edge?.label?.fontSize ?? 6
        }
      }
    },
    edges: [],
    nodes: [],
    nodeMap: new Map(),
    nodesWithOutboundEdges: new Set(),
    edgeMap: new Map(),
    collapsedNodeIds,
    clusters: new Map(),
    panning: false,
    draggingIds: [],
    actives,
    hoveredEdgeIds: [],
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
    setHoveredEdgeIds: hoveredEdgeIds =>
      set(state => ({ ...state, hoveredEdgeIds })),
    setNodes: nodes =>
      set(state => ({
        ...state,
        nodes,
        nodeMap: buildNodeMap(nodes),
        centerPosition: getLayoutCenter(nodes)
      })),
    setEdges: edges =>
      set(state => ({
        ...state,
        edges,
        edgeMap: buildEdgeMap(edges),
        nodesWithOutboundEdges: buildOutboundSet(edges)
      })),
    setNodePosition: (id, position) =>
      set(state => {
        const node =
          state.nodeMap.get(id) ?? state.nodes.find(n => n.id === id);
        const originalVector = getVector(node);
        const newVector = new Vector3(position.x, position.y, position.z);
        const offset = newVector.sub(originalVector);

        // Determine which nodes move: a multi-selection drags all selected
        // nodes, otherwise just the dragged node.
        const idsToMove =
          state.selections?.includes(id) && state.selections.length
            ? state.selections
            : [id];
        const moving = new Set(idsToMove);

        // Single O(n) pass producing both the new array and the new lookup map
        // with O(1) per-node access (no nested find/indexOf scans).
        const nodeMap = new Map(state.nodeMap);
        const nodes = state.nodes.map(n => {
          if (moving.has(n.id)) {
            const updated = updateNodePosition(n, offset);
            nodeMap.set(n.id, updated);
            return updated;
          }
          return n;
        });

        return {
          ...state,
          drags: {
            ...state.drags,
            [id]: node
          },
          nodes,
          nodeMap
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
          const nodeMap = new Map(state.nodeMap);
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
              nodeMap.set(node.id, nodes[index]);
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
            nodes,
            nodeMap
          };
        }

        return state;
      })
  }));

const defaultStore = createStore({});
const StoreContext = isServerRender
  ? null
  : createContext<StoreApi<GraphState>>(defaultStore);

export const Provider: FC<{
  children: ReactNode;
  store?: StoreApi<GraphState>;
}> = ({ children, store = defaultStore }) => {
  if (isServerRender) {
    return children;
  }

  return React.createElement(StoreContext.Provider, { value: store }, children);
};

export const useStore = <T>(selector: (state: GraphState) => T): T => {
  const store = useContext(StoreContext);
  // use the useShallow hook, which will return a stable reference (https://zustand.docs.pmnd.rs/migrations/migrating-to-v5)
  return useZustandStore(store, useShallow(selector));
};
