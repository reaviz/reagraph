import { Color } from 'three';

export interface Theme {
  canvas: {
    background: string | Color;
    fog: string;
  };
  node: {
    fill: string;
    color: string;
    activeFill: string;
    activeColor: string;
  };
  ring: {
    fill: string;
    activeFill: string;
  };
  edge: {
    fill: string;
    color: string;
    activeFill: string;
    activeColor: string;
    label?: {
      outlineColor?: Color;
    };
  };
  arrow: {
    fill: string;
    activeFill: string;
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
    background: new Color(255, 255, 255),
    fog: '#FFFFFF'
  },
  node: {
    fill: '#AACBD2',
    color: '#2A6475',
    activeFill: '#1DE9AC',
    activeColor: '#1DE9AC'
  },
  menu: {
    background: '#FFF',
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
    color: '#2A6475',
    activeFill: '#1DE9AC',
    activeColor: '#1DE9AC',
    label: {
      outlineColor: new Color(255, 255, 255)
    }
  },
  arrow: {
    fill: '#D8E6EA',
    activeFill: '#1DE9AC'
  }
};

export const darkTheme: Theme = {
  canvas: {
    background: new Color(0, 0, 0),
    fog: '#000000'
  },
  node: {
    fill: '#7A8C9E',
    color: '#ACBAC7',
    activeFill: '#1DE9AC',
    activeColor: '#1DE9AC'
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
    fill: '#54616D',
    color: '#ACBAC7',
    activeFill: '#1DE9AC',
    activeColor: '#1DE9AC',
    label: {
      outlineColor: new Color(0, 0, 0)
    }
  },
  arrow: {
    fill: '#54616D',
    activeFill: '#1DE9AC'
  }
};
