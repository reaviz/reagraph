import React, { FC, useLayoutEffect, useMemo, useRef } from 'react';
import { RadialSlice, MenuItem } from './RadialSlice';
import { calculateRadius } from './utils';
import css from './RadialMenu.module.css';
import { CollapsibleMenuProps } from 'types';

interface RadialMenuProps {
  items: MenuItem[];
  radius?: number;
  innerRadius?: number;
  startOffsetAngle?: number;
  collapsibleMenuProps?: CollapsibleMenuProps;
  onClose?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

export const RadialMenu: FC<RadialMenuProps> = ({
  items,
  radius,
  innerRadius,
  startOffsetAngle,
  collapsibleMenuProps,
  onClose
}) => {
  const { canCollapse, isCollapsed, onCollapse } = collapsibleMenuProps;
  const radialItems = useMemo(() => {
    if (canCollapse) {
      return [
        ...items,
        {
          label: isCollapsed ? 'Expand Node' : 'Collapse Node',
          onClick: () => {
            onCollapse();
          }
        }
      ];
    }

    return items;
  }, [canCollapse, isCollapsed, items, onCollapse]);
  const { centralAngle, polar, startAngle, deltaAngle } = useMemo(
    () => calculateRadius(radialItems, startOffsetAngle),
    [radialItems, startOffsetAngle]
  );
  const timeout = useRef<any | null>(null);

  useLayoutEffect(() => {
    const timer = timeout.current;
    return () => clearTimeout(timer);
  }, []);

  if (items.length === 0) {
    return null;
  }

  return (
    <div
      role="menu"
      className={css.container}
      onPointerEnter={() => clearTimeout(timeout.current)}
      onPointerLeave={event => {
        clearTimeout(timeout.current);
        timeout.current = setTimeout(() => onClose?.(event), 500);
      }}
    >
      {radialItems.map((slice, index) => (
        <RadialSlice
          key={index}
          {...slice}
          radius={radius}
          innerRadius={innerRadius}
          startAngle={startAngle}
          endAngle={centralAngle * index}
          skew={polar ? 0 : deltaAngle}
          polar={polar}
          centralAngle={centralAngle}
          onClick={event => {
            slice?.onClick(event);
            onClose?.(event);
          }}
        />
      ))}
    </div>
  );
};

RadialMenu.defaultProps = {
  radius: 175,
  innerRadius: 25,
  startOffsetAngle: 0
};
