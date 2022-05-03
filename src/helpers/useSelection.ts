import React, { RefObject, useState } from 'react';
import { GraphCanvasRef } from '../GraphCanvas';
import { useHotkeys } from 'reakeys';
import { GraphEdge, GraphNode } from 'types';

export type HotkeyTypes = 'selectAll' | 'deselect' | 'delete';

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
   * On selection change.
   */
  onSelection?: (newSelectedIds: string[]) => void;
}

export interface SelectionResult {
  /**
   * Selections id array (of nodes and edges).
   */
  selections: string[];

  /**
   * Clear selections method.
   */
  clearSelections: (value?: string[]) => void;

  /**
   * A selection method.
   */
  addSelection: (value: string) => void;

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
   * On keydown event pass through.
   */
  onKeyDown?: (event: React.KeyboardEvent<SVGGElement>) => void;
}

export const useSelection = ({
  selections = [],
  nodes = [],
  focusOnSelect = true,
  ref,
  hotkeys = ['selectAll', 'deselect', 'delete'],
  disabled,
  onSelection
}: SelectionProps): SelectionResult => {
  const [internalSelections, setInternalSelections] =
    useState<string[]>(selections);
  const [metaKeyDown, setMetaKeyDown] = useState<boolean>(false);

  const addSelection = (item: string) => {
    if (!disabled) {
      const has = internalSelections.includes(item);
      if (!has) {
        const next = [...internalSelections, item];
        onSelection?.(next);
        setInternalSelections(next);
      }
    }
  };

  const removeSelection = (item: string) => {
    if (!disabled) {
      const has = internalSelections.includes(item);
      if (has) {
        const next = internalSelections.filter(i => i !== item);
        onSelection?.(next);
        setInternalSelections(next);
      }
    }
  };

  const toggleSelection = (item: string) => {
    const has = internalSelections.includes(item);
    if (has) {
      removeSelection(item);
    } else {
      addSelection(item);
    }
  };

  const clearSelections = (next: string[] = []) => {
    if (!disabled) {
      setInternalSelections(next);
      onSelection?.(next);
    }
  };

  const onNodeClick = (data: GraphNode) => {
    if (!metaKeyDown) {
      clearSelections([data.id]);

      if (focusOnSelect) {
        ref.current?.centerGraph([data.id]);
      }
    } else {
      toggleSelection(data.id);
    }

    setMetaKeyDown(false);
  };

  const onKeyDown = event => {
    event.preventDefault();
    setMetaKeyDown(event.metaKey || event.ctrlKey);
  };

  const onCanvasClick = (event: MouseEvent) => {
    if (event.button !== 2 && internalSelections.length) {
      clearSelections();
      setMetaKeyDown(false);

      if (focusOnSelect) {
        ref.current?.centerGraph();
      }
    }
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

        if (!disabled) {
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

  return {
    onNodeClick,
    onKeyDown,
    onCanvasClick,
    selections: internalSelections,
    clearSelections,
    addSelection,
    removeSelection,
    toggleSelection,
    setSelections: setInternalSelections
  };
};
