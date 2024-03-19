import{j as e}from"./jsx-runtime-DRTy3Uxn.js";import{M as r}from"./index-BxDAS6aZ.js";import{useMDXComponents as s}from"./index-DzJSSmSq.js";import"./index-BBkUAzwr.js";import"./iframe-NADS3VYa.js";import"../sb-preview/runtime.js";import"./chunk-EIRT5I3Z-DXochb4c.js";import"./index-PqR-_bA4.js";import"./extends-CCbyfPlC.js";import"./index-C7vVqNWd.js";import"./index-DrFu-skq.js";function t(o){const n=Object.assign({h1:"h1",p:"p",a:"a",h3:"h3",pre:"pre",code:"code"},s(),o.components);return e.jsxs(e.Fragment,{children:[e.jsx(r,{title:"Docs/Advanced/Hotkeys"}),`
`,e.jsx(n.h1,{id:"hotkeys",children:"Hotkeys"}),`
`,e.jsxs(n.p,{children:["Under the hood the library uses ",e.jsx(n.a,{href:"https://github.com/reaviz/reakeys",target:"_blank",rel:"nofollow noopener noreferrer",children:"reakeys"}),` for
binding hotkeys.`]}),`
`,e.jsx(n.h3,{id:"camera-controls",children:"Camera Controls"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-ts",children:`{
  name: 'Zoom In',
  keys: 'command+shift+i'
},
{
  name: 'Zoom Out',
  keys: 'command+shift+o'
},
{
  name: 'Center',
  keys: ['command+shift+c']
}
`})}),`
`,e.jsx(n.h3,{id:"selection",children:"Selection"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-ts",children:`{
  name: 'Select All',
  keys: 'mod+a',
},
{
  name: 'Deselect Selections',
  keys: 'escape'
}
`})})]})}function u(o={}){const{wrapper:n}=Object.assign({},s(),o.components);return n?e.jsx(n,Object.assign({},o,{children:e.jsx(t,o)})):t(o)}export{u as default};
