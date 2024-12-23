import { FC, PropsWithChildren } from 'react';
export type LassoType = 'none' | 'all' | 'node' | 'edge';
export type LassoProps = PropsWithChildren<{
    /**
     * Whether the lasso tool is disabled.
     */
    disabled?: boolean;
    /**
     * The type of the lasso tool.
     */
    type?: LassoType;
    /**
     * A function that is called when the lasso tool is used to select nodes.
     * The function receives an array of the ids of the selected nodes.
     */
    onLasso?: (selections: string[]) => void;
    /**
     * A function that is called when the lasso tool is released, ending the selection.
     * The function receives an array of the ids of the selected nodes.
     */
    onLassoEnd?: (selections: string[]) => void;
}>;
export declare const Lasso: FC<LassoProps>;
