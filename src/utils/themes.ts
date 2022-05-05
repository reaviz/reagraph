export interface Theme {
  canvas: {
    background: string;
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
    background: '#fff',
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
    activeColor: '#1DE9AC'
  },
  arrow: {
    fill: '#D8E6EA',
    activeFill: '#1DE9AC'
  }
};

export const darkTheme: Theme = {
  canvas: {
    background: '#1C252D',
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
    activeColor: '#1DE9AC'
  },
  arrow: {
    fill: '#54616D',
    activeFill: '#1DE9AC'
  }
};
