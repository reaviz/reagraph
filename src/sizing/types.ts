import Graph from 'graphology';

export interface SizingStrategyInputs {
  /**
   * The graph object.
   */
  graph: Graph;

  /**
   * The default node size.
   */
  defaultSize?: number;

  /**
   * The min node size.
   */
  minSize?: number;

  /**
   * The max node size.
   */
  maxSize?: number;

  /**
   * The attribute to use for sizing.
   * Only applicable for `attribute` type.
   */
  attribute?: string;
}

export interface SizingStrategy {
  /**
   * Key value pairs of node sizes.
   */
  ranks?: { [node: string]: number };

  /**
   * Get the size for a given node.
   */
  getSizeForNode: (id: string) => number;
}
