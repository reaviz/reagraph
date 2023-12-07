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
    inactiveOpacity: 0.2,
    label: {
      stroke: '#1E2026',
      color: '#ACBAC7',
      activeColor: '#1DE9AC'
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
    fill: '#474B56',
    activeFill: '#1DE9AC',
    opacity: 1,
    selectedOpacity: 1,
    inactiveOpacity: 0.1,
    label: {
      stroke: '#1E2026',
      color: '#ACBAC7',
      activeColor: '#1DE9AC',
      fontSize: 6
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
      stroke: '#1E2026',
      color: '#ACBAC7'
    }
  }
};
