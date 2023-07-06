import noverlapLayout from 'graphology-layout-noverlap';
import { LayoutFactoryProps } from './types';

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
  ratio,
  gridSize,
  maxIterations
}: NoOverlapLayoutInputs) {
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
      // If we dragged, we need to use that position
      return (drags?.[id]?.position as any) || layout?.[id];
    }
  };
}
