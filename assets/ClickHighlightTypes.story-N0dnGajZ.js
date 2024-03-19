import{j as t}from"./jsx-runtime-DRTy3Uxn.js";import{r as i}from"./index-BBkUAzwr.js";import{G as r}from"./RadialMenu-BZb6EL-Y.js";import{u as d}from"./useSelection-BNSyQBma.js";import{c as s,d as n}from"./demo-NS5ySwyj.js";import"./index-27578f8f.esm-CAmGDcI7.js";import"./extends-CCbyfPlC.js";import"./client-CzthVdz-.js";import"./index-PqR-_bA4.js";const B={title:"Demos/Highlight/Click",component:r},p=()=>{const e=i.useRef(null),{selections:o,onNodeClick:c,onCanvasClick:a}=d({ref:e,nodes:s,edges:n});return t.jsx(r,{ref:e,nodes:s,edges:n,selections:o,onNodeClick:c,onCanvasClick:a})},C=()=>{const e=i.useRef(null),{selections:o,onNodeClick:c,onCanvasClick:a}=d({ref:e,nodes:s,edges:n,focusOnSelect:!1});return t.jsx(r,{ref:e,nodes:s,edges:n,selections:o,onCanvasClick:a,onNodeClick:c})},f=()=>{const e=i.useRef(null),{selections:o,actives:c,onNodeClick:a,onCanvasClick:l}=d({ref:e,nodes:s,edges:n,pathSelectionType:"in"});return t.jsx(r,{ref:e,nodes:s,edges:n,selections:o,actives:c,onCanvasClick:l,onNodeClick:a})},u=()=>{const e=i.useRef(null),{selections:o,actives:c,onNodeClick:a,onCanvasClick:l}=d({ref:e,nodes:s,edges:n,pathSelectionType:"out"});return t.jsx(r,{ref:e,nodes:s,edges:n,selections:o,actives:c,onCanvasClick:l,onNodeClick:a})},g=()=>{const e=i.useRef(null),{selections:o,actives:c,onNodeClick:a,onCanvasClick:l}=d({ref:e,nodes:s,edges:n,pathSelectionType:"all"});return t.jsx(r,{ref:e,nodes:s,edges:n,selections:o,actives:c,onCanvasClick:l,onNodeClick:a})};var m,v,k;p.parameters={...p.parameters,docs:{...(m=p.parameters)==null?void 0:m.docs,source:{originalSource:`() => {
  const graphRef = useRef<GraphCanvasRef | null>(null);
  const {
    selections,
    onNodeClick,
    onCanvasClick
  } = useSelection({
    ref: graphRef,
    nodes: complexNodes,
    edges: complexEdges
  });
  return <GraphCanvas ref={graphRef} nodes={complexNodes} edges={complexEdges} selections={selections} onNodeClick={onNodeClick} onCanvasClick={onCanvasClick} />;
}`,...(k=(v=p.parameters)==null?void 0:v.docs)==null?void 0:k.source}}};var h,R,N;C.parameters={...C.parameters,docs:{...(h=C.parameters)==null?void 0:h.docs,source:{originalSource:`() => {
  const graphRef = useRef<GraphCanvasRef | null>(null);
  const {
    selections,
    onNodeClick,
    onCanvasClick
  } = useSelection({
    ref: graphRef,
    nodes: complexNodes,
    edges: complexEdges,
    focusOnSelect: false
  });
  return <GraphCanvas ref={graphRef} nodes={complexNodes} edges={complexEdges} selections={selections} onCanvasClick={onCanvasClick} onNodeClick={onNodeClick} />;
}`,...(N=(R=C.parameters)==null?void 0:R.docs)==null?void 0:N.source}}};var x,S,E;f.parameters={...f.parameters,docs:{...(x=f.parameters)==null?void 0:x.docs,source:{originalSource:`() => {
  const graphRef = useRef<GraphCanvasRef | null>(null);
  const {
    selections,
    actives,
    onNodeClick,
    onCanvasClick
  } = useSelection({
    ref: graphRef,
    nodes: complexNodes,
    edges: complexEdges,
    pathSelectionType: 'in'
  });
  return <GraphCanvas ref={graphRef} nodes={complexNodes} edges={complexEdges} selections={selections} actives={actives} onCanvasClick={onCanvasClick} onNodeClick={onNodeClick} />;
}`,...(E=(S=f.parameters)==null?void 0:S.docs)==null?void 0:E.source}}};var G,y,j;u.parameters={...u.parameters,docs:{...(G=u.parameters)==null?void 0:G.docs,source:{originalSource:`() => {
  const graphRef = useRef<GraphCanvasRef | null>(null);
  const {
    selections,
    actives,
    onNodeClick,
    onCanvasClick
  } = useSelection({
    ref: graphRef,
    nodes: complexNodes,
    edges: complexEdges,
    pathSelectionType: 'out'
  });
  return <GraphCanvas ref={graphRef} nodes={complexNodes} edges={complexEdges} selections={selections} actives={actives} onCanvasClick={onCanvasClick} onNodeClick={onNodeClick} />;
}`,...(j=(y=u.parameters)==null?void 0:y.docs)==null?void 0:j.source}}};var T,O,w;g.parameters={...g.parameters,docs:{...(T=g.parameters)==null?void 0:T.docs,source:{originalSource:`() => {
  const graphRef = useRef<GraphCanvasRef | null>(null);
  const {
    selections,
    actives,
    onNodeClick,
    onCanvasClick
  } = useSelection({
    ref: graphRef,
    nodes: complexNodes,
    edges: complexEdges,
    pathSelectionType: 'all'
  });
  return <GraphCanvas ref={graphRef} nodes={complexNodes} edges={complexEdges} selections={selections} actives={actives} onCanvasClick={onCanvasClick} onNodeClick={onNodeClick} />;
}`,...(w=(O=g.parameters)==null?void 0:O.docs)==null?void 0:w.source}}};export{g as All,p as Direct,f as Inwards,C as NoFocus,u as Outwards,B as default};
