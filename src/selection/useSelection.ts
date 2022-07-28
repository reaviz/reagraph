import React, { RefObject, useEffect, useMemo, useState } from 'react';
import { GraphCanvasRef } from '../GraphCanvas';
import { useHotkeys } from 'reakeys';
import { GraphEdge, GraphNode } from '../types';
import { findPath } from '../utils/paths';
import { getAdjacents, PathSelectionTypes } from './utils';

export type HotkeyTypes = 'selectAll' | 'deselect' | 'delete';

export type SelectionTypes = 'single' | 'multi' | 'multiModifier';

export interface SelectionProps {
  /**
   * Required ref for the graph.
   */
  ref: RefObject<GraphCanvasRef | null>;

  /**
   * Current selections.
   *
   * Contains both nodes and edges ids.
   */
  selections?: string[];

  /**
   * Default active selections.
   */
  actives?: string[];

  /**
   * Node datas.
   */
  nodes?: GraphNode[];

  /**
   * Edge datas.
   */
  edges?: GraphEdge[];

  /**
   * Disabled or not.
   */
  disabled?: boolean;

  /**
   * Hotkey types
   */
  hotkeys?: HotkeyTypes[];

  /**
   * Whether to focus on select or not.
   */
  focusOnSelect?: boolean;

  /**
   * Type of selection.
   */
  type?: SelectionTypes;

  /**
   * Type of selection.
   */
  pathSelectionType?: PathSelectionTypes;

  /**
   * On selection change.
   */
  onSelection?: (selectionIds: string[]) => void;
}

export interface SelectionResult {
  /**
   * Selections id array (of nodes and edges).
   */
  selections: string[];

  /**
   * The nodes/edges around the selections to highlight.
   */
  actives: string[];

  /**
   * Clear selections method.
   */
  clearSelections: (value?: string[]) => void;

  /**
   * A selection method.
   */
  addSelection: (value: string) => void;

  /**
   * Get the paths between two nodes.
   */
  selectNodePaths: (fromId: string, toId: string) => void;

  /**
   * Remove selection method.
   */
  removeSelection: (value: string) => void;

  /**
   * Toggle existing selection on/off method.
   */
  toggleSelection: (value: string) => void;

  /**
   * Set internal selections.
   */
  setSelections: (value: string[]) => void;

  /**
   * On click event pass through.
   */
  onNodeClick?: (data: GraphNode) => void;

  /**
   * On canvas click event pass through.
   */
  onCanvasClick?: (event: MouseEvent) => void;

  /**
   * When the lasso happened.
   */
  onLasso?: (selections: string[]) => void;

  /**
   * When the lasso ended.
   */
  onLassoEnd?: (selections: string[]) => void;
}

export const useSelection = ({
  selections = [],
  nodes = [],
  actives = [],
  focusOnSelect = true,
  type = 'single',
  pathSelectionType = 'direct',
  ref,
  hotkeys = ['selectAll', 'deselect', 'delete'],
  disabled,
  onSelection
}: SelectionProps): SelectionResult => {
  const [internalActives, setInternalActives] = useState<string[]>(actives);
  const [internalSelections, setInternalSelections] =
    useState<string[]>(selections);
  const [metaKeyDown, setMetaKeyDown] = useState<boolean>(false);
  const isMulti = type === 'multi' || type === 'multiModifier';

  const addSelection = (items: string | string[]) => {
    if (!disabled && items) {
      items = Array.isArray(items) ? items : [items];

      const filtered = items.filter(item => !internalSelections.includes(item));
      if (filtered.length) {
        const next = [...internalSelections, ...filtered];
        onSelection?.(next);
        setInternalSelections(next);
      }
    }
  };

  const removeSelection = (items: string | string[]) => {
    if (!disabled && items) {
      items = Array.isArray(items) ? items : [items];

      const next = internalSelections.filter(i => !items.includes(i));
      onSelection?.(next);
      setInternalSelections(next);
    }
  };

  const toggleSelection = (item: string) => {
    const has = internalSelections.includes(item);
    if (has) {
      removeSelection(item);
    } else {
      if (!isMulti) {
        clearSelections(item);
      } else {
        addSelection(item);
      }
    }
  };

  const clearSelections = (next: string | string[] = []) => {
    if (!disabled) {
      next = Array.isArray(next) ? next : [next];
      setInternalActives([]);
      setInternalSelections(next);
      onSelection?.(next);
    }
  };

  const onNodeClick = (data: GraphNode) => {
    if (isMulti) {
      if (type === 'multiModifier') {
        if (metaKeyDown) {
          addSelection(data.id);
        } else {
          clearSelections(data.id);
        }
      } else {
        addSelection(data.id);
      }
    } else {
      clearSelections(data.id);
    }

    if (focusOnSelect) {
      ref.current?.centerGraph([data.id]);
    }
  };

  const selectNodePaths = (fromId: string, toId: string) => {
    const graph = ref.current.getGraph();
    if (!graph) {
      throw new Error('Graph is not initialized');
    }

    const path = findPath(graph, fromId, toId);
    clearSelections([fromId, toId]);

    const result = [];
    for (let i = 0; i < path.length - 1; i++) {
      const from = path[i];
      const to = path[i + 1];
      const edge = graph.getLink(to.data.id, from.data.id);
      if (edge) {
        result.push(edge.data.id);
      }
    }

    setInternalActives([...path.map(p => p.id as string), ...result]);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const element = event.target as any;
    const isSafe =
      element.tagName !== 'INPUT' &&
      element.tagName !== 'SELECT' &&
      element.tagName !== 'TEXTAREA' &&
      !element.isContentEditable;

    if (isSafe) {
      event.preventDefault();
      setMetaKeyDown(event.metaKey || event.ctrlKey);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  });

  const onCanvasClick = (event: MouseEvent) => {
    if (
      event.button !== 2 &&
      (internalSelections.length || internalActives.length)
    ) {
      clearSelections();
      setMetaKeyDown(false);

      // Only re-center if we have a single selection
      if (focusOnSelect && internalSelections.length === 1) {
        ref.current?.centerGraph();
      }
    }
  };

  const onLasso = (selections: string[]) => {
    setInternalActives(selections);
  };

  const onLassoEnd = (selections: string[]) => {
    clearSelections(selections);
  };

  useHotkeys([
    {
      name: 'Select All',
      keys: 'mod+a',
      disabled: !hotkeys.includes('selectAll'),
      category: 'Canvas',
      description: 'Select all nodes and edges',
      callback: event => {
        event.preventDefault();

        if (!disabled && type !== 'single') {
          const next = nodes.map(n => n.id);
          onSelection?.(next);
          setInternalSelections(next);
        }
      }
    },
    {
      name: 'Deselect Selections',
      category: 'Canvas',
      disabled: !hotkeys.includes('deselect'),
      description: 'Deselect selected nodes and edges',
      keys: 'escape',
      callback: event => {
        if (!disabled) {
          event.preventDefault();
          onSelection?.([]);
          setInternalSelections([]);
        }
      }
    }
  ]);

  useEffect(() => {
    if (pathSelectionType !== 'direct') {
      setInternalActives(
        getAdjacents(ref, internalSelections, pathSelectionType)
      );
    }
  }, [internalSelections, pathSelectionType, ref]);

  return {
    actives: internalActives,
    onNodeClick,
    onLasso,
    onLassoEnd,
    selectNodePaths,
    onCanvasClick,
    selections: internalSelections,
    clearSelections,
    addSelection,
    removeSelection,
    toggleSelection,
    setSelections: setInternalSelections
  };
};
