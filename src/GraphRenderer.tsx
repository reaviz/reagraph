import React, { FC, Fragment } from 'react';
import { useGraph } from './utils/graph';
import { LayoutTypes } from './layout/types';
import { GraphEdge, GraphNode } from './types';
import { SizingType } from './sizing';
import { Edge, Node } from './symbols';
import { useCenterGraph } from './controls/useCenterGraph';
import { LabelVisibilityType } from './utils/visibility';

export interface GraphRendererProps {
  layoutType?: LayoutTypes;
  nodes: GraphNode[];
  edges: GraphEdge[];
  sizingType?: SizingType;
  labelType?: LabelVisibilityType;
  sizingAttribute?: string;
  onNodeClick?: (id: string) => void;
}

export const GraphRenderer: FC<GraphRendererProps> = ({
  onNodeClick,
  ...rest
}) => {
  const { nodes, edges, graph } = useGraph(rest);
  const { centerNodes } = useCenterGraph({ nodes });

  return (
    <Fragment>
      {nodes.map(n => (
        <Node
          {...n}
          graph={graph}
          key={n.id}
          onClick={() => {
            onNodeClick?.(n.id);
            centerNodes([n]);
          }}
        />
      ))}
      {edges.map(e => (
        <Edge {...e} key={e.id} />
      ))}
    </Fragment>
  );
};
