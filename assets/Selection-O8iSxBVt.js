import{j as e}from"./jsx-runtime-DRTy3Uxn.js";import{M as i}from"./index-BxDAS6aZ.js";import{useMDXComponents as t}from"./index-DzJSSmSq.js";import"./index-BBkUAzwr.js";import"./iframe-NADS3VYa.js";import"../sb-preview/runtime.js";import"./chunk-EIRT5I3Z-DXochb4c.js";import"./index-PqR-_bA4.js";import"./extends-CCbyfPlC.js";import"./index-C7vVqNWd.js";import"./index-DrFu-skq.js";function o(s){const n=Object.assign({h1:"h1",p:"p",code:"code",h2:"h2",h3:"h3",pre:"pre",ul:"ul",li:"li"},t(),s.components);return e.jsxs(e.Fragment,{children:[e.jsx(i,{title:"Docs/Advanced/Selection"}),`
`,e.jsx(n.h1,{id:"selection",children:"Selection"}),`
`,e.jsxs(n.p,{children:["Out of the box, reagraph supports selection handled either manually or via the ",e.jsx(n.code,{children:"useSelection"})," hook."]}),`
`,e.jsx(n.h2,{id:"useselection",children:e.jsx(n.code,{children:"useSelection"})}),`
`,e.jsxs(n.p,{children:["The ",e.jsx(n.code,{children:"useSelection"})," hook will automatically manage selection state and bind some hotkeys for you."]}),`
`,e.jsx(n.h3,{id:"interfaces",children:"Interfaces"}),`
`,e.jsx(n.p,{children:"The hook accepts the following:"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-ts",children:`export type HotkeyTypes = 'selectAll' | 'deselect' | 'delete';
export type PathSelectionTypes = 'direct' | 'out' | 'in' | 'all';
export type SelectionTypes = 'single' | 'multi' | 'multiModifier';

export interface SelectionProps {
  /**
   * Required ref for the graph.
   */
  ref: RefObject<GraphCanvasRef | null>;

  /**
   * Current selections.
   *
   * Contains both nodes and edges ids.
   */
  selections?: string[];

  /**
   * Default active selections.
   */
  actives?: string[];

  /**
   * Node datas.
   */
  nodes?: GraphNode[];

  /**
   * Edge datas.
   */
  edges?: GraphEdge[];

  /**
   * Disabled or not.
   */
  disabled?: boolean;

  /**
   * Hotkey types
   */
  hotkeys?: HotkeyTypes[];

  /**
   * Whether to focus on select or not.
   */
  focusOnSelect?: boolean | 'singleOnly';

  /**
   * Type of selection.
   */
  type?: SelectionTypes;

  /**
   * Type of selection.
   */
  pathSelectionType?: PathSelectionTypes;

  /**
   * On selection change.
   */
  onSelection?: (selectionIds: string[]) => void;
}
`})}),`
`,e.jsx(n.p,{children:"and returns the following:"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-ts",children:`export interface SelectionResult {
  /**
   * Selections id array (of nodes and edges).
   */
  selections: string[];

  /**
   * The nodes/edges around the selections to highlight.
   */
  actives: string[];

  /**
   * Clear selections method.
   */
  clearSelections: (value?: string[]) => void;

  /**
   * A selection method.
   */
  addSelection: (value: string) => void;

  /**
   * Get the paths between two nodes.
   */
  selectNodePaths: (source: string, target: string) => void;

  /**
   * Remove selection method.
   */
  removeSelection: (value: string) => void;

  /**
   * Toggle existing selection on/off method.
   */
  toggleSelection: (value: string) => void;

  /**
   * Set internal selections.
   */
  setSelections: (value: string[]) => void;

  /**
   * On click event pass through.
   */
  onNodeClick?: (data: GraphNode) => void;

  /**
   * On canvas click event pass through.
   */
  onCanvasClick?: (event: MouseEvent) => void;
}
`})}),`
`,e.jsx(n.h3,{id:"hotkeys",children:"Hotkeys"}),`
`,e.jsx(n.p,{children:"The hotkeys that are bound via this hook are:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"ctrl/meta + a"}),": Select all nodes"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"escape"}),": Defoucs selections"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"ctrl/meta + click"}),": Toggle node selection"]}),`
`]}),`
`,e.jsx(n.h3,{id:"example",children:"Example"}),`
`,e.jsx(n.p,{children:"A typical example might look like:"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`import { GraphCanvas, GraphCanvasRef, useSelection } from 'reagraph';

export const App = () => {
  const graphRef = useRef<GraphCanvasRef | null>(null);
  const { selections, onNodeClick, onCanvasClick } = useSelection({
    ref: graphRef,
    nodes: myNodes,
    edges: myEdges
  });

  return (
    <GraphCanvas
      ref={graphRef}
      nodes={myNodes}
      edges={myEdges}
      selections={selections}
      onCanvasClick={onCanvasClick}
      onNodeClick={onNodeClick}
    />
  );
};
`})}),`
`,e.jsx(n.h2,{id:"manual-selection",children:"Manual Selection"}),`
`,e.jsxs(n.p,{children:["If you don't wish to use the ",e.jsx(n.code,{children:"useSelection"}),` hook you can handle the selections yourself manually via
passing down a `,e.jsx(n.code,{children:"string[]"})," of ids to the ",e.jsx(n.code,{children:"selections"})," prop."]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`export const App = () => (
  <GraphCanvas
    nodes={complexNodes}
    edges={complexEdges}
    selections={['node-id-1']}
  />
);
`})})]})}function j(s={}){const{wrapper:n}=Object.assign({},t(),s.components);return n?e.jsx(n,Object.assign({},s,{children:e.jsx(o,s)})):o(s)}export{j as default};
