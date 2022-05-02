import { Fragment } from 'react';
import { Stats } from '@react-three/drei';
import theme from './theme';

const order = [
  'docs-',
  'demos-'
];

const withProvider = (Story, context) => (
  <Fragment>
    <Story {...context} />
    <Stats className='stats' />
  </Fragment>
);

export const decorators = [withProvider];

export const parameters = {
  layout: 'centered',
  darkMode: {
    stylePreview: true,
    darkClass: 'dark',
    lightClass: 'light'
  },
  actions: { argTypesRegex: '^on.*' },
  options: {
    storySort: (a, b) => {
      const aName = a[0];
      const bName = b[0];

      if (aName.includes('docs-') || bName.includes('docs-')) {
        const aIdx = order.findIndex(i => aName.indexOf(i) > -1);
        const bIdx = order.findIndex(i => bName.indexOf(i) > -1);
        return aIdx - bIdx;
      }

      return aName < bName ? -1 : 1;
    }
  },
  docs: {
    theme
  }
};
