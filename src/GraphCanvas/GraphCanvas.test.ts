import React, { act, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, test, vi } from 'vitest';

import type { CosmosGraphCanvasRef, GraphCanvasRef } from './GraphCanvas';
import { GraphCanvas } from './GraphCanvas';

const { graphInstances, MockCosmosGraph } = vi.hoisted(() => {
  class MockCosmosGraph {
    config: unknown;
    destroyed = false;

    constructor(_container: HTMLDivElement, config: unknown) {
      this.config = config;
      graphInstances.push(this);
    }

    destroy = vi.fn(() => {
      this.destroyed = true;
    });
    fitView = vi.fn();
    fitViewByPointIndices = vi.fn();
    getPointPositions = vi.fn(() => []);
    getPointsInRect = vi.fn(() => new Float32Array());
    getZoomLevel = vi.fn(() => 1);
    pause = vi.fn();
    render = vi.fn();
    setConfig = vi.fn();
    setLinkArrows = vi.fn();
    setLinkColors = vi.fn();
    setLinks = vi.fn();
    setLinkWidths = vi.fn();
    setPointColors = vi.fn();
    setPointPositions = vi.fn();
    setPointSizes = vi.fn();
    unpause = vi.fn();
    zoom = vi.fn();
    zoomToPointByIndex = vi.fn();
  }

  const graphInstances: MockCosmosGraph[] = [];

  return { graphInstances, MockCosmosGraph };
});

vi.mock('@cosmos.gl/graph', () => ({
  Graph: MockCosmosGraph
}));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

afterEach(() => {
  graphInstances.length = 0;
  vi.clearAllMocks();
});

const emptyGraph = {
  edges: [],
  nodes: []
};

const typeCheckGraphCanvasRefs = () => {
  const threeRef = createRef<GraphCanvasRef>();
  const cosmosRef = createRef<CosmosGraphCanvasRef>();

  GraphCanvas({ ref: threeRef, ...emptyGraph });
  GraphCanvas({ ref: cosmosRef, renderEngine: 'cosmos', ...emptyGraph });
  cosmosRef.current?.getControls().getCosmosGraph();

  // @ts-expect-error Three GraphCanvasRef is not valid for renderEngine="cosmos".
  GraphCanvas({ ref: threeRef, renderEngine: 'cosmos', ...emptyGraph });
};
void typeCheckGraphCanvasRefs;

describe('GraphCanvas cosmos renderer', () => {
  test('mounts through GraphCanvas and exposes the cosmos ref contract', async () => {
    const container = document.createElement('div');
    const ref = createRef<CosmosGraphCanvasRef>();
    const root = createRoot(container);

    await act(async () => {
      root.render(
        React.createElement(GraphCanvas, {
          ref,
          renderEngine: 'cosmos',
          labelType: 'none',
          nodes: [
            { id: 'one', label: 'One' },
            { id: 'two', label: 'Two' }
          ],
          edges: [{ id: 'edge', source: 'one', target: 'two' }]
        })
      );
    });

    expect(graphInstances).toHaveLength(1);
    expect(ref.current?.getCosmosGraph()).toBe(graphInstances[0]);
    expect(ref.current?.getControls().getCosmosGraph()).toBe(graphInstances[0]);
    ref.current?.getControls().zoomIn();
    expect(graphInstances[0].zoom).toHaveBeenCalledWith(1.5, 250);
    expect(graphInstances[0].setConfig).toHaveBeenCalled();

    await act(async () => {
      root.unmount();
    });

    expect(graphInstances[0].destroy).toHaveBeenCalled();
  });

  test('supports node lasso selection with the cosmos renderer', async () => {
    const container = document.createElement('div');
    const onLassoEnd = vi.fn();
    const root = createRoot(container);

    await act(async () => {
      root.render(
        React.createElement(GraphCanvas, {
          renderEngine: 'cosmos',
          labelType: 'none',
          lassoType: 'node',
          nodes: [
            { id: 'one', label: 'One' },
            { id: 'two', label: 'Two' }
          ],
          edges: [{ id: 'edge', source: 'one', target: 'two' }],
          onLassoEnd
        })
      );
    });

    await act(async () => {
      await Promise.resolve();
    });

    graphInstances[0].getPointsInRect.mockReturnValue(new Float32Array([0, 1]));

    const cosmosContainer = container.firstElementChild
      ?.firstElementChild as HTMLDivElement;
    cosmosContainer.getBoundingClientRect = () =>
      ({
        bottom: 100,
        height: 100,
        left: 0,
        right: 100,
        top: 0,
        width: 100,
        x: 0,
        y: 0,
        toJSON: () => ({})
      }) as DOMRect;

    await act(async () => {
      cosmosContainer.dispatchEvent(
        new MouseEvent('pointerdown', {
          bubbles: true,
          button: 0,
          clientX: 10,
          clientY: 20,
          shiftKey: true
        })
      );
      document.dispatchEvent(
        new MouseEvent('pointermove', {
          bubbles: true,
          clientX: 50,
          clientY: 70
        })
      );
      document.dispatchEvent(
        new MouseEvent('pointerup', {
          bubbles: true,
          clientX: 50,
          clientY: 70
        })
      );
    });

    expect(graphInstances[0].getPointsInRect).toHaveBeenCalledWith([
      [10, 20],
      [50, 70]
    ]);
    expect(onLassoEnd).toHaveBeenCalledWith(['one', 'two']);

    await act(async () => {
      root.unmount();
    });
  });
});
