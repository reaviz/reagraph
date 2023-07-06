import noverlapLayout from 'graphology-layout-noverlap';
import { LayoutFactoryProps } from './types';

export interface NoOverlapLayoutInputs extends LayoutFactoryProps {
  gridSize?: number;
  ratio?: number;
  maxIterations?: number;
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
