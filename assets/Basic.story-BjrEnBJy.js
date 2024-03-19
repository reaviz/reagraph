import{j as e}from"./jsx-runtime-DRTy3Uxn.js";import{r as x}from"./index-BBkUAzwr.js";import{G as n,l as ae}from"./RadialMenu-BZb6EL-Y.js";import{s as a,a as r,r as re,b as C}from"./demo-NS5ySwyj.js";import"./index-27578f8f.esm-CAmGDcI7.js";import"./extends-CCbyfPlC.js";import"./client-CzthVdz-.js";import"./index-PqR-_bA4.js";const ge={title:"Demos/Basic",component:n},te=s=>e.jsx(n,{...s}),d=te.bind({});d.args={nodes:a,edges:r,cameraMode:"pan",theme:ae,layoutType:"forceDirected2d",sizingType:"none",labelType:"auto"};const l=()=>e.jsx(n,{nodes:[{id:"1",label:"1"},{id:"2",label:"2"}],edges:[{source:"1",target:"2",id:"1-2",label:"1-2"},{source:"2",target:"1",id:"2-1",label:"2-1"}]}),c=()=>e.jsx(n,{labelType:"all",labelFontUrl:"https://ey2pz3.csb.app/NotoSansSC-Regular.ttf",nodes:[{id:"1",label:"牡"},{id:"2",label:"牡"}],edges:[{source:"1",target:"2",id:"1-2",label:"牡 - 牡"},{source:"2",target:"1",id:"2-1",label:"牡 - 牡"}]}),p=()=>e.jsx(n,{nodes:a,edges:r,disabled:!0}),u=()=>e.jsx(n,{nodes:a,edges:r,layoutType:"forceDirected3d",children:e.jsx("directionalLight",{position:[0,5,-4],intensity:1})}),m=()=>e.jsx("div",{style:{display:"flex",flexWrap:"wrap"},children:re(10).map(s=>e.jsx("div",{style:{border:"solid 1px red",height:350,width:350,margin:15,position:"relative"},children:e.jsx(n,{disabled:!0,nodes:a,edges:r,animated:!1})},s))}),g=()=>{var f;const[s,i]=x.useState(a),[t,ne]=x.useState(r);return e.jsxs("div",{children:[e.jsxs("div",{style:{zIndex:9,position:"absolute",top:15,right:15,background:"rgba(0, 0, 0, .5)",padding:1,color:"white"},children:[e.jsx("button",{style:{display:"block",width:"100%"},onClick:()=>{const o=C(0,1e3);i([...s,{id:`n-${o}`,label:`Node ${o}`}]),C(0,2)!==2&&ne([...t,{id:`e-${o}`,source:s[s.length-1].id,target:`n-${o}`}])},children:"Add Node"}),e.jsxs("button",{style:{display:"block",width:"100%"},onClick:()=>{i(s.filter(o=>{var k;return o.id!==((k=s[0])==null?void 0:k.id)}))},children:["Remove Node ",(f=s[0])==null?void 0:f.id]})]}),e.jsx(n,{nodes:s,edges:t})]})},b=()=>{const s=x.useRef(null);return e.jsxs("div",{children:[e.jsx("div",{style:{zIndex:9,position:"absolute",top:15,right:15,background:"rgba(0, 0, 0, .5)",padding:1,color:"white"},children:e.jsx("button",{style:{display:"block",width:"100%"},onClick:()=>{const i=s.current.exportCanvas(),t=document.createElement("a");t.setAttribute("href",i),t.setAttribute("target","_blank"),t.setAttribute("download","graph.png"),t.click()},children:"Export Graph"})}),e.jsx(n,{ref:s,nodes:a,edges:r})]})},h=()=>e.jsx(n,{animated:!1,nodes:a,edges:r}),v=()=>e.jsx(n,{animated:!1,nodes:a,edges:r,glOptions:{preserveDrawingBuffer:!0}}),y=()=>e.jsx(n,{nodes:[{id:"1",label:"Node 1"},{id:"2",label:"Node 2"}],edges:[{source:"1",target:"2",id:"1-2",label:"1-2"},{source:"2",target:"1",id:"2-1",label:"2-1"}],onNodeDoubleClick:s=>alert(s.label)});var N,S,j;d.parameters={...d.parameters,docs:{...(N=d.parameters)==null?void 0:N.docs,source:{originalSource:"args => <GraphCanvas {...args} />",...(j=(S=d.parameters)==null?void 0:S.docs)==null?void 0:j.source}}};var w,E,G;l.parameters={...l.parameters,docs:{...(w=l.parameters)==null?void 0:w.docs,source:{originalSource:`() => <GraphCanvas nodes={[{
  id: '1',
  label: '1'
}, {
  id: '2',
  label: '2'
}]} edges={[{
  source: '1',
  target: '2',
  id: '1-2',
  label: '1-2'
}, {
  source: '2',
  target: '1',
  id: '2-1',
  label: '2-1'
}]} />`,...(G=(E=l.parameters)==null?void 0:E.docs)==null?void 0:G.source}}};var A,D,T;c.parameters={...c.parameters,docs:{...(A=c.parameters)==null?void 0:A.docs,source:{originalSource:`() => <GraphCanvas labelType="all" labelFontUrl="https://ey2pz3.csb.app/NotoSansSC-Regular.ttf" nodes={[{
  id: '1',
  label: '牡'
}, {
  id: '2',
  label: '牡'
}]} edges={[{
  source: '1',
  target: '2',
  id: '1-2',
  label: '牡 - 牡'
}, {
  source: '2',
  target: '1',
  id: '2-1',
  label: '牡 - 牡'
}]} />`,...(T=(D=c.parameters)==null?void 0:D.docs)==null?void 0:T.source}}};var R,$,z;p.parameters={...p.parameters,docs:{...(R=p.parameters)==null?void 0:R.docs,source:{originalSource:"() => <GraphCanvas nodes={simpleNodes} edges={simpleEdges} disabled />",...(z=($=p.parameters)==null?void 0:$.docs)==null?void 0:z.source}}};var I,L,B;u.parameters={...u.parameters,docs:{...(I=u.parameters)==null?void 0:I.docs,source:{originalSource:`() => <GraphCanvas nodes={simpleNodes} edges={simpleEdges} layoutType="forceDirected3d">
    <directionalLight position={[0, 5, -4]} intensity={1} />
  </GraphCanvas>`,...(B=(L=u.parameters)==null?void 0:L.docs)==null?void 0:B.source}}};var O,U,W;m.parameters={...m.parameters,docs:{...(O=m.parameters)==null?void 0:O.docs,source:{originalSource:`() => <div style={{
  display: 'flex',
  flexWrap: 'wrap'
}}>
    {range(10).map(i => <div key={i} style={{
    border: 'solid 1px red',
    height: 350,
    width: 350,
    margin: 15,
    position: 'relative'
  }}>
        <GraphCanvas disabled nodes={simpleNodes} edges={simpleEdges} animated={false} />
      </div>)}
  </div>`,...(W=(U=m.parameters)==null?void 0:U.docs)==null?void 0:W.source}}};var _,F,M;g.parameters={...g.parameters,docs:{...(_=g.parameters)==null?void 0:_.docs,source:{originalSource:`() => {
  const [nodes, setNodes] = useState(simpleNodes);
  const [edges, setEdges] = useState(simpleEdges);
  return <div>
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
      }} onClick={() => {
        const num = random(0, 1000);
        setNodes([...nodes, {
          id: \`n-\${num}\`,
          label: \`Node \${num}\`
        }]);
        if (random(0, 2) !== 2) {
          setEdges([...edges, {
            id: \`e-\${num}\`,
            source: nodes[nodes.length - 1].id,
            target: \`n-\${num}\`
          }]);
        }
      }}>
          Add Node
        </button>
        <button style={{
        display: 'block',
        width: '100%'
      }} onClick={() => {
        setNodes(nodes.filter(n => n.id !== nodes[0]?.id));
      }}>
          Remove Node {nodes[0]?.id}
        </button>
      </div>
      <GraphCanvas nodes={nodes} edges={edges} />
    </div>;
}`,...(M=(F=g.parameters)==null?void 0:F.docs)==null?void 0:M.source}}};var q,H,J;b.parameters={...b.parameters,docs:{...(q=b.parameters)==null?void 0:q.docs,source:{originalSource:`() => {
  const ref = useRef<GraphCanvasRef | null>(null);
  return <div>
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
      }} onClick={() => {
        const data = ref.current.exportCanvas();
        const link = document.createElement('a');
        link.setAttribute('href', data);
        link.setAttribute('target', '_blank');
        link.setAttribute('download', 'graph.png');
        link.click();
      }}>
          Export Graph
        </button>
      </div>
      <GraphCanvas ref={ref} nodes={simpleNodes} edges={simpleEdges} />
    </div>;
}`,...(J=(H=b.parameters)==null?void 0:H.docs)==null?void 0:J.source}}};var K,P,Q;h.parameters={...h.parameters,docs:{...(K=h.parameters)==null?void 0:K.docs,source:{originalSource:"() => <GraphCanvas animated={false} nodes={simpleNodes} edges={simpleEdges} />",...(Q=(P=h.parameters)==null?void 0:P.docs)==null?void 0:Q.source}}};var V,X,Y;v.parameters={...v.parameters,docs:{...(V=v.parameters)==null?void 0:V.docs,source:{originalSource:`() => <GraphCanvas animated={false} nodes={simpleNodes} edges={simpleEdges} glOptions={{
  preserveDrawingBuffer: true
}} />`,...(Y=(X=v.parameters)==null?void 0:X.docs)==null?void 0:Y.source}}};var Z,ee,se;y.parameters={...y.parameters,docs:{...(Z=y.parameters)==null?void 0:Z.docs,source:{originalSource:`() => <GraphCanvas nodes={[{
  id: '1',
  label: 'Node 1'
}, {
  id: '2',
  label: 'Node 2'
}]} edges={[{
  source: '1',
  target: '2',
  id: '1-2',
  label: '1-2'
}, {
  source: '2',
  target: '1',
  id: '2-1',
  label: '2-1'
}]} onNodeDoubleClick={node => alert(node.label)} />`,...(se=(ee=y.parameters)==null?void 0:ee.docs)==null?void 0:se.source}}};export{u as CustomLighting,p as Disabled,v as ExtraGlOptions,g as LiveUpdates,m as Many,h as NoAnimation,y as NodeDoubleClick,b as SaveAsImage,d as Simple,c as SpecialCharacters,l as TwoWayLink,ge as default};
