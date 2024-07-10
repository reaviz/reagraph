import { FC, ReactNode, Ref } from 'react';
import { LayoutOverrides, LayoutTypes } from './layout';
import { NodeContextMenuProps, ContextMenuEvent, GraphEdge, GraphNode, InternalGraphEdge, InternalGraphNode, NodeRenderer, CollapseProps } from './types';
import { SizingType } from './sizing';
import { ClusterEventArgs, EdgeArrowPosition, EdgeInterpolation, EdgeLabelPosition } from './symbols';
import { CenterNodesParams, FitNodesParams } from './CameraControls';
import { LabelVisibilityType } from './utils';
import Graph from 'graphology';
import { ThreeEvent } from '@react-three/fiber';
export interface GraphSceneProps {
    /**
     * Type of layout.
     */
    layoutType?: LayoutTypes;
    /**
     * List of ids that are selected.
     */
    selections?: string[];
    /**
     * List of ids that are active.
     */
    actives?: string[];
    /**
     * List of node ids that are collapsed.
     */
    collapsedNodeIds?: string[];
    /**
     * Animate or not the graph positions.
     */
    animated?: boolean;
    /**
     * Nodes to pass to the graph.
     */
    nodes: GraphNode[];
    /**
     * Edges to pass to the graph.
     */
    edges: GraphEdge[];
    /**
     * Context menu element.
     */
    contextMenu?: (event: ContextMenuEvent) => ReactNode;
    /**
     * Type of sizing for nodes.
     */
    sizingType?: SizingType;
    /**
     * Type of visibility for labels.
     */
    labelType?: LabelVisibilityType;
    /**
     * Place of visibility for edge labels.
     */
    edgeLabelPosition?: EdgeLabelPosition;
    /**
     * Placement of edge arrows.
     */
    edgeArrowPosition?: EdgeArrowPosition;
    /**
     * Shape of edge.
     */
    edgeInterpolation?: EdgeInterpolation;
    /**
     * Font of label, same as troika-three-text
     * The URL of a custom font file to be used. Supported font formats are: * .ttf * .otf * .woff (.woff2 is not supported)
     * Default: The Roboto font loaded from Google Fonts CDN
     */
    labelFontUrl?: string;
    /**
     * Attribute based sizing property.
     */
    sizingAttribute?: string;
    /**
     * The default size to size nodes to. Default is 7.
     */
    defaultNodeSize?: number;
    /**
     * When using sizing attributes, the min size a node can be.
     */
    minNodeSize?: number;
    /**
     * When using sizing attributes, the max size a node can be.
     */
    maxNodeSize?: number;
    /**
     * Attribute used for clustering.
     */
    clusterAttribute?: string;
    /**
     * Disable interactions or not.
     */
    disabled?: boolean;
    /**
     * Allow dragging of nodes.
     */
    draggable?: boolean;
    /**
     * Render a custom node
     */
    renderNode?: NodeRenderer;
    /**
     * Advanced overrides for the layout.
     */
    layoutOverrides?: LayoutOverrides;
    /**
     * When a node was clicked.
     */
    onNodeClick?: (node: InternalGraphNode, props?: CollapseProps, event?: ThreeEvent<MouseEvent>) => void;
    /**
     * When a node was double clicked.
     */
    onNodeDoubleClick?: (node: InternalGraphNode, event: ThreeEvent<MouseEvent>) => void;
    /**
     * When a node context menu happened.
     */
    onNodeContextMenu?: (node: InternalGraphNode, props?: NodeContextMenuProps) => void;
    /**
     * When node got a pointer over.
     */
    onNodePointerOver?: (node: InternalGraphNode, event: ThreeEvent<PointerEvent>) => void;
    /**
     * When node lost pointer over.
     */
    onNodePointerOut?: (node: InternalGraphNode, event: ThreeEvent<PointerEvent>) => void;
    /**
     * Triggered after a node was dragged.
     */
    onNodeDragged?: (node: InternalGraphNode) => void;
    /**
     * When a edge context menu happened.
     */
    onEdgeContextMenu?: (edge?: InternalGraphEdge) => void;
    /**
     * When an edge was clicked.
     */
    onEdgeClick?: (edge: InternalGraphEdge, event?: ThreeEvent<MouseEvent>) => void;
    /**
     * When edge got a pointer over.
     */
    onEdgePointerOver?: (edge: InternalGraphEdge, event?: ThreeEvent<PointerEvent>) => void;
    /**
     * When edge lost pointer over.
     */
    onEdgePointerOut?: (edge: InternalGraphEdge, event?: ThreeEvent<PointerEvent>) => void;
    /**
     * When a cluster was clicked.
     */
    onClusterClick?: (cluster: ClusterEventArgs, event: ThreeEvent<MouseEvent>) => void;
    /**
     * When a cluster receives a pointer over event.
     */
    onClusterPointerOver?: (cluster: ClusterEventArgs, event: ThreeEvent<PointerEvent>) => void;
    /**
     * When cluster receives a pointer leave event.
     */
    onClusterPointerOut?: (cluster: ClusterEventArgs, event: ThreeEvent<PointerEvent>) => void;
}
export interface GraphSceneRef {
    /**
     * Reference to the graph object.
     */
    graph: Graph;
    /**
     * Centers the graph on a specific node or list of nodes.
     *
     * @param nodeIds - An array of node IDs to center the graph on. If this parameter is omitted,
     * the graph will be centered on all nodes.
     *
     * @param opts.centerOnlyIfNodesNotInView - A boolean flag that determines whether the graph should
     * only be centered if the nodes specified by `ids` are not currently in view. If this
     * parameter is `true`, the graph will only be re-centered if one or more of the nodes
     * specified by `ids` are not currently in view. If this parameter is
     * `false` or omitted, the graph will be re-centered regardless of whether the nodes
     * are currently in view.
     */
    centerGraph: (nodeIds?: string[], opts?: CenterNodesParams) => void;
    /**
     * Fit all the given nodes into view of the camera.
     *
     * @param nodeIds - An array of node IDs to fit the view on. If this parameter is omitted,
     * the view will fit to all nodes.
     *
     * @param opts.fitOnlyIfNodesNotInView - A boolean flag that determines whether the view should
     * only be fit if the nodes specified by `ids` are not currently in view. If this
     * parameter is `true`, the view will only be fit if one or more of the nodes
     * specified by `ids` are not currently visible in the viewport. If this parameter is
     * `false` or omitted, the view will be fit regardless of whether the nodes
     * are currently in view.
     */
    fitNodesInView: (nodeIds?: string[], opts?: FitNodesParams) => void;
    /**
     * Calls render scene on the graph. this is useful when you want to manually render the graph
     * for things like screenshots.
     */
    renderScene: () => void;
}
export declare const GraphScene: FC<GraphSceneProps & {
    ref?: Ref<GraphSceneRef>;
}>;
