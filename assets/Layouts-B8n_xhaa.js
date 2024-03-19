import{j as e}from"./jsx-runtime-DRTy3Uxn.js";import{M as s,b as r}from"./index-BxDAS6aZ.js";import{useMDXComponents as i}from"./index-DzJSSmSq.js";import"./index-BBkUAzwr.js";import"./iframe-NADS3VYa.js";import"../sb-preview/runtime.js";import"./chunk-EIRT5I3Z-DXochb4c.js";import"./index-PqR-_bA4.js";import"./extends-CCbyfPlC.js";import"./index-C7vVqNWd.js";import"./index-DrFu-skq.js";function t(o){const n=Object.assign({h1:"h1",p:"p",ul:"ul",li:"li",h2:"h2",code:"code",h3:"h3",pre:"pre",a:"a"},i(),o.components);return e.jsxs(e.Fragment,{children:[e.jsx(s,{title:"Docs/Getting Started/Layouts"}),`
`,e.jsx(n.h1,{id:"layouts",children:"Layouts"}),`
`,e.jsx(n.p,{children:"reagraph has the following layout types:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Force Directed 2D"}),`
`,e.jsx(n.li,{children:"Force Directed 3D"}),`
`,e.jsx(n.li,{children:"Circular 2D"}),`
`,e.jsx(n.li,{children:"Tree Top Down 2D"}),`
`,e.jsx(n.li,{children:"Tree Left Right 2D"}),`
`,e.jsx(n.li,{children:"Tree Top Down 3D"}),`
`,e.jsx(n.li,{children:"Tree Left Right 3D"}),`
`,e.jsx(n.li,{children:"Radial Out 2D"}),`
`,e.jsx(n.li,{children:"Radial Out 3D"}),`
`,e.jsx(n.li,{children:"Hierarchical Top Down 2D"}),`
`,e.jsx(n.li,{children:"Hierarchical Left Right 2D"}),`
`,e.jsx(n.li,{children:"No Overlap 2D"}),`
`,e.jsx(n.li,{children:"ForceAtlas2 2D"}),`
`,e.jsx(n.li,{children:"Custom"}),`
`]}),`
`,e.jsx(n.h2,{id:"layout-overrides",children:"Layout Overrides"}),`
`,e.jsxs(n.p,{children:[`You can override the default layout options for each respective layout using
the `,e.jsx(n.code,{children:"layoutOverrides"})," property on the ",e.jsx(n.code,{children:"GraphCanvas"}),` component. In each layout
description, it will list the available overrides for that layout if applicable.`]}),`
`,e.jsx(n.h3,{id:"position-overrides",children:"Position Overrides"}),`
`,e.jsxs(n.p,{children:["You can override the position in any layout by passing the ",e.jsx(n.code,{children:"getNodePosition"}),` property
to the canvas.`]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-ts",children:`export interface NodePositionArgs {
  /**
   * The graphology object. Useful for any graph manipulation.
   */
  graph: Graph;

  /**
   * Any nodes that were dragged. This is useful if you want to override
   * the position of a node when dragged.
   */
  drags?: DragReferences;

  /**
   * The nodes for the graph.
   */
  nodes: InternalGraphNode[];

  /**
   * The edges for the graph.
   */
  edges: InternalGraphEdge[];
}

/**
 * Get the node position for a given node id.
 */
getNodePosition: (
  id: string,
  args: NodePositionArgs
) => InternalGraphPosition;
`})}),`
`,e.jsx(n.p,{children:"See custom layouts for more information."}),`
`,e.jsx(n.h2,{id:"layout-types",children:"Layout Types"}),`
`,e.jsx(n.p,{children:"Below are examples of each layout type and corresponding descriptions."}),`
`,e.jsx(n.h3,{id:"force-directed-2d",children:"Force Directed 2D"}),`
`,e.jsx("div",{style:{height:300,width:500,position:"relative",background:"white",borderRadius:4,border:"1px solid rgba(0,0,0,.1)",boxShadow:"rgb(0 0 0 / 10%) 0 1px 3px 0",overflow:"hidden"},children:e.jsx(r,{id:"demos-layouts-2d--force-directed"})}),`
`,e.jsxs(n.p,{children:["This is the standard force-directed layout which uses ",e.jsx(n.a,{href:"https://github.com/vasturiano/d3-force-3d",target:"_blank",rel:"nofollow noopener noreferrer",children:"d3-force-3d"}),`.
This is a modified version of the force directed library from d3 except adds support for three dimensional layouts.`]}),`
`,e.jsx(n.p,{children:`This is a one of the most common layouts used because of the simplicity and flexibility that the layout
can support.`}),`
`,e.jsx(n.p,{children:"This layout supports the following overrides:"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-ts",children:`export interface ForceDirectedLayoutInputs extends LayoutFactoryProps {
  /**
   * Center inertia for the layout. Default: 1.
   */
  centerInertia?: number;

  /**
   * Number of dimensions for the layout. 2d or 3d.
   */
  dimensions?: number;

  /**
   * Mode for the dag layout. Only applicable for dag layouts.
   */
  mode?: DagMode;

  /**
   * Distance between links.
   */
  linkDistance?: number;

  /**
   * Strength of the node repulsion.
   */
  nodeStrength?: number;

  /**
   * Strength of the cluster repulsion.
   */
  clusterStrength?: number;

  /**
   * The type of clustering.
   */
  clusterType?: 'force' | 'treemap';

  /**
   * Ratio of the distance between nodes on the same level.
   */
  nodeLevelRatio?: number;

  /**
   * LinkStrength between nodes of different clusters
   */
  linkStrengthInterCluster?: number;

  /**
   * LinkStrength between nodes of the same cluster
   */
  linkStrengthIntraCluster?: number;

  /**
   * Charge between the meta-nodes (Force template only)
   */
  forceLinkDistance?: number;

  /**
   * Used to compute the template force nodes size (Force template only)
   */
  forceLinkStrength?: number;

  /**
   * Used to compute the template force nodes size (Force template only)
   */
  forceCharge?: number;
}
`})}),`
`,e.jsx(n.h3,{id:"force-directed-3d",children:"Force Directed 3D"}),`
`,e.jsx("div",{style:{height:300,width:500,position:"relative",background:"white",borderRadius:4,border:"1px solid rgba(0,0,0,.1)",boxShadow:"rgb(0 0 0 / 10%) 0 1px 3px 0",overflow:"hidden"},children:e.jsx(r,{id:"demos-layouts-3d--force-directed"})}),`
`,e.jsxs(n.p,{children:[`The force directed 3d layout is similar to the 2D version except it adds another dimension. It uses
the same library as the 2D version ( `,e.jsx(n.a,{href:"https://github.com/vasturiano/d3-force-3d",target:"_blank",rel:"nofollow noopener noreferrer",children:"d3-force-3d"}),` ).
The 3D version is useful for very large graphs where many nodes would overlap each other.`]}),`
`,e.jsxs(n.p,{children:["This layout accepts the same layout overrides as the ",e.jsx(n.code,{children:"forceDirected2d"}),"."]}),`
`,e.jsx(n.h3,{id:"circular-2d",children:"Circular 2d"}),`
`,e.jsx("div",{style:{height:300,width:500,position:"relative",background:"white",borderRadius:4,border:"1px solid rgba(0,0,0,.1)",boxShadow:"rgb(0 0 0 / 10%) 0 1px 3px 0",overflow:"hidden"},children:e.jsx(r,{id:"demos-layouts-2d--circular"})}),`
`,e.jsx(n.p,{children:`The circular layout arranges nodes in a circular fashion drawing relationships between the nodes
on the outside of the circle.`}),`
`,e.jsx(n.p,{children:"This layout supports the following overrides:"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-ts",children:`export interface CircularLayoutInputs extends LayoutFactoryProps {
  /**
   * Radius of the circle.
   */
  radius: 300;
}
`})}),`
`,e.jsx(n.h3,{id:"tree-2d",children:"Tree 2D"}),`
`,e.jsx("div",{style:{height:300,width:500,position:"relative",background:"white",borderRadius:4,border:"1px solid rgba(0,0,0,.1)",boxShadow:"rgb(0 0 0 / 10%) 0 1px 3px 0",overflow:"hidden"},children:e.jsx(r,{id:"demos-layouts-2d--tree-top-down"})}),`
`,e.jsxs(n.p,{children:[`The tree layout is a good way to display a clear parent-child relationship between nodes. This layout uses
`,e.jsx(n.a,{href:"https://github.com/vasturiano/d3-force-3d",target:"_blank",rel:"nofollow noopener noreferrer",children:"d3-force-3d"}),"."]}),`
`,e.jsxs(n.p,{children:["This layout accepts the same layout overrides as the ",e.jsx(n.code,{children:"forceDirected2d"}),"."]}),`
`,e.jsx(n.h3,{id:"tree-3d",children:"Tree 3D"}),`
`,e.jsx("div",{style:{height:300,width:500,position:"relative",background:"white",borderRadius:4,border:"1px solid rgba(0,0,0,.1)",boxShadow:"rgb(0 0 0 / 10%) 0 1px 3px 0",overflow:"hidden"},children:e.jsx(r,{id:"demos-layouts-3d--tree-top-down"})}),`
`,e.jsxs(n.p,{children:[`This layout is the same as the tree 2d except adds another dimension. It uses
`,e.jsx(n.a,{href:"https://github.com/vasturiano/d3-force-3d",target:"_blank",rel:"nofollow noopener noreferrer",children:"d3-force-3d"})," under the hood for the layout."]}),`
`,e.jsxs(n.p,{children:["This layout accepts the same layout overrides as the ",e.jsx(n.code,{children:"forceDirected2d"}),"."]}),`
`,e.jsx(n.h3,{id:"radial-2d",children:"Radial 2D"}),`
`,e.jsx("div",{style:{height:300,width:500,position:"relative",background:"white",borderRadius:4,border:"1px solid rgba(0,0,0,.1)",boxShadow:"rgb(0 0 0 / 10%) 0 1px 3px 0",overflow:"hidden"},children:e.jsx(r,{id:"demos-layouts-2d--radial-out"})}),`
`,e.jsxs(n.p,{children:[`The radial layout arranges nodes in a circular fashion around the focus node in a radial tree. Each
relationship extends to another level in the tree to show a depedency tree.
This layout uses `,e.jsx(n.a,{href:"https://github.com/vasturiano/d3-force-3d",target:"_blank",rel:"nofollow noopener noreferrer",children:"d3-force-3d"}),"."]}),`
`,e.jsxs(n.p,{children:["This layout accepts the same layout overrides as the ",e.jsx(n.code,{children:"forceDirected2d"}),"."]}),`
`,e.jsx(n.h3,{id:"radial-3d",children:"Radial 3D"}),`
`,e.jsx("div",{style:{height:300,width:500,position:"relative",background:"white",borderRadius:4,border:"1px solid rgba(0,0,0,.1)",boxShadow:"rgb(0 0 0 / 10%) 0 1px 3px 0",overflow:"hidden"},children:e.jsx(r,{id:"demos-layouts-3d--radial-out"})}),`
`,e.jsxs(n.p,{children:["Similar to the Radial 2D but adds another dimension. This layout uses ",e.jsx(n.a,{href:"https://github.com/vasturiano/d3-force-3d",target:"_blank",rel:"nofollow noopener noreferrer",children:"d3-force-3d"}),"."]}),`
`,e.jsxs(n.p,{children:["This layout accepts the same layout overrides as the ",e.jsx(n.code,{children:"forceDirected2d"}),"."]}),`
`,e.jsx(n.h3,{id:"hierarchical-2d",children:"Hierarchical 2D"}),`
`,e.jsx("div",{style:{height:300,width:500,position:"relative",background:"white",borderRadius:4,border:"1px solid rgba(0,0,0,.1)",boxShadow:"rgb(0 0 0 / 10%) 0 1px 3px 0",overflow:"hidden"},children:e.jsx(r,{id:"demos-layouts-2d--hierarchical-top-down"})}),`
`,e.jsxs(n.p,{children:["This layout uses ",e.jsx(n.a,{href:"https://www.npmjs.com/package/d3-hierarchy",target:"_blank",rel:"nofollow noopener noreferrer",children:"d3-hierarchy"}),"."]}),`
`,e.jsx(n.p,{children:"This layout supports the following overrides:"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-ts",children:`export interface HierarchicalLayoutInputs extends LayoutFactoryProps {
  /**
   * Direction of the layout. Default 'td'.
   */
  mode?: 'td' | 'lr';
  /**
  * Factor of distance between nodes. Default 1.
  */
  nodeSeparation?: number;
  /**
  * Size of each node. Default [50,50]
  */
  nodeSize?: [number, number];
}
`})}),`
`,e.jsx(n.h3,{id:"no-overlap",children:"No Overlap"}),`
`,e.jsx("div",{style:{height:300,width:500,position:"relative",background:"white",borderRadius:4,border:"1px solid rgba(0,0,0,.1)",boxShadow:"rgb(0 0 0 / 10%) 0 1px 3px 0",overflow:"hidden"},children:e.jsx(r,{id:"demos-layouts-2d--no-overlap"})}),`
`,e.jsxs(n.p,{children:["This layout uses ",e.jsx(n.a,{href:"https://graphology.github.io/standard-library/layout-noverlap.html",target:"_blank",rel:"nofollow noopener noreferrer",children:"graphology-layout-nooverlap"}),"."]}),`
`,e.jsx(n.p,{children:"This layout supports the following overrides:"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-ts",children:`export interface NoOverlapLayoutInputs extends LayoutFactoryProps {
  /**
   * Grid size. Default 20.
   */
  gridSize?: number;

  /**
   * Ratio of the layout. Default 10.
   */
  ratio?: number;

  /**
   * Maximum number of iterations. Default 50.
   */
  maxIterations?: number;

  /**
   * Margin between nodes. Default 10.
   */
  margin?: number;
}
`})}),`
`,e.jsx(n.h3,{id:"force-atlas-2",children:"Force Atlas 2"}),`
`,e.jsx("div",{style:{height:300,width:500,position:"relative",background:"white",borderRadius:4,border:"1px solid rgba(0,0,0,.1)",boxShadow:"rgb(0 0 0 / 10%) 0 1px 3px 0",overflow:"hidden"},children:e.jsx(r,{id:"demos-layouts-2d--force-atlas-2"})}),`
`,e.jsxs(n.p,{children:["This layout uses ",e.jsx(n.a,{href:"https://graphology.github.io/standard-library/layout-forceatlas2.html",target:"_blank",rel:"nofollow noopener noreferrer",children:"graphology-layout-forceatlas2"}),"."]}),`
`,e.jsx(n.p,{children:"This layout supports the following overrides:"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-ts",children:`export interface ForceAtlas2LayoutInputs extends LayoutFactoryProps {
  /**
   * Should the node’s sizes be taken into account. Default: false.
   */
  adjustSizes?: boolean;

  /**
   * whether to use the Barnes-Hut approximation to compute
   * repulsion in O(n*log(n)) rather than default O(n^2),
   * n being the number of nodes. Default: false.
   */
  barnesHutOptimize?: boolean;

  /**
   * Barnes-Hut approximation theta parameter. Default: 0.5.
   */
  barnesHutTheta?: number;

  /**
   * Influence of the edge’s weights on the layout. To consider edge weight, don’t
   *  forget to pass weighted as true. Default: 1.
   */
  edgeWeightInfluence?: number;

  /**
   * Strength of the layout’s gravity. Default: 10.
   */
  gravity?: number;

  /**
   * Whether to use Noack’s LinLog model. Default: false.
   */
  linLogMode?: boolean;

  /**
   * Whether to consider edge weights when calculating repulsion. Default: false.
   */
  outboundAttractionDistribution?: boolean;

  /**
   * Scaling ratio for repulsion. Default: 100.
   */
  scalingRatio?: number;

  /**
   * Speed of the slowdown. Default: 1.
   */
  slowDown?: number;

  /**
   * Whether to use the strong gravity mode. Default: false.
   */
  strongGravityMode?: boolean;

  /**
   * Number of iterations to perform. Default: 50.
   */
  iterations?: number;
}
`})})]})}function y(o={}){const{wrapper:n}=Object.assign({},i(),o.components);return n?e.jsx(n,Object.assign({},o,{children:e.jsx(t,o)})):t(o)}export{y as default};
