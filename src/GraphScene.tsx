import React, {
  FC,
  forwardRef,
  Fragment,
  Ref,
  useImperativeHandle
} from 'react';
import { useGraph } from './useGraph';
import { LayoutTypes } from './layout';
import { GraphEdge, GraphNode, InternalGraphNode } from './types';
import { SizingType } from './sizing';
import { Edge, EdgeLabelPosition, Node } from './symbols';
import { useCenterGraph } from './CameraControls';
import { LabelVisibilityType } from './utils';
import { Theme } from './utils';
import { MenuItem } from './RadialMenu';
import { useStore } from './store';

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
   * Context menu items for a node.
   */
  contextMenuItems?: MenuItem[];

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
   * When a node was clicked.
   */
  onNodeClick?: (node: InternalGraphNode) => void;

  /**
   * Canvas container DOM parameters
   */
  canvasContainer?: DOMRect;
}

export interface GraphSceneRef {
  graph: any;
  centerGraph: (nodeIds?: string[]) => void;
}

export const GraphScene: FC<GraphSceneProps & { ref?: Ref<GraphSceneRef> }> =
  forwardRef(
    (
      {
        onNodeClick,
        theme,
        animated,
        disabled,
        contextMenuItems,
        draggable,
        edgeLabelPosition,
        labelFontUrl,
        canvasContainer,
        ...rest
      },
      ref: Ref<GraphSceneRef>
    ) => {
      useGraph(rest);

      const [graph, nodeIds, edgeIds] = useStore(state => [
        state.graph,
        state.nodes.map(n => n.id),
        state.edges.map(e => e.id)
      ]);

      const { centerNodesById: centerGraph } = useCenterGraph({
        animated
      });

      useImperativeHandle(
        ref,
        () => ({
          centerGraph,
          graph
        }),
        [centerGraph, graph]
      );

      return (
        <Fragment>
          {nodeIds.map(n => (
            <Node
              key={n}
              id={n}
              labelFontUrl={labelFontUrl}
              draggable={draggable}
              disabled={disabled}
              animated={animated}
              contextMenuItems={contextMenuItems}
              theme={theme}
              onClick={onNodeClick}
              canvasContainer={canvasContainer}
            />
          ))}
          {edgeIds.map(e => (
            <Edge
              theme={theme}
              key={e}
              id={e}
              animated={animated}
              labelPlacement={edgeLabelPosition}
            />
          ))}
        </Fragment>
      );
    }
  );
