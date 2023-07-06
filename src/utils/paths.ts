import Graph from 'graphology';
import { bidirectional } from 'graphology-shortest-path';

export function findPath(graph: Graph, source: string, target: string) {
  return bidirectional(graph, source, target);
}
