import path from 'ngraph.path';

export function findPath(graph, fromId: string, toId: string) {
  const pathFinder = path.aStar(graph);
  const foundPath = pathFinder.find(fromId, toId);
  return foundPath;
}
