import { buildNodeEdges } from './layoutUtils';
import type { LayoutFactoryProps } from './types';

export function custom({ graph, drags, getNodePosition }: LayoutFactoryProps) {
  const { nodes, edges } = buildNodeEdges(graph);

  return {
    step() {
      return true;
    },
    getNodePosition(id: string) {
      return getNodePosition(id, { graph, drags, nodes, edges });
    }
  };
}
