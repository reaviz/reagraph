import { ColorRepresentation } from 'three';

export interface Theme {
  canvas: {
    background: ColorRepresentation;
    fog: ColorRepresentation;
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
    opacityOnlySelected: number;
    label: {
      color: ColorRepresentation;
      stroke?: ColorRepresentation;
      activeColor: ColorRepresentation;
    };
  };
  arrow: {
    fill: ColorRepresentation;
    activeFill: ColorRepresentation;
  };
  menu: {
    background: string;
    color: string;
    border: string;
    activeBackground: string;
    activeColor: string;
  };
}

export const lightTheme: Theme = {
  canvas: {
    background: '#fff',
    fog: '#fff'
  },
  node: {
    fill: '#7CA0AB',
    activeFill: '#1DE9AC',
    opacity: 1,
    selectedOpacity: 1,
    inactiveOpacity: 0.2,
    label: {
      color: '#2A6475',
      stroke: '#fff',
      activeColor: '#1DE9AC'
    }
  },
  menu: {
    background: '#fff',
    border: '#AACBD2',
    color: '#000',
    activeBackground: '#D8E6EA',
    activeColor: '#000'
  },
  ring: {
    fill: '#D8E6EA',
    activeFill: '#1DE9AC'
  },
  edge: {
    fill: '#D8E6EA',
    activeFill: '#1DE9AC',
    opacity: 1,
    selectedOpacity: 0.1,
    opacityOnlySelected: 1,
    label: {
      stroke: '#fff',
      color: '#2A6475',
      activeColor: '#1DE9AC'
    }
  },
  arrow: {
    fill: '#D8E6EA',
    activeFill: '#1DE9AC'
  }
};

export const darkTheme: Theme = {
  canvas: {
    background: '#1E2026',
    fog: '#1E2026'
  },
  node: {
    fill: '#7A8C9E',
    activeFill: '#1DE9AC',
    opacity: 1,
    selectedOpacity: 1,
    inactiveOpacity: 0.2,
    label: {
      stroke: '#1E2026',
      color: '#ACBAC7',
      activeColor: '#1DE9AC'
    }
  },
  menu: {
    background: '#54616D',
    border: '#7A8C9E',
    color: '#fff',
    activeBackground: '#1DE9AC',
    activeColor: '#000'
  },
  ring: {
    fill: '#54616D',
    activeFill: '#1DE9AC'
  },
  edge: {
    fill: '#474B56',
    activeFill: '#1DE9AC',
    opacity: 1,
    selectedOpacity: 0.1,
    opacityOnlySelected: 1,
    label: {
      stroke: '#1E2026',
      color: '#ACBAC7',
      activeColor: '#1DE9AC'
    }
  },
  arrow: {
    fill: '#474B56',
    activeFill: '#1DE9AC'
  }
};
