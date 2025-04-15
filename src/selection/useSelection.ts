import React, {
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';
import { GraphCanvasRef } from '../GraphCanvas';
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
   * Whether to focus on select or not.
   */
  focusOnSelect?: boolean | 'singleOnly';

  /**
   * Type of selection.
   */
  type?: SelectionTypes;

  /**
   * Type of selection.
   */
  pathSelectionType?: PathSelectionTypes;

  /**
   * Whether it should active on hover or not.
   */
  pathHoverType?: PathSelectionTypes;

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
  selectNodePaths: (source: string, target: string) => void;

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

  /**
   * When node got a pointer over.
   */
  onNodePointerOver?: (node: GraphNode) => void;

  /**
   * When node lost pointer over.
   */
  onNodePointerOut?: (node: GraphNode) => void;
}

export const useSelection = ({
  selections = [],
  nodes = [],
  actives = [],
  focusOnSelect = true,
  type = 'single',
  pathHoverType = 'out',
  pathSelectionType = 'direct',
  ref,
  disabled,
  onSelection
}: SelectionProps): SelectionResult => {
  const [internalHovers, setInternalHovers] = useState<string[]>([]);
  const [internalActives, setInternalActives] = useState<string[]>(actives);
  const [internalSelections, setInternalSelections] =
    useState<string[]>(selections);
  const [metaKeyDown, setMetaKeyDown] = useState<boolean>(false);
  const isMulti = type === 'multi' || type === 'multiModifier';

  const addSelection = useCallback(
    (items: string | string[]) => {
      if (!disabled && items) {
        items = Array.isArray(items) ? items : [items];

        const filtered = items.filter(
          item => !internalSelections.includes(item)
        );
        if (filtered.length) {
          const next = [...internalSelections, ...filtered];
          onSelection?.(next);
          setInternalSelections(next);
        }
      }
    },
    [disabled, internalSelections, onSelection]
  );

  const removeSelection = useCallback(
    (items: string | string[]) => {
      if (!disabled && items) {
        items = Array.isArray(items) ? items : [items];

        const next = internalSelections.filter(i => !items.includes(i));
        onSelection?.(next);
        setInternalSelections(next);
      }
    },
    [disabled, internalSelections, onSelection]
  );

  const clearSelections = useCallback(
    (next: string | string[] = []) => {
      if (!disabled) {
        next = Array.isArray(next) ? next : [next];
        setInternalActives([]);
        setInternalSelections(next);
        onSelection?.(next);
      }
    },
    [disabled, onSelection]
  );

  const toggleSelection = useCallback(
    (item: string) => {
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
    },
    [
      addSelection,
      clearSelections,
      internalSelections,
      isMulti,
      removeSelection
    ]
  );

  const onNodeClick = useCallback(
    (data: GraphNode) => {
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

      if (
        focusOnSelect === true ||
        (focusOnSelect === 'singleOnly' && !metaKeyDown)
      ) {
        if (!ref.current) {
          throw new Error('No ref found for the graph canvas.');
        }

        const graph = ref.current.getGraph();
        const { nodes: adjacents } = getAdjacents(
          graph,
          [data.id],
          pathSelectionType
        );

        ref.current.fitNodesInView([data.id, ...adjacents], {
          fitOnlyIfNodesNotInView: true
        });
      }
    },
    [
      addSelection,
      clearSelections,
      focusOnSelect,
      isMulti,
      metaKeyDown,
      pathSelectionType,
      ref,
      type
    ]
  );

  const selectNodePaths = useCallback(
    (source: string, target: string) => {
      const graph = ref.current.getGraph();
      if (!graph) {
        throw new Error('Graph is not initialized');
      }

      const path = findPath(graph, source, target);
      clearSelections([source, target]);

      const result = [];
      for (let i = 0; i < path.length - 1; i++) {
        const from = path[i];
        const to = path[i + 1];
        const edge = graph.getEdgeAttributes(from, to);
        if (edge) {
          result.push(edge.id);
        }
      }

      setInternalActives([...path.map(p => p as string), ...result]);
    },
    [clearSelections, ref]
  );

  const onKeyDown = useCallback((event: KeyboardEvent) => {
    const element = event.target as HTMLElement;
    const isSafe =
      element.tagName !== 'INPUT' &&
      element.tagName !== 'SELECT' &&
      element.tagName !== 'TEXTAREA' &&
      !element.isContentEditable;

    const isMeta = event.metaKey || event.ctrlKey;

    if (isSafe && isMeta) {
      setMetaKeyDown(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', onKeyDown);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('keydown', onKeyDown);
      }
    };
  }, [onKeyDown]);

  const onCanvasClick = useCallback(
    (event: MouseEvent) => {
      if (
        event.button !== 2 &&
        (internalSelections.length || internalActives.length)
      ) {
        clearSelections();
        setMetaKeyDown(false);

        // Only re-center if we have a single selection
        if (focusOnSelect && internalSelections.length === 1) {
          if (!ref.current) {
            throw new Error('No ref found for the graph canvas.');
          }

          ref.current.fitNodesInView([], { fitOnlyIfNodesNotInView: true });
        }
      }
    },
    [
      clearSelections,
      focusOnSelect,
      internalActives.length,
      internalSelections.length,
      ref
    ]
  );

  const onLasso = useCallback((selections: string[]) => {
    setInternalActives(selections);
  }, []);

  const onLassoEnd = useCallback(
    (selections: string[]) => {
      clearSelections(selections);
    },
    [clearSelections]
  );

  const onNodePointerOver = useCallback(
    (data: GraphNode) => {
      if (pathHoverType) {
        const graph = ref.current.getGraph();
        if (!graph) {
          throw new Error('No ref found for the graph canvas.');
        }

        const { nodes, edges } = getAdjacents(graph, [data.id], pathHoverType);
        setInternalHovers([...nodes, ...edges]);
      }
    },
    [pathHoverType, ref]
  );

  const onNodePointerOut = useCallback(() => {
    if (pathHoverType) {
      setInternalHovers([]);
    }
  }, [pathHoverType]);

  useEffect(() => {
    if (pathSelectionType !== 'direct' && internalSelections.length > 0) {
      const graph = ref.current?.getGraph();
      if (graph) {
        const { nodes, edges } = getAdjacents(
          graph,
          internalSelections,
          pathSelectionType
        );
        setInternalActives([...nodes, ...edges]);
      }
    }
  }, [internalSelections, pathSelectionType, ref]);

  const joinedActives = useMemo(
    () => [...internalActives, ...internalHovers],
    [internalActives, internalHovers]
  );

  return {
    actives: joinedActives,
    onNodeClick,
    onNodePointerOver,
    onNodePointerOut,
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
