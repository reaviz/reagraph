import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../stories/**/*.story.tsx'],

  addons: ['@storybook/addon-docs'],

  framework: {
    name: '@storybook/react-vite',
    options: {}
  },

  typescript: {
    reactDocgen: 'react-docgen-typescript'
  },

  core: {
    disableTelemetry: true // XXX: wanted?
  }
};

export default config;
