import React, {
  FC,
  forwardRef,
  Fragment,
  Ref,
  useImperativeHandle
} from 'react';
import { useGraph } from './useGraph';
import { LayoutTypes } from './layout/types';
import { GraphEdge, GraphNode, InternalGraphNode } from './types';
import { SizingType } from './sizing';
import { Edge, Node } from './symbols';
import { useCenterGraph } from './CameraControls';
import { LabelVisibilityType } from './utils/visibility';
import { Theme } from './utils/themes';
import { MenuItem } from './RadialMenu';
import { useStore } from './store';

export interface GraphSceneProps {
  theme: Theme;
  layoutType?: LayoutTypes;
  selections?: string[];
  animated?: boolean;
  nodes: GraphNode[];
  edges: GraphEdge[];
  contextMenuItems?: MenuItem[];
  sizingType?: SizingType;
  labelType?: LabelVisibilityType;
  sizingAttribute?: string;
  disabled?: boolean;
  draggable?: boolean;
  onNodeClick?: (node: InternalGraphNode) => void;
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
        selections,
        disabled,
        contextMenuItems,
        draggable,
        ...rest
      },
      ref: Ref<GraphSceneRef>
    ) => {
      useGraph(rest);
      const [graph, nodes, edges] = useStore(state => [
        state.graph,
        state.nodes,
        state.edges
      ]);
      const { centerNodesById: centerGraph } = useCenterGraph({
        nodes,
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
          {nodes.map(n => (
            <Node
              {...n}
              key={n.id}
              draggable={draggable}
              disabled={disabled}
              animated={animated}
              contextMenuItems={contextMenuItems}
              theme={theme}
              selections={selections}
              onClick={() => {
                if (!disabled) {
                  onNodeClick?.(n);
                }
              }}
            />
          ))}
          {edges.map(e => (
            <Edge
              {...e}
              theme={theme}
              key={e.id}
              selections={selections}
              animated={animated}
            />
          ))}
        </Fragment>
      );
    }
  );
