import{j as e}from"./jsx-runtime-DRTy3Uxn.js";import{M as s}from"./index-BxDAS6aZ.js";import"./RadialMenu-BZb6EL-Y.js";import"./index-BBkUAzwr.js";import{useMDXComponents as r}from"./index-DzJSSmSq.js";import"./iframe-NADS3VYa.js";import"../sb-preview/runtime.js";import"./chunk-EIRT5I3Z-DXochb4c.js";import"./index-PqR-_bA4.js";import"./extends-CCbyfPlC.js";import"./index-C7vVqNWd.js";import"./index-DrFu-skq.js";import"./index-27578f8f.esm-CAmGDcI7.js";import"./client-CzthVdz-.js";function t(o){const n=Object.assign({h1:"h1",p:"p",code:"code",pre:"pre",a:"a"},r(),o.components);return e.jsxs(e.Fragment,{children:[e.jsx(s,{title:"Docs/Advanced/Custom Nodes"}),`
`,e.jsx(n.h1,{id:"custom-nodes",children:"Custom Nodes"}),`
`,e.jsx(n.p,{children:`reagraph supports the ability to override the Node shape and
pass your own custom node component.`}),`
`,e.jsxs(n.p,{children:["In the ",e.jsx(n.code,{children:"GraphCanvas"})," you can pass a callback to the ",e.jsx(n.code,{children:"renderNode"}),` function
which passes the following attributes:`]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-ts",children:`export interface NodeRendererProps {
  /**
   * Color of the node. Handles selected/etc.
   */
  color: ColorRepresentation;

  /**
   * The internal node model.
   */
  node: InternalGraphNode;

  /**
   * Size of the node.
   */
  size: number;

  /**
   * Whether the node is active or not.
   */
  active: boolean;

  /**
   * Opacity of the node. Mainly used for selection.
   */
  opacity: number;

  /**
   * Animation of the node.
   */
  animated: boolean;

  /**
   * ID of the node.
   */
  id: string;
}
`})}),`
`,e.jsxs(n.p,{children:["Using ",e.jsx(n.a,{href:"https://github.com/pmndrs/react-three-fiber",target:"_blank",rel:"nofollow noopener noreferrer",children:"react-three-fiber"}),` you can
use JSX to create your own WebGL custom node like:`]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`export const Custom3DNode = () => (
  <GraphCanvas
    nodes={simpleNodes}
    edges={simpleEdges}
    cameraMode="rotate"
    renderNode={({ size, color, opacity }) => (
      <group>
        <mesh>
          <torusKnotGeometry attach="geometry" args={[size, 1.25, 50, 8]} />
          <meshBasicMaterial
            attach="material"
            color={color}
            opacity={opacity}
            transparent
          />
        </mesh>
      </group>
    )}
  />
`})})]})}function y(o={}){const{wrapper:n}=Object.assign({},r(),o.components);return n?e.jsx(n,Object.assign({},o,{children:e.jsx(t,o)})):t(o)}export{y as default};
