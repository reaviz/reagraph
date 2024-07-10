import Graph from 'graphology';
import { SizingType } from '../sizing';
import { GraphEdge, GraphNode, InternalGraphEdge, InternalGraphNode } from '../types';
import { LabelVisibilityType } from './visibility';
import { LayoutStrategy } from '../layout';
/**
 * Initialize the graph with the nodes/edges.
 */
export declare function buildGraph(graph: Graph, nodes: GraphNode[], edges: GraphEdge[]): Graph<import("graphology-types").Attributes, import("graphology-types").Attributes, import("graphology-types").Attributes>;
interface TransformGraphInput {
    graph: Graph;
    layout: LayoutStrategy;
    sizingType?: SizingType;
    labelType?: LabelVisibilityType;
    sizingAttribute?: string;
    minNodeSize?: number;
    maxNodeSize?: number;
    defaultNodeSize?: number;
}
/**
 * Transform the graph into a format that is easier to work with.
 */
export declare function transformGraph({ graph, layout, sizingType, labelType, sizingAttribute, defaultNodeSize, minNodeSize, maxNodeSize }: TransformGraphInput): {
    nodes: InternalGraphNode[];
    edges: InternalGraphEdge[];
};
export {};
