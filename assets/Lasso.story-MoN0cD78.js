import{j as e}from"./jsx-runtime-DRTy3Uxn.js";import{r as m}from"./index-BBkUAzwr.js";import{G as d}from"./RadialMenu-BZb6EL-Y.js";import{u as f}from"./useSelection-BNSyQBma.js";import{c as s,d as o}from"./demo-NS5ySwyj.js";import"./index-27578f8f.esm-CAmGDcI7.js";import"./extends-CCbyfPlC.js";import"./client-CzthVdz-.js";import"./index-PqR-_bA4.js";const A={title:"Demos/Selection/Lasso",component:d},p=()=>{const n=m.useRef(null),{actives:a,selections:t,onNodeClick:r,onCanvasClick:l,onLasso:c,onLassoEnd:i}=f({ref:n,nodes:s,edges:o,type:"multi"});return e.jsxs(e.Fragment,{children:[e.jsx("div",{style:{zIndex:9,userSelect:"none",position:"absolute",top:0,right:0,background:"rgba(0, 0, 0, .5)",color:"white"},children:e.jsx("h3",{style:{margin:5},children:"Hold Shift and Drag to Lasso"})}),e.jsx(d,{ref:n,nodes:s,edges:o,selections:t,actives:a,onNodeClick:r,onCanvasClick:l,lassoType:"all",onLasso:c,onLassoEnd:i})]})},g=()=>{const n=m.useRef(null),{actives:a,selections:t,onNodeClick:r,onCanvasClick:l,onLasso:c,onLassoEnd:i}=f({ref:n,nodes:s,edges:o,type:"multi"});return e.jsxs(e.Fragment,{children:[e.jsx("div",{style:{zIndex:9,userSelect:"none",position:"absolute",top:0,right:0,background:"rgba(0, 0, 0, .5)",color:"white"},children:e.jsx("h3",{style:{margin:5},children:"Hold Shift and Drag to Lasso"})}),e.jsx(d,{ref:n,nodes:s,edges:o,selections:t,actives:a,onNodeClick:r,onCanvasClick:l,lassoType:"node",onLasso:c,onLassoEnd:i})]})},u=()=>{const n=m.useRef(null),{actives:a,selections:t,onNodeClick:r,onCanvasClick:l,onLasso:c,onLassoEnd:i}=f({ref:n,nodes:s,edges:o,type:"multi"});return e.jsxs(e.Fragment,{children:[e.jsx("div",{style:{zIndex:9,userSelect:"none",position:"absolute",top:0,right:0,background:"rgba(0, 0, 0, .5)",color:"white"},children:e.jsx("h3",{style:{margin:5},children:"Hold Shift and Drag to Lasso"})}),e.jsx(d,{ref:n,nodes:s,draggable:!0,edges:o,selections:t,actives:a,onNodeClick:r,onCanvasClick:l,lassoType:"node",onLasso:c,onLassoEnd:i})]})},h=()=>{const n=m.useRef(null),{actives:a,selections:t,onNodeClick:r,onCanvasClick:l,onLasso:c,onLassoEnd:i}=f({ref:n,nodes:s,edges:o,type:"multi"});return e.jsxs(e.Fragment,{children:[e.jsx("div",{style:{zIndex:9,userSelect:"none",position:"absolute",top:0,right:0,background:"rgba(0, 0, 0, .5)",color:"white"},children:e.jsx("h3",{style:{margin:5},children:"Hold Shift and Drag to Lasso"})}),e.jsx(d,{ref:n,nodes:s,edges:o,selections:t,actives:a,onNodeClick:r,onCanvasClick:l,lassoType:"edge",onLasso:c,onLassoEnd:i})]})};var C,v,x;p.parameters={...p.parameters,docs:{...(C=p.parameters)==null?void 0:C.docs,source:{originalSource:`() => {
  const graphRef = useRef<GraphCanvasRef | null>(null);
  const {
    actives,
    selections,
    onNodeClick,
    onCanvasClick,
    onLasso,
    onLassoEnd
  } = useSelection({
    ref: graphRef,
    nodes: complexNodes,
    edges: complexEdges,
    type: 'multi'
  });
  return <>
      <div style={{
      zIndex: 9,
      userSelect: 'none',
      position: 'absolute',
      top: 0,
      right: 0,
      background: 'rgba(0, 0, 0, .5)',
      color: 'white'
    }}>
        <h3 style={{
        margin: 5
      }}>Hold Shift and Drag to Lasso</h3>
      </div>
      <GraphCanvas ref={graphRef} nodes={complexNodes} edges={complexEdges} selections={selections} actives={actives} onNodeClick={onNodeClick} onCanvasClick={onCanvasClick} lassoType="all" onLasso={onLasso} onLassoEnd={onLassoEnd} />
    </>;
}`,...(x=(v=p.parameters)==null?void 0:v.docs)==null?void 0:x.source}}};var L,k,y;g.parameters={...g.parameters,docs:{...(L=g.parameters)==null?void 0:L.docs,source:{originalSource:`() => {
  const graphRef = useRef<GraphCanvasRef | null>(null);
  const {
    actives,
    selections,
    onNodeClick,
    onCanvasClick,
    onLasso,
    onLassoEnd
  } = useSelection({
    ref: graphRef,
    nodes: complexNodes,
    edges: complexEdges,
    type: 'multi'
  });
  return <>
      <div style={{
      zIndex: 9,
      userSelect: 'none',
      position: 'absolute',
      top: 0,
      right: 0,
      background: 'rgba(0, 0, 0, .5)',
      color: 'white'
    }}>
        <h3 style={{
        margin: 5
      }}>Hold Shift and Drag to Lasso</h3>
      </div>
      <GraphCanvas ref={graphRef} nodes={complexNodes} edges={complexEdges} selections={selections} actives={actives} onNodeClick={onNodeClick} onCanvasClick={onCanvasClick} lassoType="node" onLasso={onLasso} onLassoEnd={onLassoEnd} />
    </>;
}`,...(y=(k=g.parameters)==null?void 0:k.docs)==null?void 0:y.source}}};var E,R,N;u.parameters={...u.parameters,docs:{...(E=u.parameters)==null?void 0:E.docs,source:{originalSource:`() => {
  const graphRef = useRef<GraphCanvasRef | null>(null);
  const {
    actives,
    selections,
    onNodeClick,
    onCanvasClick,
    onLasso,
    onLassoEnd
  } = useSelection({
    ref: graphRef,
    nodes: complexNodes,
    edges: complexEdges,
    type: 'multi'
  });
  return <>
      <div style={{
      zIndex: 9,
      userSelect: 'none',
      position: 'absolute',
      top: 0,
      right: 0,
      background: 'rgba(0, 0, 0, .5)',
      color: 'white'
    }}>
        <h3 style={{
        margin: 5
      }}>Hold Shift and Drag to Lasso</h3>
      </div>
      <GraphCanvas ref={graphRef} nodes={complexNodes} draggable edges={complexEdges} selections={selections} actives={actives} onNodeClick={onNodeClick} onCanvasClick={onCanvasClick} lassoType="node" onLasso={onLasso} onLassoEnd={onLassoEnd} />
    </>;
}`,...(N=(R=u.parameters)==null?void 0:R.docs)==null?void 0:N.source}}};var b,S,j;h.parameters={...h.parameters,docs:{...(b=h.parameters)==null?void 0:b.docs,source:{originalSource:`() => {
  const graphRef = useRef<GraphCanvasRef | null>(null);
  const {
    actives,
    selections,
    onNodeClick,
    onCanvasClick,
    onLasso,
    onLassoEnd
  } = useSelection({
    ref: graphRef,
    nodes: complexNodes,
    edges: complexEdges,
    type: 'multi'
  });
  return <>
      <div style={{
      zIndex: 9,
      userSelect: 'none',
      position: 'absolute',
      top: 0,
      right: 0,
      background: 'rgba(0, 0, 0, .5)',
      color: 'white'
    }}>
        <h3 style={{
        margin: 5
      }}>Hold Shift and Drag to Lasso</h3>
      </div>
      <GraphCanvas ref={graphRef} nodes={complexNodes} edges={complexEdges} selections={selections} actives={actives} onNodeClick={onNodeClick} onCanvasClick={onCanvasClick} lassoType="edge" onLasso={onLasso} onLassoEnd={onLassoEnd} />
    </>;
}`,...(j=(S=h.parameters)==null?void 0:S.docs)==null?void 0:j.source}}};export{u as Dragging,h as EdgesOnly,p as NodesAndEdges,g as NodesOnly,A as default};
