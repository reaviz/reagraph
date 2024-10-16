import { ColorRepresentation } from 'three';

export interface Theme {
  canvas?: {
    background?: ColorRepresentation;
    fog?: ColorRepresentation | null;
  };
  node: {
    fill: ColorRepresentation;
    activeFill: ColorRepresentation;
    opacity: number;
    selectedOpacity: number;
    inactiveOpacity: number;
    label: {
      color: ColorRepresentation;
      stroke?: ColorRepresentation;
      activeColor: ColorRepresentation;
    };
    subLabel?: {
      color: ColorRepresentation;
      stroke?: ColorRepresentation;
      activeColor: ColorRepresentation;
    };
  };
  ring: {
    fill: ColorRepresentation;
    activeFill: ColorRepresentation;
  };
  edge: {
    fill: ColorRepresentation;
    activeFill: ColorRepresentation;
    opacity: number;
    selectedOpacity: number;
    inactiveOpacity: number;
    label: {
      color: ColorRepresentation;
      stroke?: ColorRepresentation;
      activeColor: ColorRepresentation;
      fontSize?: number;
    };
  };
  arrow: {
    fill: ColorRepresentation;
    activeFill: ColorRepresentation;
  };
  lasso: {
    background: string;
    border: string;
  };
  cluster?: {
    stroke?: ColorRepresentation;
    fill?: ColorRepresentation;
    opacity?: number;
    selectedOpacity?: number;
    inactiveOpacity?: number;
    label?: {
      stroke?: ColorRepresentation;
      color: ColorRepresentation;
      /**
       * Size of the cluster label
       */
      fontSize?: number;
      /**
       * Offset of the cluster label relative to the default
       */
      offset?: [number, number, number];
    };
  };
}
