import { describe, expect, test } from 'vitest';

import type { GraphEdge, GraphNode } from '../types';
import { getExpandPath, getVisibleEntities } from './utils';

const n = (id: string): GraphNode => ({ id });
const e = (source: string, target: string): GraphEdge => ({
  id: `${source}->${target}`,
  source,
  target
});

const ids = (arr: { id: string }[]) => arr.map(x => x.id).sort();

describe('getVisibleEntities', () => {
  test('no collapsed ids returns everything', () => {
    const nodes = [n('a'), n('b'), n('c')];
    const edges = [e('a', 'b'), e('b', 'c')];
    const { visibleNodes, visibleEdges } = getVisibleEntities({
      collapsedIds: [],
      nodes,
      edges
    });
    expect(ids(visibleNodes)).toEqual(['a', 'b', 'c']);
    expect(ids(visibleEdges)).toEqual(['a->b', 'b->c']);
  });

  test('collapsing a node hides its single-parent descendants (chain)', () => {
    const nodes = [n('a'), n('b'), n('c'), n('d')];
    const edges = [e('a', 'b'), e('b', 'c'), e('c', 'd')];
    const { visibleNodes, visibleEdges } = getVisibleEntities({
      collapsedIds: ['a'],
      nodes,
      edges
    });
    // a stays visible; b,c,d hidden along with all their edges
    expect(ids(visibleNodes)).toEqual(['a']);
    expect(ids(visibleEdges)).toEqual([]);
  });

  test('node with another visible parent is NOT hidden (diamond)', () => {
    // a->b, a->c, b->d, c->d : collapsing b should keep d (c->d still feeds it)
    const nodes = [n('a'), n('b'), n('c'), n('d')];
    const edges = [e('a', 'b'), e('a', 'c'), e('b', 'd'), e('c', 'd')];
    const { visibleNodes, visibleEdges } = getVisibleEntities({
      collapsedIds: ['b'],
      nodes,
      edges
    });
    expect(ids(visibleNodes)).toEqual(['a', 'b', 'c', 'd']);
    // only b->d hidden (outbound of b); d remains because c->d is a live parent
    expect(ids(visibleEdges)).toEqual(['a->b', 'a->c', 'c->d']);
  });

  test('accepts a prebuilt graph and returns identical results', async () => {
    const Graph = (await import('graphology')).default;
    const { buildGraph } = await import('../utils/graph');
    const nodes = [n('a'), n('b'), n('c'), n('d')];
    const edges = [e('a', 'b'), e('a', 'c'), e('b', 'd'), e('c', 'd')];
    const graph = buildGraph(new Graph({ multi: true }), nodes, edges);

    const withGraph = getVisibleEntities({
      collapsedIds: ['b'],
      nodes,
      edges,
      graph
    });
    const withoutGraph = getVisibleEntities({
      collapsedIds: ['b'],
      nodes,
      edges
    });
    expect(ids(withGraph.visibleNodes)).toEqual(ids(withoutGraph.visibleNodes));
    expect(ids(withGraph.visibleEdges)).toEqual(ids(withoutGraph.visibleEdges));
  });

  test('collapsing both parents hides the shared child', () => {
    const nodes = [n('a'), n('b'), n('c'), n('d')];
    const edges = [e('a', 'b'), e('a', 'c'), e('b', 'd'), e('c', 'd')];
    const { visibleNodes, visibleEdges } = getVisibleEntities({
      collapsedIds: ['b', 'c'],
      nodes,
      edges
    });
    // b,c visible; d hidden because both its inbound edges are hidden
    expect(ids(visibleNodes)).toEqual(['a', 'b', 'c']);
    expect(ids(visibleEdges)).toEqual(['a->b', 'a->c']);
  });
});

describe('getExpandPath', () => {
  test('returns parent chain when no inbound edge is visible', () => {
    const edges = [e('a', 'b'), e('b', 'c')];
    // c has no visible inbound edges → expand path back through b, a
    const path = getExpandPath({
      nodeId: 'c',
      edges,
      visibleEdgeIds: []
    });
    expect(path).toEqual(['b', 'a']);
  });

  test('returns empty when a visible inbound edge exists', () => {
    const edges = [e('a', 'b'), e('b', 'c')];
    const path = getExpandPath({
      nodeId: 'c',
      edges,
      visibleEdgeIds: ['b->c']
    });
    expect(path).toEqual([]);
  });

  test('expands only the first parent path when multiple parents are hidden', () => {
    // a->c and b->c both hidden: only the first inbound (a) is expanded
    const edges = [e('a', 'c'), e('b', 'c')];
    const path = getExpandPath({
      nodeId: 'c',
      edges,
      visibleEdgeIds: []
    });
    expect(path).toEqual(['a']);
  });
});
