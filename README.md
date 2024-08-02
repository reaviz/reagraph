<div align="center">
  <img width="650" src="docs/assets/logo-light.png">
  <br />
  <br />
  WebGL Network Graphs for React
  <br /><br />
  <a href="https://github.com/reaviz/reagraph/workflows/build/" target="_blank">
    <img src="https://github.com/reaviz/reagraph/workflows/build/badge.svg?branch=master" />
  </a>
  <a href="https://npm.im/reagraph" target="_blank">
    <img src="https://img.shields.io/npm/v/reagraph.svg" />
  </a>
  <a href="https://npm.im/reagraph" target="_blank">
    <img src="https://badgen.net/npm/dw/reagraph" />
  </a>
  <a href="https://github.com/reaviz/reagraph/blob/master/LICENSE" target="_blank">
    <img src="https://badgen.now.sh/badge/license/apache2" />
  </a>
  <a href="https://discord.gg/tt8wGExq35" target="_blank">
    <img src="https://img.shields.io/discord/773948315037073409?label=discord">
  </a>
  <a href="https://opencollective.com/reaviz" target="_blank">
    <img alt="Open Collective backers and sponsors" src="https://img.shields.io/opencollective/all/reaviz?label=backers">
  </a>
</div>

---

Reagraph is a high-performance network graph visualization built in WebGL for React.

## 🚀 Quick Links

- Checkout the [**docs and demos**](https://reagraph.dev)
- Checkout a basic demo on [CodeSandbox](https://codesandbox.io/s/reagraph-example-mwh96q)
- Learn about updates from the [changelog](CHANGELOG.md)

## 💎 Other Projects

- [Reaflow](https://reaflow.dev?utm=reagraph) - Open-source library for workflow and diagram graphs.
- [Reablocks](https://reablocks.dev?utm=reagraph) - Open-source component library for React based on Tailwind.
- [Reaviz](https://reaviz.dev?utm=reagraph) - Open-source library for data visualizations for React. 
- [Reachat](https://reachat.dev?utm=reagraph) - Open-source library for building LLM/Chat UIs for React.

## ✨ Features
- WebGL based for high performance
- Node Sizing based on attribute, page rank, centrality, custom
- Light and Dark Mode with custom theme ability
- Path finding between nodes
- Radial Context Menu
- Highlight and Selection Hook
- Dragging Nodes
- Lasso Selection
- Expand/Collapse Nodes
- Customizable Nodes
- Advanced Label Placement
- Edge Interpolation
- Clustering

with the following built in layouts:

- Force Directed 2D
- Force Directed 3D
- Circular 2D
- Tree Top Down 2D
- Tree Left Right 2D
- Tree Top Down 3D
- Tree Left Right 3D
- Radial Out 2D
- Radial Out 3D
- Hierarchical Top Down 2D
- Hierarchical Left Right 2D
- No Overlap 2D
- Force Atlas 2 2D

## 📦 Usage

Install the package via **NPM**:

```
npm i reagraph --save
```

Install the package via **Yarn**:

```
yarn add reagraph
```

Import the component into your app and add some nodes and edges:

```tsx
import React from 'react';
import { GraphCanvas } from 'reagraph';

export default () => (
  <GraphCanvas
    nodes={[
      {
        id: 'n-1',
        label: '1'
      },
      {
        id: 'n-2',
        label: '2'
      }
    ]}
    edges={[
      {
        id: '1->2',
        source: 'n-1',
        target: 'n-2',
        label: 'Edge 1-2'
      }
    ]}
  />
);
```

Checkout an example on [CodeSandbox](https://codesandbox.io/s/reagraph-example-mwh96q).

## 🔭 Development

If you want to run reagraph locally, its super easy!

- Clone the repo
- `npm i`
- `npm start`
- Browser opens to Storybook page

## ❤️ Contributors

Thanks to all our contributors!

<a href="https://github.com/reaviz/reaviz/graphs/contributors"><img src="https://opencollective.com/reaviz/contributors.svg?width=890" /></a>
