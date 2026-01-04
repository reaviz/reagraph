/**
 * Node type classification utilities for efficient batching.
 * Groups nodes by their rendering type to enable instanced rendering.
 */

import type { InternalGraphNode } from '../../types';

/**
 * Types of node rendering modes.
 * - 'sphere': Default sphere nodes (can be instanced)
 * - 'icon': Nodes with icon URL (grouped by texture for instancing)
 * - 'custom': Nodes using custom renderNode (rendered individually)
 */
export type NodeRenderType = 'sphere' | 'icon' | 'custom';

/**
 * A group of nodes that share the same rendering type.
 */
export interface NodeTypeGroup {
  /** The rendering type for this group */
  type: NodeRenderType;
  /** Nodes in this group */
  nodes: InternalGraphNode[];
  /** For icon groups, the shared texture URL */
  iconUrl?: string;
}

/**
 * Result of classifying nodes by type.
 */
export interface ClassifiedNodes {
  /** Sphere nodes (no icon, no custom renderer) */
  sphereNodes: InternalGraphNode[];
  /** Icon nodes grouped by their icon URL for texture batching */
  iconNodeGroups: Map<string, InternalGraphNode[]>;
  /** Nodes that use custom renderNode (rendered individually) */
  customNodes: InternalGraphNode[];
  /** Nodes currently being dragged (rendered individually for real-time updates) */
  draggingNodes: InternalGraphNode[];
}

/**
 * Classifies nodes by their rendering type for efficient batching.
 *
 * @param nodes - All nodes to classify
 * @param draggingIds - IDs of nodes currently being dragged
 * @param hasCustomRenderer - Whether a custom renderNode function is provided
 * @returns Classified nodes by type
 */
export function classifyNodes(
  nodes: InternalGraphNode[],
  draggingIds: string[] = [],
  hasCustomRenderer: boolean = false
): ClassifiedNodes {
  const sphereNodes: InternalGraphNode[] = [];
  const iconNodeGroups = new Map<string, InternalGraphNode[]>();
  const customNodes: InternalGraphNode[] = [];
  const draggingNodes: InternalGraphNode[] = [];

  const draggingIdSet = new Set(draggingIds);

  for (const node of nodes) {
    // Dragging nodes are always rendered individually for real-time position updates
    if (draggingIdSet.has(node.id)) {
      draggingNodes.push(node);
      continue;
    }

    // Custom renderer nodes bypass instancing entirely
    if (hasCustomRenderer) {
      customNodes.push(node);
      continue;
    }

    // Classify by node properties
    if (node.icon) {
      // Group icon nodes by their icon URL for texture batching
      const group = iconNodeGroups.get(node.icon);
      if (group) {
        group.push(node);
      } else {
        iconNodeGroups.set(node.icon, [node]);
      }
    } else {
      // Default sphere nodes
      sphereNodes.push(node);
    }
  }

  return {
    sphereNodes,
    iconNodeGroups,
    customNodes,
    draggingNodes
  };
}

/**
 * Determines the render type for a single node.
 * Useful for state-based classification (active, selected, etc.)
 *
 * @param node - The node to classify
 * @param hasCustomRenderer - Whether a custom renderNode function is provided
 * @returns The render type for this node
 */
export function getNodeRenderType(
  node: InternalGraphNode,
  hasCustomRenderer: boolean = false
): NodeRenderType {
  if (hasCustomRenderer) {
    return 'custom';
  }
  if (node.icon) {
    return 'icon';
  }
  return 'sphere';
}

