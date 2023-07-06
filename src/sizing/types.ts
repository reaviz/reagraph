import Graph from 'graphology';

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
