import{j as e}from"./jsx-runtime-DRTy3Uxn.js";import{r as N}from"./index-BBkUAzwr.js";import{G as t,S as H,a as J,b as Q}from"./RadialMenu-BZb6EL-Y.js";import{j as V,k as x,a,s as y,l as X}from"./demo-NS5ySwyj.js";import"./index-27578f8f.esm-CAmGDcI7.js";import"./extends-CCbyfPlC.js";import"./client-CzthVdz-.js";import"./index-PqR-_bA4.js";const ae={title:"Demos/Nodes",component:t},d=()=>e.jsx(t,{nodes:V,edges:[]}),c=()=>e.jsx(t,{nodes:x,edges:a}),i=()=>{const o=N.useRef(new Map),[s,n]=N.useState(y);return e.jsxs(e.Fragment,{children:[e.jsx(t,{draggable:!0,nodes:s,edges:a,layoutOverrides:{getNodePosition:r=>{var S;return console.log("custom position",o.current.get(r)),(S=o.current.get(r))==null?void 0:S.position}},onNodeDragged:r=>{console.log("node dragged",r),o.current.set(r.id,r)}}),e.jsx("div",{style:{zIndex:9,position:"absolute",top:15,right:15},children:e.jsx("button",{type:"button",onClick:()=>{const r=s.length+2;n([...s,{id:`${r}`,label:`Node ${r}`}])},children:"Reset Graph"})})]})},p=()=>e.jsx(t,{nodes:y,edges:a,cameraMode:"rotate",renderNode:({size:o,color:s,opacity:n})=>e.jsx("group",{children:e.jsxs("mesh",{children:[e.jsx("torusKnotGeometry",{attach:"geometry",args:[o,1.25,50,8]}),e.jsx("meshBasicMaterial",{attach:"material",color:s,opacity:n,transparent:!0})]})})}),g=()=>e.jsx(t,{nodes:x,edges:a,cameraMode:"rotate",renderNode:({node:o,...s})=>e.jsx(H,{...s,node:o,image:o.icon||""})}),l=()=>e.jsx(t,{nodes:x,edges:a,cameraMode:"rotate",renderNode:({node:o,...s})=>e.jsx(J,{...s,node:o,image:o.icon||""})}),m=()=>e.jsx(t,{nodes:x,edges:a,cameraMode:"rotate",renderNode:({node:o,...s})=>e.jsx(Q,{...s,node:o,image:o.icon||""})}),u=()=>e.jsx(t,{nodes:X,edges:a}),h=()=>{const[o,s]=N.useState("forceDirected2d"),[n,r]=N.useState(y);return e.jsxs("div",{children:[e.jsx("button",{style:{position:"absolute",top:15,right:15,zIndex:999,width:120},onClick:()=>r([...n,{id:`n-${n.length}`,label:`Node ${n.length}`}]),children:"Update Nodes"}),e.jsx("button",{style:{position:"absolute",top:40,right:15,zIndex:999,width:120},onClick:()=>s(o==="forceDirected2d"?"forceDirected3d":"forceDirected2d"),children:"Reset Layout"}),e.jsx(t,{nodes:n,edges:a,draggable:!0,layoutType:o})]})};var b,j,v;d.parameters={...d.parameters,docs:{...(b=d.parameters)==null?void 0:b.docs,source:{originalSource:"() => <GraphCanvas nodes={manyNodes} edges={[]} />",...(v=(j=d.parameters)==null?void 0:j.docs)==null?void 0:v.source}}};var f,C,G;c.parameters={...c.parameters,docs:{...(f=c.parameters)==null?void 0:f.docs,source:{originalSource:"() => <GraphCanvas nodes={iconNodes} edges={simpleEdges} />",...(G=(C=c.parameters)==null?void 0:C.docs)==null?void 0:G.source}}};var D,E,I;i.parameters={...i.parameters,docs:{...(D=i.parameters)==null?void 0:D.docs,source:{originalSource:`() => {
  const nodeRef = useRef(new Map());
  const [nodes, setNodes] = useState(simpleNodes);
  return <>
      <GraphCanvas draggable nodes={nodes} edges={simpleEdges} layoutOverrides={{
      getNodePosition: id => {
        console.log('custom position', nodeRef.current.get(id));
        return nodeRef.current.get(id)?.position;
      }
    }} onNodeDragged={node => {
      console.log('node dragged', node);
      nodeRef.current.set(node.id, node);
    }} />
      <div style={{
      zIndex: 9,
      position: 'absolute',
      top: 15,
      right: 15
    }}>
        <button type="button" onClick={() => {
        const next = nodes.length + 2;
        setNodes([...nodes, {
          id: \`\${next}\`,
          label: \`Node \${next}\`
        }]);
      }}>
          Reset Graph
        </button>
      </div>
    </>;
}`,...(I=(E=i.parameters)==null?void 0:E.docs)==null?void 0:I.source}}};var M,R,z;p.parameters={...p.parameters,docs:{...(M=p.parameters)==null?void 0:M.docs,source:{originalSource:`() => <GraphCanvas nodes={simpleNodes} edges={simpleEdges} cameraMode="rotate" renderNode={({
  size,
  color,
  opacity
}) => <group>
        <mesh>
          <torusKnotGeometry attach="geometry" args={[size, 1.25, 50, 8]} />
          <meshBasicMaterial attach="material" color={color} opacity={opacity} transparent />
        </mesh>
      </group>} />`,...(z=(R=p.parameters)==null?void 0:R.docs)==null?void 0:z.source}}};var $,k,w;g.parameters={...g.parameters,docs:{...($=g.parameters)==null?void 0:$.docs,source:{originalSource:`() => <GraphCanvas nodes={iconNodes} edges={simpleEdges} cameraMode="rotate" renderNode={({
  node,
  ...rest
}) => <SphereWithIcon {...rest} node={node} image={node.icon || ''} />} />`,...(w=(k=g.parameters)==null?void 0:k.docs)==null?void 0:w.source}}};var L,W,O;l.parameters={...l.parameters,docs:{...(L=l.parameters)==null?void 0:L.docs,source:{originalSource:`() => <GraphCanvas nodes={iconNodes} edges={simpleEdges} cameraMode="rotate" renderNode={({
  node,
  ...rest
}) => <SphereWithSvg {...rest} node={node} image={node.icon || ''} />} />`,...(O=(W=l.parameters)==null?void 0:W.docs)==null?void 0:O.source}}};var T,B,K;m.parameters={...m.parameters,docs:{...(T=m.parameters)==null?void 0:T.docs,source:{originalSource:`() => <GraphCanvas nodes={iconNodes} edges={simpleEdges} cameraMode="rotate" renderNode={({
  node,
  ...rest
}) => <Svg {...rest} node={node} image={node.icon || ''} />} />`,...(K=(B=m.parameters)==null?void 0:B.docs)==null?void 0:K.source}}};var P,U,F;u.parameters={...u.parameters,docs:{...(P=u.parameters)==null?void 0:P.docs,source:{originalSource:"() => <GraphCanvas nodes={simpleNodesColors} edges={simpleEdges} />",...(F=(U=u.parameters)==null?void 0:U.docs)==null?void 0:F.source}}};var _,q,A;h.parameters={...h.parameters,docs:{...(_=h.parameters)==null?void 0:_.docs,source:{originalSource:`() => {
  const [layout, setLayout] = useState<LayoutTypes>('forceDirected2d');
  const [nodes, setNodes] = useState(simpleNodes);
  return <div>
      <button style={{
      position: 'absolute',
      top: 15,
      right: 15,
      zIndex: 999,
      width: 120
    }} onClick={() => setNodes([...nodes, {
      id: \`n-\${nodes.length}\`,
      label: \`Node \${nodes.length}\`
    }])}>
        Update Nodes
      </button>
      <button style={{
      position: 'absolute',
      top: 40,
      right: 15,
      zIndex: 999,
      width: 120
    }} onClick={() => setLayout(layout === 'forceDirected2d' ? 'forceDirected3d' : 'forceDirected2d')}>
        Reset Layout
      </button>
      <GraphCanvas nodes={nodes} edges={simpleEdges} draggable layoutType={layout} />
    </div>;
}`,...(A=(q=h.parameters)==null?void 0:q.docs)==null?void 0:A.source}}};export{u as Colors,p as Custom3DNode,i as DragOverrides,h as Draggable,c as Icons,d as NoEdges,l as SphereSvgIconNode,g as SphereWithIconNode,m as SvgIconNode,ae as default};
