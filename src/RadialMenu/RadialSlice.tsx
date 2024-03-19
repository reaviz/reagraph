import classNames from 'classnames';
import React, { FC, ReactNode } from 'react';
import css from './RadialSlice.module.css';

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

export const RadialSlice: FC<RadialSliceProps> = ({
  label,
  centralAngle,
  startAngle,
  endAngle,
  polar,
  radius,
  className,
  icon,
  innerRadius,
  skew,
  disabled,
  onClick
}) => (
  <div
    role="menuitem"
    className={classNames(css.container, className, {
      [css.disabled]: disabled
    })}
    style={{
      width: centralAngle > 90 ? '100%' : '50%',
      height: centralAngle > 90 ? '100%' : '50%',
      bottom: centralAngle > 90 ? '50%' : 'initial',
      right: centralAngle > 90 ? '50%' : 'initial',
      transform: `rotate(${startAngle + endAngle}deg) skew(${skew}deg)`
    }}
    onClick={event => {
      if (!disabled) {
        onClick(event);
      }
    }}
  >
    <div
      className={css.contentContainer}
      style={{
        transform: `skew(${-skew}deg) rotate(${
          (polar ? 90 : centralAngle) / 2 - 90
        }deg)`
      }}
    >
      <div
        className={css.contentInner}
        style={{
          top: `calc((((${
            centralAngle > 90 ? '50% + ' : ''
          }${radius}px) - ${innerRadius}px) / 2) - 4em)`
        }}
      >
        <div
          className={css.content}
          style={{
            transform: `rotate(${-endAngle}deg)`
          }}
          title={label}
        >
          {icon}
          {label}
        </div>
      </div>
    </div>
  </div>
);
