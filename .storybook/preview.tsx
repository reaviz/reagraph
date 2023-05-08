import { Stats } from '@react-three/drei';
import theme from './theme';
import { Preview } from '@storybook/react';

const withProvider = (Story, context) => (
  <>
    <Story {...context} />
    <Stats className='stats' />
  </>
);

const preview: Preview = {
  decorators: [withProvider],
  parameters: {
    layout: 'centered',
    controls: { hideNoControlsWarning: true },
    actions: { argTypesRegex: '^on.*' },
    docs: {
      theme
    }
  }
};

export default preview;
