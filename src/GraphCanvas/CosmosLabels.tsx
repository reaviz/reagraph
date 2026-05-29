import type { Graph as CosmosGraph } from '@cosmos.gl/graph';
import React, { useEffect, useState } from 'react';

import type { Theme } from '../themes';
import type { InternalGraphNode } from '../types';
import type { PreparedCosmosGraph } from './cosmos';
import { toHexColor } from './cosmos';
import type { GraphCanvasProps } from './GraphCanvas';

interface CosmosLabel {
  active: boolean;
  id: string;
  label: string;
  type: 'node' | 'edge';
  x: number;
  y: number;
}

type CosmosLabelType = NonNullable<GraphCanvasProps['labelType']>;

export const DEFAULT_COSMOS_LABEL_MAX_COUNT = 150;
export const DEFAULT_COSMOS_LABEL_UPDATE_INTERVAL = 50;

const LABEL_MARGIN = 24;

const areLabelsEqual = (a: CosmosLabel[], b: CosmosLabel[]) => {
  if (a.length !== b.length) {
    return false;
  }

  return a.every((label, index) => {
    const next = b[index];

    return (
      label.active === next.active &&
      label.id === next.id &&
      label.label === next.label &&
      label.type === next.type &&
      Math.abs(label.x - next.x) < 1 &&
      Math.abs(label.y - next.y) < 1
    );
  });
};

const isVisibleScreenPosition = (
  x: number,
  y: number,
  container: HTMLDivElement
) =>
  x >= LABEL_MARGIN &&
  y >= LABEL_MARGIN &&
  x <= container.clientWidth - LABEL_MARGIN &&
  y <= container.clientHeight - LABEL_MARGIN;

const getPointPosition = (
  graph: CosmosGraph,
  node: InternalGraphNode,
  index: number
): [number, number] => {
  const positions = graph.getPointPositions();
  const offset = index * 2;

  return [
    positions[offset] ?? node.position.x,
    positions[offset + 1] ?? node.position.y
  ];
};

const getNodeLabels = (
  graph: CosmosGraph,
  preparedGraph: PreparedCosmosGraph,
  selectedIds: Set<string>,
  activeIds: Set<string>,
  labelType: CosmosLabelType,
  defaultNodeSize: number,
  maxCount: number
): CosmosLabel[] => {
  const labels: CosmosLabel[] = [];
  const sampledPositions =
    labelType === 'auto' ? graph.getSampledPointPositionsMap() : undefined;
  const zoom = graph.getZoomLevel();

  for (let index = 0; index < preparedGraph.nodes.length; index += 1) {
    const node = preparedGraph.nodes[index];
    if (!node.label || node.labelVisible === false) {
      continue;
    }

    if (
      labelType === 'auto' &&
      !sampledPositions?.has(index) &&
      (node.size ?? defaultNodeSize) <= defaultNodeSize &&
      zoom < 1.5
    ) {
      continue;
    }

    const [x, y] = graph.spaceToScreenPosition(
      sampledPositions?.get(index) ?? getPointPosition(graph, node, index)
    );

    labels.push({
      active: selectedIds.has(node.id) || activeIds.has(node.id),
      id: node.id,
      label: node.label,
      type: 'node',
      x,
      y
    });

    if (labels.length >= maxCount) {
      break;
    }
  }

  return labels;
};

const getEdgeLabels = (
  graph: CosmosGraph,
  preparedGraph: PreparedCosmosGraph,
  selectedIds: Set<string>,
  activeIds: Set<string>,
  maxCount: number
): CosmosLabel[] => {
  const labels: CosmosLabel[] = [];

  for (const edge of preparedGraph.edges) {
    if (!edge.label || edge.labelVisible === false) {
      continue;
    }

    const sourceIndex = preparedGraph.nodeIndexById.get(edge.source);
    const targetIndex = preparedGraph.nodeIndexById.get(edge.target);
    if (sourceIndex === undefined || targetIndex === undefined) {
      continue;
    }

    const source = preparedGraph.nodes[sourceIndex];
    const target = preparedGraph.nodes[targetIndex];
    const sourcePosition = getPointPosition(graph, source, sourceIndex);
    const targetPosition = getPointPosition(graph, target, targetIndex);
    const [x, y] = graph.spaceToScreenPosition([
      (sourcePosition[0] + targetPosition[0]) / 2,
      (sourcePosition[1] + targetPosition[1]) / 2
    ]);

    labels.push({
      active: selectedIds.has(edge.id) || activeIds.has(edge.id),
      id: edge.id,
      label: edge.label,
      type: 'edge',
      x,
      y
    });

    if (labels.length >= maxCount) {
      break;
    }
  }

  return labels;
};

