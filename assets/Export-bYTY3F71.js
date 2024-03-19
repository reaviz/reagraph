import{j as e}from"./jsx-runtime-DRTy3Uxn.js";import{M as a}from"./index-BxDAS6aZ.js";import{useMDXComponents as o}from"./index-DzJSSmSq.js";import"./index-BBkUAzwr.js";import"./iframe-NADS3VYa.js";import"../sb-preview/runtime.js";import"./chunk-EIRT5I3Z-DXochb4c.js";import"./index-PqR-_bA4.js";import"./extends-CCbyfPlC.js";import"./index-C7vVqNWd.js";import"./index-DrFu-skq.js";function r(t){const n=Object.assign({h1:"h1",p:"p",code:"code",pre:"pre"},o(),t.components);return e.jsxs(e.Fragment,{children:[e.jsx(a,{title:"Docs/Advanced/Export Image"}),`
`,e.jsx(n.h1,{id:"export-as-image",children:"Export as Image"}),`
`,e.jsxs(n.p,{children:["reagraph allows for exporting the graph as an image. This can be done by calling the ",e.jsx(n.code,{children:"exportCanvas"}),`
method on the graph instance. The method returns a string that resolves to the image data URL.`]}),`
`,e.jsxs(n.p,{children:["Below is an example of how to use the ",e.jsx(n.code,{children:"exportCanvas"})," method to export the graph as an image."]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`export const MApp = () => {
  const ref = useRef<GraphCanvasRef | null>(null);
  return (
    <>
      <button
        onClick={() => {
          const data = ref.current.exportCanvas();

          const link = document.createElement('a');
          link.setAttribute('href', data);
          link.setAttribute('target', '_blank');
          link.setAttribute('download', 'graph.png');
          link.click();
        }}
      >
        Export Graph
      </button>
      <GraphCanvas ref={ref} nodes={simpleNodes} edges={simpleEdges} />
    </>
  );
};
`})})]})}function j(t={}){const{wrapper:n}=Object.assign({},o(),t.components);return n?e.jsx(n,Object.assign({},t,{children:e.jsx(r,t)})):r(t)}export{j as default};
