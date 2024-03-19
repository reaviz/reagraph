import{j as n}from"./jsx-runtime-DRTy3Uxn.js";import{M as d}from"./index-BxDAS6aZ.js";import"./RadialMenu-BZb6EL-Y.js";import"./index-BBkUAzwr.js";import{useMDXComponents as t}from"./index-DzJSSmSq.js";import"./iframe-NADS3VYa.js";import"../sb-preview/runtime.js";import"./chunk-EIRT5I3Z-DXochb4c.js";import"./index-PqR-_bA4.js";import"./extends-CCbyfPlC.js";import"./index-C7vVqNWd.js";import"./index-DrFu-skq.js";import"./index-27578f8f.esm-CAmGDcI7.js";import"./client-CzthVdz-.js";function o(s){const e=Object.assign({h1:"h1",p:"p",pre:"pre",code:"code"},t(),s.components);return n.jsxs(n.Fragment,{children:[n.jsx(d,{title:"Docs/Advanced/Collapse"}),`
`,n.jsx(e.h1,{id:"collapse",children:"Collapse"}),`
`,n.jsx(e.p,{children:`reagraph supports the ability to expand and collapse nodes and edges.
To collapse a node and its edges, simply pass a array of node ids to
the graph component like:`}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-jsx",children:`const App = () => {
  const nodes = [];
  const edges = [];

  // List of node ids
  const [collapsed, setCollapsed] = useState<string[]>([]);

  return (
    <GraphCanvas
      collapsedNodeIds={collapsed}
      nodes={nodes}
      edges={edges}
    />
  );
};
`})}),`
`,n.jsxs(e.p,{children:["For more complex scenarios, you expose a ",n.jsx(e.code,{children:"useCollapse"})," hook:"]}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-jsx",children:`
const App = () => {
  const nodes = [];
  const edges = [];
  const [collapsedNodeIds, setCollapsedNodeIds] = useState<string[]>([]);

  // Helper hook
  const { getExpandPathIds } = useCollapse({
    collapsedNodeIds,
    nodes,
    edges
  });

  function onExpandClick() {
    // Use the helper method to determine the ids to expand
    setCollapsedNodeIds(getExpandPathIds('some node id'))
  }

  return (
    <>
      <button onClick={onExpandClick}>
        Expand Node
      </button>
      <GraphCanvas
        collapsedNodeIds={collapsedNodeIds}
        nodes={nodes}
        edges={edges}
      />
    </>
  );
};
`})})]})}function f(s={}){const{wrapper:e}=Object.assign({},t(),s.components);return e?n.jsx(e,Object.assign({},s,{children:n.jsx(o,s)})):o(s)}export{f as default};
