import circular from 'graphology-layout/circular.js';
import { LayoutFactoryProps } from './types';
import { buildNodeEdges } from './layoutUtils';

export interface CircularLayoutInputs extends LayoutFactoryProps {
  /**
   * Radius of the circle.
   */
  radius: number;
}

export function circular2d({
  graph,
  radius,
  drags,
  getNodePosition
}: CircularLayoutInputs) {
  const layout = circular(graph, {
    scale: radius
  });

  const { nodes, edges } = buildNodeEdges(graph);

  return {
    step() {
      return true;
    },
    getNodePosition(id: string) {
      if (getNodePosition) {
        const pos = getNodePosition(id, { graph, drags, nodes, edges });
        if (pos) {
          return pos;
        }
      }

      if (drags?.[id]?.position) {
        // If we dragged, we need to use that position
        return drags?.[id]?.position as any;
      }

      return layout?.[id];
    }
  };
}
