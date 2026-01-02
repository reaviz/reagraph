/**
 * Batched node rendering component using Three.js InstancedMesh.
 * Replaces O(n) individual Node components with a single instanced renderer
 * for dramatically improved performance with large graphs.
 */

import { Html } from '@react-three/drei';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import type { FC, ReactNode } from 'react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PerspectiveCamera } from 'three';

import { useStore } from '../../store';
import type {
  CollapseProps,
  ContextMenuEvent,
  InternalGraphNode,
  NodeContextMenuProps,
  NodeRenderer
} from '../../types';
import { Label } from '../Label';
import { Node } from '../Node';
import { Ring } from '../Ring';
import { classifyNodes } from './classifyNodes';
import { useNodeInstancing } from './useNodeInstancing';
import { useNodePositionAnimation } from './useNodeAnimations';
import { createIndexToNodeIdMap, useNodeEvents } from './useNodeEvents';

// LOD: Maximum camera distance at which node labels are visible
const LABEL_VISIBILITY_DISTANCE = 15000;

export interface NodesProps {
  /** Nodes to render */
  nodes: InternalGraphNode[];
  /** Whether animations are enabled */
  animated?: boolean;
  /** Whether interactions are disabled */
  disabled?: boolean;
  /** Whether nodes are draggable */
  draggable?: boolean;
  /** Constrain dragging to cluster bounds */
  constrainDragging?: boolean;
  /** URL for custom label font */
  labelFontUrl?: string;
  /** Custom node renderer (falls back to individual rendering) */
  renderNode?: NodeRenderer;
  /** Context menu render function */
  contextMenu?: (event: ContextMenuEvent) => ReactNode;
  /** Default node size */
  defaultNodeSize?: number;
  /** Click handler */
  onClick?: (
    node: InternalGraphNode,
    props?: CollapseProps,
    event?: ThreeEvent<MouseEvent>
  ) => void;
  /** Double-click handler */
  onDoubleClick?: (
    node: InternalGraphNode,
    event?: ThreeEvent<MouseEvent>
  ) => void;
  /** Context menu handler */
  onContextMenu?: (
    node: InternalGraphNode,
    props?: NodeContextMenuProps
  ) => void;
  /** Pointer over handler */
  onPointerOver?: (
    node: InternalGraphNode,
    event?: ThreeEvent<PointerEvent>
  ) => void;
  /** Pointer out handler */
  onPointerOut?: (
    node: InternalGraphNode,
    event?: ThreeEvent<PointerEvent>
  ) => void;
  /** Drag complete handler */
  onDragged?: (node: InternalGraphNode) => void;
}

/**
 * Batched node rendering component.
 * Uses InstancedMesh for sphere nodes, falling back to individual
 * rendering for custom nodes and dragging nodes.
 */
