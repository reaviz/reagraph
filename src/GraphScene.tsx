import React, {
  FC,
  forwardRef,
  Fragment,
  ReactNode,
  Ref,
  useImperativeHandle,
  useMemo
} from 'react';
import { useGraph } from './useGraph';
import { LayoutOverrides, LayoutTypes } from './layout';
import {
  NodeContextMenuProps,
  ContextMenuEvent,
  GraphEdge,
  GraphNode,
  InternalGraphEdge,
  InternalGraphNode,
  NodeRenderer,
  CollapseProps
} from './types';
import { SizingType } from './sizing';
import {
  Cluster,
  ClusterEventArgs,
  Edge,
  EdgeArrowPosition,
  EdgeInterpolation,
  EdgeLabelPosition,
  Edges,
  Node
} from './symbols';
import { useCenterGraph } from './CameraControls';
import { LabelVisibilityType } from './utils';
import { Theme } from './themes';
import { useStore } from './store';
import Graph from 'graphology';

export interface GraphSceneProps {
  /**
   * Theme to use for the graph.
   */
  theme: Theme;

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
  onNodeClick?: (node: InternalGraphNode, props?: CollapseProps) => void;

  /**
   * When a node was double clicked.
   */
  onNodeDoubleClick?: (node: InternalGraphNode) => void;

  /**
   * When a node context menu happened.
   */
  onNodeContextMenu?: (
    node: InternalGraphNode,
    props?: NodeContextMenuProps
  ) => void;

  /**
   * When node got a pointer over.
   */
  onNodePointerOver?: (node: InternalGraphNode) => void;

  /**
   * When node lost pointer over.
   */
  onNodePointerOut?: (node: InternalGraphNode) => void;

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
  onEdgeClick?: (edge: InternalGraphEdge) => void;

  /**
   * When edge got a pointer over.
   */
  onEdgePointerOver?: (edge: InternalGraphEdge) => void;

  /**
   * When edge lost pointer over.
   */
  onEdgePointerOut?: (edge: InternalGraphEdge) => void;

  /**
   * When a cluster was clicked.
   */
  onClusterClick?: (cluster: ClusterEventArgs) => void;

  /**
   * When a cluster recieves a pointer over event.
   */
  onClusterPointerOver?: (cluster: ClusterEventArgs) => void;

  /**
   * When cluster recieves a pointer leave event.
   */
  onClusterPointerOut?: (cluster: ClusterEventArgs) => void;
}

export interface GraphSceneRef {
  /**
   * Reference to the graph object.
   */
  graph: Graph;

  /**
   * Center the graph on a node or list of nodes.
   */
  centerGraph: (ids?: string[]) => void;
}

export const GraphScene: FC<GraphSceneProps & { ref?: Ref<GraphSceneRef> }> =
  forwardRef(
    (
      {
        onNodeClick,
        onNodeDoubleClick,
        onNodeContextMenu,
        onEdgeContextMenu,
        onEdgeClick,
        onEdgePointerOver,
        onEdgePointerOut,
        onNodePointerOver,
        onNodePointerOut,
        onClusterClick,
        onNodeDragged,
        onClusterPointerOver,
        onClusterPointerOut,
        contextMenu,
        theme,
        animated,
        disabled,
        draggable,
        edgeLabelPosition,
        edgeArrowPosition,
        edgeInterpolation,
        labelFontUrl,
        renderNode,
        ...rest
      },
      ref
    ) => {
      const { mounted } = useGraph(rest);

      const graph = useStore(state => state.graph);
      const nodes = useStore(state => state.nodes);
      const edges = useStore(state => state.edges);
      const clusters = useStore(state => [...state.clusters.values()]);

      const nodeIds = useMemo(() => nodes.map(n => n.id), [nodes]);
      const edgeIds = useMemo(() => edges.map(e => e.id), [edges]);

      const { centerNodesById } = useCenterGraph({
        animated
      });

      useImperativeHandle(
        ref,
        () => ({
          centerGraph: centerNodesById,
          graph
        }),
        [centerNodesById, graph]
      );

      return (
        <Fragment>
          {mounted && (
            <Fragment>
              {nodeIds.map(n => (
                <Node
                  key={n}
                  id={n}
                  labelFontUrl={labelFontUrl}
                  draggable={draggable}
                  disabled={disabled}
                  animated={animated}
                  contextMenu={contextMenu}
                  renderNode={renderNode}
                  onClick={onNodeClick}
                  onDoubleClick={onNodeDoubleClick}
                  onContextMenu={onNodeContextMenu}
                  onPointerOver={onNodePointerOver}
                  onPointerOut={onNodePointerOut}
                  onDragged={onNodeDragged}
                />
              ))}
              {animated ? (
                edgeIds.map(e => (
                  <Edge
                    key={e}
                    id={e}
                    disabled={disabled}
                    animated={animated}
                    labelFontUrl={labelFontUrl}
                    labelPlacement={edgeLabelPosition}
                    arrowPlacement={edgeArrowPosition}
                    interpolation={edgeInterpolation}
                    contextMenu={contextMenu}
                    onClick={onEdgeClick}
                    onContextMenu={onEdgeContextMenu}
                    onPointerOver={onEdgePointerOver}
                    onPointerOut={onEdgePointerOut}
                  />
                ))
              ) : (
                <Edges
                  theme={theme}
                  edges={edges}
                  disabled={disabled}
                  animated={animated}
                  labelFontUrl={labelFontUrl}
                  labelPlacement={edgeLabelPosition}
                  arrowPlacement={edgeArrowPosition}
                  interpolation={edgeInterpolation}
                  contextMenu={contextMenu}
                  onClick={onEdgeClick}
                  onContextMenu={onEdgeContextMenu}
                  onPointerOver={onEdgePointerOver}
                  onPointerOut={onEdgePointerOut}
                />
              )}
              {clusters.map(c => (
                <Cluster
                  key={c.label}
                  animated={animated}
                  disabled={disabled}
                  labelFontUrl={labelFontUrl}
                  onClick={onClusterClick}
                  onPointerOver={onClusterPointerOver}
                  onPointerOut={onClusterPointerOut}
                  {...c}
                />
              ))}
            </Fragment>
          )}
        </Fragment>
      );
    }
  );

GraphScene.defaultProps = {
  edgeInterpolation: 'linear'
};
