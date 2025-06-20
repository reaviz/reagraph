import { GraphData, GraphNode, GraphEdge, DatasetGenerator, BenchmarkTest } from '../types/benchmark.types';

export class DatasetGeneratorImpl implements DatasetGenerator {
  generateRandom(nodeCount: number, edgeDensity = 1.5): GraphData {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    // Generate nodes
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        id: `node-${i}`,
        label: `Node ${i}`,
        color: this.getRandomColor(),
        size: 1 + Math.random() * 2
      });
    }

    // Generate edges with specified density
    const targetEdges = Math.floor(nodeCount * edgeDensity);
    const edgeSet = new Set<string>();

    for (let i = 0; i < targetEdges; i++) {
      let sourceIdx = Math.floor(Math.random() * nodeCount);
      let targetIdx = Math.floor(Math.random() * nodeCount);
      
      // Avoid self-loops
      while (targetIdx === sourceIdx) {
        targetIdx = Math.floor(Math.random() * nodeCount);
      }

      const edgeKey = `${sourceIdx}-${targetIdx}`;
      const reverseKey = `${targetIdx}-${sourceIdx}`;
      
      // Avoid duplicate edges
      if (!edgeSet.has(edgeKey) && !edgeSet.has(reverseKey)) {
        edgeSet.add(edgeKey);
        edges.push({
          id: `edge-${i}`,
          source: nodes[sourceIdx].id,
          target: nodes[targetIdx].id,
          color: this.getRandomColor()
        });
      }
    }

    return { nodes, edges };
  }

  generateScaleFree(nodeCount: number, m = 2): GraphData {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const degrees: number[] = [];

    // Start with a small complete graph
    const initialNodes = Math.min(m + 1, nodeCount);
    
    for (let i = 0; i < initialNodes; i++) {
      nodes.push({
        id: `node-${i}`,
        label: `Node ${i}`,
        color: this.getRandomColor(),
        size: 1 + Math.random() * 2
      });
      degrees[i] = 0;
    }

    // Create initial complete graph
    for (let i = 0; i < initialNodes; i++) {
      for (let j = i + 1; j < initialNodes; j++) {
        edges.push({
          id: `edge-${i}-${j}`,
          source: `node-${i}`,
          target: `node-${j}`,
          color: this.getRandomColor()
        });
        degrees[i]++;
        degrees[j]++;
      }
    }

    // Add remaining nodes using preferential attachment
    for (let i = initialNodes; i < nodeCount; i++) {
      nodes.push({
        id: `node-${i}`,
        label: `Node ${i}`,
        color: this.getRandomColor(),
        size: 1 + Math.random() * 2
      });
      degrees[i] = 0;

      // Calculate total degree
      const totalDegree = degrees.reduce((sum, deg) => sum + deg, 0);
      
      // Add m edges using preferential attachment
      const connectedNodes = new Set<number>();
      for (let j = 0; j < Math.min(m, i); j++) {
        let targetNode = this.selectByPreference(degrees, totalDegree, connectedNodes);
        connectedNodes.add(targetNode);
        
        edges.push({
          id: `edge-${i}-${targetNode}`,
          source: `node-${i}`,
          target: `node-${targetNode}`,
          color: this.getRandomColor()
        });
        degrees[i]++;
        degrees[targetNode]++;
      }
    }

    return { nodes, edges };
  }

  generateClustered(nodeCount: number, clusterCount = Math.ceil(Math.sqrt(nodeCount))): GraphData {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const clusterColors = this.generateClusterColors(clusterCount);
    
    const nodesPerCluster = Math.floor(nodeCount / clusterCount);
    const remainingNodes = nodeCount % clusterCount;

    let nodeIndex = 0;

    // Generate clusters
    for (let cluster = 0; cluster < clusterCount; cluster++) {
      const clusterSize = nodesPerCluster + (cluster < remainingNodes ? 1 : 0);
      const clusterNodes: number[] = [];
      
      // Create nodes for this cluster
      for (let i = 0; i < clusterSize; i++) {
        nodes.push({
          id: `node-${nodeIndex}`,
          label: `Node ${nodeIndex} (C${cluster})`,
          color: clusterColors[cluster],
          size: 1 + Math.random() * 2
        });
        clusterNodes.push(nodeIndex);
        nodeIndex++;
      }

      // Create intra-cluster edges (higher density)
      for (let i = 0; i < clusterNodes.length; i++) {
        for (let j = i + 1; j < clusterNodes.length; j++) {
          if (Math.random() < 0.7) { // 70% chance of intra-cluster edge
            edges.push({
              id: `edge-${clusterNodes[i]}-${clusterNodes[j]}`,
              source: `node-${clusterNodes[i]}`,
              target: `node-${clusterNodes[j]}`,
              color: clusterColors[cluster]
            });
          }
        }
      }
    }

    // Create inter-cluster edges (lower density)
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const clusterI = Math.floor(i / nodesPerCluster);
        const clusterJ = Math.floor(j / nodesPerCluster);
        
        if (clusterI !== clusterJ && Math.random() < 0.05) { // 5% chance of inter-cluster edge
          edges.push({
            id: `edge-${i}-${j}`,
            source: `node-${i}`,
            target: `node-${j}`,
            color: '#666666'
          });
        }
      }
    }

    return { nodes, edges };
  }

  generateGrid(nodeCount: number): GraphData {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    
    const gridSize = Math.ceil(Math.sqrt(nodeCount));
    let nodeIndex = 0;

    // Generate grid nodes
    for (let row = 0; row < gridSize && nodeIndex < nodeCount; row++) {
      for (let col = 0; col < gridSize && nodeIndex < nodeCount; col++) {
        nodes.push({
          id: `node-${nodeIndex}`,
          label: `Node ${nodeIndex} (${row},${col})`,
          color: this.getRandomColor(),
          size: 1 + Math.random() * 2,
          x: col * 100,
          y: row * 100
        });
        nodeIndex++;
      }
    }

    // Generate grid edges
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const currentIndex = row * gridSize + col;
        if (currentIndex >= nodeCount) break;

        // Connect to right neighbor
        if (col < gridSize - 1 && currentIndex + 1 < nodeCount) {
          edges.push({
            id: `edge-${currentIndex}-${currentIndex + 1}`,
            source: `node-${currentIndex}`,
            target: `node-${currentIndex + 1}`,
            color: this.getRandomColor()
          });
        }

        // Connect to bottom neighbor
        if (row < gridSize - 1 && currentIndex + gridSize < nodeCount) {
          edges.push({
            id: `edge-${currentIndex}-${currentIndex + gridSize}`,
            source: `node-${currentIndex}`,
            target: `node-${currentIndex + gridSize}`,
            color: this.getRandomColor()
          });
        }
      }
    }

    return { nodes, edges };
  }

  generateHierarchical(nodeCount: number, levels = 3): GraphData {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    
    let nodeIndex = 0;
    const levelColors = this.generateClusterColors(levels);
    
    // Calculate nodes per level (exponential distribution)
    const nodesPerLevel: number[] = [];
    const baseNodes = Math.max(1, Math.floor(nodeCount / (Math.pow(2, levels) - 1)));
    
    for (let level = 0; level < levels; level++) {
      const levelNodes = Math.min(
        baseNodes * Math.pow(2, level),
        nodeCount - nodeIndex
      );
      nodesPerLevel.push(levelNodes);
    }

    // Ensure we use all nodes
    const totalAssigned = nodesPerLevel.reduce((sum, count) => sum + count, 0);
    if (totalAssigned < nodeCount) {
      nodesPerLevel[levels - 1] += nodeCount - totalAssigned;
    }

    const levelStartIndices: number[] = [];
    
    // Generate nodes by level
    for (let level = 0; level < levels; level++) {
      levelStartIndices.push(nodeIndex);
      
      for (let i = 0; i < nodesPerLevel[level]; i++) {
        nodes.push({
          id: `node-${nodeIndex}`,
          label: `Node ${nodeIndex} (L${level})`,
          color: levelColors[level],
          size: 1 + (levels - level) * 0.5 // Larger nodes at higher levels
        });
        nodeIndex++;
      }
    }

    // Generate hierarchical edges
    for (let level = 0; level < levels - 1; level++) {
      const currentLevelStart = levelStartIndices[level];
      const nextLevelStart = levelStartIndices[level + 1];
      const currentLevelSize = nodesPerLevel[level];
      const nextLevelSize = nodesPerLevel[level + 1];
      
      // Each node in current level connects to some nodes in next level
      for (let i = 0; i < currentLevelSize; i++) {
        const parentIndex = currentLevelStart + i;
        const childrenPerParent = Math.ceil(nextLevelSize / currentLevelSize);
        
        for (let j = 0; j < childrenPerParent && j < nextLevelSize; j++) {
          const childIndex = nextLevelStart + (i * childrenPerParent + j) % nextLevelSize;
          
          edges.push({
            id: `edge-${parentIndex}-${childIndex}`,
            source: `node-${parentIndex}`,
            target: `node-${childIndex}`,
            color: levelColors[level]
          });
        }
      }
    }

    return { nodes, edges };
  }

  private selectByPreference(degrees: number[], totalDegree: number, exclude: Set<number>): number {
    let target = Math.random() * totalDegree;
    let cumulative = 0;
    
    for (let i = 0; i < degrees.length; i++) {
      if (exclude.has(i)) continue;
      cumulative += degrees[i] || 1; // Ensure minimum degree of 1
      if (cumulative >= target) {
        return i;
      }
    }
    
    // Fallback to random selection
    let attempts = 0;
    while (attempts < 100) {
      const random = Math.floor(Math.random() * degrees.length);
      if (!exclude.has(random)) return random;
      attempts++;
    }
    
    return 0;
  }

  private getRandomColor(): string {
    const colors = [
      '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
      '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private generateClusterColors(count: number): string[] {
    const colors = [];
    for (let i = 0; i < count; i++) {
      const hue = (i * 360) / count;
      colors.push(`hsl(${hue}, 70%, 60%)`);
    }
    return colors;
  }
}

