/// <reference types="react" />
import { StoreApi } from 'zustand';
import { InternalGraphEdge, InternalGraphNode, InternalGraphPosition } from './types';
import { BufferGeometry, Mesh } from 'three';
import { CenterPositionVector, ClusterGroup } from './utils';
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
export declare const Provider: ({ createStore, children, }: {
    createStore: () => StoreApi<GraphState>;
    children: import("react").ReactNode;
}) => import("react").FunctionComponentElement<import("react").ProviderProps<StoreApi<GraphState>>>, useStore: {
    (): GraphState;
    <U>(selector: (state: GraphState) => U, equalityFn?: (a: U, b: U) => boolean): U;
};
export declare const createStore: ({ actives, selections, collapsedNodeIds, theme }: Partial<GraphState>) => import("zustand").UseBoundStore<StoreApi<GraphState>>;
