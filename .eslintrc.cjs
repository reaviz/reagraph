module.exports = {
  'env': {
    'browser': true,
    'es2021': true
  },
  'extends': ["eslint:recommended", "plugin:react/recommended", "prettier", "plugin:react-hooks/recommended", "plugin:storybook/recommended"],
  'parser': '@typescript-eslint/parser',
  'parserOptions': {
    'ecmaFeatures': {
      'jsx': true
    },
    'ecmaVersion': 12,
    'sourceType': 'module'
  },
  'settings': {
    'react': {
      'version': 'detect'
    }
  },
  'plugins': ['react', '@typescript-eslint'],
  'rules': {
    'no-prototype-builtins': 'off',
    'no-unused-vars': [0],
    'indent': ['error', 2],
    'arrow-parens': ['error', 'as-needed'],
    'react/display-name': [0],
    'react/prop-types': [0],
    'react/no-children-prop': [0],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'react/no-unknown-property': [0]
  }
};
