import{j as e}from"./jsx-runtime-DRTy3Uxn.js";import{M as s,b as r}from"./index-BxDAS6aZ.js";import"./RadialMenu-BZb6EL-Y.js";import"./index-BBkUAzwr.js";import{useMDXComponents as o}from"./index-DzJSSmSq.js";import"./iframe-NADS3VYa.js";import"../sb-preview/runtime.js";import"./chunk-EIRT5I3Z-DXochb4c.js";import"./index-PqR-_bA4.js";import"./extends-CCbyfPlC.js";import"./index-C7vVqNWd.js";import"./index-DrFu-skq.js";import"./index-27578f8f.esm-CAmGDcI7.js";import"./client-CzthVdz-.js";function n(i){const t=Object.assign({h1:"h1",p:"p",ul:"ul",li:"li",h3:"h3",a:"a"},o(),i.components);return e.jsxs(e.Fragment,{children:[e.jsx(s,{title:"Docs/Advanced/Sizing"}),`
`,e.jsx(t.h1,{id:"sizing",children:"Sizing"}),`
`,e.jsx(t.p,{children:`reagraph supports the ability to dynamically size nodes. It supports
the following sizing strategies out of the box:`}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"Page Rank"}),`
`,e.jsx(t.li,{children:"Centrality"}),`
`,e.jsx(t.li,{children:"Attribute"}),`
`]}),`
`,e.jsx(t.h3,{id:"page-rank",children:"Page Rank"}),`
`,e.jsxs(t.p,{children:[`The Page Rank sizing strategy sizes nodes based on the page rank of the node. Under the hood,
it uses `,e.jsx(t.a,{href:"https://graphology.github.io/standard-library/metrics.html#pagerank",target:"_blank",rel:"nofollow noopener noreferrer",children:"Graphology Metrics"}),` to
calculate the rank.`]}),`
`,e.jsx("div",{style:{height:500,width:"100%",position:"relative",margin:"0 auto",background:"white",borderRadius:4,border:"1px solid rgba(0,0,0,.1)",boxShadow:"rgb(0 0 0 / 10%) 0 1px 3px 0",overflow:"hidden"},children:e.jsx(r,{id:"demos-sizing--page-rank"})}),`
`,e.jsx(t.h3,{id:"centrality",children:"Centrality"}),`
`,e.jsxs(t.p,{children:[`The Degree Centrality sizing strategy sizes nodes based on the degree of centrality of the node. Under the hood,
it uses `,e.jsx(t.a,{href:"https://graphology.github.io/standard-library/metrics.html#degree-centrality",target:"_blank",rel:"nofollow noopener noreferrer",children:"Graphology Metrics"}),` to
calculate the rank.`]}),`
`,e.jsx("div",{style:{height:500,width:"100%",position:"relative",margin:"0 auto",background:"white",borderRadius:4,border:"1px solid rgba(0,0,0,.1)",boxShadow:"rgb(0 0 0 / 10%) 0 1px 3px 0",overflow:"hidden"},children:e.jsx(r,{id:"demos-sizing--centrality"})}),`
`,e.jsx(t.h3,{id:"attribute",children:"Attribute"}),`
`,e.jsx(t.p,{children:"The attribute sizing strategy sizes nodes based on the value of a given attribute."}),`
`,e.jsx("div",{style:{height:500,width:"100%",position:"relative",margin:"0 auto",background:"white",borderRadius:4,border:"1px solid rgba(0,0,0,.1)",boxShadow:"rgb(0 0 0 / 10%) 0 1px 3px 0",overflow:"hidden"},children:e.jsx(r,{id:"demos-sizing--attribute"})})]})}function w(i={}){const{wrapper:t}=Object.assign({},o(),i.components);return t?e.jsx(t,Object.assign({},i,{children:e.jsx(n,i)})):n(i)}export{w as default};
