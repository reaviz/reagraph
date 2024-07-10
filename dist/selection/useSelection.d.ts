import { RefObject } from 'react';
import { GraphCanvasRef } from '../GraphCanvas';
import { GraphEdge, GraphNode } from '../types';
import { PathSelectionTypes } from './utils';
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
export declare const useSelection: ({ selections, nodes, actives, focusOnSelect, type, pathHoverType, pathSelectionType, ref, hotkeys, disabled, onSelection }: SelectionProps) => SelectionResult;
