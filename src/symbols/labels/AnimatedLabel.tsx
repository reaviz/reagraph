import React from 'react';
import { useSpring } from '@react-spring/three';
import { a } from '@react-spring/three';

import { InternalGraphNode } from '../../types';
import { CulledLabelProps } from './CulledLabels';
import { useStore } from '../../store';
import { Label } from './Label';
import { animationConfig } from '../../utils/animation';

// Calculate text height for multi-line text to get the correct offset
const calculateTextHeight = (
  text: string,
  fontSize: number,
  maxWidth: number = 100
) => {
  const lineHeight = fontSize * 1.2;
  const avgCharWidth = fontSize * 0.6;
  const charsPerLine = Math.floor(maxWidth / avgCharWidth);
  const lines = Math.ceil(text.length / charsPerLine);
  return lines * lineHeight;
};

interface AnimatedLabelProps extends Omit<CulledLabelProps, 'nodes'> {
  node: InternalGraphNode;
  shouldAnimate: boolean;
  setShouldAnimate: (value: boolean) => void;
}

export const AnimatedLabel = ({
  node,
  theme,
  selections,
  actives,
  hoveredNodeId,
  draggingIds,
  fontSize,
  animated,
  shouldAnimate,
  setShouldAnimate,
  onPointerOver,
  onPointerOut,
  onPointerDown,
  onPointerUp,
  onClick
}: AnimatedLabelProps) => {
  const center = useStore(state => state.centerPosition);
  const nodeSize = node.size || 1;
  const shouldHighlight =
    selections.includes(node.id) ||
    actives.includes(node.id) ||
    hoveredNodeId === node.id;

  const isDragging = draggingIds.length > 0;
  const isActive =
    selections.includes(node.id) ||
    actives.includes(node.id) ||
    hoveredNodeId === node.id;

  const textHeight = calculateTextHeight(node.label || '', fontSize);
  const baseOffset = nodeSize + 7;
  const textOffset = textHeight / 2;
  const totalOffset = baseOffset + textOffset;

  const [{ position }] = useSpring(
    () => ({
      from: {
        position: center ? [center.x, center.y, 0] : [0, 0, 0]
      },
      to: {
        position: [
          node.position?.x || 0,
          (node.position?.y || 0) - totalOffset,
          shouldHighlight ? (node.position?.z || 0) + 1 : node.position?.z || 0
        ]
      },
      config: {
        ...animationConfig,
        duration: animated && shouldAnimate && !isDragging ? undefined : 0
      },
      onRest: () => {
        // Disable animation after first render completes
        if (shouldAnimate && animated && !isDragging) {
          setShouldAnimate(false);
        }
      }
    }),
    [
      node.position?.x,
      node.position?.y,
      node.position?.z,
      shouldHighlight,
      isDragging,
      nodeSize,
      totalOffset,
      shouldAnimate
    ]
  );

  return (
    <a.group
      key={node.id}
      position={position as any}
      userData={{ node: node }}
      onClick={e => onClick?.(e, node)}
      onPointerOver={e => onPointerOver?.(e, node)}
      onPointerOut={e => onPointerOut?.(e, node)}
      onPointerDown={e => onPointerDown?.(e, node)}
      onPointerUp={e => onPointerUp?.(e, node)}
    >
      <Label
        text={node.label || ''}
        opacity={1}
        stroke={theme.node.label.stroke}
        backgroundColor={theme.node.label.backgroundColor}
        backgroundOpacity={theme.node.label.backgroundOpacity}
        padding={theme.node.label.padding}
        strokeColor={theme.node.label.strokeColor}
        strokeWidth={theme.node.label.strokeWidth}
        radius={theme.node.label.radius}
        active={isActive}
        color={
          isActive || draggingIds.includes(node.id)
            ? theme.node.label.activeColor
            : theme.node.label.color
        }
        fontSize={fontSize}
      />
    </a.group>
  );
};
