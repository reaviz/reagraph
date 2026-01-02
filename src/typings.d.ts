declare module '*.json';
declare module '*.css';
declare module '*.md';
declare module '*.svg';

// Vite inline worker imports - creates worker from blob URL
declare module '*?worker&inline' {
  const WorkerConstructor: {
    new (): Worker;
  };
  export default WorkerConstructor;
}

declare module 'graphology-layout-forceatlas2/worker' {
  import type Graph from 'graphology';

  interface FA2LayoutSettings {
    adjustSizes?: boolean;
    barnesHutOptimize?: boolean;
    barnesHutTheta?: number;
    edgeWeightInfluence?: number;
    gravity?: number;
    linLogMode?: boolean;
    outboundAttractionDistribution?: boolean;
    scalingRatio?: number;
    slowDown?: number;
    strongGravityMode?: boolean;
  }

  interface FA2LayoutOptions {
    settings?: FA2LayoutSettings;
  }

  class FA2Layout {
    constructor(graph: Graph, options?: FA2LayoutOptions);
    start(): void;
    stop(): void;
    kill(): void;
    isRunning(): boolean;
  }

  export default FA2Layout;
}
