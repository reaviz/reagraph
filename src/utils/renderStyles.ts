import type { ColorRepresentation } from 'three';

import type { Theme } from '../themes';
import type { InternalGraphEdge, InternalGraphNode } from '../types';

export interface RenderStyle {
  color: ColorRepresentation;
  opacity: number;
}

export interface NodeRenderStyleInput {
  node: InternalGraphNode;
  theme: Theme;
  active?: boolean;
  colorActive?: boolean;
  hasSelections?: boolean;
}

export interface EdgeRenderStyleInput {
  edge: InternalGraphEdge;
  theme: Theme;
  active?: boolean;
  colorActive?: boolean;
  hasSelections?: boolean;
}

const getSelectionOpacity = ({
  active,
  baseOpacity,
  hasSelections,
  inactiveOpacity,
  selectedOpacity
}: {
  active?: boolean;
  baseOpacity: number;
  hasSelections?: boolean;
  inactiveOpacity: number;
  selectedOpacity: number;
}) => {
  if (!hasSelections) {
    return baseOpacity;
  }

  return active ? selectedOpacity : inactiveOpacity;
};

export const getNodeRenderStyle = ({
  node,
  theme,
  active,
  colorActive = active,
  hasSelections
}: NodeRenderStyleInput): RenderStyle => ({
  color: colorActive ? theme.node.activeFill : node.fill || theme.node.fill,
  opacity: getSelectionOpacity({
    active,
    baseOpacity: theme.node.opacity,
    hasSelections,
    inactiveOpacity: theme.node.inactiveOpacity,
    selectedOpacity: theme.node.selectedOpacity
  })
});

export const getEdgeRenderStyle = ({
  edge,
  theme,
  active,
  colorActive = active,
  hasSelections
}: EdgeRenderStyleInput): RenderStyle => ({
  color: colorActive ? theme.edge.activeFill : edge.fill || theme.edge.fill,
  opacity: getSelectionOpacity({
    active,
    baseOpacity: theme.edge.opacity,
    hasSelections,
    inactiveOpacity: theme.edge.inactiveOpacity,
    selectedOpacity: theme.edge.selectedOpacity
  })
});