const getCosmosLabels = ({
  activeIds,
  container,
  defaultNodeSize,
  graph,
  labelType,
  maxCount,
  preparedGraph,
  selectedIds
}: {
  activeIds: Set<string>;
  container: HTMLDivElement;
  defaultNodeSize: number;
  graph: CosmosGraph;
  labelType: CosmosLabelType;
  maxCount: number;
  preparedGraph: PreparedCosmosGraph;
  selectedIds: Set<string>;
}) => {
  if (labelType === 'none') {
    return [];
  }

  const labels: CosmosLabel[] = [];

  if (labelType === 'auto' || labelType === 'all' || labelType === 'nodes') {
    labels.push(
      ...getNodeLabels(
        graph,
        preparedGraph,
        selectedIds,
        activeIds,
        labelType,
        defaultNodeSize,
        maxCount
      )
    );
  }

  if (
    (labelType === 'all' || labelType === 'edges') &&
    labels.length < maxCount
  ) {
    labels.push(
      ...getEdgeLabels(
        graph,
        preparedGraph,
        selectedIds,
        activeIds,
        maxCount - labels.length
      )
    );
  }

  return labels.filter(label =>
    isVisibleScreenPosition(label.x, label.y, container)
  );
};

export const CosmosLabels = ({
  activeIds,
  containerRef,
  defaultNodeSize,
  graphRef,
  labelType,
  maxCount,
  preparedGraph,
  selectedIds,
  theme,
  updateInterval
}: {
  activeIds: Set<string>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  defaultNodeSize: number;
  graphRef: React.RefObject<CosmosGraph | null>;
  labelType: CosmosLabelType;
  maxCount: number;
  preparedGraph: PreparedCosmosGraph;
  selectedIds: Set<string>;
  theme: Theme;
  updateInterval: number;
}) => {
  const [labels, setLabels] = useState<CosmosLabel[]>([]);

  useEffect(() => {
    if (labelType === 'none') {
      setLabels(labels => (labels.length ? [] : labels));
      return undefined;
    }

    let frameId = 0;
    let lastUpdate = 0;
    let lastLabels: CosmosLabel[] = [];

    const update = (now: number) => {
      const graph = graphRef.current;
      const container = containerRef.current;

      if (
        graph &&
        container &&
        preparedGraph.nodes.length &&
        now - lastUpdate >= updateInterval
      ) {
        const nextLabels = getCosmosLabels({
          activeIds,
          container,
          defaultNodeSize,
          graph,
          labelType,
          maxCount,
          preparedGraph,
          selectedIds
        });

        if (!areLabelsEqual(nextLabels, lastLabels)) {
          lastLabels = nextLabels;
          setLabels(nextLabels);
        }

        lastUpdate = now;
      }

      frameId = requestAnimationFrame(update);
    };

    frameId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [
    activeIds,
    containerRef,
    defaultNodeSize,
    graphRef,
    labelType,
    maxCount,
    preparedGraph,
    selectedIds,
    updateInterval
  ]);

  if (!labels.length) {
    return null;
  }

  const nodeColor = toHexColor(theme.node.label.color, '#2A6475');
  const nodeActiveColor = toHexColor(theme.node.label.activeColor, '#1DE9AC');
  const nodeStroke = toHexColor(theme.node.label.stroke, '#fff');
  const edgeColor = toHexColor(theme.edge.label.color, '#2A6475');
  const edgeActiveColor = toHexColor(theme.edge.label.activeColor, '#1DE9AC');
  const edgeStroke = toHexColor(theme.edge.label.stroke, '#fff');

  return (
    <>
      {labels.map(label => {
        const isNode = label.type === 'node';
        const color = label.active
          ? isNode
            ? nodeActiveColor
            : edgeActiveColor
          : isNode
            ? nodeColor
            : edgeColor;
        const stroke = isNode ? nodeStroke : edgeStroke;

        return (
          <div
            key={`${label.type}-${label.id}`}
            style={{
              color,
              fontSize: isNode
                ? 12
                : Math.max(theme.edge.label.fontSize ?? 10, 10),
              fontWeight: isNode ? 600 : 500,
              left: label.x,
              maxWidth: 160,
              overflow: 'hidden',
              pointerEvents: 'none',
              position: 'absolute',
              textAlign: 'center',
              textOverflow: 'ellipsis',
              textShadow: `-1px -1px 0 ${stroke}, 1px -1px 0 ${stroke}, -1px 1px 0 ${stroke}, 1px 1px 0 ${stroke}`,
              top: label.y,
              transform: isNode
                ? 'translate(-50%, -150%)'
                : 'translate(-50%, -50%)',
              whiteSpace: 'nowrap',
              zIndex: 8
            }}
          >
            {label.label}
          </div>
        );
      })}
    </>
  );
};
