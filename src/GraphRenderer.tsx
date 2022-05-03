import React, {
  FC,
  forwardRef,
  Fragment,
  Ref,
  useImperativeHandle,
  useRef
} from 'react';
import { useGraph } from './utils/graph';
import { LayoutTypes } from './layout/types';
import { GraphEdge, GraphNode, InternalGraphNode } from './types';
import { SizingType } from './sizing';
import { Edge, Node } from './symbols';
import { useCenterGraph } from './controls/useCenterGraph';
import { LabelVisibilityType } from './utils/visibility';
import { Theme } from './utils/themes';

export interface GraphRendererProps {
  theme: Theme;
  layoutType?: LayoutTypes;
  selections?: string[];
  animated?: boolean;
  nodes: GraphNode[];
  edges: GraphEdge[];
  sizingType?: SizingType;
  labelType?: LabelVisibilityType;
  sizingAttribute?: string;
  onNodeClick?: (node: InternalGraphNode) => void;
}

export interface GraphRendererRef {
  centerGraph: (nodeIds?: string[]) => void;
}

export const GraphRenderer: FC<
  GraphRendererProps & { ref?: Ref<GraphRendererRef> }
> = forwardRef(
  (
    { onNodeClick, theme, animated, selections, ...rest },
    ref: Ref<GraphRendererRef>
  ) => {
    const { nodes, edges, graph } = useGraph(rest);
    const { centerNodesById } = useCenterGraph({ nodes, animated });

    useImperativeHandle(ref, () => ({
      centerGraph: centerNodesById
    }));

    return (
      <Fragment>
        {nodes.map(n => (
          <Node
            {...n}
            graph={graph}
            key={n.id}
            animated={animated}
            theme={theme}
            selections={selections}
            onClick={() => onNodeClick?.(n)}
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
