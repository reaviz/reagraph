import{j as C}from"./jsx-runtime-DRTy3Uxn.js";import{r as N}from"./index-BBkUAzwr.js";import{G as d}from"./RadialMenu-BZb6EL-Y.js";import{u as m}from"./useSelection-BNSyQBma.js";import{c as o,d as n}from"./demo-NS5ySwyj.js";import"./index-27578f8f.esm-CAmGDcI7.js";import"./extends-CCbyfPlC.js";import"./client-CzthVdz-.js";import"./index-PqR-_bA4.js";const q={title:"Demos/Highlight/Hover",component:d},l=()=>{const e=N.useRef(null),{selections:s,onNodeClick:r,onCanvasClick:t,onNodePointerOver:a,onNodePointerOut:c}=m({ref:e,nodes:o,edges:n,pathHoverType:"direct"});return C.jsx(d,{ref:e,nodes:o,edges:n,selections:s,onNodePointerOver:a,onNodePointerOut:c,onNodeClick:r,onCanvasClick:t})},p=()=>{const e=N.useRef(null),{selections:s,actives:r,onNodeClick:t,onCanvasClick:a,onNodePointerOver:c,onNodePointerOut:i}=m({ref:e,nodes:o,edges:n,pathHoverType:"in"});return C.jsx(d,{ref:e,nodes:o,edges:n,selections:s,actives:r,onNodePointerOver:c,onNodePointerOut:i,onCanvasClick:a,onNodeClick:t})},u=()=>{const e=N.useRef(null),{selections:s,actives:r,onNodeClick:t,onCanvasClick:a,onNodePointerOver:c,onNodePointerOut:i}=m({ref:e,nodes:o,edges:n,pathHoverType:"out"});return C.jsx(d,{ref:e,nodes:o,edges:n,selections:s,actives:r,onNodePointerOver:c,onNodePointerOut:i,onCanvasClick:a,onNodeClick:t})},v=()=>{const e=N.useRef(null),{selections:s,actives:r,onNodeClick:t,onCanvasClick:a,onNodePointerOver:c,onNodePointerOut:i}=m({ref:e,nodes:o,edges:n,pathHoverType:"all"});return C.jsx(d,{ref:e,nodes:o,edges:n,selections:s,actives:r,onNodePointerOver:c,onNodePointerOut:i,onCanvasClick:a,onNodeClick:t})};var f,g,h;l.parameters={...l.parameters,docs:{...(f=l.parameters)==null?void 0:f.docs,source:{originalSource:`() => {
  const graphRef = useRef<GraphCanvasRef | null>(null);
  const {
    selections,
    onNodeClick,
    onCanvasClick,
    onNodePointerOver,
    onNodePointerOut
  } = useSelection({
    ref: graphRef,
    nodes: complexNodes,
    edges: complexEdges,
    pathHoverType: 'direct'
  });
  return <GraphCanvas ref={graphRef} nodes={complexNodes} edges={complexEdges} selections={selections} onNodePointerOver={onNodePointerOver} onNodePointerOut={onNodePointerOut} onNodeClick={onNodeClick} onCanvasClick={onCanvasClick} />;
}`,...(h=(g=l.parameters)==null?void 0:g.docs)==null?void 0:h.source}}};var O,k,P;p.parameters={...p.parameters,docs:{...(O=p.parameters)==null?void 0:O.docs,source:{originalSource:`() => {
  const graphRef = useRef<GraphCanvasRef | null>(null);
  const {
    selections,
    actives,
    onNodeClick,
    onCanvasClick,
    onNodePointerOver,
    onNodePointerOut
  } = useSelection({
    ref: graphRef,
    nodes: complexNodes,
    edges: complexEdges,
    pathHoverType: 'in'
  });
  return <GraphCanvas ref={graphRef} nodes={complexNodes} edges={complexEdges} selections={selections} actives={actives} onNodePointerOver={onNodePointerOver} onNodePointerOut={onNodePointerOut} onCanvasClick={onCanvasClick} onNodeClick={onNodeClick} />;
}`,...(P=(k=p.parameters)==null?void 0:k.docs)==null?void 0:P.source}}};var R,x,H;u.parameters={...u.parameters,docs:{...(R=u.parameters)==null?void 0:R.docs,source:{originalSource:`() => {
  const graphRef = useRef<GraphCanvasRef | null>(null);
  const {
    selections,
    actives,
    onNodeClick,
    onCanvasClick,
    onNodePointerOver,
    onNodePointerOut
  } = useSelection({
    ref: graphRef,
    nodes: complexNodes,
    edges: complexEdges,
    pathHoverType: 'out'
  });
  return <GraphCanvas ref={graphRef} nodes={complexNodes} edges={complexEdges} selections={selections} actives={actives} onNodePointerOver={onNodePointerOver} onNodePointerOut={onNodePointerOut} onCanvasClick={onCanvasClick} onNodeClick={onNodeClick} />;
}`,...(H=(x=u.parameters)==null?void 0:x.docs)==null?void 0:H.source}}};var E,y,G;v.parameters={...v.parameters,docs:{...(E=v.parameters)==null?void 0:E.docs,source:{originalSource:`() => {
  const graphRef = useRef<GraphCanvasRef | null>(null);
  const {
    selections,
    actives,
    onNodeClick,
    onCanvasClick,
    onNodePointerOver,
    onNodePointerOut
  } = useSelection({
    ref: graphRef,
    nodes: complexNodes,
    edges: complexEdges,
    pathHoverType: 'all'
  });
  return <GraphCanvas ref={graphRef} nodes={complexNodes} edges={complexEdges} selections={selections} actives={actives} onNodePointerOver={onNodePointerOver} onNodePointerOut={onNodePointerOut} onCanvasClick={onCanvasClick} onNodeClick={onNodeClick} />;
}`,...(G=(y=v.parameters)==null?void 0:y.docs)==null?void 0:G.source}}};export{v as All,l as Direct,p as Inwards,u as Outwards,q as default};
