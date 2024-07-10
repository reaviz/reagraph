import { SizingType } from './sizing';
import { LayoutTypes, LayoutOverrides } from './layout';
import { LabelVisibilityType } from './utils/visibility';
import { GraphEdge, GraphNode } from './types';
export interface GraphInputs {
    nodes: GraphNode[];
    edges: GraphEdge[];
    collapsedNodeIds?: string[];
    layoutType?: LayoutTypes;
    sizingType?: SizingType;
    labelType?: LabelVisibilityType;
    sizingAttribute?: string;
    selections?: string[];
    actives?: string[];
    clusterAttribute?: string;
    defaultNodeSize?: number;
    minNodeSize?: number;
    maxNodeSize?: number;
    layoutOverrides?: LayoutOverrides;
}
export declare const useGraph: ({ layoutType, sizingType, labelType, sizingAttribute, clusterAttribute, selections, nodes, edges, actives, collapsedNodeIds, defaultNodeSize, maxNodeSize, minNodeSize, layoutOverrides }: GraphInputs) => void;
