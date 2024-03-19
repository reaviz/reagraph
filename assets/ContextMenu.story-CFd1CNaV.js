import{j as e}from"./jsx-runtime-DRTy3Uxn.js";import{G as r}from"./RadialMenu-BZb6EL-Y.js";import"./index-BBkUAzwr.js";import{s as C,a as g,p as M,h as v}from"./demo-NS5ySwyj.js";import"./index-27578f8f.esm-CAmGDcI7.js";import"./extends-CCbyfPlC.js";import"./client-CzthVdz-.js";import"./index-PqR-_bA4.js";const S={title:"Demos/Context Menu",component:r},s=()=>e.jsx(r,{nodes:C,edges:g,contextMenu:({data:n,onClose:o})=>e.jsxs("div",{style:{background:"white",width:150,border:"solid 1px blue",borderRadius:2,padding:5,textAlign:"center"},children:[e.jsx("h1",{children:n.label}),e.jsx("button",{onClick:o,children:"Close Menu"})]})}),t=()=>e.jsx(r,{nodes:M,edges:v,contextMenu:({data:n,onCollapse:o,isCollapsed:m,canCollapse:j,onClose:k})=>e.jsxs("div",{style:{background:"white",width:150,border:"solid 1px blue",borderRadius:2,padding:5,textAlign:"center"},children:[e.jsx("h1",{children:n.label}),j&&e.jsx("button",{onClick:o,children:m?"Expand Node":"Collapse Node"}),e.jsx("button",{onClick:k,children:"Close Menu"})]})}),d=()=>e.jsx(r,{nodes:C,edges:g,contextMenu:({data:n,onClose:o})=>e.jsxs("div",{style:{background:"white",width:150,border:"solid 1px blue",borderRadius:2,padding:5,textAlign:"center"},children:[e.jsx("h1",{children:n.label}),e.jsx("button",{onClick:o,children:"Close Menu"})]})});var a,l,i;s.parameters={...s.parameters,docs:{...(a=s.parameters)==null?void 0:a.docs,source:{originalSource:`() => <GraphCanvas nodes={simpleNodes} edges={simpleEdges} contextMenu={({
  data,
  onClose
}) => <div style={{
  background: 'white',
  width: 150,
  border: 'solid 1px blue',
  borderRadius: 2,
  padding: 5,
  textAlign: 'center'
}}>
        <h1>{data.label}</h1>
        <button onClick={onClose}>Close Menu</button>
      </div>} />`,...(i=(l=s.parameters)==null?void 0:l.docs)==null?void 0:i.source}}};var c,p,u;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`() => <GraphCanvas nodes={parentNodes} edges={parentEdges} contextMenu={({
  data,
  onCollapse,
  isCollapsed,
  canCollapse,
  onClose
}) => <div style={{
  background: 'white',
  width: 150,
  border: 'solid 1px blue',
  borderRadius: 2,
  padding: 5,
  textAlign: 'center'
}}>
        <h1>{data.label}</h1>
        {canCollapse && <button onClick={onCollapse}>{isCollapsed ? 'Expand Node' : 'Collapse Node'}</button>}
        <button onClick={onClose}>Close Menu</button>
      </div>} />`,...(u=(p=t.parameters)==null?void 0:p.docs)==null?void 0:u.source}}};var b,x,h;d.parameters={...d.parameters,docs:{...(b=d.parameters)==null?void 0:b.docs,source:{originalSource:`() => <GraphCanvas nodes={simpleNodes} edges={simpleEdges} contextMenu={({
  data,
  onClose
}) => <div style={{
  background: 'white',
  width: 150,
  border: 'solid 1px blue',
  borderRadius: 2,
  padding: 5,
  textAlign: 'center'
}}>
        <h1>{data.label}</h1>
        <button onClick={onClose}>Close Menu</button>
      </div>} />`,...(h=(x=d.parameters)==null?void 0:x.docs)==null?void 0:h.source}}};export{t as Collapsible,d as Edge,s as Node,S as default};
