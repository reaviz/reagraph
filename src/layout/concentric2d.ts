import { LayoutFactoryProps } from './types';
import { buildNodeEdges } from './layoutUtils';

export interface ConcentricLayoutInputs extends LayoutFactoryProps {
  /**
   * Base radius of the innermost circle.
   */
  radius: number;
  /**
   * Distance between circles.
   */
  concentricSpacing?: number;
}

/**
 * Concentric layout algorithm for 2D graphs.
 * @param graph
 * @param radius
 * @param drags
 * @param getNodePosition
 * @param concentricSpacing
 */
export function concentric2d({
  graph,
  radius = 40,
  drags,
  getNodePosition,
  concentricSpacing = 100
}: ConcentricLayoutInputs) {
  const { nodes, edges } = buildNodeEdges(graph);

  const layout: Record<string, { x: number; y: number }> = {};

  const getNodesInLevel = (level: number) => {
    const circumference = 2 * Math.PI * (radius + level * concentricSpacing);
    const minNodeSpacing = 40;
    return Math.floor(circumference / minNodeSpacing);
  };

  const fixedLevelMap = new Map<number, string[]>();
  const dynamicNodes: { id: string; metric: number }[] = [];

  // Split nodes: fixed-level and dynamic
  for (const node of nodes) {
    const data = graph.getNodeAttribute(node.id, 'data');
    const level = data?.level;

    if (typeof level === 'number' && level >= 0) {
      if (!fixedLevelMap.has(level)) {
        fixedLevelMap.set(level, []);
      }
      fixedLevelMap.get(level)!.push(node.id);
    } else {
      dynamicNodes.push({ id: node.id, metric: graph.degree(node.id) });
    }
  }

  // Sort dynamic nodes by degree
  dynamicNodes.sort((a, b) => b.metric - a.metric);

  // Fill layout for fixed-level nodes
  for (const [level, nodeIds] of fixedLevelMap.entries()) {
    const count = nodeIds.length;
    const r = radius + level * concentricSpacing;

    for (let i = 0; i < count; i++) {
      const angle = (2 * Math.PI * i) / count;
      layout[nodeIds[i]] = {
        x: r * Math.cos(angle),
        y: r * Math.sin(angle)
      };
    }
  }

  // Determine which levels are partially used and which are available
  const occupiedLevels = new Set(fixedLevelMap.keys());
  let dynamicLevel = 0;

  let i = 0;
  while (i < dynamicNodes.length) {
    // Skip occupied levels
    while (occupiedLevels.has(dynamicLevel)) {
      dynamicLevel++;
    }

    const nodesInLevel = getNodesInLevel(dynamicLevel);
    const r = radius + dynamicLevel * concentricSpacing;

    for (let j = 0; j < nodesInLevel && i < dynamicNodes.length; j++) {
      const angle = (2 * Math.PI * j) / nodesInLevel;
      layout[dynamicNodes[i].id] = {
        x: r * Math.cos(angle),
        y: r * Math.sin(angle)
      };
      i++;
    }

    dynamicLevel++;
  }

  return {
    step() {
      return true;
    },
    getNodePosition(id: string) {
      if (getNodePosition) {
        const pos = getNodePosition(id, { graph, drags, nodes, edges });
        if (pos) return pos;
      }

      if (drags?.[id]?.position) {
        return drags[id].position as any;
      }

      return layout[id];
    }
  };
}
