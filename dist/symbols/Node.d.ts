import { FC, ReactNode } from 'react';
import { NodeContextMenuProps, ContextMenuEvent, InternalGraphNode, NodeRenderer, CollapseProps } from '../types';
import { ThreeEvent } from '@react-three/fiber';
export interface NodeProps {
    /**
     * The unique identifier for the node.
     */
    id: string;
    /**
     * The parent nodes of the node.
     */
    parents?: string[];
    /**
     * Whether the node is disabled.
     */
    disabled?: boolean;
    /**
     * Whether the node is animated.
     */
    animated?: boolean;
    /**
     * Whether the node is draggable.
     */
    draggable?: boolean;
    /**
     * The url for the label font.
     */
    labelFontUrl?: string;
    /**
     * The function to use to render the node.
     */
    renderNode?: NodeRenderer;
    /**
     * The context menu for the node.
     */
    contextMenu?: (event: ContextMenuEvent) => ReactNode;
    /**
     * The function to call when the pointer is over the node.
     */
    onPointerOver?: (node: InternalGraphNode, event: ThreeEvent<PointerEvent>) => void;
    /**
     * The function to call when the pointer is out of the node.
     */
    onPointerOut?: (node: InternalGraphNode, event: ThreeEvent<PointerEvent>) => void;
    /**
     * The function to call when the node is clicked.
     */
    onClick?: (node: InternalGraphNode, props?: CollapseProps, event?: ThreeEvent<MouseEvent>) => void;
    /**
     * The function to call when the node is double clicked.
     */
    onDoubleClick?: (node: InternalGraphNode, event: ThreeEvent<MouseEvent>) => void;
    /**
     * The function to call when the node is right clicked.
     */
    onContextMenu?: (node?: InternalGraphNode, props?: NodeContextMenuProps) => void;
    /**
     * Triggered after a node was dragged.
     */
    onDragged?: (node: InternalGraphNode) => void;
}
export declare const Node: FC<NodeProps>;
