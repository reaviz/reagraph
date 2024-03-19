import{j as e}from"./jsx-runtime-DRTy3Uxn.js";import{M as i}from"./index-BxDAS6aZ.js";import{useMDXComponents as r}from"./index-DzJSSmSq.js";import"./index-BBkUAzwr.js";import"./iframe-NADS3VYa.js";import"../sb-preview/runtime.js";import"./chunk-EIRT5I3Z-DXochb4c.js";import"./index-PqR-_bA4.js";import"./extends-CCbyfPlC.js";import"./index-C7vVqNWd.js";import"./index-DrFu-skq.js";function t(o){const n=Object.assign({h1:"h1",p:"p",code:"code",pre:"pre"},r(),o.components);return e.jsxs(e.Fragment,{children:[e.jsx(i,{title:"Docs/Getting Started/Theme"}),`
`,e.jsx(n.h1,{id:"theme",children:"Theme"}),`
`,e.jsxs(n.p,{children:[`By default, the graph supports 2 themes: light and dark mode. You can
also define your own theme using the `,e.jsx(n.code,{children:"theme"})," interface."]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-ts",children:`export type ThemeColor = number | string;

export interface Theme {
  canvas: {
    background: ThemeColor;
    fog: ThemeColor;
  };
  node: {
    fill: ThemeColor;
    activeFill: ThemeColor;
    opacity: number;
    selectedOpacity: number;
    inactiveOpacity: number;
    label: {
      color: ThemeColor;
      stroke: ThemeColor;
      activeColor: ThemeColor;
    };
    subLabel?: {
      color: ColorRepresentation;
      stroke?: ColorRepresentation;
      activeColor: ColorRepresentation;
    };
  };
  ring: {
    fill: ThemeColor;
    activeFill: ThemeColor;
  };
  edge: {
    fill: ThemeColor;
    activeFill: ThemeColor;
    opacity: number;
    selectedOpacity: number;
    inactiveOpacity: number;
    label: {
      color: ThemeColor;
      stroke: ThemeColor;
      activeColor: ThemeColor;
      fontSize: number;
    }
  };
  arrow: {
    fill: ThemeColor;
    activeFill: ThemeColor;
  };
  lasso: {
    background: string;
    border: string;
  };
  cluster?: {
    stroke?: ColorRepresentation;
    fill?: ColorRepresentation;
    opacity?: number;
    selectedOpacity?: number;
    inactiveOpacity?: number;
    label?: {
      stroke?: ColorRepresentation;
      color: ColorRepresentation;
    };
  };
}
`})}),`
`,e.jsxs(n.p,{children:["which you can pass to the ",e.jsx(n.code,{children:"GraphCanvas"})," component like:"]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`<GraphCanvas
  theme={myTheme}
/>
`})}),`
`,e.jsx(n.p,{children:"you can extend the existing themes by importing them and then overriding them like:"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`import { GraphCanvas, lightTheme } from 'reagraph';

const myTheme = {
  ...lightTheme,
  node: {
    ...lightTheme.node,
    color: '#000'
  }
};

const App = () => (
  <GraphCanvas
    theme={myTheme}
  />
);
`})}),`
`,e.jsx(n.p,{children:"An example theme ( the light theme in this case ) ends up looking like this:"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-ts",children:`import { Theme } from 'reagraph';

export const lightTheme: Theme = {
  canvas: {
    background: '#fff',
    fog: '#fff'
  },
  node: {
    fill: '#7CA0AB',
    activeFill: '#1DE9AC',
    opacity: 1,
    selectedOpacity: 1,
    inactiveOpacity: 0.2,
    label: {
      color: '#2A6475',
      stroke: '#fff',
      activeColor: '#1DE9AC'
    }
    subLabel: {
      color: '#2A6475',
      stroke: '#eee',
      activeColor: '#1DE9AC'
    }
  },
  lasso: {
    border: '1px solid #55aaff',
    background: 'rgba(75, 160, 255, 0.1)'
  },
  ring: {
    fill: '#D8E6EA',
    activeFill: '#1DE9AC'
  },
  edge: {
    fill: '#D8E6EA',
    activeFill: '#1DE9AC',
    opacity: 1,
    selectedOpacity: 1,
    inactiveOpacity: 0.1,
    label: {
      stroke: '#fff',
      color: '#2A6475',
      activeColor: '#1DE9AC'
    }
  },
  arrow: {
    fill: '#D8E6EA',
    activeFill: '#1DE9AC'
  },
  cluster: {
    stroke: '#D8E6EA',
    opacity: 1,
    selectedOpacity: 1,
    inactiveOpacity: 0.1,
    label: {
      stroke: '#fff',
      color: '#2A6475'
    }
  }
};
`})}),`
`,e.jsx(n.p,{children:"Note that opacity fields are numbers between 0 and 1."})]})}function u(o={}){const{wrapper:n}=Object.assign({},r(),o.components);return n?e.jsx(n,Object.assign({},o,{children:e.jsx(t,o)})):t(o)}export{u as default};
