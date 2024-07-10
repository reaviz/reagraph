import React, { FC } from 'react';
import { MenuItem } from './RadialSlice';
interface RadialMenuProps {
    /**
     * An array of menu items to be displayed in the radial menu.
     */
    items: MenuItem[];
    /**
     * The radius of the radial menu.
     */
    radius?: number;
    /**
     * The inner radius of the radial menu.
     */
    innerRadius?: number;
    /**
     * The starting offset angle for the first menu item.
     */
    startOffsetAngle?: number;
    /**
     * The CSS class name for the radial menu.
     */
    className?: string;
    /**
     * A function that is called when the radial menu is closed.
     * The function receives the mouse event that triggered the closure.
     */
    onClose?: (event: React.MouseEvent<HTMLDivElement>) => void;
}
export declare const RadialMenu: FC<RadialMenuProps>;
export {};
