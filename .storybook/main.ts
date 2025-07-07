import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    '../docs/**/*.story.tsx'
  ],

  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-storysource',
    '@storybook/addon-mdx-gfm'
  ],

  framework: {
    name: '@storybook/react-vite',
    options: {}
  },

  docs: {
    autodocs: 'tag'
  },

  typescript: {
    reactDocgen: 'react-docgen-typescript'
  }
};

export default config;