export const Nodes: FC<NodesProps> = ({
  nodes,
  animated = true,
  disabled = false,
  draggable = false,
  constrainDragging = false,
  labelFontUrl,
  renderNode,
  contextMenu,
  defaultNodeSize = 7,
  onClick,
  onDoubleClick,
  onContextMenu,
  onPointerOver,
  onPointerOut,
  onDragged
}) => {
  // Access store state
  const theme = useStore(state => state.theme);
  const actives = useStore(state => state.actives ?? []);
  const selections = useStore(state => state.selections ?? []);
  const draggingIds = useStore(state => state.draggingIds ?? []);
  const nodeContextMenus = useStore(state => state.nodeContextMenus ?? new Set<string>());
  const setNodeContextMenus = useStore(state => state.setNodeContextMenus);

  const hasSelections = selections.length > 0;
  const hasCustomRenderer = !!renderNode;

  // Three.js context
  const { gl, camera } = useThree();

  // Classify nodes by type for efficient rendering
  const { sphereNodes, iconNodeGroups, customNodes, draggingNodes } = useMemo(
    () => classifyNodes(nodes, draggingIds, hasCustomRenderer),
    [nodes, draggingIds, hasCustomRenderer]
  );

  // Create instanced mesh for sphere nodes
  const instancing = useNodeInstancing(5000);

  // Create index-to-nodeId map for raycasting
  const indexToNodeId = useMemo(
    () => createIndexToNodeIdMap(instancing.nodeIdToIndex),
    [instancing.nodeIdToIndex]
  );

  // Update instanced mesh transforms when nodes change
  useEffect(() => {
    instancing.updateTransforms(sphereNodes, defaultNodeSize);
  }, [sphereNodes, defaultNodeSize, instancing]);

  // Update instanced mesh colors when state changes
  useEffect(() => {
    instancing.updateColors(sphereNodes, theme, actives, selections, hasSelections);
  }, [sphereNodes, theme, actives, selections, hasSelections, instancing]);

  // Animate node positions
  useNodePositionAnimation(
    instancing.mesh,
    sphereNodes,
    instancing.nodeIdToIndex,
    animated,
    defaultNodeSize
  );

  // Event handling
  const events = useNodeEvents(
    instancing.mesh,
    sphereNodes,
    indexToNodeId,
    { onClick, onDoubleClick, onContextMenu, onPointerOver, onPointerOut },
    contextMenu,
    disabled
  );

  // Attach DOM event listeners
  useEffect(() => {
    const canvas = gl.domElement;
    if (disabled) return;

    canvas.addEventListener('click', events.handleClick);
    canvas.addEventListener('dblclick', events.handleDoubleClick);
    canvas.addEventListener('contextmenu', events.handleContextMenu);
    canvas.addEventListener('pointermove', events.handlePointerMove);

    return () => {
      canvas.removeEventListener('click', events.handleClick);
      canvas.removeEventListener('dblclick', events.handleDoubleClick);
      canvas.removeEventListener('contextmenu', events.handleContextMenu);
      canvas.removeEventListener('pointermove', events.handlePointerMove);
    };
  }, [gl.domElement, events, disabled]);

  // Track label visibility with LOD - use state to trigger re-renders
  const [visibleLabels, setVisibleLabels] = useState<Set<string>>(new Set());
  const lastLodUpdateRef = useRef(0);
  const LOD_UPDATE_INTERVAL = 100; // ms

  useFrame(() => {
    const now = performance.now();
    if (now - lastLodUpdateRef.current < LOD_UPDATE_INTERVAL) return;
    lastLodUpdateRef.current = now;

    const cam = camera as PerspectiveCamera;
    const zoom = 'zoom' in cam ? cam.zoom : 1;
    const newVisible = new Set<string>();

    for (const node of sphereNodes) {
      if (!node.label) continue;
      // Skip if labelVisible is explicitly false
      if (node.labelVisible === false) continue;

      const dx = cam.position.x - node.position.x;
      const dy = cam.position.y - node.position.y;
      const dz = cam.position.z - node.position.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (distance / zoom < LABEL_VISIBILITY_DISTANCE) {
        newVisible.add(node.id);
      }
    }

    // Only update state if the set of visible labels has changed
    const hasChanged =
      newVisible.size !== visibleLabels.size ||
      [...newVisible].some(id => !visibleLabels.has(id));

    if (hasChanged) {
      setVisibleLabels(newVisible);
    }
  });

  // Get nodes with visible labels
  const labeledNodes = useMemo(() => {
    return sphereNodes.filter(n => {
      if (!n.label) return false;
      if (n.labelVisible === false) return false;
      // Include selected/active nodes even if out of LOD range
      if (selections.includes(n.id) || actives.includes(n.id)) return true;
      return visibleLabels.has(n.id);
    });
  }, [sphereNodes, selections, actives, visibleLabels]);

  // Close context menu handler
  const handleCloseContextMenu = useCallback(
    (nodeId: string) => {
      const newMenus = new Set(nodeContextMenus);
      newMenus.delete(nodeId);
      setNodeContextMenus(newMenus);
    },
    [nodeContextMenus, setNodeContextMenus]
  );

  // Get selected/active nodes for selection rings
  const highlightedNodes = useMemo(
    () =>
      sphereNodes.filter(
        n => selections.includes(n.id) || actives.includes(n.id)
      ),
    [sphereNodes, selections, actives]
  );

  return (
    <group>
      {/* Instanced sphere nodes */}
      <primitive object={instancing.mesh} />

      {/* Selection rings for highlighted nodes */}
      {highlightedNodes.map(node => (
        <group
          key={`ring-${node.id}`}
          position={[node.position.x, node.position.y, node.position.z]}
        >
          <Ring
            opacity={0.5}
            size={node.size ?? defaultNodeSize}
            animated={animated}
            color={theme.ring.activeFill}
          />
        </group>
      ))}

      {/* Node labels (LOD-controlled) */}
      {labeledNodes.map(node => {
        const nodeSize = node.size ?? defaultNodeSize;
        const isHighlighted =
          selections.includes(node.id) || actives.includes(node.id);
        const labelOpacity = hasSelections
          ? isHighlighted
            ? theme.node.selectedOpacity
            : theme.node.inactiveOpacity
          : theme.node.opacity;

        return (
          <group
            key={`label-${node.id}`}
            position={[
              node.position.x,
              node.position.y - nodeSize - 7,
              node.position.z + 2
            ]}
          >
            <Label
              text={node.label!}
              fontUrl={labelFontUrl}
              opacity={labelOpacity}
              stroke={theme.node.label.stroke}
              backgroundColor={theme.node.label.backgroundColor}
              backgroundOpacity={theme.node.label.backgroundOpacity}
              padding={theme.node.label.padding}
              strokeColor={theme.node.label.strokeColor}
              strokeWidth={theme.node.label.strokeWidth}
              radius={theme.node.label.radius}
              active={isHighlighted}
              color={
                isHighlighted
                  ? theme.node.label.activeColor
                  : theme.node.label.color
              }
            />
            {node.subLabel && (
              <group position={[0, -(nodeSize - 3), 0]}>
                <Label
                  text={node.subLabel}
                  fontUrl={labelFontUrl}
                  fontSize={5}
                  opacity={labelOpacity}
                  stroke={theme.node.subLabel?.stroke}
                  active={isHighlighted}
                  color={
                    isHighlighted
                      ? theme.node.subLabel?.activeColor
                      : theme.node.subLabel?.color
                  }
                />
              </group>
            )}
          </group>
        );
      })}

      {/* Context menus */}
      {contextMenu &&
        [...nodeContextMenus].map(nodeId => {
          const node = nodes.find(n => n.id === nodeId);
          if (!node) return null;

          return (
            <group
              key={`menu-${nodeId}`}
              position={[node.position.x, node.position.y, node.position.z]}
            >
              <Html prepend center>
                {contextMenu({
                  data: node,
                  canCollapse: false, // TODO: Compute from graph
                  isCollapsed: false,
                  onCollapse: () => {},
                  onClose: () => handleCloseContextMenu(nodeId)
                })}
              </Html>
            </group>
          );
        })}

      {/* Icon nodes - render individually for now (TODO: implement icon instancing) */}
      {[...iconNodeGroups.values()].flat().map(node => (
        <Node
          key={node.id}
          id={node.id}
          animated={animated}
          disabled={disabled}
          draggable={draggable}
          constrainDragging={constrainDragging}
          labelFontUrl={labelFontUrl}
          contextMenu={contextMenu}
          onClick={onClick}
          onDoubleClick={onDoubleClick}
          onContextMenu={onContextMenu}
          onPointerOver={onPointerOver}
          onPointerOut={onPointerOut}
          onDragged={onDragged}
        />
      ))}

      {/* Dragging nodes - render individually for real-time updates */}
      {draggingNodes.map(node => (
        <Node
          key={node.id}
          id={node.id}
          animated={animated}
          disabled={disabled}
          draggable={draggable}
          constrainDragging={constrainDragging}
          labelFontUrl={labelFontUrl}
          contextMenu={contextMenu}
          onClick={onClick}
          onDoubleClick={onDoubleClick}
          onContextMenu={onContextMenu}
          onPointerOver={onPointerOver}
          onPointerOut={onPointerOut}
          onDragged={onDragged}
        />
      ))}

      {/* Custom renderer nodes - render individually */}
      {customNodes.map(node => (
        <Node
          key={node.id}
          id={node.id}
          animated={animated}
          disabled={disabled}
          draggable={draggable}
          constrainDragging={constrainDragging}
          labelFontUrl={labelFontUrl}
          renderNode={renderNode}
          contextMenu={contextMenu}
          onClick={onClick}
          onDoubleClick={onDoubleClick}
          onContextMenu={onContextMenu}
          onPointerOver={onPointerOver}
          onPointerOut={onPointerOut}
          onDragged={onDragged}
        />
      ))}
    </group>
  );
};
