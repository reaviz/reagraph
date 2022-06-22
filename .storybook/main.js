module.exports = {
  stories: ['../docs/**/*.story.mdx', '../docs/**/*.story.tsx'],
  addons: [
    'storybook-css-modules-preset',
    '@storybook/addon-storysource',
    '@storybook/addon-docs',
    '@storybook/addon-essentials'
  ],
  webpackFinal: async (config, { configType }) => {
    config.module.rules.push({
      type: 'javascript/auto',
      test: /\.mjs$/,
      include: /node_modules/
    });

    return config;
  }
};
