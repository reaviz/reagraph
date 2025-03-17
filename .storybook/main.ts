import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    '../docs/**/*.mdx',
    '../docs/**/*.story.tsx'
  ],

  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-storysource',
    '@storybook/addon-mdx-gfm',
    '@chromatic-com/storybook'
  ],

  framework: {
    name: '@storybook/react-vite',
    options: {}
  },

  docs: {
    autodocs: true
  },

  typescript: {
    reactDocgen: 'react-docgen-typescript'
  }
};

export default config;
