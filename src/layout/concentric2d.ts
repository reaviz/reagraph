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

export function concentricLayout({
  graph,
  radius = 40,
  drags,
  getNodePosition,
  concentricSpacing = 100
}: ConcentricLayoutInputs) {
  const { nodes, edges } = buildNodeEdges(graph);

  const metrics = nodes.map(node => ({
    id: node.id,
    metric: graph.degree(node.id)
  }));

  // Sort by importance (degree)
  metrics.sort((a, b) => b.metric - a.metric);

  const layout: Record<string, { x: number; y: number }> = {};
  let level = 0;
  let indexInLevel = 0;

  const getNodesInLevel = (level: number) => {
    const circumference = 2 * Math.PI * (radius + level * concentricSpacing);
    const minNodeSpacing = 40; // Minimum spacing between nodes in px
    return Math.floor(circumference / minNodeSpacing);
  };

  for (let i = 0; i < metrics.length; i++) {
    const nodesInCurrentLevel = getNodesInLevel(level);

    if (indexInLevel >= nodesInCurrentLevel) {
      level++;
      indexInLevel = 0;
    }

    const r = radius + level * concentricSpacing;
    const angle = (2 * Math.PI * indexInLevel) / nodesInCurrentLevel;

    layout[metrics[i].id] = {
      x: r * Math.cos(angle),
      y: r * Math.sin(angle)
    };

    indexInLevel++;
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
