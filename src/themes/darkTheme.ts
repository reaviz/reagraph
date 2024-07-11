import { Theme } from './theme';

export const darkTheme: Theme = {
  canvas: {
    background: '#1E2026'
  },
  node: {
    fill: '#7A8C9E',
    activeFill: '#1DE9AC',
    opacity: 1,
    selectedOpacity: 1,
    inactiveOpacity: 0.1,
    label: {
      color: '#202020',
      activeColor: '#000000',
      fontSize: 6,
      maxWidth: 100,
      ellipsis: 100,
      backgroundColor: '#fafafa',
      borderRadius: 2
    },
    subLabel: {
      stroke: '#1E2026',
      color: '#ACBAC7',
      activeColor: '#1DE9AC'
    }
  },
  lasso: {
    border: '1px solid #55aaff',
    background: 'rgba(75, 160, 255, 0.1)'
  },
  ring: {
    fill: '#54616D',
    activeFill: '#1DE9AC'
  },
  edge: {
    fill: '#ffffff',
    activeFill: '#1DE9AC',
    opacity: 1,
    selectedOpacity: 1,
    inactiveOpacity: 0.1,
    label: {
      color: '#202020',
      activeColor: '#000000',
      fontSize: 4,
      maxWidth: 100,
      ellipsis: 100,
      backgroundColor: '#fafafa',
      borderRadius: 2
    }
  },
  arrow: {
    fill: '#474B56',
    activeFill: '#1DE9AC'
  },
  cluster: {
    stroke: '#474B56',
    opacity: 1,
    selectedOpacity: 1,
    inactiveOpacity: 0.1,
    label: {
      color: '#202020',
      activeColor: '#000000',
      fontSize: 4,
      maxWidth: 100,
      ellipsis: 100,
      backgroundColor: '#fafafa',
      borderRadius: 2
    }
  }
};
