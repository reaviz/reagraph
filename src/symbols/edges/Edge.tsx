import React, { FC, useCallback, useMemo } from 'react';
import { useSpring, a } from '@react-spring/three';
import { Html } from 'glodrei';
import { ColorRepresentation, Euler } from 'three';

import { useStore } from '../../store';
import { Theme } from '../../themes';
import { ContextMenuEvent, InternalGraphEdge } from '../../types';
import {
  animationConfig,
  getLabelOffsetByType,
  getMidPoint
} from '../../utils';
import { Label } from '../Label';

/**
 * Label positions relatively edge
 *
 * below: show label under the edge line
 * above: show label above the edge line
 * inline: show label along the edge line
 * natural: normal text positions
 */
export type EdgeLabelPosition = 'below' | 'above' | 'inline' | 'natural';

export type EdgeArrowPosition = 'none' | 'mid' | 'end';

export interface EdgeProps {
  /**
   * Whether the edge should be animated.
   */
  animated?: boolean;

  /**
   * Whether the edge should be disabled.
   */
  disabled?: boolean;

  /**
   * The color of the edge.
   */
  color: ColorRepresentation;

  /**
   * A function that returns the context menu for the edge.
   */
  contextMenu?: (event: Partial<ContextMenuEvent>) => React.ReactNode;

  /**
   * The edge object.
   */
  edge: InternalGraphEdge;

  /**
   * The URL of the font for the edge label.
   */
  labelFontUrl?: string;

  /**
   * The placement of the edge label.
   */
  labelPlacement?: EdgeLabelPosition;

  /**
   * The opacity of the edge.
   */
  opacity?: number;
}

export const Edge: FC<EdgeProps> = ({
  animated,
  color,
  contextMenu,
  edge,
  labelFontUrl,
  labelPlacement = 'inline',
  opacity
}) => {
  const theme = useStore(state => state.theme);
  const { target, source, label, labelVisible = false, size = 1 } = edge;

  const nodes = useStore(store => store.nodes);
  const [from, to] = useMemo(
    () => [
      nodes.find(node => node.id === source),
      nodes.find(node => node.id === target)
    ],
    [nodes, source, target]
  );
  const isDragging = useStore(state => state.draggingIds.length > 0);

  const labelOffset = useMemo(
    () => (size + theme.edge.label.fontSize) / 2,
    [size, theme.edge.label.fontSize]
  );

  const midPoint = useMemo(
    () =>
      getMidPoint(
        from.position,
        to.position,
        getLabelOffsetByType(labelOffset, labelPlacement)
      ),
    [from.position, to.position, labelOffset, labelPlacement]
  );

  const edgeContextMenus = useStore(state => state.edgeContextMenus);
  const setEdgeContextMenus = useStore(state => state.setEdgeContextMenus);

  const [{ labelPosition }] = useSpring(
    () => ({
      from: {
        labelPosition: [0, 0, 0]
      },
      to: {
        labelPosition: [midPoint.x, midPoint.y, midPoint.z]
      },
      config: {
        ...animationConfig,
        duration: animated && !isDragging ? undefined : 0
      }
    }),
    [midPoint, animated, isDragging]
  );

  const removeContextMenu = useCallback(
    (edgeId: string) => {
      edgeContextMenus.delete(edgeId);
      setEdgeContextMenus(new Set(edgeContextMenus));
    },
    [edgeContextMenus, setEdgeContextMenus]
  );

  const labelRotation = useMemo(() => {
    if (labelPlacement === 'natural') {
      return new Euler(0, 0, 0);
    }
    return new Euler(
      0,
      0,
      Math.atan2(
        to.position.y - from.position.y,
        to.position.x - from.position.x
      )
    );
  }, [
    labelPlacement,
    to.position.y,
    to.position.x,
    from.position.y,
    from.position.x
  ]);

  const htmlProps = useMemo(
    () => ({
      prepend: true,
      center: true,
      position: midPoint
    }),
    [midPoint]
  );

  const labelProps = useMemo(
    () => ({
      text: label,
      ellipsis: 15,
      fontUrl: labelFontUrl,
      stroke: theme.edge.label.stroke,
      color,
      opacity,
      fontSize: theme.edge.label.fontSize,
      rotation: labelRotation
    }),
    [
      label,
      labelFontUrl,
      theme.edge.label.stroke,
      color,
      opacity,
      theme.edge.label.fontSize,
      labelRotation
    ]
  );

  return (
    <group>
      {labelVisible && label && (
        <a.group position={labelPosition as any}>
          <Label {...labelProps} />
        </a.group>
      )}
      {contextMenu && edgeContextMenus.has(edge.id) && (
        <Html {...htmlProps}>
          {contextMenu({
            data: edge,
            onClose: () => removeContextMenu(edge.id)
          })}
        </Html>
      )}
    </group>
  );
};
