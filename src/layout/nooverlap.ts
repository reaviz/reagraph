import noverlapLayout from 'graphology-layout-noverlap';
import { LayoutFactoryProps } from './types';
import { buildNodeEdges } from './layoutUtils';

export interface NoOverlapLayoutInputs extends LayoutFactoryProps {
  /**
   * Grid size. Default 20.
   */
  gridSize?: number;

  /**
   * Ratio of the layout. Default 10.
   */
  ratio?: number;

  /**
   * Maximum number of iterations. Default 50.
   */
  maxIterations?: number;

  /**
   * Margin between nodes. Default 10.
   */
  margin?: number;
}

export function nooverlap({
  graph,
  margin,
  drags,
  getNodePosition,
  ratio,
  gridSize,
  maxIterations
}: NoOverlapLayoutInputs) {
  const { nodes, edges } = buildNodeEdges(graph);

  const layout = noverlapLayout(graph, {
    maxIterations,
    inputReducer: (_key, attr) => ({
      ...attr,
      // Have to specify defaults for the engine
      x: attr.x || 0,
      y: attr.y || 0
    }),
    settings: {
      ratio,
      margin,
      gridSize
    }
  });

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
