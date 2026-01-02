/**
 * Layout adapter that reads positions directly from graphology node attributes.
 * Used when a worker (like FA2Layout) has already computed positions
 * and stored them as x/y attributes on the graph nodes.
 */

import type Graph from 'graphology';
import type { DragReferences } from '../store';
import type { InternalGraphPosition, InternalVector3 } from '../types';
import type { LayoutStrategy } from './types';

export interface GraphPositionAdapterOptions {
  graph: Graph;
  drags?: DragReferences;
  /** Whether the layout is 3D (reads z attribute) */
  is3d?: boolean;
}

/**
 * Creates a LayoutStrategy adapter that reads positions from graph node attributes.
 * This allows using `transformGraph` instead of `transformGraphWithPositions`
 * when positions are stored directly on the graph (e.g., from FA2 worker).
 */
export function createGraphPositionAdapter({
  graph,
  drags,
  is3d = false
}: GraphPositionAdapterOptions): LayoutStrategy {
  return {
    getNodePosition(id: string): InternalGraphPosition {
      // Check for drag position first
      if (drags?.[id]?.position) {
        const dragPos = drags[id].position;
        return {
          x: dragPos.x,
          y: dragPos.y,
          z: dragPos.z ?? (is3d ? 0 : 1)
        } as InternalGraphPosition;
      }

      // Read position from graph node attributes
      const attrs = graph.getNodeAttributes(id);
      return {
        x: (attrs as any).x ?? 0,
        y: (attrs as any).y ?? 0,
        z: is3d ? ((attrs as any).z ?? 0) : 1
      } as InternalGraphPosition;
    },

    // No-op step since the worker already ran the layout
    step(): boolean {
      return false;
    }
  };
}

/**
 * Creates a LayoutStrategy adapter from a pre-computed positions Map.
 * Used when positions come from a custom worker that returns a Map.
 */
export function createPositionMapAdapter(
  positions: Map<string, InternalVector3>,
  drags?: DragReferences,
  is3d = false
): LayoutStrategy {
  return {
    getNodePosition(id: string): InternalGraphPosition {
      // Check for drag position first
      if (drags?.[id]?.position) {
        const dragPos = drags[id].position;
        return {
          x: dragPos.x,
          y: dragPos.y,
          z: dragPos.z ?? (is3d ? 0 : 1)
        } as InternalGraphPosition;
      }

      // Read position from positions map
      const pos = positions.get(id);
      return {
        x: pos?.x ?? 0,
        y: pos?.y ?? 0,
        z: is3d ? (pos?.z ?? 0) : 1
      } as InternalGraphPosition;
    },

    // No-op step since the worker already ran the layout
    step(): boolean {
      return false;
    }
  };
}
