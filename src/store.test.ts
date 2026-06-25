import { describe, expect, test } from 'vitest';

import { createStore } from './store';
import type { InternalGraphEdge, InternalGraphNode } from './types';

const makeNode = (id: string, x = 0, y = 0, z = 0): InternalGraphNode =>
  ({
    id,
    position: { id, x, y, z } as any,
    size: 7
  }) as InternalGraphNode;

const makeEdge = (id: string, source: string, target: string) =>
  ({ id, source, target }) as InternalGraphEdge;

describe('store lookup maps', () => {
  test('setNodes builds an id -> node map in sync with nodes', () => {
    const store = createStore({});
    const nodes = [makeNode('a'), makeNode('b'), makeNode('c')];
    store.getState().setNodes(nodes);

    const { nodeMap } = store.getState();
    expect(nodeMap.size).toBe(3);
    expect(nodeMap.get('b')).toBe(nodes[1]);
    expect(nodeMap.get('missing')).toBeUndefined();
  });

  test('setEdges builds edge map and outbound-edge set', () => {
    const store = createStore({});
    const edges = [
      makeEdge('e1', 'a', 'b'),
      makeEdge('e2', 'a', 'c'),
      makeEdge('e3', 'b', 'c')
    ];
    store.getState().setEdges(edges);

    const { edgeMap, nodesWithOutboundEdges } = store.getState();
    expect(edgeMap.get('e2')).toBe(edges[1]);
    // a and b have outbound edges, c does not
    expect(nodesWithOutboundEdges.has('a')).toBe(true);
    expect(nodesWithOutboundEdges.has('b')).toBe(true);
    expect(nodesWithOutboundEdges.has('c')).toBe(false);
  });

  test('setNodes shrinking removes stale entries from the node map', () => {
    const store = createStore({});
    store.getState().setNodes([makeNode('a'), makeNode('b'), makeNode('c')]);
    // Simulate removing a node (e.g. data change / collapse)
    store.getState().setNodes([makeNode('a'), makeNode('c')]);

    const { nodeMap } = store.getState();
    expect(nodeMap.size).toBe(2);
    expect(nodeMap.has('b')).toBe(false);
    expect(nodeMap.has('a')).toBe(true);
  });

  test('setEdges shrinking removes stale entries and updates outbound set', () => {
    const store = createStore({});
    store
      .getState()
      .setEdges([makeEdge('e1', 'a', 'b'), makeEdge('e2', 'a', 'c')]);
    // Remove the only edge that gave 'a' an outbound edge via e1, keep e2
    store.getState().setEdges([makeEdge('e2', 'a', 'c')]);

    const { edgeMap, nodesWithOutboundEdges } = store.getState();
    expect(edgeMap.has('e1')).toBe(false);
    expect(edgeMap.has('e2')).toBe(true);
    expect(nodesWithOutboundEdges.has('a')).toBe(true);
    expect(nodesWithOutboundEdges.has('b')).toBe(false);
  });

  test('setNodePosition updates the moved node and keeps others stable', () => {
    const store = createStore({});
    const nodes = [makeNode('a', 0, 0), makeNode('b', 10, 10)];
    store.getState().setNodes(nodes);

    store.getState().setNodePosition('a', { id: 'a', x: 5, y: 5, z: 0 } as any);

    const state = store.getState();
    // Moved node is replaced in both array and map, with consistent identity
    const movedFromArray = state.nodes.find(n => n.id === 'a');
    expect(state.nodeMap.get('a')).toBe(movedFromArray);
    expect(state.nodeMap.get('a').position.x).toBe(5);
    // Untouched node keeps its referential identity (prevents re-render churn)
    expect(state.nodeMap.get('b')).toBe(nodes[1]);
  });

  test('setNodePosition moves the whole selection when dragging a selected node', () => {
    const store = createStore({ selections: ['a', 'b'] });
    const nodes = [
      makeNode('a', 0, 0),
      makeNode('b', 0, 0),
      makeNode('c', 0, 0)
    ];
    store.getState().setNodes(nodes);

    store.getState().setNodePosition('a', { id: 'a', x: 4, y: 0, z: 0 } as any);

    const state = store.getState();
    expect(state.nodeMap.get('a').position.x).toBe(4);
    expect(state.nodeMap.get('b').position.x).toBe(4);
    // Unselected node is unchanged
    expect(state.nodeMap.get('c')).toBe(nodes[2]);
  });
});
