export interface Theme {
  backgroundColor: string;
  node: {
    fill: string;
    color: string;
  };
  edge: {
    fill: string;
    color: string;
  };
  arrow: {
    fill: string;
  };
}

export const lightTheme: Theme = {
  backgroundColor: '#fff',
  node: {
    fill: '#AACBD2',
    color: '#2A6475'
  },
  edge: {
    fill: '#D8E6EA',
    color: '#2A6475'
  },
  arrow: {
    fill: '#D8E6EA'
  }
};

export const darkTheme: Theme = {
  backgroundColor: '#1C252D',
  node: {
    fill: '#7A8C9E',
    color: '#ACBAC7'
  },
  edge: {
    fill: '#54616D',
    color: '#ACBAC7'
  },
  arrow: {
    fill: '#54616D'
  }
};