// Predefined benchmark test configurations
export function createBenchmarkTests(): BenchmarkTest[] {
  const generator = new DatasetGeneratorImpl();
  
  return [
    {
      id: 'small-random',
      name: 'Small Random Graph',
      description: '100 nodes, random topology',
      nodeCount: 100,
      edgeCount: 150,
      category: 'small',
      dataset: generator.generateRandom(100, 1.5)
    },
    {
      id: 'medium-random',
      name: 'Medium Random Graph', 
      description: '500 nodes, random topology',
      nodeCount: 500,
      edgeCount: 750,
      category: 'medium',
      dataset: generator.generateRandom(500, 1.5)
    },
    {
      id: 'large-scalefree',
      name: 'Large Scale-Free Network',
      description: '1,000 nodes, scale-free topology',
      nodeCount: 1000,
      edgeCount: 2000,
      category: 'large',
      dataset: generator.generateScaleFree(1000, 2)
    },
    {
      id: 'large-clustered',
      name: 'Large Clustered Graph',
      description: '2,000 nodes, clustered topology',
      nodeCount: 2000,
      edgeCount: 3000,
      category: 'large',
      dataset: generator.generateClustered(2000, 10)
    },
    {
      id: 'massive-performance',
      name: 'Performance Test (5K)',
      description: '5,000 nodes - Target performance test',
      nodeCount: 5000,
      edgeCount: 7500,
      category: 'massive',
      dataset: generator.generateScaleFree(5000, 2)
    },
    {
      id: 'stress-test',
      name: 'Stress Test (10K)',
      description: '10,000 nodes - Stress testing',
      nodeCount: 10000,
      edgeCount: 15000,
      category: 'stress',
      dataset: generator.generateScaleFree(10000, 2)
    },
    {
      id: 'performance-5k-clustered',
      name: 'Performance Test 5K Clustered',
      description: '5,000 nodes with clustering - Real-world topology',
      nodeCount: 5000,
      edgeCount: 8000,
      category: 'massive',
      dataset: generator.generateClustered(5000, 20)
    },
    {
      id: 'performance-5k-grid',
      name: 'Performance Test 5K Grid',
      description: '5,000 nodes in grid layout - Structured topology',
      nodeCount: 5000,
      edgeCount: 9800,
      category: 'massive',
      dataset: generator.generateGrid(5000)
    },
    {
      id: 'performance-7500',
      name: 'Performance Test 7.5K',
      description: '7,500 nodes - Upper performance boundary',
      nodeCount: 7500,
      edgeCount: 11250,
      category: 'massive',
      dataset: generator.generateScaleFree(7500, 2)
    },
    {
      id: 'extreme-test',
      name: 'Extreme Test (15K)',
      description: '15,000 nodes - Beyond target performance',
      nodeCount: 15000,
      edgeCount: 22500,
      category: 'extreme',
      dataset: generator.generateScaleFree(15000, 2)
    }
  ];
}