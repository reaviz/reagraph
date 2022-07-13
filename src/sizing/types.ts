import { Graph } from 'ngraph.graph';

export interface SizingStrategyInputs {
  graph: Graph;
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  attribute?: string;
}

export interface SizingStrategy {
  ranks?: any;
  getSizeForNode: (id: string) => number;
}
