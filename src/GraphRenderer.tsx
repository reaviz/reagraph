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
import { GraphEdge, GraphNode } from './types';
import { SizingType } from './sizing';
import { Edge, Node } from './symbols';
import { useCenterGraph } from './controls/useCenterGraph';
import { LabelVisibilityType } from './utils/visibility';
import { Theme } from './utils/themes';

export interface GraphRendererProps {
  theme: Theme;
  layoutType?: LayoutTypes;
  selections?: string[];
  nodes: GraphNode[];
  edges: GraphEdge[];
  sizingType?: SizingType;
  labelType?: LabelVisibilityType;
  sizingAttribute?: string;
  onNodeClick?: (id: string) => void;
}

export interface GraphRendererRef {
  centerGraph: (nodeIds?: string[]) => void;
}

export const GraphRenderer: FC<
  GraphRendererProps & { ref?: Ref<GraphRendererRef> }
> = forwardRef(
  ({ onNodeClick, theme, selections, ...rest }, ref: Ref<GraphRendererRef>) => {
    const { nodes, edges, graph } = useGraph(rest);
    const { centerNodes } = useCenterGraph({ nodes });

    useImperativeHandle(ref, () => ({
      centerGraph: (nodesToCenter?: string[]) => {
        if (nodesToCenter?.length) {
          nodesToCenter = nodesToCenter.reduce((acc, id) => {
            const node = nodes.find(n => n.id === id);
            if (node) {
              acc.push(node);
            } else {
              throw new Error(
                `Attempted to center ${id} but it was not found in the nodes`
              );
            }

            return acc;
          }, []);
        }

        centerNodes(nodesToCenter || nodes);
      }
    }));

    return (
      <Fragment>
        {nodes.map(n => (
          <Node
            {...n}
            graph={graph}
            key={n.id}
            theme={theme}
            selections={selections}
            onClick={() => {
              onNodeClick?.(n.id);
              centerNodes([n]);
            }}
          />
        ))}
        {edges.map(e => (
          <Edge {...e} theme={theme} key={e.id} selections={selections} />
        ))}
      </Fragment>
    );
  }
);
