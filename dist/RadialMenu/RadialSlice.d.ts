import React, { FC, ReactNode } from 'react';
export interface MenuItem {
    /**
     * Label to display on the menu item.
     */
    label: string;
    /**
     * CSS Classname to apply to the slice.
     */
    className?: string;
    /**
     * Optional icon to display on the menu item.
     */
    icon?: ReactNode;
    /**
     * Optional callback to detemine if the menu item is active.
     */
    disabled?: boolean;
    /**
     * Optional callback to handle when the menu item is clicked.
     */
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}
interface RadialSliceProps extends MenuItem {
    /**
     * The starting angle of the radial slice, in degrees.
     */
    startAngle: number;
    /**
     * The ending angle of the radial slice, in degrees.
     */
    endAngle: number;
    /**
     * The skew of the radial slice.
     */
    skew: number;
    /**
     * Whether the radial slice is polar (true) or not (false).
     */
    polar: boolean;
    /**
     * The central angle of the radial slice, in degrees.
     */
    centralAngle: number;
    /**
     * The radius of the radial slice.
     */
    radius: number;
    /**
     * The inner radius of the radial slice.
     */
    innerRadius: number;
}
export declare const RadialSlice: FC<RadialSliceProps>;
export {};
