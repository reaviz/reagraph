import { ConcentricLayoutInputs } from 'layout/concentric2d';
import { buildNodeEdges } from './layoutUtils';
import * as THREE from 'three';

/**
 * Generates a point on a Fibonacci sphere.
 * @param i
 * @param n
 * @param r
 */
function fibonacciSpherePoint(i: number, n: number, r: number) {
  const phi = Math.acos(1 - (2 * (i + 0.5)) / n);
  const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.sin(phi) * Math.sin(theta);
  const z = r * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

export function concentric({
  graph,
  radius = 40,
  drags,
  getNodePosition,
  concentricSpacing = 100
}: ConcentricLayoutInputs) {
  const { nodes, edges } = buildNodeEdges(graph);

  const layout: Record<string, { x: number; y: number; z: number }> = {};

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

  // Fill layout for fixed-level nodes (3D spherical placement)
  for (const [level, nodeIds] of fixedLevelMap.entries()) {
    const count = nodeIds.length;
    const r = radius + level * concentricSpacing;

    nodeIds.forEach((id, i) => {
      const pos = fibonacciSpherePoint(i, count, r);
      layout[id] = { x: pos.x, y: pos.y, z: pos.z };
    });
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
      const pos = fibonacciSpherePoint(j, nodesInLevel, r);
      layout[dynamicNodes[i].id] = { x: pos.x, y: pos.y, z: pos.z };
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
        if (pos) return pos as any;
      }

      if (drags?.[id]?.position) {
        return drags[id].position as any;
      }

      return layout[id];
    }
  };
}
