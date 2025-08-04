import { Stats } from '@react-three/drei';
import theme from './theme';
import { Preview } from '@storybook/react-vite';
import React from 'react';

const withProvider = (Story, context) => (
  <>
    <Story {...context} />
    <Stats className="stats" />
  </>
);

const preview: Preview = {
  decorators: [withProvider],
  parameters: {
    layout: 'centered',
    controls: { hideNoControlsWarning: true },
    actions: { argTypesRegex: '^on[A-Z].*' },
    docs: {
      theme,
      codePanel: true
    },
    options: {
      storySort: {
        order: [
          'Docs',
          [
            'Intro',
            'Getting Started',
            ['Installing'],
            'API',
            'Advanced',
            'Support'
          ],
          '*'
        ]
      }
    }
  }
};

export default preview;
