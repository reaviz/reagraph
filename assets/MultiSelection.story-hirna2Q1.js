import{j as o}from"./jsx-runtime-DRTy3Uxn.js";import{r}from"./index-BBkUAzwr.js";import{G as a}from"./RadialMenu-BZb6EL-Y.js";import{u as g}from"./useSelection-BNSyQBma.js";import{c as e,d as s}from"./demo-NS5ySwyj.js";import"./index-27578f8f.esm-CAmGDcI7.js";import"./extends-CCbyfPlC.js";import"./client-CzthVdz-.js";import"./index-PqR-_bA4.js";const L={title:"Demos/Selection/Multi",component:a},i=()=>{const n=r.useRef(null),{selections:t,onNodeClick:l,onCanvasClick:c}=g({ref:n,nodes:e,edges:s,type:"multi",selections:[e[0].id,e[1].id]});return o.jsx(a,{ref:n,nodes:e,edges:s,selections:t,onNodeClick:l,onCanvasClick:c})},d=()=>{const n=r.useRef(null),{selections:t,onNodeClick:l,onCanvasClick:c}=g({ref:n,nodes:e,edges:s,type:"multi"});return o.jsx(a,{draggable:!0,ref:n,nodes:e,edges:s,selections:t,onNodeClick:l,onCanvasClick:c})},p=()=>{const n=r.useRef(null),{selections:t,onNodeClick:l,onCanvasClick:c}=g({ref:n,nodes:e,edges:s,focusOnSelect:"singleOnly",type:"multiModifier"});return o.jsxs(o.Fragment,{children:[o.jsx("div",{style:{zIndex:9,position:"absolute",top:0,right:0,background:"rgba(0, 0, 0, .5)",color:"white"},children:o.jsx("h3",{style:{margin:5},children:"Hold Command/CTRL and Click to Select Multiples"})}),o.jsx(a,{ref:n,nodes:e,edges:s,selections:t,onNodeClick:l,onCanvasClick:c})]})},m=()=>{const n=r.useRef(null),{selections:t,actives:l,selectNodePaths:c,onNodeClick:G,onCanvasClick:M}=g({ref:n,nodes:e,edges:s,pathSelectionType:"direct",type:"multi"}),u=e[0].id,C=e[8].id;return o.jsxs(r.Fragment,{children:[o.jsx("div",{style:{zIndex:9,position:"absolute",top:15,right:15,background:"rgba(0, 0, 0, .5)",padding:1,color:"white"},children:o.jsxs("button",{style:{display:"block",width:"100%"},onClick:()=>c(u,C),children:["Select ",u," to ",C," Paths"]})}),o.jsx(a,{ref:n,actives:l,nodes:e,edges:s,selections:t,onCanvasClick:M,onNodeClick:G})]})};var f,h,k;i.parameters={...i.parameters,docs:{...(f=i.parameters)==null?void 0:f.docs,source:{originalSource:`() => {
  const graphRef = useRef<GraphCanvasRef | null>(null);
  const {
    selections,
    onNodeClick,
    onCanvasClick
  } = useSelection({
    ref: graphRef,
    nodes: complexNodes,
    edges: complexEdges,
    type: 'multi',
    selections: [complexNodes[0].id, complexNodes[1].id]
  });
  return <GraphCanvas ref={graphRef} nodes={complexNodes} edges={complexEdges} selections={selections} onNodeClick={onNodeClick} onCanvasClick={onCanvasClick} />;
}`,...(k=(h=i.parameters)==null?void 0:h.docs)==null?void 0:k.source}}};var x,v,N;d.parameters={...d.parameters,docs:{...(x=d.parameters)==null?void 0:x.docs,source:{originalSource:`() => {
  const graphRef = useRef<GraphCanvasRef | null>(null);
  const {
    selections,
    onNodeClick,
    onCanvasClick
  } = useSelection({
    ref: graphRef,
    nodes: complexNodes,
    edges: complexEdges,
    type: 'multi'
  });
  return <GraphCanvas draggable ref={graphRef} nodes={complexNodes} edges={complexEdges} selections={selections} onNodeClick={onNodeClick} onCanvasClick={onCanvasClick} />;
}`,...(N=(v=d.parameters)==null?void 0:v.docs)==null?void 0:N.source}}};var R,y,b;p.parameters={...p.parameters,docs:{...(R=p.parameters)==null?void 0:R.docs,source:{originalSource:`() => {
  const graphRef = useRef<GraphCanvasRef | null>(null);
  const {
    selections,
    onNodeClick,
    onCanvasClick
  } = useSelection({
    ref: graphRef,
    nodes: complexNodes,
    edges: complexEdges,
    focusOnSelect: 'singleOnly',
    type: 'multiModifier'
  });
  return <>
      <div style={{
      zIndex: 9,
      position: 'absolute',
      top: 0,
      right: 0,
      background: 'rgba(0, 0, 0, .5)',
      color: 'white'
    }}>
        <h3 style={{
        margin: 5
      }}>Hold Command/CTRL and Click to Select Multiples</h3>
      </div>
      <GraphCanvas ref={graphRef} nodes={complexNodes} edges={complexEdges} selections={selections} onNodeClick={onNodeClick} onCanvasClick={onCanvasClick} />
    </>;
}`,...(b=(y=p.parameters)==null?void 0:y.docs)==null?void 0:b.source}}};var S,j,E;m.parameters={...m.parameters,docs:{...(S=m.parameters)==null?void 0:S.docs,source:{originalSource:`() => {
  const graphRef = useRef<GraphCanvasRef | null>(null);
  const {
    selections,
    actives,
    selectNodePaths,
    onNodeClick,
    onCanvasClick
  } = useSelection({
    ref: graphRef,
    nodes: complexNodes,
    edges: complexEdges,
    pathSelectionType: 'direct',
    type: 'multi'
  });
  const from = complexNodes[0].id;
  const to = complexNodes[8].id;
  return <Fragment>
      <div style={{
      zIndex: 9,
      position: 'absolute',
      top: 15,
      right: 15,
      background: 'rgba(0, 0, 0, .5)',
      padding: 1,
      color: 'white'
    }}>
        <button style={{
        display: 'block',
        width: '100%'
      }} onClick={() => selectNodePaths(from, to)}>
          Select {from} to {to} Paths
        </button>
      </div>
      <GraphCanvas ref={graphRef} actives={actives} nodes={complexNodes} edges={complexEdges} selections={selections} onCanvasClick={onCanvasClick} onNodeClick={onNodeClick} />
    </Fragment>;
}`,...(E=(j=m.parameters)==null?void 0:j.docs)==null?void 0:E.source}}};export{i as Defaults,d as Dragging,p as ModifierKey,m as PathFinding,L as default};
