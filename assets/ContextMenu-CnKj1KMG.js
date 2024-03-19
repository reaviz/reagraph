import{j as n}from"./jsx-runtime-DRTy3Uxn.js";import{M as s}from"./index-BxDAS6aZ.js";import{useMDXComponents as t}from"./index-DzJSSmSq.js";import"./index-BBkUAzwr.js";import"./iframe-NADS3VYa.js";import"../sb-preview/runtime.js";import"./chunk-EIRT5I3Z-DXochb4c.js";import"./index-PqR-_bA4.js";import"./extends-CCbyfPlC.js";import"./index-C7vVqNWd.js";import"./index-DrFu-skq.js";function a(o){const e=Object.assign({h1:"h1",p:"p",ul:"ul",li:"li",h2:"h2",code:"code",pre:"pre"},t(),o.components);return n.jsxs(n.Fragment,{children:[n.jsx(s,{title:"Docs/Advanced/Context Menu"}),`
`,n.jsx(e.h1,{id:"context-menu",children:"Context Menu"}),`
`,n.jsx(e.p,{children:`reagraph supports context menus on nodes and edges. Out of the box, reagraph
supports:`}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:"Radial Menu"}),`
`,n.jsx(e.li,{children:"Custom Menu"}),`
`]}),`
`,n.jsx(e.h2,{id:"radial-menu",children:"Radial Menu"}),`
`,n.jsxs(e.p,{children:["The setup the ",n.jsx(e.code,{children:"RadialMenu"}),` component, we need to setup the theme first. The
radial menu uses CSS variables to define colors. Here is an example
of how to define those colors:`]}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-css",children:`body {
  --radial-menu-background: #fff;
  --radial-menu-color: #000;
  --radial-menu-border: #AACBD2;
  --radial-menu-active-color: #000;
  --radial-menu-active-background: #D8E6EA;
}
`})}),`
`,n.jsxs(e.p,{children:["Once those are defined, we can use the ",n.jsx(e.code,{children:"contextMenu"}),` callback prop
to return a radial menu component. The callback provides the model (node/edge),
contextual information around a node's collapse state, and a callback to close the menu.`]}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-tsx",children:`import { GraphCanvas, RadialMenu } from 'reagraph';

export const MyApp = () => (
  <GraphCanvas
    nodes={nodes}
    edges={edges}
    contextMenu={({ data, additional, onClose }) => (
      <RadialMenu
        onClose={onClose}
        items={[
          {
            label: 'Add Node',
            onClick: () => {
              alert('Add a node');
              onClose();
            }
          },
          {
            label: 'Remove Node',
            onClick: () => {
              alert('Remove the node');
              onClose();
            }
          }
        ]}
      />
    )}
  />
);
`})}),`
`,n.jsx(e.h2,{id:"custom-menu",children:"Custom Menu"}),`
`,n.jsxs(e.p,{children:["The ",n.jsx(e.code,{children:"contextMenu"}),` callback prop can be used to return a custom menu. Below is
an example of how to setup a simple menu that displays the label of the node.`]}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-tsx",children:`import { GraphCanvas } from 'reagraph';

export const Node = () => (
  <GraphCanvas
    nodes={nodes}
    edges={edges}
    contextMenu={({ data, additional, onClose }) => (
      <div
        style={{
          background: 'white',
          width: 150,
          border: 'solid 1px blue',
          borderRadius: 2,
          padding: 5,
          textAlign: 'center'
        }}
      >
        <h1>{data.label}</h1>
        <button onClick={onClose}>Close Menu</button>
      </div>
    )}
  />
);
`})})]})}function g(o={}){const{wrapper:e}=Object.assign({},t(),o.components);return e?n.jsx(e,Object.assign({},o,{children:n.jsx(a,o)})):a(o)}export{g as default};
