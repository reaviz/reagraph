import{j as e}from"./jsx-runtime-DRTy3Uxn.js";import{M as i,b as r}from"./index-BxDAS6aZ.js";import{useMDXComponents as o}from"./index-DzJSSmSq.js";import"./index-BBkUAzwr.js";import"./iframe-NADS3VYa.js";import"../sb-preview/runtime.js";import"./chunk-EIRT5I3Z-DXochb4c.js";import"./index-PqR-_bA4.js";import"./extends-CCbyfPlC.js";import"./index-C7vVqNWd.js";import"./index-DrFu-skq.js";function t(n){const s=Object.assign({h1:"h1",p:"p",code:"code",h2:"h2",pre:"pre"},o(),n.components);return e.jsxs(e.Fragment,{children:[e.jsx(i,{title:"Docs/Advanced/Custom Scenes"}),`
`,e.jsx(s.h1,{id:"custom-scenes",children:"Custom Scenes"}),`
`,e.jsxs(s.p,{children:["You can customize the ThreeJS scene by passing props to the ",e.jsx(s.code,{children:"Canvas"}),` component.
This is useful if you want to add custom lighting, shadows, or other effects.`]}),`
`,e.jsx(s.h2,{id:"usage",children:"Usage"}),`
`,e.jsx(s.p,{children:`The example below shows how to add custom lighting to the scene which
gives it a nice 3d effect.`}),`
`,e.jsx(s.pre,{children:e.jsx(s.code,{className:"language-tsx",children:`<GraphCanvas
  nodes={simpleNodes}
  edges={simpleEdges}
  layoutType="forceDirected3d"
>
  <directionalLight position={[0, 5, -4]} intensity={1} />
</GraphCanvas>
`})}),`
`,e.jsx(s.p,{children:"The edge result will look something like:"}),`
`,e.jsx("div",{style:{height:400,width:"100%",position:"relative",margin:"0 auto",background:"white",borderRadius:4,border:"1px solid rgba(0,0,0,.1)",boxShadow:"rgb(0 0 0 / 10%) 0 1px 3px 0",overflow:"hidden"},children:e.jsx(r,{id:"demos-basic--custom-lighting"})})]})}function f(n={}){const{wrapper:s}=Object.assign({},o(),n.components);return s?e.jsx(s,Object.assign({},n,{children:e.jsx(t,n)})):t(n)}export{f as default};
