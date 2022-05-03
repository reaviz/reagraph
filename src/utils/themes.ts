export interface Theme {
  backgroundColor: string;
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
}

export const lightTheme: Theme = {
  backgroundColor: '#fff',
  node: {
    fill: '#AACBD2',
    color: '#2A6475',
    activeFill: '#1DE9AC',
    activeColor: '#1DE9AC'
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
  backgroundColor: '#1C252D',
  node: {
    fill: '#7A8C9E',
    color: '#ACBAC7',
    activeFill: '#1DE9AC',
    activeColor: '#1DE9AC'
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
