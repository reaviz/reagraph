import{j as e}from"./jsx-runtime-DRTy3Uxn.js";import{M as s,b as i}from"./index-BxDAS6aZ.js";import"./RadialMenu-BZb6EL-Y.js";import"./index-BBkUAzwr.js";import{useMDXComponents as o}from"./index-DzJSSmSq.js";import"./iframe-NADS3VYa.js";import"../sb-preview/runtime.js";import"./chunk-EIRT5I3Z-DXochb4c.js";import"./index-PqR-_bA4.js";import"./extends-CCbyfPlC.js";import"./index-C7vVqNWd.js";import"./index-DrFu-skq.js";import"./index-27578f8f.esm-CAmGDcI7.js";import"./client-CzthVdz-.js";function r(t){const n=Object.assign({h1:"h1",p:"p",a:"a",h2:"h2",code:"code",pre:"pre"},o(),t.components);return e.jsxs(e.Fragment,{children:[e.jsx(s,{title:"Docs/Advanced/Clustering"}),`
`,e.jsx(n.h1,{id:"clustering",children:"Clustering"}),`
`,e.jsx(n.p,{children:`reagraph supports the ability to cluster nodes in a graph. This is useful for visualizing large graphs
where the number of nodes is too large to display on the screen at once.`}),`
`,e.jsxs(n.p,{children:[`Clustering is only available on the force directed layout and under the hood
uses `,e.jsx(n.a,{href:"https://github.com/vasturiano/d3-force-cluster-3d",target:"_blank",rel:"nofollow noopener noreferrer",children:"d3-force-cluster-3d"}),"."]}),`
`,e.jsx(n.h2,{id:"useage",children:"Useage"}),`
`,e.jsxs(n.p,{children:["In order to cluster nodes, you must provide a ",e.jsx(n.code,{children:"clusterAttribute"})," property on the ",e.jsx(n.code,{children:"GraphCanvas"})," component. For example:"]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`const nodes = [
  { id: '1', label: 'Tesla', data: { category: 'EV' }},
  { id: '2', label: 'C8', data: { category: 'ICE' }}
];

const App = () => (
  <GraphCanvas
    nodes={nodes}
    edges={[]}
    clusterAttribute="category"
  />
)
`})}),`
`,e.jsx(n.p,{children:`Below you can see an example of the clustered graph where each node is color
coded to better show the clustering.`}),`
`,e.jsx("div",{style:{height:400,width:"100%",position:"relative",margin:"0 auto",background:"white",borderRadius:4,border:"1px solid rgba(0,0,0,.1)",boxShadow:"rgb(0 0 0 / 10%) 0 1px 3px 0",overflow:"hidden"},children:e.jsx(i,{id:"demos-cluster--simple"})}),`
`,e.jsx(n.h2,{id:"styling",children:"Styling"}),`
`,e.jsxs(n.p,{children:[`You can change the style of the clustering ( or turn it off completely ) by setting
the `,e.jsx(n.code,{children:"Theme"})," properties. For example:"]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`import { Theme } from 'reagraph';

export const darkTheme: Theme = {
  // ...Rest of your theme...
  cluster: {

    // Pass \`null\` to hide the stroke
    stroke: '#474B56',

    // Pass \`null\` to hide the labels
    label: {
      stroke: '#1E2026',
      color: '#ACBAC7'
    }
  }
};
`})})]})}function C(t={}){const{wrapper:n}=Object.assign({},o(),t.components);return n?e.jsx(n,Object.assign({},t,{children:e.jsx(r,t)})):r(t)}export{C as default};
