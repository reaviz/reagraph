import{j as e}from"./jsx-runtime-DRTy3Uxn.js";import{r as p}from"./index-BBkUAzwr.js";import{d as g,e as S,G as x,R as A}from"./RadialMenu-BZb6EL-Y.js";import{p as u,h}from"./demo-NS5ySwyj.js";import"./index-27578f8f.esm-CAmGDcI7.js";import"./extends-CCbyfPlC.js";import"./client-CzthVdz-.js";import"./index-PqR-_bA4.js";const R=({collapsedNodeIds:s=[],nodes:l=[],edges:n=[]})=>{const t=p.useCallback(a=>{const{visibleNodes:o}=g({nodes:l,edges:n,collapsedIds:s});return!o.map(r=>r.id).includes(a)},[s,n,l]),d=p.useCallback(a=>{const{visibleEdges:o}=g({nodes:l,edges:n,collapsedIds:s}),i=o.map(r=>r.id);return S({nodeId:a,edges:n,visibleEdgeIds:i})},[s,n,l]);return{getIsCollapsed:t,getExpandPathIds:d}},H={title:"Demos/Collapsible",component:x},b=()=>{const[s,l]=p.useState(null),[n,t]=p.useState(["n-2"]);return e.jsxs("div",{style:{position:"absolute",top:0,bottom:0,left:0,right:0},children:[e.jsxs("div",{style:{zIndex:9,position:"absolute",top:15,right:15,background:"rgba(0, 0, 0, .5)",padding:10,color:"white"},children:[e.jsx("h3",{children:"Node Actions"}),s?e.jsxs(e.Fragment,{children:["Selected: ",s.node.id,e.jsx("br",{}),e.jsx("button",{style:{display:"block",width:"100%"},onClick:()=>{n.includes(s.node.id)||t([...n,s.node.id])},children:"Collapse Node"}),e.jsx("button",{style:{display:"block",width:"100%"},onClick:()=>{n.includes(s.node.id)&&t(n.filter(d=>d!==s.node.id))},children:"Expand Node"})]}):e.jsx(e.Fragment,{children:"Click a node to see options"}),e.jsx("h3",{children:"Collapsed Nodes"}),e.jsx("code",{children:e.jsx("pre",{children:JSON.stringify(n,null,2)})})]}),e.jsx(x,{collapsedNodeIds:n,nodes:u,edges:h,onNodeClick:(d,a)=>l({node:d,props:a})})]})},C=()=>e.jsx(x,{nodes:u,edges:h,contextMenu:({data:s,canCollapse:l,isCollapsed:n,onCollapse:t,onClose:d})=>e.jsx(A,{onClose:d,items:[{label:"Add Node",onClick:()=>{alert("Add a node"),d()}},{label:"Remove",onClick:()=>{alert("Remove the node"),d()}},...l?[{label:n?"Expand":"Collapse",onClick:t}]:[]]})}),N=()=>{const[s,l]=p.useState(null),[n,t]=p.useState(["n-2"]),{getExpandPathIds:d}=R({collapsedNodeIds:n,nodes:u,edges:h}),a=p.useMemo(()=>{const{visibleNodes:o}=g({collapsedIds:n,nodes:u,edges:h}),i=o.map(c=>c.id);return u.filter(c=>!i.includes(c.id)).map(c=>c.id)},[n]);return e.jsxs("div",{style:{position:"absolute",top:0,bottom:0,left:0,right:0},children:[e.jsxs("div",{style:{zIndex:9,position:"absolute",top:15,right:15,background:"rgba(0, 0, 0, .5)",padding:10,color:"white"},children:[e.jsx("h3",{children:"Node Actions"}),s?e.jsxs(e.Fragment,{children:["Selected: ",s.node.id,e.jsx("br",{}),e.jsx("button",{style:{display:"block",width:"100%"},onClick:()=>{n.includes(s.node.id)||t([...n,s.node.id])},children:"Collapse Node"}),e.jsx("button",{style:{display:"block",width:"100%"},onClick:()=>{n.includes(s.node.id)&&t(n.filter(o=>o!==s.node.id))},children:"Expand Node"})]}):e.jsx(e.Fragment,{children:"Click a node to see options"}),e.jsx("h3",{children:"Collapsed Nodes"}),e.jsx("code",{children:e.jsx("pre",{children:JSON.stringify(n,null,2)})}),e.jsx("h3",{children:"Hidden Nodes"}),e.jsx("ul",{children:a.map(o=>e.jsxs("li",{children:[o,e.jsx("button",{style:{display:"block",width:"100%"},onClick:()=>{const i=d(o),r=n.filter(c=>!i.includes(c));t(r)},children:"View Node"})]},o))})]}),e.jsx(x,{collapsedNodeIds:n,nodes:u,edges:h,onNodeClick:(o,i)=>l({node:o,props:i})})]})};var v,m,k;b.parameters={...b.parameters,docs:{...(v=b.parameters)==null?void 0:v.docs,source:{originalSource:`() => {
  const [active, setActive] = useState<any>(null);
  const [collapsed, setCollapsed] = useState<string[]>(['n-2']);
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
      padding: 10,
      color: 'white'
    }}>
        <h3>Node Actions</h3>
        {active ? <>
            Selected: {active.node.id}
            <br />
            <button style={{
          display: 'block',
          width: '100%'
        }} onClick={() => {
          if (!collapsed.includes(active.node.id)) {
            setCollapsed([...collapsed, active.node.id]);
          }
        }}>
              Collapse Node
            </button>
            <button style={{
          display: 'block',
          width: '100%'
        }} onClick={() => {
          if (collapsed.includes(active.node.id)) {
            setCollapsed(collapsed.filter(n => n !== active.node.id));
          }
        }}>
              Expand Node
            </button>
          </> : <>
            Click a node to see options
          </>}
        <h3>Collapsed Nodes</h3>
        <code>
          <pre>
            {JSON.stringify(collapsed, null, 2)}
          </pre>
        </code>
      </div>
      <GraphCanvas collapsedNodeIds={collapsed} nodes={parentNodes} edges={parentEdges} onNodeClick={(node, props) => setActive({
      node,
      props
    })} />
    </div>;
}`,...(k=(m=b.parameters)==null?void 0:m.docs)==null?void 0:k.source}}};var y,j,f;C.parameters={...C.parameters,docs:{...(y=C.parameters)==null?void 0:y.docs,source:{originalSource:`() => <GraphCanvas nodes={parentNodes} edges={parentEdges} contextMenu={({
  data,
  canCollapse,
  isCollapsed,
  onCollapse,
  onClose
}) => <RadialMenu onClose={onClose} items={[{
  label: 'Add Node',
  onClick: () => {
    alert('Add a node');
    onClose();
  }
}, {
  label: 'Remove',
  onClick: () => {
    alert('Remove the node');
    onClose();
  }
}, ...(canCollapse ? [{
  label: isCollapsed ? 'Expand' : 'Collapse',
  onClick: onCollapse
}] : [])]} />} />`,...(f=(j=C.parameters)==null?void 0:j.docs)==null?void 0:f.source}}};var I,E,w;N.parameters={...N.parameters,docs:{...(I=N.parameters)==null?void 0:I.docs,source:{originalSource:`() => {
  const [active, setActive] = useState<any>(null);
  const [collapsed, setCollapsed] = useState<string[]>(['n-2']);
  const {
    getExpandPathIds
  } = useCollapse({
    collapsedNodeIds: collapsed,
    nodes: parentNodes,
    edges: parentEdges
  });
  const hiddenNodeIds = useMemo(() => {
    const {
      visibleNodes
    } = getVisibleEntities({
      collapsedIds: collapsed,
      nodes: parentNodes,
      edges: parentEdges
    });
    const visibleNodeIds = visibleNodes.map(n => n.id);
    const hiddenNodes = parentNodes.filter(n => !visibleNodeIds.includes(n.id));
    return hiddenNodes.map(n => n.id);
  }, [collapsed]);
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
      padding: 10,
      color: 'white'
    }}>
      <h3>Node Actions</h3>
      {active ? <>
          Selected: {active.node.id}
          <br />
          <button style={{
          display: 'block',
          width: '100%'
        }} onClick={() => {
          if (!collapsed.includes(active.node.id)) {
            setCollapsed([...collapsed, active.node.id]);
          }
        }}>
            Collapse Node
          </button>
          <button style={{
          display: 'block',
          width: '100%'
        }} onClick={() => {
          if (collapsed.includes(active.node.id)) {
            setCollapsed(collapsed.filter(n => n !== active.node.id));
          }
        }}>
            Expand Node
          </button>
        </> : <>
          Click a node to see options
        </>}
      <h3>Collapsed Nodes</h3>
      <code>
        <pre>
          {JSON.stringify(collapsed, null, 2)}
        </pre>
      </code>
      <h3>Hidden Nodes</h3>
      <ul>
        {hiddenNodeIds.map(id => <li key={id}>
            {id}
            <button style={{
            display: 'block',
            width: '100%'
          }} onClick={() => {
            const toExpandIds = getExpandPathIds(id);
            const newCollapsed = collapsed.filter(id => !toExpandIds.includes(id));
            setCollapsed(newCollapsed);
          }}>
              View Node
            </button>
          </li>)}
      </ul>
    </div>
    <GraphCanvas collapsedNodeIds={collapsed} nodes={parentNodes} edges={parentEdges} onNodeClick={(node, props) => setActive({
      node,
      props
    })} />
    </div>;
}`,...(w=(E=N.parameters)==null?void 0:E.docs)==null?void 0:w.source}}};export{b as Basic,N as ExpandToHiddenNode,C as RadialContextMenu,H as default};
