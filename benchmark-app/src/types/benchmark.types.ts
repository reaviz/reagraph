export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  workerStatus: 'enabled' | 'disabled' | 'failed' | 'initializing';
  nodeCount: number;
  edgeCount: number;
  timestamp: number;
  gpuMemory?: number;
  layoutTime?: number;
}

export interface BenchmarkTest {
  id: string;
  name: string;
  description: string;
  nodeCount: number;
  edgeCount: number;
  dataset: GraphData;
  category: 'small' | 'medium' | 'large' | 'massive' | 'stress' | 'extreme';
  // Animation and interaction features
  animated?: boolean;
  interactive?: boolean;
  initialCollapsedNodeIds?: string[];
  edgeInterpolation?: 'linear' | 'curved';
  layoutType?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata?: {
    totalLevels?: number;
    nodeCountByLevel?: number[];
    defaultCollapsedIds?: string[];
  };
}

export interface GraphNode {
  id: string;
  label?: string;
  x?: number;
  y?: number;
  z?: number;
  color?: string;
  size?: number;
  data?: any; // Generic data field for node-specific information
}

export interface GraphEdge {
  id?: string;
  source: string;
  target: string;
  label?: string;
  color?: string;
  size?: number;
  curved?: boolean;
  animated?: boolean;
}

export interface BenchmarkResult {
  testId: string;
  workerEnabled: boolean;
  duration: number;
  avgFps: number;
  minFps: number;
  maxFps: number;
  avgMemory: number;
  maxMemory: number;
  avgRenderTime: number;
  success: boolean;
  error?: string;
  timestamp: number;
}

export interface DatasetGenerator {
  generateRandom(nodeCount: number, edgeDensity?: number): GraphData;
  generateScaleFree(nodeCount: number, m?: number): GraphData;
  generateClustered(nodeCount: number, clusterCount?: number): GraphData;
  generateGrid(nodeCount: number): GraphData;
  generateHierarchical(nodeCount: number, levels?: number): GraphData;
}

export interface PerformanceTracker {
  start(): void;
  stop(): void;
  getCurrentMetrics(): PerformanceMetrics | null;
  getAverageMetrics(samples?: number): PerformanceMetrics | null;
  getMetricsHistory(): PerformanceMetrics[];
  reset(): void;
}