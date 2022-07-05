import { Graph } from 'ngraph.graph';
import path from 'ngraph.path';

export function findPath(graph: Graph, fromId: string, toId: string) {
  const pathFinder = path.aStar(graph);
  const foundPath = pathFinder.find(fromId, toId);
  return foundPath;
}
