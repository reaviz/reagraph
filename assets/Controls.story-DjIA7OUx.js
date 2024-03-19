import{j as n}from"./jsx-runtime-DRTy3Uxn.js";import{r as g}from"./index-BBkUAzwr.js";import{G as l}from"./RadialMenu-BZb6EL-Y.js";import{s as i,a}from"./demo-NS5ySwyj.js";import"./index-27578f8f.esm-CAmGDcI7.js";import"./extends-CCbyfPlC.js";import"./client-CzthVdz-.js";import"./index-PqR-_bA4.js";const z={title:"Demos/Controls",component:l},o=()=>{const e=g.useRef(null);return n.jsxs("div",{style:{position:"absolute",top:0,bottom:0,left:0,right:0},children:[n.jsxs("div",{style:{zIndex:9,position:"absolute",top:15,right:15,background:"rgba(0, 0, 0, .5)",padding:1,color:"white"},children:[n.jsx("button",{style:{display:"block",width:"100%"},onClick:()=>{var t;return(t=e.current)==null?void 0:t.centerGraph()},children:"Center"}),n.jsx("button",{style:{display:"block",width:"100%"},onClick:()=>{var t;return(t=e.current)==null?void 0:t.centerGraph([i[2].id])},children:"Center Node 2"}),n.jsx("br",{}),n.jsx("button",{style:{display:"block",width:"100%"},onClick:()=>{var t;return(t=e.current)==null?void 0:t.zoomIn()},children:"Zoom In"}),n.jsx("button",{style:{display:"block",width:"100%"},onClick:()=>{var t;return(t=e.current)==null?void 0:t.zoomOut()},children:"Zoom Out"}),n.jsx("br",{}),n.jsx("button",{style:{display:"block",width:"100%"},onClick:()=>{var t;return(t=e.current)==null?void 0:t.panDown()},children:"Pan Down"}),n.jsx("button",{style:{display:"block",width:"100%"},onClick:()=>{var t;return(t=e.current)==null?void 0:t.panUp()},children:"Pan Up"}),n.jsx("button",{style:{display:"block",width:"100%"},onClick:()=>{var t;return(t=e.current)==null?void 0:t.panLeft()},children:"Pan Left"}),n.jsx("button",{style:{display:"block",width:"100%"},onClick:()=>{var t;return(t=e.current)==null?void 0:t.panRight()},children:"Pan Right"})]}),n.jsx(l,{ref:e,nodes:i,edges:a})]})},r=()=>n.jsx(l,{cameraMode:"rotate",nodes:i,edges:a}),s=()=>{const[e,t]=g.useState("orbit");return n.jsxs("div",{style:{position:"absolute",top:0,bottom:0,left:0,right:0},children:[n.jsx("div",{style:{zIndex:9,position:"absolute",top:15,right:15,background:"rgba(0, 0, 0, .5)",padding:1,color:"white"},children:n.jsx("button",{style:{display:"block",width:"100%"},onClick:()=>t(e==="orbit"?"rotate":"orbit"),children:"Enable/Disable Orbit"})}),n.jsx(l,{cameraMode:e,nodes:i,edges:a})]})};var d,c,p;o.parameters={...o.parameters,docs:{...(d=o.parameters)==null?void 0:d.docs,source:{originalSource:`() => {
  const ref = useRef<GraphCanvasRef | null>(null);
  return <div style={{
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  }}>
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
      }} onClick={() => ref.current?.centerGraph()}>Center</button>
        <button style={{
        display: 'block',
        width: '100%'
      }} onClick={() => ref.current?.centerGraph([simpleNodes[2].id])}>Center Node 2</button>
        <br />
        <button style={{
        display: 'block',
        width: '100%'
      }} onClick={() => ref.current?.zoomIn()}>Zoom In</button>
        <button style={{
        display: 'block',
        width: '100%'
      }} onClick={() => ref.current?.zoomOut()}>Zoom Out</button>
        <br />
        <button style={{
        display: 'block',
        width: '100%'
      }} onClick={() => ref.current?.panDown()}>Pan Down</button>
        <button style={{
        display: 'block',
        width: '100%'
      }} onClick={() => ref.current?.panUp()}>Pan Up</button>
        <button style={{
        display: 'block',
        width: '100%'
      }} onClick={() => ref.current?.panLeft()}>Pan Left</button>
        <button style={{
        display: 'block',
        width: '100%'
      }} onClick={() => ref.current?.panRight()}>Pan Right</button>
      </div>
      <GraphCanvas ref={ref} nodes={simpleNodes} edges={simpleEdges} />
    </div>;
}`,...(p=(c=o.parameters)==null?void 0:c.docs)==null?void 0:p.source}}};var b,u,m;r.parameters={...r.parameters,docs:{...(b=r.parameters)==null?void 0:b.docs,source:{originalSource:'() => <GraphCanvas cameraMode="rotate" nodes={simpleNodes} edges={simpleEdges} />',...(m=(u=r.parameters)==null?void 0:u.docs)==null?void 0:m.source}}};var h,y,k;s.parameters={...s.parameters,docs:{...(h=s.parameters)==null?void 0:h.docs,source:{originalSource:`() => {
  const [mode, setMode] = useState<CameraMode>('orbit');
  return <div style={{
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  }}>
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
      }} onClick={() => setMode(mode === 'orbit' ? 'rotate' : 'orbit')}>Enable/Disable Orbit</button>
      </div>
      <GraphCanvas cameraMode={mode} nodes={simpleNodes} edges={simpleEdges} />
    </div>;
}`,...(k=(y=s.parameters)==null?void 0:y.docs)==null?void 0:k.source}}};export{o as All,s as Orbit,r as Rotate,z as default};
