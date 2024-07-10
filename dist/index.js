(function() {
  "use strict";
  try {
    if (typeof document != "undefined") {
      var elementStyle = document.createElement("style");
      elementStyle.appendChild(document.createTextNode("._canvas_670zp_1 {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n}\n._container_155l7_1 {\n  transform-origin: bottom right;\n  overflow: hidden;\n  position: absolute;\n  border: solid 1px var(--radial-menu-border);\n}\n\n  ._container_155l7_1._disabled_155l7_7 {\n    opacity: 0.6;\n  }\n\n  ._container_155l7_1._disabled_155l7_7 ._contentContainer_155l7_10 {\n      cursor: not-allowed;\n    }\n\n  ._container_155l7_1:not(._disabled_155l7_7) ._contentContainer_155l7_10 {\n      cursor: pointer;\n    }\n\n  ._container_155l7_1:not(._disabled_155l7_7) ._contentContainer_155l7_10:hover {\n        color: var(--radial-menu-active-color);\n        background: var(--radial-menu-active-background);\n      }\n\n  ._container_155l7_1 ._contentContainer_155l7_10 {\n    width: 200%;\n    height: 200%;\n    transform-origin: 50% 50%;\n    border-radius: 50%;\n    outline: none;\n    transition: background 150ms ease-in-out;\n    color: var(--radial-menu-color);\n  }\n\n  ._container_155l7_1 ._contentContainer_155l7_10 ._contentInner_155l7_35 {\n      position: absolute;\n      width: 100%;\n      text-align: center;\n    }\n\n  ._container_155l7_1 ._contentContainer_155l7_10 ._contentInner_155l7_35 ._content_155l7_10 {\n        display: inline-block;\n      }\n\n  ._container_155l7_1 svg {\n    margin: 0 auto;\n    fill: var(--radial-menu-active-color);\n    height: 25px;\n    width: 25px;\n    display: block;\n  }\n._container_x9hyx_1 {\n  border-radius: 50%;\n  z-index: 9;\n  position: relative;\n  height: 175px;\n  width: 175px;\n  border: solid 5px var(--radial-menu-border);\n  overflow: hidden;\n  background: var(--radial-menu-background);\n}\n\n  ._container_x9hyx_1:before {\n    content: ' ';\n    background: var(--radial-menu-border);\n    border-radius: 50%;\n    height: 25px;\n    width: 25px;\n    position: absolute;\n    z-index: 9;\n    top: 50%;\n    left: 50%;\n    transform: translate(-50%, -50%);\n  }"));
      document.head.appendChild(elementStyle);
    }
  } catch (e) {
    console.error("vite-plugin-css-injected-by-js", e);
  }
})();
var _a, _b;
import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useRef, useCallback, useMemo, useEffect, createContext as createContext$1, useContext, forwardRef, useImperativeHandle, useState, useLayoutEffect, Fragment as Fragment$1, Suspense } from "react";
import { useThree, extend, useFrame, Canvas } from "@react-three/fiber";
import { forceRadial as forceRadial$1, forceSimulation, forceX, forceY, forceCollide, forceManyBody, forceLink, forceCenter, forceZ } from "d3-force-3d";
import { treemap, hierarchy, stratify, tree } from "d3-hierarchy";
import circular from "graphology-layout/circular.js";
import noverlapLayout from "graphology-layout-noverlap";
import forceAtlas2Layout from "graphology-layout-forceatlas2";
import random from "graphology-layout/random.js";
import pagerank from "graphology-metrics/centrality/pagerank.js";
import { degreeCentrality } from "graphology-metrics/centrality/degree.js";
import { scaleLinear } from "d3-scale";
import { create } from "zustand";
import createContext from "zustand/context";
import { Vector3, QuadraticBezierCurve3, LineCurve3, Vector2, Plane, Color, DoubleSide, MOUSE, Vector4, Quaternion, Matrix4, Spherical, Box3, Sphere as Sphere$1, Raycaster, MathUtils, TextureLoader, LinearFilter, TubeGeometry, Euler, BoxGeometry, CylinderGeometry, BufferAttribute, Mesh, Scene } from "three";
import { useGesture } from "react-use-gesture";
import { bidirectional } from "graphology-shortest-path";
import Graph from "graphology";
import { Billboard, Html, Svg as Svg$1, useCursor } from "glodrei";
import ellipsize from "ellipsize";
import { useSpring, a } from "@react-spring/three";
import ThreeCameraControls from "camera-controls";
import { useHotkeys } from "reakeys";
import * as holdEvent from "hold-event";
import { mergeBufferGeometries, SelectionBox } from "three-stdlib";
import classNames from "classnames";
function traverseGraph(nodes, nodeStack = []) {
  const currentDepth = nodeStack.length;
  for (const node of nodes) {
    const idx = nodeStack.indexOf(node);
    if (idx > -1) {
      const loop = [...nodeStack.slice(idx), node].map((d) => d.data.id);
      throw new Error(
        `Invalid Graph: Circular node path detected: ${loop.join(" -> ")}.`
      );
    }
    if (currentDepth > node.depth) {
      node.depth = currentDepth;
      traverseGraph(node.out, [...nodeStack, node]);
    }
  }
}
function getNodeDepth(nodes, links) {
  let invalid = false;
  const graph = nodes.reduce(
    (acc, cur) => ({
      ...acc,
      [cur.id]: {
        data: cur,
        out: [],
        depth: -1,
        ins: []
      }
    }),
    {}
  );
  try {
    for (const link of links) {
      const from = link.source;
      const to = link.target;
      if (!graph.hasOwnProperty(from)) {
        throw new Error(`Missing source Node ${from}`);
      }
      if (!graph.hasOwnProperty(to)) {
        throw new Error(`Missing target Node ${to}`);
      }
      const sourceNode = graph[from];
      const targetNode = graph[to];
      targetNode.ins.push(sourceNode);
      sourceNode.out.push(targetNode);
    }
    traverseGraph(Object.values(graph));
  } catch (e) {
    invalid = true;
  }
  const allDepths = Object.keys(graph).map((id) => graph[id].depth);
  const maxDepth = Math.max(...allDepths);
  return {
    invalid,
    depths: graph,
    maxDepth: maxDepth || 1
  };
}
const RADIALS = ["radialin", "radialout"];
function forceRadial({
  nodes,
  edges,
  mode = "lr",
  nodeLevelRatio = 2
}) {
  const { depths, maxDepth, invalid } = getNodeDepth(nodes, edges);
  if (invalid) {
    return null;
  }
  const modeDistance = RADIALS.includes(mode) ? 1 : 5;
  const dagLevelDistance = nodes.length / maxDepth * nodeLevelRatio * modeDistance;
  if (mode) {
    const getFFn = (fix, invert) => (node) => !fix ? void 0 : (depths[node.id].depth - maxDepth / 2) * dagLevelDistance * (invert ? -1 : 1);
    const fxFn = getFFn(["lr", "rl"].includes(mode), mode === "rl");
    const fyFn = getFFn(["td", "bu"].includes(mode), mode === "td");
    const fzFn = getFFn(["zin", "zout"].includes(mode), mode === "zout");
    nodes.forEach((node) => {
      node.fx = fxFn(node);
      node.fy = fyFn(node);
      node.fz = fzFn(node);
    });
  }
  return RADIALS.includes(mode) ? forceRadial$1((node) => {
    const nodeDepth = depths[node.id];
    const depth = mode === "radialin" ? maxDepth - nodeDepth.depth : nodeDepth.depth;
    return depth * dagLevelDistance;
  }).strength(1) : null;
}
function tick(layout) {
  return new Promise((resolve, _reject) => {
    let stable;
    function run() {
      if (!stable) {
        stable = layout.step();
        run();
      } else {
        resolve(stable);
      }
    }
    run();
  });
}
function buildNodeEdges(graph) {
  const nodes = [];
  const edges = [];
  graph.forEachNode((id, n) => {
    nodes.push({
      ...n,
      id,
      // This is for the clustering
      radius: n.size || 1
    });
  });
  graph.forEachEdge((id, l) => {
    edges.push({ ...l, id });
  });
  return { nodes, edges };
}
function forceInABox() {
  const constant = (_) => () => _;
  const index = (d) => d.index;
  let id = index;
  let nodes = [];
  let links = [];
  let tree2;
  let size = [100, 100];
  let forceNodeSize = constant(1);
  let forceCharge = constant(-1);
  let forceLinkDistance = constant(100);
  let forceLinkStrength = constant(0.1);
  let foci = {};
  let linkStrengthIntraCluster = 0.1;
  let linkStrengthInterCluster = 1e-3;
  let templateNodes = [];
  let offset = [0, 0];
  let templateForce;
  let groupBy = (d) => d.cluster;
  let template = "treemap";
  let enableGrouping = true;
  let strength = 0.1;
  function force(alpha) {
    if (!enableGrouping) {
      return force;
    }
    if (template === "force") {
      templateForce.tick();
      getFocisFromTemplate();
    }
    for (let i = 0, n = nodes.length, node, k = alpha * strength; i < n; ++i) {
      node = nodes[i];
      node.vx += (foci[groupBy(node)].x - node.x) * k;
      node.vy += (foci[groupBy(node)].y - node.y) * k;
    }
  }
  function initialize() {
    if (!nodes) {
      return;
    }
    if (template === "treemap") {
      initializeWithTreemap();
    } else {
      initializeWithForce();
    }
  }
  force.initialize = function(_) {
    nodes = _;
    initialize();
  };
  function getLinkKey(l) {
    let sourceID = groupBy(l.source), targetID = groupBy(l.target);
    return sourceID <= targetID ? sourceID + "~" + targetID : targetID + "~" + sourceID;
  }
  function computeClustersNodeCounts(nodes2) {
    let clustersCounts = /* @__PURE__ */ new Map(), tmpCount = {};
    nodes2.forEach(function(d) {
      if (!clustersCounts.has(groupBy(d))) {
        clustersCounts.set(groupBy(d), { count: 0, sumforceNodeSize: 0 });
      }
    });
    nodes2.forEach(function(d) {
      tmpCount = clustersCounts.get(groupBy(d));
      tmpCount.count = tmpCount.count + 1;
      tmpCount.sumforceNodeSize = tmpCount.sumforceNodeSize + // @ts-ignore
      Math.PI * (forceNodeSize(d) * forceNodeSize(d)) * 1.3;
      clustersCounts.set(groupBy(d), tmpCount);
    });
    return clustersCounts;
  }
  function computeClustersLinkCounts(links2) {
    let dClusterLinks = /* @__PURE__ */ new Map(), clusterLinks = [];
    links2.forEach(function(l) {
      let key = getLinkKey(l), count;
      if (dClusterLinks.has(key)) {
        count = dClusterLinks.get(key);
      } else {
        count = 0;
      }
      count += 1;
      dClusterLinks.set(key, count);
    });
    dClusterLinks.forEach(function(value, key) {
      let source, target;
      source = key.split("~")[0];
      target = key.split("~")[1];
      if (source !== void 0 && target !== void 0) {
        clusterLinks.push({
          source,
          target,
          count: value
        });
      }
    });
    return clusterLinks;
  }
  function getGroupsGraph() {
    let gnodes = [];
    let glinks = [];
    let dNodes = /* @__PURE__ */ new Map();
    let c;
    let i;
    let cc;
    let clustersCounts;
    let clustersLinks;
    clustersCounts = computeClustersNodeCounts(nodes);
    clustersLinks = computeClustersLinkCounts(links);
    for (c of clustersCounts.keys()) {
      cc = clustersCounts.get(c);
      gnodes.push({
        id: c,
        size: cc.count,
        r: Math.sqrt(cc.sumforceNodeSize / Math.PI)
      });
      dNodes.set(c, i);
    }
    clustersLinks.forEach(function(l) {
      let source = dNodes.get(l.source), target = dNodes.get(l.target);
      if (source !== void 0 && target !== void 0) {
        glinks.push({
          source,
          target,
          count: l.count
        });
      }
    });
    return { nodes: gnodes, links: glinks };
  }
  function getGroupsTree() {
    let children = [];
    let c;
    let cc;
    let clustersCounts;
    clustersCounts = computeClustersNodeCounts(force.nodes());
    for (c of clustersCounts.keys()) {
      cc = clustersCounts.get(c);
      children.push({ id: c, size: cc.count });
    }
    return { id: "clustersTree", children };
  }
  function getFocisFromTemplate() {
    foci.none = { x: 0, y: 0 };
    templateNodes.forEach(function(d) {
      if (template === "treemap") {
        foci[d.data.id] = {
          x: d.x0 + (d.x1 - d.x0) / 2 - offset[0],
          y: d.y0 + (d.y1 - d.y0) / 2 - offset[1]
        };
      } else {
        foci[d.id] = {
          x: d.x - offset[0],
          y: d.y - offset[1]
        };
      }
    });
    return foci;
  }
  function initializeWithTreemap() {
    let sim = treemap().size(force.size());
    tree2 = hierarchy(getGroupsTree()).sum((d) => d.radius).sort(function(a2, b) {
      return b.height - a2.height || b.value - a2.value;
    });
    templateNodes = sim(tree2).leaves();
    getFocisFromTemplate();
  }
  function checkLinksAsObjects() {
    let linkCount = 0;
    if (nodes.length === 0)
      return;
    links.forEach(function(link) {
      let source, target;
      if (!nodes) {
        return;
      }
      source = link.source;
      target = link.target;
      if (typeof link.source !== "object") {
        source = nodes.find((n) => n.id === link.source);
      }
      if (typeof link.target !== "object") {
        target = nodes.find((n) => n.id === link.target);
      }
      if (source === void 0 || target === void 0) {
        throw Error(
          "Error setting links, couldnt find nodes for a link (see it on the console)"
        );
      }
      link.source = source;
      link.target = target;
      link.index = linkCount++;
    });
  }
  function initializeWithForce() {
    let net;
    if (!nodes || !nodes.length) {
      return;
    }
    checkLinksAsObjects();
    net = getGroupsGraph();
    templateForce = forceSimulation(net.nodes).force("x", forceX(size[0] / 2).strength(0.1)).force("y", forceY(size[1] / 2).strength(0.1)).force("collide", forceCollide((d) => d.r).iterations(4)).force("charge", forceManyBody().strength(forceCharge)).force(
      "links",
      forceLink(net.nodes.length ? net.links : []).distance(forceLinkDistance).strength(forceLinkStrength)
    );
    templateNodes = templateForce.nodes();
    getFocisFromTemplate();
  }
  force.template = function(x) {
    if (!arguments.length) {
      return template;
    }
    template = x;
    initialize();
    return force;
  };
  force.groupBy = function(x) {
    if (!arguments.length) {
      return groupBy;
    }
    if (typeof x === "string") {
      groupBy = function(d) {
        return d[x];
      };
      return force;
    }
    groupBy = x;
    return force;
  };
  force.enableGrouping = function(x) {
    if (!arguments.length) {
      return enableGrouping;
    }
    enableGrouping = x;
    return force;
  };
  force.strength = function(x) {
    if (!arguments.length) {
      return strength;
    }
    strength = x;
    return force;
  };
  force.getLinkStrength = function(e) {
    if (enableGrouping) {
      if (groupBy(e.source) === groupBy(e.target)) {
        if (typeof linkStrengthIntraCluster === "function") {
          return linkStrengthIntraCluster(e);
        } else {
          return linkStrengthIntraCluster;
        }
      } else {
        if (typeof linkStrengthInterCluster === "function") {
          return linkStrengthInterCluster(e);
        } else {
          return linkStrengthInterCluster;
        }
      }
    } else {
      if (typeof linkStrengthIntraCluster === "function") {
        return linkStrengthIntraCluster(e);
      } else {
        return linkStrengthIntraCluster;
      }
    }
  };
  force.id = function(_) {
    return arguments.length ? (id = _, force) : id;
  };
  force.size = function(_) {
    return arguments.length ? (size = _, force) : size;
  };
  force.linkStrengthInterCluster = function(_) {
    return arguments.length ? (linkStrengthInterCluster = _, force) : linkStrengthInterCluster;
  };
  force.linkStrengthIntraCluster = function(_) {
    return arguments.length ? (linkStrengthIntraCluster = _, force) : linkStrengthIntraCluster;
  };
  force.nodes = function(_) {
    return arguments.length ? (nodes = _, force) : nodes;
  };
  force.links = function(_) {
    if (!arguments.length) {
      return links;
    }
    if (_ === null) {
      links = [];
    } else {
      links = _;
    }
    initialize();
    return force;
  };
  force.template = function(x) {
    if (!arguments.length) {
      return template;
    }
    template = x;
    initialize();
    return force;
  };
  force.forceNodeSize = function(_) {
    return arguments.length ? (forceNodeSize = typeof _ === "function" ? _ : constant(+_), initialize(), force) : forceNodeSize;
  };
  force.nodeSize = force.forceNodeSize;
  force.forceCharge = function(_) {
    return arguments.length ? (forceCharge = typeof _ === "function" ? _ : constant(+_), initialize(), force) : forceCharge;
  };
  force.forceLinkDistance = function(_) {
    return arguments.length ? (forceLinkDistance = typeof _ === "function" ? _ : constant(+_), initialize(), force) : forceLinkDistance;
  };
  force.forceLinkStrength = function(_) {
    return arguments.length ? (forceLinkStrength = typeof _ === "function" ? _ : constant(+_), initialize(), force) : forceLinkStrength;
  };
  force.offset = function(_) {
    return arguments.length ? (offset = typeof _ === "function" ? _ : constant(+_), force) : offset;
  };
  force.getFocis = getFocisFromTemplate;
  return force;
}
function forceDirected({
  graph,
  nodeLevelRatio = 2,
  mode = null,
  dimensions = 2,
  nodeStrength = -250,
  linkDistance = 50,
  clusterStrength = 0.5,
  linkStrengthInterCluster = 0.01,
  linkStrengthIntraCluster = 0.5,
  forceLinkDistance = 100,
  forceLinkStrength = 0.1,
  clusterType = "force",
  forceCharge = -700,
  getNodePosition,
  drags,
  clusterAttribute,
  forceLayout
}) {
  const { nodes, edges } = buildNodeEdges(graph);
  const is2d = dimensions === 2;
  const nodeStrengthAdjustment = is2d && edges.length > 25 ? nodeStrength * 2 : nodeStrength;
  let forceX$1;
  let forceY$1;
  if (forceLayout === "forceDirected2d") {
    forceX$1 = forceX();
    forceY$1 = forceY();
  } else {
    forceX$1 = forceX(600).strength(0.05);
    forceY$1 = forceY(600).strength(0.05);
  }
  const sim = forceSimulation().force("center", forceCenter(0, 0)).force("link", forceLink()).force("charge", forceManyBody().strength(nodeStrengthAdjustment)).force("x", forceX$1).force("y", forceY$1).force("z", forceZ()).force(
    "collide",
    forceCollide((d) => d.radius + 10)
  ).force(
    "dagRadial",
    forceRadial({
      nodes,
      edges,
      mode,
      nodeLevelRatio
    })
  ).stop();
  let groupingForce;
  if (clusterAttribute) {
    let forceChargeAdjustment = forceCharge;
    if (nodes == null ? void 0 : nodes.length) {
      const adjustmentFactor = Math.ceil(nodes.length / 200);
      forceChargeAdjustment = forceCharge * adjustmentFactor;
    }
    groupingForce = forceInABox().strength(clusterStrength).template(clusterType).groupBy((d) => d.data[clusterAttribute]).links(edges).size([100, 100]).linkStrengthInterCluster(linkStrengthInterCluster).linkStrengthIntraCluster(linkStrengthIntraCluster).forceLinkDistance(forceLinkDistance).forceLinkStrength(forceLinkStrength).forceCharge(forceChargeAdjustment).forceNodeSize((d) => d.radius);
  }
  let layout = sim.numDimensions(dimensions).nodes(nodes);
  if (groupingForce) {
    layout = layout.force("group", groupingForce);
  }
  if (linkDistance) {
    let linkForce = layout.force("link");
    if (linkForce) {
      linkForce.id((d) => d.id).links(edges).distance(linkDistance);
      if (groupingForce) {
        linkForce = linkForce.strength((groupingForce == null ? void 0 : groupingForce.getLinkStrength) ?? 0.1);
      }
    }
  }
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  return {
    step() {
      while (sim.alpha() > 0.01) {
        sim.tick();
      }
      return true;
    },
    getNodePosition(id) {
      var _a2, _b2;
      if (getNodePosition) {
        const pos = getNodePosition(id, { graph, drags, nodes, edges });
        if (pos) {
          return pos;
        }
      }
      if ((_a2 = drags == null ? void 0 : drags[id]) == null ? void 0 : _a2.position) {
        return (_b2 = drags == null ? void 0 : drags[id]) == null ? void 0 : _b2.position;
      }
      return nodeMap.get(id);
    }
  };
}
function circular2d({
  graph,
  radius,
  drags,
  getNodePosition
}) {
  const layout = circular(graph, {
    scale: radius
  });
  const { nodes, edges } = buildNodeEdges(graph);
  return {
    step() {
      return true;
    },
    getNodePosition(id) {
      var _a2, _b2;
      if (getNodePosition) {
        const pos = getNodePosition(id, { graph, drags, nodes, edges });
        if (pos) {
          return pos;
        }
      }
      if ((_a2 = drags == null ? void 0 : drags[id]) == null ? void 0 : _a2.position) {
        return (_b2 = drags == null ? void 0 : drags[id]) == null ? void 0 : _b2.position;
      }
      return layout == null ? void 0 : layout[id];
    }
  };
}
const DIRECTION_MAP = {
  td: {
    x: "x",
    y: "y",
    factor: -1
  },
  lr: {
    x: "y",
    y: "x",
    factor: 1
  }
};
function hierarchical({
  graph,
  drags,
  mode = "td",
  nodeSeparation = 1,
  nodeSize = [50, 50],
  getNodePosition
}) {
  const { nodes, edges } = buildNodeEdges(graph);
  const { depths } = getNodeDepth(nodes, edges);
  const rootNodes = Object.keys(depths).map((d) => depths[d]);
  const root = stratify().id((d) => d.data.id).parentId((d) => {
    var _a2, _b2, _c;
    return (_c = (_b2 = (_a2 = d.ins) == null ? void 0 : _a2[0]) == null ? void 0 : _b2.data) == null ? void 0 : _c.id;
  })(rootNodes);
  const treeRoot = tree().separation(() => nodeSeparation).nodeSize(nodeSize)(hierarchy(root));
  const treeNodes = treeRoot.descendants();
  const path = DIRECTION_MAP[mode];
  const mappedNodes = new Map(
    nodes.map((n) => {
      const { x, y } = treeNodes.find((t) => t.data.id === n.id);
      return [
        n.id,
        {
          ...n,
          [path.x]: x * path.factor,
          [path.y]: y * path.factor,
          z: 0
        }
      ];
    })
  );
  return {
    step() {
      return true;
    },
    getNodePosition(id) {
      var _a2, _b2;
      if (getNodePosition) {
        const pos = getNodePosition(id, { graph, drags, nodes, edges });
        if (pos) {
          return pos;
        }
      }
      if ((_a2 = drags == null ? void 0 : drags[id]) == null ? void 0 : _a2.position) {
        return (_b2 = drags == null ? void 0 : drags[id]) == null ? void 0 : _b2.position;
      }
      return mappedNodes.get(id);
    }
  };
}
function nooverlap({
  graph,
  margin,
  drags,
  getNodePosition,
  ratio,
  gridSize,
  maxIterations
}) {
  const { nodes, edges } = buildNodeEdges(graph);
  const layout = noverlapLayout(graph, {
    maxIterations,
    inputReducer: (_key, attr) => ({
      ...attr,
      // Have to specify defaults for the engine
      x: attr.x || 0,
      y: attr.y || 0
    }),
    settings: {
      ratio,
      margin,
      gridSize
    }
  });
  return {
    step() {
      return true;
    },
    getNodePosition(id) {
      var _a2, _b2;
      if (getNodePosition) {
        const pos = getNodePosition(id, { graph, drags, nodes, edges });
        if (pos) {
          return pos;
        }
      }
      if ((_a2 = drags == null ? void 0 : drags[id]) == null ? void 0 : _a2.position) {
        return (_b2 = drags == null ? void 0 : drags[id]) == null ? void 0 : _b2.position;
      }
      return layout == null ? void 0 : layout[id];
    }
  };
}
function forceAtlas2({
  graph,
  drags,
  iterations,
  ...rest
}) {
  random.assign(graph);
  const layout = forceAtlas2Layout(graph, {
    iterations,
    settings: rest
  });
  return {
    step() {
      return true;
    },
    getNodePosition(id) {
      var _a2;
      return ((_a2 = drags == null ? void 0 : drags[id]) == null ? void 0 : _a2.position) || (layout == null ? void 0 : layout[id]);
    }
  };
}
function custom({ graph, drags, getNodePosition }) {
  const { nodes, edges } = buildNodeEdges(graph);
  return {
    step() {
      return true;
    },
    getNodePosition(id) {
      return getNodePosition(id, { graph, drags, nodes, edges });
    }
  };
}
const FORCE_LAYOUTS = [
  "forceDirected2d",
  "treeTd2d",
  "treeLr2d",
  "radialOut2d",
  "treeTd3d",
  "treeLr3d",
  "radialOut3d",
  "forceDirected3d"
];
function layoutProvider({
  type,
  ...rest
}) {
  if (FORCE_LAYOUTS.includes(type)) {
    const { nodeStrength, linkDistance, nodeLevelRatio } = rest;
    if (type === "forceDirected2d") {
      return forceDirected({
        ...rest,
        dimensions: 2,
        nodeLevelRatio: nodeLevelRatio || 2,
        nodeStrength: nodeStrength || -250,
        linkDistance,
        forceLayout: type
      });
    } else if (type === "treeTd2d") {
      return forceDirected({
        ...rest,
        mode: "td",
        dimensions: 2,
        nodeLevelRatio: nodeLevelRatio || 5,
        nodeStrength: nodeStrength || -250,
        linkDistance: linkDistance || 50,
        forceLayout: type
      });
    } else if (type === "treeLr2d") {
      return forceDirected({
        ...rest,
        mode: "lr",
        dimensions: 2,
        nodeLevelRatio: nodeLevelRatio || 5,
        nodeStrength: nodeStrength || -250,
        linkDistance: linkDistance || 50,
        forceLayout: type
      });
    } else if (type === "radialOut2d") {
      return forceDirected({
        ...rest,
        mode: "radialout",
        dimensions: 2,
        nodeLevelRatio: nodeLevelRatio || 5,
        nodeStrength: nodeStrength || -500,
        linkDistance: linkDistance || 100,
        forceLayout: type
      });
    } else if (type === "treeTd3d") {
      return forceDirected({
        ...rest,
        mode: "td",
        dimensions: 3,
        nodeLevelRatio: nodeLevelRatio || 2,
        nodeStrength: nodeStrength || -500,
        linkDistance: linkDistance || 50
      });
    } else if (type === "treeLr3d") {
      return forceDirected({
        ...rest,
        mode: "lr",
        dimensions: 3,
        nodeLevelRatio: nodeLevelRatio || 2,
        nodeStrength: nodeStrength || -500,
        linkDistance: linkDistance || 50,
        forceLayout: type
      });
    } else if (type === "radialOut3d") {
      return forceDirected({
        ...rest,
        mode: "radialout",
        dimensions: 3,
        nodeLevelRatio: nodeLevelRatio || 2,
        nodeStrength: nodeStrength || -500,
        linkDistance: linkDistance || 100,
        forceLayout: type
      });
    } else if (type === "forceDirected3d") {
      return forceDirected({
        ...rest,
        dimensions: 3,
        nodeLevelRatio: nodeLevelRatio || 2,
        nodeStrength: nodeStrength || -250,
        linkDistance,
        forceLayout: type
      });
    }
  } else if (type === "circular2d") {
    const { radius } = rest;
    return circular2d({
      ...rest,
      radius: radius || 300
    });
  } else if (type === "hierarchicalTd") {
    return hierarchical({ ...rest, mode: "td" });
  } else if (type === "hierarchicalLr") {
    return hierarchical({ ...rest, mode: "lr" });
  } else if (type === "nooverlap") {
    const { graph, maxIterations, ratio, margin, gridSize, ...settings } = rest;
    return nooverlap({
      type: "nooverlap",
      graph,
      margin: margin || 10,
      maxIterations: maxIterations || 50,
      ratio: ratio || 10,
      gridSize: gridSize || 20,
      ...settings
    });
  } else if (type === "forceatlas2") {
    const { graph, iterations, gravity, scalingRatio, ...settings } = rest;
    return forceAtlas2({
      type: "forceatlas2",
      graph,
      ...settings,
      scalingRatio: scalingRatio || 100,
      gravity: gravity || 10,
      iterations: iterations || 50
    });
  } else if (type === "custom") {
    return custom({
      type: "custom",
      ...rest
    });
  }
  throw new Error(`Layout ${type} not found.`);
}
function recommendLayout(nodes, edges) {
  const { invalid } = getNodeDepth(nodes, edges);
  const nodeCount = nodes.length;
  if (!invalid) {
    if (nodeCount > 100) {
      return "radialOut2d";
    } else {
      return "treeTd2d";
    }
  }
  return "forceDirected2d";
}
function calcLabelVisibility({
  nodeCount,
  nodePosition,
  labelType,
  camera
}) {
  return (shape, size) => {
    var _a2;
    if (camera && nodePosition && ((_a2 = camera == null ? void 0 : camera.position) == null ? void 0 : _a2.z) / (camera == null ? void 0 : camera.zoom) - (nodePosition == null ? void 0 : nodePosition.z) > 6e3) {
      return false;
    }
    if (labelType === "all") {
      return true;
    } else if (labelType === "nodes" && shape === "node") {
      return true;
    } else if (labelType === "edges" && shape === "edge") {
      return true;
    } else if (labelType === "auto" && shape === "node") {
      if (size > 7) {
        return true;
      } else if (camera && nodePosition && camera.position.z / camera.zoom - nodePosition.z < 3e3) {
        return true;
      }
    }
    return false;
  };
}
function getLabelOffsetByType(offset, position) {
  switch (position) {
    case "above":
      return offset;
    case "below":
      return -offset;
    case "inline":
    case "natural":
    default:
      return 0;
  }
}
function pageRankSizing({
  graph
}) {
  const ranks = pagerank(graph);
  return {
    ranks,
    getSizeForNode: (nodeID) => ranks[nodeID] * 80
  };
}
function centralitySizing({
  graph
}) {
  const ranks = degreeCentrality(graph);
  return {
    ranks,
    getSizeForNode: (nodeID) => ranks[nodeID] * 20
  };
}
function attributeSizing({
  graph,
  attribute,
  defaultSize
}) {
  const map = /* @__PURE__ */ new Map();
  if (attribute) {
    graph.forEachNode((id, node) => {
      var _a2;
      const size = (_a2 = node.data) == null ? void 0 : _a2[attribute];
      if (isNaN(size)) {
        console.warn(`Attribute ${size} is not a number for node ${node.id}`);
      }
      map.set(id, size || 0);
    });
  } else {
    console.warn("Attribute sizing configured but no attribute provided");
  }
  return {
    getSizeForNode: (nodeId) => {
      if (!attribute || !map) {
        return defaultSize;
      }
      return map.get(nodeId);
    }
  };
}
const providers = {
  pagerank: pageRankSizing,
  centrality: centralitySizing,
  attribute: attributeSizing,
  none: ({ defaultSize }) => ({
    getSizeForNode: (_id) => defaultSize
  })
};
function nodeSizeProvider({ type, ...rest }) {
  var _a2;
  const provider = (_a2 = providers[type]) == null ? void 0 : _a2.call(providers, rest);
  if (!provider && type !== "default") {
    throw new Error(`Unknown sizing strategy: ${type}`);
  }
  const { graph, minSize, maxSize } = rest;
  const sizes = /* @__PURE__ */ new Map();
  let min;
  let max;
  graph.forEachNode((id, node) => {
    let size;
    if (type === "default") {
      size = node.size || rest.defaultSize;
    } else {
      size = provider.getSizeForNode(id);
    }
    if (min === void 0 || size < min) {
      min = size;
    }
    if (max === void 0 || size > max) {
      max = size;
    }
    sizes.set(id, size);
  });
  if (type !== "none") {
    const scale = scaleLinear().domain([min, max]).rangeRound([minSize, maxSize]);
    for (const [nodeId, size] of sizes) {
      sizes.set(nodeId, scale(size));
    }
  }
  return sizes;
}
function buildGraph(graph, nodes, edges) {
  graph.clear();
  for (const node of nodes) {
    try {
      graph.addNode(node.id, node);
    } catch ({ message }) {
      console.error(`[Graph] ${message}`);
    }
  }
  for (const edge of edges) {
    try {
      graph.addEdge(edge.source, edge.target, edge);
    } catch ({ message }) {
      console.error(`[Graph] ${message}`);
    }
  }
  return graph;
}
function transformGraph({
  graph,
  layout,
  sizingType,
  labelType,
  sizingAttribute,
  defaultNodeSize,
  minNodeSize,
  maxNodeSize
}) {
  const nodes = [];
  const edges = [];
  const map = /* @__PURE__ */ new Map();
  const sizes = nodeSizeProvider({
    graph,
    type: sizingType,
    attribute: sizingAttribute,
    minSize: minNodeSize,
    maxSize: maxNodeSize,
    defaultSize: defaultNodeSize
  });
  const nodeCount = graph.nodes().length;
  const checkVisibility = calcLabelVisibility({ nodeCount, labelType });
  graph.forEachNode((id, node) => {
    const position = layout.getNodePosition(id);
    const { data, fill, icon, label, size, ...rest } = node;
    const nodeSize = sizes.get(node.id);
    const labelVisible = checkVisibility("node", nodeSize);
    const nodeLinks = graph.inboundNeighbors(node.id) || [];
    const parents = nodeLinks.map((n2) => graph.getNodeAttributes(n2));
    const n = {
      ...node,
      size: nodeSize,
      labelVisible,
      label,
      icon,
      fill,
      parents,
      data: {
        ...rest,
        ...data ?? {}
      },
      position: {
        ...position,
        x: position.x || 0,
        y: position.y || 0,
        z: position.z || 1
      }
    };
    map.set(node.id, n);
    nodes.push(n);
  });
  graph.forEachEdge((_id, link) => {
    const from = map.get(link.source);
    const to = map.get(link.target);
    if (from && to) {
      const { data, id, label, size, ...rest } = link;
      const labelVisible = checkVisibility("edge", size);
      edges.push({
        ...link,
        id,
        label,
        labelVisible,
        size,
        data: {
          ...rest,
          id,
          ...data || {}
        }
      });
    }
  });
  return {
    nodes,
    edges
  };
}
const animationConfig = {
  mass: 10,
  tension: 1e3,
  friction: 300,
  // Decreasing precision to improve performance from 0.00001
  precision: 0.1
};
function getArrowVectors(placement, curve, arrowLength) {
  const curveLength = curve.getLength();
  const absSize = placement === "end" ? curveLength : curveLength / 2;
  const offset = placement === "end" ? arrowLength / 2 : 0;
  const u = (absSize - offset) / curveLength;
  const position = curve.getPointAt(u);
  const rotation = curve.getTangentAt(u);
  return [position, rotation];
}
function getArrowSize(size) {
  return [size + 6, 2 + size / 1.5];
}
const MULTI_EDGE_OFFSET_FACTOR = 0.7;
function getMidPoint(from, to, offset = 0) {
  const fromVector = new Vector3(from.x, from.y || 0, from.z || 0);
  const toVector = new Vector3(to.x, to.y || 0, to.z || 0);
  const midVector = new Vector3().addVectors(fromVector, toVector).divideScalar(2);
  return midVector.setLength(midVector.length() + offset);
}
function getCurvePoints(from, to, offset = -1) {
  const fromVector = from.clone();
  const toVector = to.clone();
  const v = new Vector3().subVectors(toVector, fromVector);
  const vlen = v.length();
  const vn = v.clone().normalize();
  const vv = new Vector3().subVectors(toVector, fromVector).divideScalar(2);
  const k = Math.abs(vn.x) % 1;
  const b = new Vector3(-vn.y, vn.x - k * vn.z, k * vn.y).normalize();
  const vm = new Vector3().add(fromVector).add(vv).add(b.multiplyScalar(vlen / 4).multiplyScalar(offset));
  return [from, vm, to];
}
function getCurve(from, fromOffset, to, toOffset, curved, curveOffset) {
  const offsetFrom = getPointBetween(from, to, fromOffset);
  const offsetTo = getPointBetween(to, from, toOffset);
  return curved ? new QuadraticBezierCurve3(
    ...getCurvePoints(offsetFrom, offsetTo, curveOffset)
  ) : new LineCurve3(offsetFrom, offsetTo);
}
function getVector(node) {
  return new Vector3(node.position.x, node.position.y, node.position.z || 0);
}
function getPointBetween(from, to, offset) {
  const distance = from.distanceTo(to);
  return from.clone().add(
    to.clone().sub(from).multiplyScalar(offset / distance)
  );
}
function updateNodePosition(node, offset) {
  return {
    ...node,
    position: {
      ...node.position,
      x: node.position.x + offset.x,
      y: node.position.y + offset.y,
      z: node.position.z + offset.z
    }
  };
}
function calculateEdgeCurveOffset({ edge, edges, curved }) {
  let updatedCurved = curved;
  let curveOffset;
  const parallelEdges = edges.filter((e) => e.target === edge.target && e.source === edge.source).map((e) => e.id);
  if (parallelEdges.length > 1) {
    updatedCurved = true;
    const edgeIndex = parallelEdges.indexOf(edge.id);
    if (parallelEdges.length === 2) {
      curveOffset = edgeIndex === 0 ? MULTI_EDGE_OFFSET_FACTOR : -MULTI_EDGE_OFFSET_FACTOR;
    } else {
      curveOffset = (edgeIndex - Math.floor(parallelEdges.length / 2)) * MULTI_EDGE_OFFSET_FACTOR;
    }
  }
  return { curved: updatedCurved, curveOffset };
}
function getLayoutCenter(nodes) {
  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  let minZ = Number.POSITIVE_INFINITY;
  let maxZ = Number.NEGATIVE_INFINITY;
  for (let node of nodes) {
    minX = Math.min(minX, node.position.x);
    maxX = Math.max(maxX, node.position.x);
    minY = Math.min(minY, node.position.y);
    maxY = Math.max(maxY, node.position.y);
    minZ = Math.min(minZ, node.position.z);
    maxZ = Math.max(maxZ, node.position.z);
  }
  return {
    height: maxY - minY,
    width: maxX - minX,
    minX,
    maxX,
    minY,
    maxY,
    minZ,
    maxZ,
    x: (maxX + minX) / 2,
    y: (maxY + minY) / 2,
    z: (maxZ + minZ) / 2
  };
}
function buildClusterGroups(nodes, clusterAttribute) {
  if (!clusterAttribute) {
    return /* @__PURE__ */ new Map();
  }
  return nodes.reduce((entryMap, e) => {
    const val = e.data[clusterAttribute];
    if (val) {
      entryMap.set(val, [...entryMap.get(val) || [], e]);
    }
    return entryMap;
  }, /* @__PURE__ */ new Map());
}
function calculateClusters({
  nodes,
  clusterAttribute
}) {
  const result = /* @__PURE__ */ new Map();
  if (clusterAttribute) {
    const groups = buildClusterGroups(nodes, clusterAttribute);
    for (const [key, nodes2] of groups) {
      const position = getLayoutCenter(nodes2);
      result.set(key, {
        label: key,
        nodes: nodes2,
        position
      });
    }
  }
  return result;
}
const useHoverIntent = ({
  sensitivity = 7,
  interval = 50,
  timeout = 0,
  disabled: disabled2,
  onPointerOver,
  onPointerOut
}) => {
  const mouseOver = useRef(false);
  const timer = useRef(null);
  const state = useRef(0);
  const coords = useRef({
    x: null,
    y: null,
    px: null,
    py: null
  });
  const onMouseMove = useCallback((event) => {
    coords.current.x = event.clientX;
    coords.current.y = event.clientY;
  }, []);
  const comparePosition = useCallback(
    (event) => {
      timer.current = clearTimeout(timer.current);
      const { px, x, py, y } = coords.current;
      if (Math.abs(px - x) + Math.abs(py - y) < sensitivity) {
        state.current = 1;
        onPointerOver(event);
      } else {
        coords.current.px = x;
        coords.current.py = y;
        timer.current = setTimeout(() => comparePosition(event), interval);
      }
    },
    [interval, onPointerOver, sensitivity]
  );
  const cleanup = useCallback(() => {
    clearTimeout(timer.current);
    if (typeof window !== "undefined") {
      document.removeEventListener("mousemove", onMouseMove, false);
    }
  }, [onMouseMove]);
  const pointerOver = useCallback(
    (event) => {
      if (!disabled2) {
        mouseOver.current = true;
        cleanup();
        if (state.current !== 1) {
          coords.current.px = event.pointer.x;
          coords.current.py = event.pointer.y;
          if (typeof window !== "undefined") {
            document.addEventListener("mousemove", onMouseMove, false);
          }
          timer.current = setTimeout(() => comparePosition(event), timeout);
        }
      }
    },
    [cleanup, comparePosition, disabled2, onMouseMove, timeout]
  );
  const delay = useCallback(
    (event) => {
      timer.current = clearTimeout(timer.current);
      state.current = 0;
      onPointerOut(event);
    },
    [onPointerOut]
  );
  const pointerOut = useCallback(
    (event) => {
      mouseOver.current = false;
      cleanup();
      if (state.current === 1) {
        timer.current = setTimeout(() => delay(event), timeout);
      }
    },
    [cleanup, delay, timeout]
  );
  return {
    pointerOver,
    pointerOut
  };
};
const useDrag = ({
  draggable,
  set,
  position,
  onDragStart,
  onDragEnd
}) => {
  const camera = useThree((state) => state.camera);
  const raycaster = useThree((state) => state.raycaster);
  const size = useThree((state) => state.size);
  const gl = useThree((state) => state.gl);
  const { mouse2D, mouse3D, offset, normal, plane } = useMemo(
    () => ({
      // Normalized 2D screen space mouse coords
      mouse2D: new Vector2(),
      // 3D world space mouse coords
      mouse3D: new Vector3(),
      // Drag point offset from object origin
      offset: new Vector3(),
      // Normal of the drag plane
      normal: new Vector3(),
      // Drag plane
      plane: new Plane()
    }),
    []
  );
  const clientRect = useMemo(
    () => gl.domElement.getBoundingClientRect(),
    [gl.domElement]
  );
  return useGesture(
    {
      onDragStart: ({ event }) => {
        const { eventObject, point } = event;
        eventObject.getWorldPosition(offset).sub(point);
        mouse3D.copy(point);
        onDragStart();
      },
      onDrag: ({ event }) => {
        const nx = (event.clientX - ((clientRect == null ? void 0 : clientRect.left) ?? 0)) / size.width * 2 - 1;
        const ny = -((event.clientY - ((clientRect == null ? void 0 : clientRect.top) ?? 0)) / size.height) * 2 + 1;
        mouse2D.set(nx, ny);
        raycaster.setFromCamera(mouse2D, camera);
        camera.getWorldDirection(normal).negate();
        plane.setFromNormalAndCoplanarPoint(normal, mouse3D);
        raycaster.ray.intersectPlane(plane, mouse3D);
        const updated = new Vector3(position.x, position.y, position.z).copy(mouse3D).add(offset);
        return set(updated);
      },
      onDragEnd
    },
    { drag: { enabled: draggable, threshold: 10 } }
  );
};
function findPath(graph, source, target) {
  return bidirectional(graph, source, target);
}
const { Provider, useStore } = createContext();
const createStore = ({
  actives = [],
  selections = [],
  collapsedNodeIds = [],
  theme
}) => create((set) => ({
  theme: {
    ...theme,
    edge: {
      ...theme.edge,
      label: {
        ...theme.edge.label,
        fontSize: theme.edge.label.fontSize ?? 6
      }
    }
  },
  edges: [],
  nodes: [],
  collapsedNodeIds,
  clusters: /* @__PURE__ */ new Map(),
  panning: false,
  draggingId: null,
  actives,
  edgeContextMenus: /* @__PURE__ */ new Set(),
  edgeMeshes: [],
  selections,
  drags: {},
  graph: new Graph({ multi: true }),
  setTheme: (theme2) => set((state) => ({ ...state, theme: theme2 })),
  setClusters: (clusters) => set((state) => ({ ...state, clusters })),
  setEdgeContextMenus: (edgeContextMenus) => set((state) => ({
    ...state,
    edgeContextMenus
  })),
  setEdgeMeshes: (edgeMeshes) => set((state) => ({ ...state, edgeMeshes })),
  setPanning: (panning) => set((state) => ({ ...state, panning })),
  setDrags: (drags) => set((state) => ({ ...state, drags })),
  setDraggingId: (draggingId) => set((state) => ({ ...state, draggingId })),
  setActives: (actives2) => set((state) => ({ ...state, actives: actives2 })),
  setSelections: (selections2) => set((state) => ({ ...state, selections: selections2 })),
  setNodes: (nodes) => set((state) => ({
    ...state,
    nodes,
    centerPosition: getLayoutCenter(nodes)
  })),
  setEdges: (edges) => set((state) => ({ ...state, edges })),
  setNodePosition: (id, position) => set((state) => {
    var _a2, _b2;
    const node = state.nodes.find((n) => n.id === id);
    const originalVector = getVector(node);
    const newVector = new Vector3(position.x, position.y, position.z);
    const offset = newVector.sub(originalVector);
    const nodes = [...state.nodes];
    if ((_a2 = state.selections) == null ? void 0 : _a2.includes(id)) {
      (_b2 = state.selections) == null ? void 0 : _b2.forEach((id2) => {
        const node2 = state.nodes.find((n) => n.id === id2);
        if (node2) {
          const nodeIndex = state.nodes.indexOf(node2);
          nodes[nodeIndex] = updateNodePosition(node2, offset);
        }
      });
    } else {
      const nodeIndex = state.nodes.indexOf(node);
      nodes[nodeIndex] = updateNodePosition(node, offset);
    }
    return {
      ...state,
      drags: {
        ...state.drags,
        [id]: node
      },
      nodes
    };
  }),
  setCollapsedNodeIds: (nodeIds = []) => set((state) => ({ ...state, collapsedNodeIds: nodeIds }))
}));
function getHiddenChildren({
  nodeId,
  nodes,
  edges,
  currentHiddenNodes,
  currentHiddenEdges
}) {
  const hiddenNodes = [];
  const hiddenEdges = [];
  const curHiddenNodeIds = currentHiddenNodes.map((n) => n.id);
  const curHiddenEdgeIds = currentHiddenEdges.map((e) => e.id);
  const outboundEdges = edges.filter((l) => l.source === nodeId);
  const outboundEdgeNodeIds = outboundEdges.map((l) => l.target);
  hiddenEdges.push(...outboundEdges);
  for (const outboundEdgeNodeId of outboundEdgeNodeIds) {
    const incomingEdges = edges.filter(
      (l) => l.target === outboundEdgeNodeId && l.source !== nodeId
    );
    let hideNode = false;
    if (incomingEdges.length === 0) {
      hideNode = true;
    } else if (incomingEdges.length > 0 && !curHiddenNodeIds.includes(outboundEdgeNodeId)) {
      const inboundNodeLinkIds = incomingEdges.map((l) => l.id);
      if (inboundNodeLinkIds.every((i) => curHiddenEdgeIds.includes(i))) {
        hideNode = true;
      }
    }
    if (hideNode) {
      const node = nodes.find((n) => n.id === outboundEdgeNodeId);
      if (node) {
        hiddenNodes.push(node);
      }
      const nested = getHiddenChildren({
        nodeId: outboundEdgeNodeId,
        nodes,
        edges,
        currentHiddenEdges: hiddenEdges,
        currentHiddenNodes: hiddenNodes
      });
      hiddenEdges.push(...nested.hiddenEdges);
      hiddenNodes.push(...nested.hiddenNodes);
    }
  }
  const uniqueEdges = Object.values(
    hiddenEdges.reduce(
      (acc, next) => ({
        ...acc,
        [next.id]: next
      }),
      {}
    )
  );
  const uniqueNodes = Object.values(
    hiddenNodes.reduce(
      (acc, next) => ({
        ...acc,
        [next.id]: next
      }),
      {}
    )
  );
  return {
    hiddenEdges: uniqueEdges,
    hiddenNodes: uniqueNodes
  };
}
const getVisibleEntities = ({
  collapsedIds,
  nodes,
  edges
}) => {
  const curHiddenNodes = [];
  const curHiddenEdges = [];
  for (const collapsedId of collapsedIds) {
    const { hiddenEdges, hiddenNodes } = getHiddenChildren({
      nodeId: collapsedId,
      nodes,
      edges,
      currentHiddenEdges: curHiddenEdges,
      currentHiddenNodes: curHiddenNodes
    });
    curHiddenNodes.push(...hiddenNodes);
    curHiddenEdges.push(...hiddenEdges);
  }
  const hiddenNodeIds = curHiddenNodes.map((n) => n.id);
  const hiddenEdgeIds = curHiddenEdges.map((e) => e.id);
  const visibleNodes = nodes.filter((n) => !hiddenNodeIds.includes(n.id));
  const visibleEdges = edges.filter((e) => !hiddenEdgeIds.includes(e.id));
  return {
    visibleNodes,
    visibleEdges
  };
};
const getExpandPath = ({
  nodeId,
  edges,
  visibleEdgeIds
}) => {
  const parentIds = [];
  const inboundEdges = edges.filter((l) => l.target === nodeId);
  const inboundEdgeIds = inboundEdges.map((e) => e.id);
  const hasVisibleInboundEdge = inboundEdgeIds.some(
    (id) => visibleEdgeIds.includes(id)
  );
  if (hasVisibleInboundEdge) {
    return parentIds;
  }
  const inboundEdgeNodeIds = inboundEdges.map((l) => l.source);
  let addedParent = false;
  for (const inboundNodeId of inboundEdgeNodeIds) {
    if (!addedParent) {
      parentIds.push(
        ...[
          inboundNodeId,
          ...getExpandPath({ nodeId: inboundNodeId, edges, visibleEdgeIds })
        ]
      );
      addedParent = true;
    }
  }
  return parentIds;
};
const useCollapse = ({
  collapsedNodeIds = [],
  nodes = [],
  edges = []
}) => {
  const getIsCollapsed = useCallback(
    (nodeId) => {
      const { visibleNodes } = getVisibleEntities({
        nodes,
        edges,
        collapsedIds: collapsedNodeIds
      });
      const visibleNodeIds = visibleNodes.map((n) => n.id);
      return !visibleNodeIds.includes(nodeId);
    },
    [collapsedNodeIds, edges, nodes]
  );
  const getExpandPathIds = useCallback(
    (nodeId) => {
      const { visibleEdges } = getVisibleEntities({
        nodes,
        edges,
        collapsedIds: collapsedNodeIds
      });
      const visibleEdgeIds = visibleEdges.map((e) => e.id);
      return getExpandPath({ nodeId, edges, visibleEdgeIds });
    },
    [collapsedNodeIds, edges, nodes]
  );
  return {
    getIsCollapsed,
    getExpandPathIds
  };
};
const useGraph = ({
  layoutType,
  sizingType,
  labelType,
  sizingAttribute,
  clusterAttribute,
  selections,
  nodes,
  edges,
  actives,
  collapsedNodeIds,
  defaultNodeSize,
  maxNodeSize,
  minNodeSize,
  layoutOverrides
}) => {
  const graph = useStore((state) => state.graph);
  const setClusters = useStore((state) => state.setClusters);
  const stateCollapsedNodeIds = useStore((state) => state.collapsedNodeIds);
  const setEdges = useStore((state) => state.setEdges);
  const stateNodes = useStore((state) => state.nodes);
  const setNodes = useStore((state) => state.setNodes);
  const setSelections = useStore((state) => state.setSelections);
  const setActives = useStore((state) => state.setActives);
  const drags = useStore((state) => state.drags);
  const setDrags = useStore((state) => state.setDrags);
  const setCollapsedNodeIds = useStore((state) => state.setCollapsedNodeIds);
  const layoutMounted = useRef(false);
  const layout = useRef(null);
  const camera = useThree((state) => state.camera);
  const { visibleEdges, visibleNodes } = useMemo(
    () => getVisibleEntities({
      collapsedIds: stateCollapsedNodeIds,
      nodes,
      edges
    }),
    [stateCollapsedNodeIds, nodes, edges]
  );
  const dragRef = useRef(drags);
  useEffect(() => {
    dragRef.current = drags;
  }, [drags]);
  const updateLayout = useCallback(
    async (curLayout) => {
      layout.current = curLayout || layoutProvider({
        ...layoutOverrides,
        type: layoutType,
        graph,
        drags: dragRef.current,
        clusterAttribute
      });
      await tick(layout.current);
      const result = transformGraph({
        graph,
        layout: layout.current,
        sizingType,
        labelType,
        sizingAttribute,
        maxNodeSize,
        minNodeSize,
        defaultNodeSize
      });
      const clusters = calculateClusters({
        nodes: result.nodes,
        clusterAttribute
      });
      setEdges(result.edges);
      setNodes(result.nodes);
      setClusters(clusters);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      layoutOverrides,
      layoutType,
      clusterAttribute,
      sizingType,
      labelType,
      sizingAttribute,
      maxNodeSize,
      minNodeSize,
      defaultNodeSize,
      setEdges,
      setNodes,
      setClusters
    ]
  );
  useEffect(() => {
    const nodes2 = stateNodes.map((node) => ({
      ...node,
      labelVisible: calcLabelVisibility({
        nodeCount: stateNodes == null ? void 0 : stateNodes.length,
        labelType,
        camera,
        nodePosition: node == null ? void 0 : node.position
      })("node", node == null ? void 0 : node.size)
    }));
    const isVisibilityUpdated = nodes2.some(
      (node, i) => node.labelVisible !== stateNodes[i].labelVisible
    );
    if (isVisibilityUpdated) {
      setNodes(nodes2);
    }
  }, [camera, camera.zoom, camera.position.z, setNodes, stateNodes, labelType]);
  useEffect(() => {
    if (layoutMounted.current) {
      setSelections(selections);
    }
  }, [selections, setSelections]);
  useEffect(() => {
    if (layoutMounted.current) {
      setActives(actives);
    }
  }, [actives, setActives]);
  useEffect(() => {
    async function update() {
      layoutMounted.current = false;
      buildGraph(graph, visibleNodes, visibleEdges);
      await updateLayout();
      layoutMounted.current = true;
    }
    update();
  }, [visibleNodes, visibleEdges]);
  useEffect(() => {
    if (layoutMounted.current) {
      setCollapsedNodeIds(collapsedNodeIds);
    }
  }, [collapsedNodeIds, setCollapsedNodeIds]);
  useEffect(() => {
    if (layoutMounted.current) {
      dragRef.current = {};
      setDrags({});
      updateLayout();
    }
  }, [layoutType, updateLayout, setDrags]);
  useEffect(() => {
    if (layoutMounted.current) {
      updateLayout(layout.current);
    }
  }, [sizingType, sizingAttribute, labelType, updateLayout]);
};
const Label = ({
  text,
  fontSize,
  fontUrl,
  color,
  opacity,
  stroke,
  active,
  rotation,
  maxWidth = 100,
  ellipsis = 100,
  backgroundColor,
  borderRadius
}) => {
  const shortText = ellipsis && !active ? ellipsize(text, ellipsis) : text;
  const normalizedBackgroundColor = useMemo(
    () => new Color(backgroundColor),
    [backgroundColor]
  );
  const normalizedColor = useMemo(() => new Color(color), [color]);
  return /* @__PURE__ */ jsx(Billboard, { position: [0, 0, 1], children: /* @__PURE__ */ jsx(Html, { center: true, children: /* @__PURE__ */ jsx(
    "div",
    {
      style: {
        backgroundColor: `${normalizedBackgroundColor.getStyle()}`,
        borderRadius,
        padding: "5px",
        display: "inline-block",
        maxWidth,
        overflowWrap: "break-word",
        transform: `rotate(${rotation}deg)`
      },
      children: /* @__PURE__ */ jsx(
        "span",
        {
          style: {
            fontFamily: fontUrl,
            fontSize,
            color: `${normalizedColor.getStyle()}`,
            opacity,
            textAlign: "center",
            textDecoration: active ? "underline" : "none"
          },
          children: shortText
        }
      )
    }
  ) }) });
};
Label.defaultProps = {
  opacity: 1,
  fontSize: 7,
  color: "#2A6475",
  ellipsis: 100
};
const Ring = ({
  color,
  size,
  opacity,
  animated,
  strokeWidth,
  innerRadius = 4,
  segments = 25
}) => {
  const normalizedColor = useMemo(() => new Color(color), [color]);
  const { ringSize, ringOpacity } = useSpring({
    from: {
      ringOpacity: 0,
      ringSize: [1e-5, 1e-5, 1e-5]
    },
    to: {
      ringOpacity: opacity,
      ringSize: [size / 2, size / 2, 1]
    },
    config: {
      ...animationConfig,
      duration: animated ? void 0 : 0
    }
  });
  const strokeWidthFraction = strokeWidth / 10;
  const outerRadius = innerRadius + strokeWidthFraction;
  return /* @__PURE__ */ jsx(Billboard, { position: [0, 0, 1], children: /* @__PURE__ */ jsxs(a.mesh, { scale: ringSize, children: [
    /* @__PURE__ */ jsx(
      "ringGeometry",
      {
        attach: "geometry",
        args: [innerRadius, outerRadius, segments]
      }
    ),
    /* @__PURE__ */ jsx(
      a.meshBasicMaterial,
      {
        attach: "material",
        color: normalizedColor,
        transparent: true,
        depthTest: false,
        opacity: ringOpacity,
        side: DoubleSide,
        fog: true
      }
    )
  ] }) });
};
Ring.defaultProps = {
  color: "#D8E6EA",
  size: 1,
  opacity: 0.5,
  strokeWidth: 5
};
const Sphere = ({
  color,
  id,
  size,
  active,
  selected,
  opacity,
  animated
}) => {
  const { scale, nodeOpacity } = useSpring({
    from: {
      // Note: This prevents incorrect scaling w/ 0
      scale: [1e-5, 1e-5, 1e-5],
      nodeOpacity: 0
    },
    to: {
      scale: [size, size, size],
      nodeOpacity: opacity
    },
    config: {
      ...animationConfig,
      duration: animated ? void 0 : 0
    }
  });
  const normalizedColor = useMemo(() => new Color(color), [color]);
  const theme = useStore((state) => state.theme);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(a.mesh, { userData: { id, type: "node" }, scale, children: [
      /* @__PURE__ */ jsx("sphereGeometry", { attach: "geometry", args: [1, 25, 25] }),
      /* @__PURE__ */ jsx(
        a.meshPhongMaterial,
        {
          attach: "material",
          side: DoubleSide,
          transparent: true,
          fog: true,
          opacity: nodeOpacity,
          color: normalizedColor
        }
      )
    ] }),
    /* @__PURE__ */ jsx(
      Ring,
      {
        opacity: selected ? 0.5 : 0,
        size,
        animated,
        color: selected ? theme.ring.activeFill : theme.ring.fill
      }
    )
  ] });
};
Sphere.defaultProps = {
  opacity: 1,
  active: false
};
const CameraControlsContext = createContext$1({
  controls: null,
  resetControls: () => void 0,
  zoomIn: () => void 0,
  zoomOut: () => void 0,
  dollyIn: () => void 0,
  dollyOut: () => void 0,
  panLeft: () => void 0,
  panRight: () => void 0,
  panUp: () => void 0,
  panDown: () => void 0
});
const useCameraControls = () => {
  const context = useContext(CameraControlsContext);
  if (context === void 0) {
    throw new Error(
      "`useCameraControls` hook must be used within a `ControlsProvider` component"
    );
  }
  return context;
};
ThreeCameraControls.install({
  THREE: {
    MOUSE,
    Vector2,
    Vector3,
    Vector4,
    Quaternion,
    Matrix4,
    Spherical,
    Box3,
    Sphere: Sphere$1,
    Raycaster,
    MathUtils: {
      DEG2RAD: (_a = MathUtils) == null ? void 0 : _a.DEG2RAD,
      clamp: (_b = MathUtils) == null ? void 0 : _b.clamp
    }
  }
});
extend({ ThreeCameraControls });
const KEY_CODES = {
  ARROW_LEFT: 37,
  ARROW_UP: 38,
  ARROW_RIGHT: 39,
  ARROW_DOWN: 40
};
const leftKey = new holdEvent.KeyboardKeyHold(KEY_CODES.ARROW_LEFT, 100);
const rightKey = new holdEvent.KeyboardKeyHold(KEY_CODES.ARROW_RIGHT, 100);
const upKey = new holdEvent.KeyboardKeyHold(KEY_CODES.ARROW_UP, 100);
const downKey = new holdEvent.KeyboardKeyHold(KEY_CODES.ARROW_DOWN, 100);
const CameraControls = forwardRef(
  ({ mode, children, animated, disabled: disabled2, minDistance, maxDistance }, ref) => {
    const cameraRef = useRef(null);
    const camera = useThree((state) => state.camera);
    const gl = useThree((state) => state.gl);
    const isOrbiting = mode === "orbit";
    const setPanning = useStore((state) => state.setPanning);
    const draggingId = useStore((state) => state.draggingId);
    useFrame((_state, delta) => {
      var _a2, _b2;
      if ((_a2 = cameraRef.current) == null ? void 0 : _a2.enabled) {
        (_b2 = cameraRef.current) == null ? void 0 : _b2.update(delta);
      }
      if (isOrbiting) {
        cameraRef.current.azimuthAngle += 20 * delta * MathUtils.DEG2RAD;
      }
    }, -1);
    useEffect(() => () => {
      var _a2;
      return (_a2 = cameraRef.current) == null ? void 0 : _a2.dispose();
    }, []);
    const zoomIn = useCallback(() => {
      var _a2;
      (_a2 = cameraRef.current) == null ? void 0 : _a2.zoom(camera.zoom / 2, animated);
    }, [animated, camera.zoom]);
    const zoomOut = useCallback(() => {
      var _a2;
      (_a2 = cameraRef.current) == null ? void 0 : _a2.zoom(-camera.zoom / 2, animated);
    }, [animated, camera.zoom]);
    const dollyIn = useCallback(
      (distance) => {
        var _a2;
        (_a2 = cameraRef.current) == null ? void 0 : _a2.dolly(distance, animated);
      },
      [animated]
    );
    const dollyOut = useCallback(
      (distance) => {
        var _a2;
        (_a2 = cameraRef.current) == null ? void 0 : _a2.dolly(distance, animated);
      },
      [animated]
    );
    const panRight = useCallback(
      (event) => {
        var _a2;
        if (!isOrbiting) {
          (_a2 = cameraRef.current) == null ? void 0 : _a2.truck(-0.03 * event.deltaTime, 0, animated);
        }
      },
      [animated, isOrbiting]
    );
    const panLeft = useCallback(
      (event) => {
        var _a2;
        if (!isOrbiting) {
          (_a2 = cameraRef.current) == null ? void 0 : _a2.truck(0.03 * event.deltaTime, 0, animated);
        }
      },
      [animated, isOrbiting]
    );
    const panUp = useCallback(
      (event) => {
        var _a2;
        if (!isOrbiting) {
          (_a2 = cameraRef.current) == null ? void 0 : _a2.truck(0, 0.03 * event.deltaTime, animated);
        }
      },
      [animated, isOrbiting]
    );
    const panDown = useCallback(
      (event) => {
        var _a2;
        if (!isOrbiting) {
          (_a2 = cameraRef.current) == null ? void 0 : _a2.truck(0, -0.03 * event.deltaTime, animated);
        }
      },
      [animated, isOrbiting]
    );
    const onKeyDown = useCallback(
      (event) => {
        if (event.code === "Space") {
          if (mode === "rotate") {
            cameraRef.current.mouseButtons.left = ThreeCameraControls.ACTION.TRUCK;
          } else {
            cameraRef.current.mouseButtons.left = ThreeCameraControls.ACTION.ROTATE;
          }
        }
      },
      [mode]
    );
    const onKeyUp = useCallback(
      (event) => {
        if (event.code === "Space") {
          if (mode === "rotate") {
            cameraRef.current.mouseButtons.left = ThreeCameraControls.ACTION.ROTATE;
          } else {
            cameraRef.current.mouseButtons.left = ThreeCameraControls.ACTION.TRUCK;
          }
        }
      },
      [mode]
    );
    useEffect(() => {
      if (!disabled2) {
        leftKey.addEventListener("holding", panLeft);
        rightKey.addEventListener("holding", panRight);
        upKey.addEventListener("holding", panUp);
        downKey.addEventListener("holding", panDown);
        if (typeof window !== "undefined") {
          window.addEventListener("keydown", onKeyDown);
          window.addEventListener("keyup", onKeyUp);
        }
      }
      return () => {
        leftKey.removeEventListener("holding", panLeft);
        rightKey.removeEventListener("holding", panRight);
        upKey.removeEventListener("holding", panUp);
        downKey.removeEventListener("holding", panDown);
        if (typeof window !== "undefined") {
          window.removeEventListener("keydown", onKeyDown);
          window.removeEventListener("keyup", onKeyUp);
        }
      };
    }, [disabled2, onKeyDown, onKeyUp, panDown, panLeft, panRight, panUp]);
    useEffect(() => {
      if (disabled2) {
        cameraRef.current.mouseButtons.left = ThreeCameraControls.ACTION.NONE;
        cameraRef.current.mouseButtons.middle = ThreeCameraControls.ACTION.NONE;
        cameraRef.current.mouseButtons.wheel = ThreeCameraControls.ACTION.NONE;
      } else {
        cameraRef.current.mouseButtons.left = ThreeCameraControls.ACTION.TRUCK;
        cameraRef.current.mouseButtons.middle = ThreeCameraControls.ACTION.TRUCK;
        cameraRef.current.mouseButtons.wheel = ThreeCameraControls.ACTION.DOLLY;
      }
    }, [disabled2]);
    useEffect(() => {
      const onControl = () => setPanning(true);
      const onControlEnd = () => setPanning(false);
      const ref2 = cameraRef.current;
      if (ref2) {
        ref2.addEventListener("control", onControl);
        ref2.addEventListener("controlend", onControlEnd);
      }
      return () => {
        if (ref2) {
          ref2.removeEventListener("control", onControl);
          ref2.removeEventListener("controlend", onControlEnd);
        }
      };
    }, [cameraRef, setPanning]);
    useEffect(() => {
      if (draggingId) {
        cameraRef.current.mouseButtons.left = ThreeCameraControls.ACTION.NONE;
      } else {
        if (mode === "rotate") {
          cameraRef.current.mouseButtons.left = ThreeCameraControls.ACTION.ROTATE;
        } else {
          cameraRef.current.mouseButtons.left = ThreeCameraControls.ACTION.TRUCK;
        }
      }
    }, [draggingId, mode]);
    useHotkeys([
      {
        name: "Zoom In",
        disabled: disabled2,
        category: "Graph",
        keys: "command+shift+i",
        callback: (event) => {
          event.preventDefault();
          zoomIn();
        }
      },
      {
        name: "Zoom Out",
        category: "Graph",
        disabled: disabled2,
        keys: "command+shift+o",
        callback: (event) => {
          event.preventDefault();
          zoomOut();
        }
      }
    ]);
    const values = useMemo(
      () => ({
        controls: cameraRef.current,
        zoomIn: () => zoomIn(),
        zoomOut: () => zoomOut(),
        dollyIn: (distance = 1e3) => dollyIn(distance),
        dollyOut: (distance = -1e3) => dollyOut(distance),
        panLeft: (deltaTime = 100) => panLeft({ deltaTime }),
        panRight: (deltaTime = 100) => panRight({ deltaTime }),
        panDown: (deltaTime = 100) => panDown({ deltaTime }),
        panUp: (deltaTime = 100) => panUp({ deltaTime }),
        resetControls: (animated2) => {
          var _a2;
          return (_a2 = cameraRef.current) == null ? void 0 : _a2.reset(animated2);
        }
      }),
      // eslint-disable-next-line
      [zoomIn, zoomOut, panLeft, panRight, panDown, panUp, cameraRef.current]
    );
    useImperativeHandle(ref, () => values);
    return /* @__PURE__ */ jsxs(CameraControlsContext.Provider, { value: values, children: [
      /* @__PURE__ */ jsx(
        "threeCameraControls",
        {
          ref: cameraRef,
          args: [camera, gl.domElement],
          smoothTime: 0.1,
          minDistance,
          dollyToCursor: true,
          maxDistance
        }
      ),
      children
    ] });
  }
);
CameraControls.defaultProps = {
  mode: "rotate",
  minDistance: 1e3,
  maxDistance: 5e4
};
function visibleHeightAtZDepth(depth, camera) {
  const cameraOffset = camera.position.z;
  if (depth < cameraOffset)
    depth -= cameraOffset;
  else
    depth += cameraOffset;
  const vFOV = camera.fov / camera.zoom * Math.PI / 180;
  return 2 * Math.tan(vFOV / 2) * Math.abs(depth);
}
function visibleWidthAtZDepth(depth, camera) {
  const height = visibleHeightAtZDepth(depth, camera);
  return height * camera.aspect;
}
function isNodeInView(camera, nodePosition) {
  var _a2, _b2, _c, _d;
  const visibleWidth = visibleWidthAtZDepth(1, camera);
  const visibleHeight = visibleHeightAtZDepth(1, camera);
  const visibleArea = {
    x0: ((_a2 = camera == null ? void 0 : camera.position) == null ? void 0 : _a2.x) - visibleWidth / 2,
    x1: ((_b2 = camera == null ? void 0 : camera.position) == null ? void 0 : _b2.x) + visibleWidth / 2,
    y0: ((_c = camera == null ? void 0 : camera.position) == null ? void 0 : _c.y) - visibleHeight / 2,
    y1: ((_d = camera == null ? void 0 : camera.position) == null ? void 0 : _d.y) + visibleHeight / 2
  };
  return (nodePosition == null ? void 0 : nodePosition.x) > visibleArea.x0 && (nodePosition == null ? void 0 : nodePosition.x) < visibleArea.x1 && (nodePosition == null ? void 0 : nodePosition.y) > visibleArea.y0 && (nodePosition == null ? void 0 : nodePosition.y) < visibleArea.y1;
}
function getClosestAxis(angle, axes) {
  return axes.reduce(
    (prev, curr) => Math.abs(curr - angle % Math.PI) < Math.abs(prev - angle % Math.PI) ? curr : prev
  );
}
function getDegreesToClosest2dAxis(horizontalAngle, verticalAngle) {
  const closestHorizontalAxis = getClosestAxis(horizontalAngle, [0, Math.PI]);
  const closestVerticalAxis = getClosestAxis(verticalAngle, [
    Math.PI / 2,
    3 * Math.PI / 2
  ]);
  return {
    horizontalRotation: closestHorizontalAxis - horizontalAngle % Math.PI,
    verticalRotation: closestVerticalAxis - verticalAngle % Math.PI
  };
}
const PADDING = 50;
const useCenterGraph = ({
  animated,
  disabled: disabled2,
  layoutType
}) => {
  const nodes = useStore((state) => state.nodes);
  const [isCentered, setIsCentered] = useState(false);
  const invalidate = useThree((state) => state.invalidate);
  const { controls } = useCameraControls();
  const camera = useThree((state) => state.camera);
  const mounted = useRef(false);
  const centerNodes = useCallback(
    async (nodes2, opts) => {
      const animated2 = (opts == null ? void 0 : opts.animated) !== void 0 ? opts == null ? void 0 : opts.animated : true;
      const centerOnlyIfNodesNotInView = (opts == null ? void 0 : opts.centerOnlyIfNodesNotInView) !== void 0 ? opts == null ? void 0 : opts.centerOnlyIfNodesNotInView : false;
      if (!mounted.current || !centerOnlyIfNodesNotInView || centerOnlyIfNodesNotInView && (nodes2 == null ? void 0 : nodes2.some((node) => !isNodeInView(camera, node.position)))) {
        const { x, y, z } = getLayoutCenter(nodes2);
        await controls.setTarget(x, y, z, animated2);
        if (!isCentered) {
          setIsCentered(true);
        }
        invalidate();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [invalidate, controls, nodes]
  );
  const fitNodesInView = useCallback(
    async (nodes2, opts = { animated: true, fitOnlyIfNodesNotInView: false }) => {
      const { fitOnlyIfNodesNotInView } = opts;
      if (!fitOnlyIfNodesNotInView || fitOnlyIfNodesNotInView && (nodes2 == null ? void 0 : nodes2.some((node) => !isNodeInView(camera, node.position)))) {
        const { minX, maxX, minY, maxY, minZ, maxZ } = getLayoutCenter(nodes2);
        if (!layoutType.includes("3d")) {
          const { horizontalRotation, verticalRotation } = getDegreesToClosest2dAxis(
            controls == null ? void 0 : controls.azimuthAngle,
            controls == null ? void 0 : controls.polarAngle
          );
          void (controls == null ? void 0 : controls.rotate(horizontalRotation, verticalRotation, true));
        }
        await (controls == null ? void 0 : controls.zoomTo(1, opts == null ? void 0 : opts.animated));
        await (controls == null ? void 0 : controls.fitToBox(
          new Box3(
            new Vector3(minX, minY, minZ),
            new Vector3(maxX, maxY, maxZ)
          ),
          opts == null ? void 0 : opts.animated,
          {
            cover: false,
            paddingLeft: PADDING,
            paddingRight: PADDING,
            paddingBottom: PADDING,
            paddingTop: PADDING
          }
        ));
      }
    },
    [camera, controls, layoutType]
  );
  const getNodesById = useCallback(
    (nodeIds) => {
      let mappedNodes = null;
      if (nodeIds == null ? void 0 : nodeIds.length) {
        mappedNodes = nodeIds.reduce((acc, id) => {
          const node = nodes.find((n) => n.id === id);
          if (node) {
            acc.push(node);
          } else {
            throw new Error(
              `Attempted to center ${id} but it was not found in the nodes`
            );
          }
          return acc;
        }, []);
      }
      return mappedNodes;
    },
    [nodes]
  );
  const centerNodesById = useCallback(
    (nodeIds, opts) => {
      const mappedNodes = getNodesById(nodeIds);
      centerNodes(mappedNodes || nodes, {
        animated,
        centerOnlyIfNodesNotInView: opts == null ? void 0 : opts.centerOnlyIfNodesNotInView
      });
    },
    [animated, centerNodes, getNodesById, nodes]
  );
  const fitNodesInViewById = useCallback(
    async (nodeIds, opts) => {
      const mappedNodes = getNodesById(nodeIds);
      await fitNodesInView(mappedNodes || nodes, { animated, ...opts });
    },
    [animated, fitNodesInView, getNodesById, nodes]
  );
  useLayoutEffect(() => {
    async function load() {
      if (controls && (nodes == null ? void 0 : nodes.length)) {
        if (!mounted.current) {
          await centerNodes(nodes, { animated: false });
          await fitNodesInView(nodes, { animated: false });
          mounted.current = true;
        }
      }
    }
    load();
  }, [controls, centerNodes, nodes, animated, camera, fitNodesInView]);
  useHotkeys([
    {
      name: "Center",
      disabled: disabled2,
      category: "Graph",
      keys: ["command+shift+c"],
      callback: () => centerNodes(nodes)
    }
  ]);
  return { centerNodes, centerNodesById, fitNodesInViewById, isCentered };
};
const Icon = ({ image, id, size, opacity, animated }) => {
  const texture = useMemo(() => new TextureLoader().load(image), [image]);
  const { scale, spriteOpacity } = useSpring({
    from: {
      scale: [1e-5, 1e-5, 1e-5],
      spriteOpacity: 0
    },
    to: {
      scale: [size, size, size],
      spriteOpacity: opacity
    },
    config: {
      ...animationConfig,
      duration: animated ? void 0 : 0
    }
  });
  return /* @__PURE__ */ jsx(a.sprite, { userData: { id, type: "node" }, scale, children: /* @__PURE__ */ jsx(
    a.spriteMaterial,
    {
      attach: "material",
      opacity: spriteOpacity,
      fog: true,
      depthTest: false,
      transparent: true,
      side: DoubleSide,
      children: /* @__PURE__ */ jsx("primitive", { attach: "map", object: texture, minFilter: LinearFilter })
    }
  ) });
};
Icon.defaultProps = {
  opacity: 1
};
const SphereWithIcon = ({
  color,
  id,
  size,
  opacity,
  node,
  active,
  animated,
  image,
  selected
}) => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Sphere,
    {
      id,
      selected,
      size,
      opacity,
      animated,
      color,
      node,
      active
    }
  ),
  /* @__PURE__ */ jsx(
    Icon,
    {
      id,
      image,
      selected,
      size: size + 8,
      opacity,
      animated,
      color,
      node,
      active
    }
  )
] });
SphereWithIcon.defaultProps = {
  opacity: 1,
  active: false
};
const Svg = ({
  id,
  image,
  color,
  size,
  opacity,
  animated,
  ...rest
}) => {
  const normalizedSize = size / 25;
  const { scale } = useSpring({
    from: {
      scale: [1e-5, 1e-5, 1e-5]
    },
    to: {
      scale: [normalizedSize, normalizedSize, normalizedSize]
    },
    config: {
      ...animationConfig,
      duration: animated ? void 0 : 0
    }
  });
  const normalizedColor = useMemo(() => new Color(color), [color]);
  return /* @__PURE__ */ jsx(a.group, { userData: { id, type: "node" }, scale, children: /* @__PURE__ */ jsx(Billboard, { position: [0, 0, 1], children: /* @__PURE__ */ jsx(
    Svg$1,
    {
      ...rest,
      src: image,
      fillMaterial: {
        fog: true,
        depthTest: false,
        transparent: true,
        color: normalizedColor,
        opacity,
        side: DoubleSide,
        ...rest.fillMaterial || {}
      },
      fillMeshProps: {
        // Note: This is a hack to get the svg to
        // render in the correct position.
        position: [-25, -25, 1],
        ...rest.fillMeshProps || {}
      }
    }
  ) }) });
};
Svg.defaultProps = {
  opacity: 1
};
const SphereWithSvg = ({
  color,
  id,
  size,
  opacity,
  node,
  svgFill,
  active,
  animated,
  image,
  selected,
  ...rest
}) => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Sphere,
    {
      id,
      selected,
      size,
      opacity,
      animated,
      color,
      node,
      active
    }
  ),
  /* @__PURE__ */ jsx(
    Svg,
    {
      ...rest,
      id,
      selected,
      image,
      size,
      opacity,
      animated,
      color: svgFill,
      node,
      active
    }
  )
] });
SphereWithSvg.defaultProps = {
  opacity: 1,
  active: false
};
const Node = ({
  animated,
  disabled: disabled2,
  id,
  draggable,
  labelFontUrl,
  contextMenu,
  onClick,
  onDoubleClick,
  onPointerOver,
  onDragged,
  onPointerOut,
  onContextMenu,
  renderNode
}) => {
  var _a2, _b2, _c;
  const cameraControls = useCameraControls();
  const theme = useStore((state) => state.theme);
  const node = useStore((state) => state.nodes.find((n) => n.id === id));
  const edges = useStore((state) => state.edges);
  const draggingId = useStore((state) => state.draggingId);
  const collapsedNodeIds = useStore((state) => state.collapsedNodeIds);
  const setDraggingId = useStore((state) => state.setDraggingId);
  const setNodePosition = useStore((state) => state.setNodePosition);
  const setCollapsedNodeIds = useStore((state) => state.setCollapsedNodeIds);
  const isCollapsed = useStore((state) => state.collapsedNodeIds.includes(id));
  const isActive = useStore((state) => {
    var _a3;
    return (_a3 = state.actives) == null ? void 0 : _a3.includes(id);
  });
  const isSelected = useStore((state) => {
    var _a3;
    return (_a3 = state.selections) == null ? void 0 : _a3.includes(id);
  });
  const hasSelections = useStore((state) => {
    var _a3;
    return ((_a3 = state.selections) == null ? void 0 : _a3.length) > 0;
  });
  const center = useStore((state) => state.centerPosition);
  const isDragging = draggingId === id;
  const {
    position,
    label,
    subLabel,
    size: nodeSize = 7,
    labelVisible = true
  } = node;
  const group = useRef(null);
  const [active, setActive] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const shouldHighlight = active || isSelected || isActive;
  const selectionOpacity = hasSelections ? shouldHighlight ? theme.node.selectedOpacity : theme.node.inactiveOpacity : theme.node.opacity;
  const canCollapse = useMemo(() => {
    const outboundLinks = edges.filter((l) => l.source === id);
    return outboundLinks.length > 0 || isCollapsed;
  }, [edges, id, isCollapsed]);
  const onCollapse = useCallback(() => {
    if (canCollapse) {
      if (isCollapsed) {
        setCollapsedNodeIds(collapsedNodeIds.filter((p) => p !== id));
      } else {
        setCollapsedNodeIds([...collapsedNodeIds, id]);
      }
    }
  }, [canCollapse, collapsedNodeIds, id, isCollapsed, setCollapsedNodeIds]);
  const [{ nodePosition, labelPosition, subLabelPosition }] = useSpring(
    () => ({
      from: {
        nodePosition: center ? [center.x, center.y, 0] : [0, 0, 0],
        labelPosition: [0, -(nodeSize + 7), 2],
        subLabelPosition: [0, -(nodeSize + 14), 2]
      },
      to: {
        nodePosition: position ? [
          position.x,
          position.y,
          shouldHighlight ? position.z + 1 : position.z
        ] : [0, 0, 0],
        labelPosition: [0, -(nodeSize + 7), 2],
        subLabelPosition: [0, -(nodeSize + 14), 2]
      },
      config: {
        ...animationConfig,
        duration: animated && !draggingId ? void 0 : 0
      }
    }),
    [isDragging, position, animated, nodeSize, shouldHighlight]
  );
  const bind = useDrag({
    draggable,
    position,
    // @ts-ignore
    set: (pos) => setNodePosition(id, pos),
    onDragStart: () => {
      setDraggingId(id);
      setActive(true);
    },
    onDragEnd: () => {
      setDraggingId(null);
      setActive(false);
      onDragged == null ? void 0 : onDragged(node);
    }
  });
  useCursor(active && !draggingId && onClick !== void 0, "pointer");
  useCursor(
    active && draggable && !isDragging && onClick === void 0,
    "grab"
  );
  useCursor(isDragging, "grabbing");
  const combinedActiveState = shouldHighlight || isDragging;
  const color = combinedActiveState ? theme.node.activeFill : node.fill || theme.node.fill;
  const { pointerOver, pointerOut } = useHoverIntent({
    disabled: disabled2 || isDragging,
    onPointerOver: (event) => {
      cameraControls.controls.truckSpeed = 0;
      setActive(true);
      onPointerOver == null ? void 0 : onPointerOver(node, event);
    },
    onPointerOut: (event) => {
      cameraControls.controls.truckSpeed = 2;
      setActive(false);
      onPointerOut == null ? void 0 : onPointerOut(node, event);
    }
  });
  const nodeComponent = useMemo(
    () => renderNode ? renderNode({
      id,
      color,
      size: nodeSize,
      active: combinedActiveState,
      opacity: selectionOpacity,
      animated,
      selected: isSelected,
      node
    }) : /* @__PURE__ */ jsx(Fragment, { children: node.icon ? /* @__PURE__ */ jsx(
      Icon,
      {
        id,
        image: node.icon || "",
        size: nodeSize + 8,
        opacity: selectionOpacity,
        animated,
        color,
        node,
        active: combinedActiveState,
        selected: isSelected
      }
    ) : /* @__PURE__ */ jsx(
      Sphere,
      {
        id,
        size: nodeSize,
        opacity: selectionOpacity,
        animated,
        color,
        node,
        active: combinedActiveState,
        selected: isSelected
      }
    ) }),
    [
      renderNode,
      id,
      color,
      nodeSize,
      combinedActiveState,
      selectionOpacity,
      animated,
      isSelected,
      node
    ]
  );
  const labelComponent = useMemo(
    () => {
      var _a3, _b3, _c2;
      return (labelVisible || isSelected || active) && label && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(a.group, { position: labelPosition, children: /* @__PURE__ */ jsx(
          Label,
          {
            text: label,
            fontUrl: labelFontUrl,
            opacity: selectionOpacity,
            stroke: theme.node.label.stroke,
            maxWidth: theme.node.label.maxWidth,
            ellipsis: theme.node.label.ellipsis,
            active: isSelected || active || isDragging || isActive,
            color: isSelected || active || isDragging || isActive ? theme.node.label.activeColor : theme.node.label.color
          }
        ) }),
        subLabel && /* @__PURE__ */ jsx(a.group, { position: subLabelPosition, children: /* @__PURE__ */ jsx(
          Label,
          {
            text: subLabel,
            fontUrl: labelFontUrl,
            fontSize: theme.node.label.fontSize,
            maxWidth: theme.node.label.maxWidth,
            ellipsis: theme.node.label.ellipsis,
            backgroundColor: theme.node.label.backgroundColor,
            borderRadius: theme.node.label.borderRadius,
            opacity: selectionOpacity,
            stroke: (_a3 = theme.node.subLabel) == null ? void 0 : _a3.stroke,
            active: isSelected || active || isDragging || isActive,
            color: isSelected || active || isDragging || isActive ? (_b3 = theme.node.subLabel) == null ? void 0 : _b3.activeColor : (_c2 = theme.node.subLabel) == null ? void 0 : _c2.color
          }
        ) })
      ] });
    },
    [
      active,
      isActive,
      isDragging,
      isSelected,
      label,
      labelFontUrl,
      labelPosition,
      labelVisible,
      selectionOpacity,
      subLabel,
      subLabelPosition,
      theme.node.label.activeColor,
      theme.node.label.color,
      theme.node.label.stroke,
      (_a2 = theme.node.subLabel) == null ? void 0 : _a2.activeColor,
      (_b2 = theme.node.subLabel) == null ? void 0 : _b2.color,
      (_c = theme.node.subLabel) == null ? void 0 : _c.stroke,
      theme.node.label.fontSize,
      theme.node.label.maxWidth,
      theme.node.label.ellipsis,
      theme.node.label.backgroundColor,
      theme.node.label.borderRadius
    ]
  );
  const menuComponent = useMemo(
    () => menuVisible && contextMenu && /* @__PURE__ */ jsx(Html, { prepend: true, center: true, children: contextMenu({
      data: node,
      canCollapse,
      isCollapsed,
      onCollapse,
      onClose: () => setMenuVisible(false)
    }) }),
    [menuVisible, contextMenu, node, canCollapse, isCollapsed, onCollapse]
  );
  return /* @__PURE__ */ jsxs(
    a.group,
    {
      renderOrder: 1,
      userData: { id, type: "node" },
      ref: group,
      position: nodePosition,
      onPointerOver: pointerOver,
      onPointerOut: pointerOut,
      onClick: (event) => {
        if (!disabled2 && !isDragging) {
          onClick == null ? void 0 : onClick(
            node,
            {
              canCollapse,
              isCollapsed
            },
            event
          );
        }
      },
      onDoubleClick: (event) => {
        if (!disabled2 && !isDragging) {
          onDoubleClick == null ? void 0 : onDoubleClick(node, event);
        }
      },
      onContextMenu: () => {
        if (!disabled2) {
          setMenuVisible(true);
          onContextMenu == null ? void 0 : onContextMenu(node, {
            canCollapse,
            isCollapsed,
            onCollapse
          });
        }
      },
      ...bind(),
      children: [
        nodeComponent,
        menuComponent,
        labelComponent
      ]
    }
  );
};
Node.defaultProps = {
  draggable: false
};
const Arrow = ({
  animated,
  color,
  length,
  opacity,
  position,
  rotation,
  size,
  onActive,
  onContextMenu
}) => {
  const normalizedColor = useMemo(() => new Color(color), [color]);
  const meshRef = useRef(null);
  const draggingId = useStore((state) => state.draggingId);
  const center = useStore((state) => state.centerPosition);
  const [{ pos, arrowOpacity }] = useSpring(
    () => ({
      from: {
        pos: center ? [center.x, center.y, center.z] : [0, 0, 0],
        arrowOpacity: 0
      },
      to: {
        pos: [position.x, position.y, position.z],
        arrowOpacity: opacity
      },
      config: {
        ...animationConfig,
        duration: animated && !draggingId ? void 0 : 0
      }
    }),
    [animated, draggingId, opacity, position]
  );
  const setQuaternion = useCallback(() => {
    var _a2;
    const axis = new Vector3(0, 1, 0);
    (_a2 = meshRef.current) == null ? void 0 : _a2.quaternion.setFromUnitVectors(axis, rotation);
  }, [rotation, meshRef]);
  useEffect(() => setQuaternion(), [setQuaternion]);
  return /* @__PURE__ */ jsxs(
    a.mesh,
    {
      position: pos,
      ref: meshRef,
      scale: [1, 1, 1],
      onPointerOver: () => onActive(true),
      onPointerOut: () => onActive(false),
      onPointerDown: (event) => {
        if (event.nativeEvent.buttons === 2) {
          event.stopPropagation();
          onContextMenu();
        }
      },
      children: [
        /* @__PURE__ */ jsx(
          "cylinderGeometry",
          {
            args: [0, size, length, 20, 1, true],
            attach: "geometry"
          }
        ),
        /* @__PURE__ */ jsx(
          a.meshBasicMaterial,
          {
            attach: "material",
            color: normalizedColor,
            depthTest: false,
            opacity: arrowOpacity,
            transparent: true,
            side: DoubleSide,
            fog: true
          }
        )
      ]
    }
  );
};
Arrow.defaultProps = {
  size: 1,
  opacity: 0.5,
  color: "#D8E6EA"
};
const Line = ({
  curveOffset,
  animated,
  color,
  curve,
  curved = false,
  id,
  opacity,
  size,
  onContextMenu,
  onClick,
  onPointerOver,
  onPointerOut
}) => {
  const tubeRef = useRef(null);
  const draggingId = useStore((state) => state.draggingId);
  const normalizedColor = useMemo(() => new Color(color), [color]);
  const center = useStore((state) => state.centerPosition);
  const mounted = useRef(false);
  const { lineOpacity } = useSpring({
    from: {
      lineOpacity: 0
    },
    to: {
      lineOpacity: opacity
    },
    config: {
      ...animationConfig,
      duration: animated ? void 0 : 0
    }
  });
  useSpring(() => {
    const from = curve.getPoint(0);
    const to = curve.getPoint(1);
    return {
      from: {
        // Animate from center first time, then from the actual from point
        fromVertices: !mounted.current ? [center == null ? void 0 : center.x, center == null ? void 0 : center.y, (center == null ? void 0 : center.z) || 0] : [to == null ? void 0 : to.x, to == null ? void 0 : to.y, (to == null ? void 0 : to.z) || 0],
        toVertices: [from == null ? void 0 : from.x, from == null ? void 0 : from.y, (from == null ? void 0 : from.z) || 0]
      },
      to: {
        fromVertices: [from == null ? void 0 : from.x, from == null ? void 0 : from.y, (from == null ? void 0 : from.z) || 0],
        toVertices: [to == null ? void 0 : to.x, to == null ? void 0 : to.y, (to == null ? void 0 : to.z) || 0]
      },
      onChange: (event) => {
        const { fromVertices, toVertices } = event.value;
        const fromVector = new Vector3(...fromVertices);
        const toVector = new Vector3(...toVertices);
        const curve2 = getCurve(fromVector, 0, toVector, 0, curved, curveOffset);
        tubeRef.current.copy(new TubeGeometry(curve2, 20, size / 2, 5, false));
      },
      config: {
        ...animationConfig,
        duration: animated && !draggingId ? void 0 : 0
      }
    };
  }, [animated, draggingId, curve, size]);
  useEffect(() => {
    mounted.current = true;
  }, []);
  return /* @__PURE__ */ jsxs(
    "mesh",
    {
      userData: { id, type: "edge" },
      onPointerOver,
      onPointerOut,
      onClick,
      onPointerDown: (event) => {
        if (event.nativeEvent.buttons === 2) {
          event.stopPropagation();
          onContextMenu();
        }
      },
      children: [
        /* @__PURE__ */ jsx("tubeGeometry", { attach: "geometry", ref: tubeRef }),
        /* @__PURE__ */ jsx(
          a.meshBasicMaterial,
          {
            attach: "material",
            opacity: lineOpacity,
            fog: true,
            transparent: true,
            depthTest: false,
            color: normalizedColor
          }
        )
      ]
    }
  );
};
Line.defaultProps = {
  color: "#000",
  size: 1,
  opacity: 1
};
const LABEL_PLACEMENT_OFFSET = 3;
const Edge$1 = ({
  animated,
  arrowPlacement,
  contextMenu,
  disabled: disabled2,
  labelPlacement,
  id,
  interpolation,
  labelFontUrl,
  onContextMenu,
  onClick,
  onPointerOver,
  onPointerOut
}) => {
  const theme = useStore((state) => state.theme);
  const draggingId = useStore((state) => state.draggingId);
  const [active, setActive] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const edges = useStore((state) => state.edges);
  const edge = edges.find((e) => e.id === id);
  const { target, source, label, labelVisible = false, size = 1 } = edge;
  const from = useStore((store) => store.nodes.find((node) => node.id === source));
  const to = useStore((store) => store.nodes.find((node) => node.id === target));
  const labelOffset = (size + theme.edge.label.fontSize) / 2;
  const [arrowLength, arrowSize] = useMemo(() => getArrowSize(size), [size]);
  const { curveOffset, curved } = useMemo(
    () => calculateEdgeCurveOffset({
      edge,
      edges,
      curved: interpolation === "curved"
    }),
    [edge, edges, interpolation]
  );
  const [curve, arrowPosition, arrowRotation] = useMemo(() => {
    const fromVector = getVector(from);
    const fromOffset = from.size;
    const toVector = getVector(to);
    const toOffset = to.size;
    let curve2 = getCurve(
      fromVector,
      fromOffset,
      toVector,
      toOffset,
      curved,
      curveOffset
    );
    const [arrowPosition2, arrowRotation2] = getArrowVectors(
      arrowPlacement,
      curve2,
      arrowLength
    );
    if (arrowPlacement === "end") {
      curve2 = getCurve(
        fromVector,
        fromOffset,
        arrowPosition2,
        0,
        curved,
        curveOffset
      );
    }
    return [curve2, arrowPosition2, arrowRotation2];
  }, [from, to, curved, curveOffset, arrowPlacement, arrowLength]);
  const midPoint = useMemo(() => {
    let newMidPoint = getMidPoint(
      from.position,
      to.position,
      getLabelOffsetByType(labelOffset, labelPlacement)
    );
    if (curved) {
      const offset = new Vector3().subVectors(newMidPoint, curve.getPoint(0.5));
      switch (labelPlacement) {
        case "above":
          offset.y = offset.y - LABEL_PLACEMENT_OFFSET;
          break;
        case "below":
          offset.y = offset.y + LABEL_PLACEMENT_OFFSET;
          break;
      }
      newMidPoint = newMidPoint.sub(offset);
    }
    return newMidPoint;
  }, [from.position, to.position, labelOffset, labelPlacement, curved, curve]);
  const isSelected = useStore((state) => {
    var _a2;
    return (_a2 = state.selections) == null ? void 0 : _a2.includes(id);
  });
  const hasSelections = useStore((state) => {
    var _a2;
    return (_a2 = state.selections) == null ? void 0 : _a2.length;
  });
  const isActive = useStore((state) => {
    var _a2;
    return (_a2 = state.actives) == null ? void 0 : _a2.includes(id);
  });
  const center = useStore((state) => state.centerPosition);
  const selectionOpacity = hasSelections ? isSelected || isActive ? theme.edge.selectedOpacity : theme.edge.inactiveOpacity : theme.edge.opacity;
  const [{ labelPosition }] = useSpring(
    () => ({
      from: {
        labelPosition: center ? [center.x, center.y, center.z] : [0, 0, 0]
      },
      to: {
        labelPosition: [midPoint.x, midPoint.y, midPoint.z]
      },
      config: {
        ...animationConfig,
        duration: animated && !draggingId ? void 0 : 0
      }
    }),
    [midPoint, animated, draggingId]
  );
  const labelRotation = useMemo(
    () => new Euler(
      0,
      0,
      labelPlacement === "natural" ? 0 : Math.atan(
        (to.position.y - from.position.y) / (to.position.x - from.position.x)
      )
    ),
    [
      to.position.x,
      to.position.y,
      from.position.x,
      from.position.y,
      labelPlacement
    ]
  );
  useCursor(active && !draggingId && onClick !== void 0, "pointer");
  const { pointerOver, pointerOut } = useHoverIntent({
    disabled: disabled2,
    onPointerOver: (event) => {
      setActive(true);
      onPointerOver == null ? void 0 : onPointerOver(edge, event);
    },
    onPointerOut: (event) => {
      setActive(false);
      onPointerOut == null ? void 0 : onPointerOut(edge, event);
    }
  });
  const arrowComponent = useMemo(
    () => arrowPlacement !== "none" && /* @__PURE__ */ jsx(
      Arrow,
      {
        animated,
        color: isSelected || active || isActive ? theme.arrow.activeFill : theme.arrow.fill,
        length: arrowLength,
        opacity: selectionOpacity,
        position: arrowPosition,
        rotation: arrowRotation,
        size: arrowSize,
        onActive: setActive,
        onContextMenu: () => {
          if (!disabled2) {
            setMenuVisible(true);
            onContextMenu == null ? void 0 : onContextMenu(edge);
          }
        }
      }
    ),
    [
      active,
      animated,
      arrowLength,
      arrowPlacement,
      arrowPosition,
      arrowRotation,
      arrowSize,
      disabled2,
      edge,
      isActive,
      isSelected,
      onContextMenu,
      selectionOpacity,
      theme.arrow.activeFill,
      theme.arrow.fill
    ]
  );
  const labelComponent = useMemo(
    () => labelVisible && label && /* @__PURE__ */ jsx(a.group, { position: labelPosition, children: /* @__PURE__ */ jsx(
      Label,
      {
        text: label,
        ellipsis: theme.edge.label.ellipsis,
        fontUrl: labelFontUrl,
        stroke: theme.edge.label.stroke,
        color: isSelected || active || isActive ? theme.edge.label.activeColor : theme.edge.label.color,
        opacity: selectionOpacity,
        fontSize: theme.edge.label.fontSize,
        maxWidth: theme.edge.label.maxWidth,
        rotation: labelRotation,
        backgroundColor: theme.edge.label.backgroundColor,
        borderRadius: theme.edge.label.borderRadius
      }
    ) }),
    [
      active,
      isActive,
      isSelected,
      label,
      labelFontUrl,
      labelPosition,
      labelRotation,
      labelVisible,
      selectionOpacity,
      theme.edge.label.activeColor,
      theme.edge.label.color,
      theme.edge.label.fontSize,
      theme.edge.label.maxWidth,
      theme.edge.label.ellipsis,
      theme.edge.label.stroke,
      theme.edge.label.backgroundColor,
      theme.edge.label.borderRadius
    ]
  );
  const menuComponent = useMemo(
    () => menuVisible && contextMenu && /* @__PURE__ */ jsx(Html, { prepend: true, center: true, position: midPoint, children: contextMenu({ data: edge, onClose: () => setMenuVisible(false) }) }),
    [menuVisible, contextMenu, midPoint, edge]
  );
  return /* @__PURE__ */ jsxs("group", { children: [
    /* @__PURE__ */ jsx(
      Line,
      {
        curveOffset,
        animated,
        color: isSelected || active || isActive ? theme.edge.activeFill : theme.edge.fill,
        curve,
        curved,
        id,
        opacity: selectionOpacity,
        size,
        onClick: (event) => {
          if (!disabled2) {
            onClick == null ? void 0 : onClick(edge, event);
          }
        },
        onPointerOver: pointerOver,
        onPointerOut: pointerOut,
        onContextMenu: () => {
          if (!disabled2) {
            setMenuVisible(true);
            onContextMenu == null ? void 0 : onContextMenu(edge);
          }
        }
      }
    ),
    arrowComponent,
    labelComponent,
    menuComponent
  ] });
};
Edge$1.defaultProps = {
  labelPlacement: "inline",
  arrowPlacement: "end"
};
const NULL_GEOMETRY = new BoxGeometry(0, 0, 0);
function useEdgeGeometry(arrowPlacement, interpolation) {
  const stateRef = useRef();
  const theme = useStore((state) => state.theme);
  useStore((state) => {
    stateRef.current = state;
  });
  const geometryCacheRef = useRef(/* @__PURE__ */ new Map());
  const curved = interpolation === "curved";
  const getGeometries = useCallback(
    (edges) => {
      const geometries = [];
      const cache = geometryCacheRef.current;
      const { nodes } = stateRef.current;
      edges.forEach((edge) => {
        const { target, source, size = 1 } = edge;
        const from = nodes.find((node) => node.id === source);
        const to = nodes.find((node) => node.id === target);
        if (!from || !to) {
          return;
        }
        const hash = `fromX:${from.position.x},fromY:${from.position.y},toX:${to.position.x}},toY:${to.position.y}`;
        if (cache.has(hash)) {
          const geometry = cache.get(hash);
          geometries.push(geometry);
          return;
        }
        const fromVector = getVector(from);
        const fromOffset = from.size + theme.edge.label.fontSize;
        const toVector = getVector(to);
        const toOffset = to.size + theme.edge.label.fontSize;
        let curve = getCurve(
          fromVector,
          fromOffset,
          toVector,
          toOffset,
          curved
        );
        let edgeGeometry = new TubeGeometry(curve, 20, size / 2, 5, false);
        if (arrowPlacement === "none") {
          geometries.push(edgeGeometry);
          cache.set(hash, edgeGeometry);
          return;
        }
        const [arrowLength, arrowSize] = getArrowSize(size);
        const [arrowPosition, arrowRotation] = getArrowVectors(
          arrowPlacement,
          curve,
          arrowLength
        );
        const quaternion = new Quaternion();
        quaternion.setFromUnitVectors(new Vector3(0, 1, 0), arrowRotation);
        const arrowGeometry = new CylinderGeometry(
          0,
          arrowSize,
          arrowLength,
          20,
          1,
          true
        );
        arrowGeometry.applyQuaternion(quaternion);
        arrowGeometry.translate(
          arrowPosition.x,
          arrowPosition.y,
          arrowPosition.z
        );
        if (arrowPlacement && arrowPlacement === "end") {
          const curve2 = getCurve(
            fromVector,
            fromOffset,
            arrowPosition,
            0,
            curved
          );
          edgeGeometry = new TubeGeometry(curve2, 20, size / 2, 5, false);
        }
        const merged = mergeBufferGeometries([edgeGeometry, arrowGeometry]);
        geometries.push(merged);
        cache.set(hash, merged);
      });
      return geometries;
    },
    [arrowPlacement, curved, theme.edge.label.fontSize]
  );
  const getGeometry = useCallback(
    (active, inactive) => {
      const activeGeometries = getGeometries(active);
      const inactiveGeometries = getGeometries(inactive);
      return mergeBufferGeometries(
        [
          inactiveGeometries.length ? mergeBufferGeometries(inactiveGeometries) : NULL_GEOMETRY,
          activeGeometries.length ? mergeBufferGeometries(activeGeometries) : NULL_GEOMETRY
        ],
        true
      );
    },
    [getGeometries]
  );
  return {
    getGeometries,
    getGeometry
  };
}
function useEdgeEvents(events, contextMenu, disabled2) {
  const { onClick, onContextMenu, onPointerOut, onPointerOver } = events;
  const edgeContextMenus = useStore((state) => state.edgeContextMenus);
  const setEdgeContextMenus = useStore((state) => state.setEdgeContextMenus);
  const clickRef = useRef(false);
  const handleClick = useCallback(() => {
    clickRef.current = true;
  }, []);
  const contextMenuEventRef = useRef(false);
  const handleContextMenu = useCallback(() => {
    contextMenuEventRef.current = true;
  }, []);
  const handleIntersections = useCallback(
    (previous, intersected) => {
      if (onClick && clickRef.current) {
        clickRef.current = false;
        if (!disabled2) {
          intersected.forEach((edge) => {
            onClick(edge);
          });
        }
      }
      if ((contextMenu || onContextMenu) && contextMenuEventRef.current) {
        contextMenuEventRef.current = false;
        if (!disabled2) {
          intersected.forEach((edge) => {
            if (!edgeContextMenus.has(edge.id)) {
              setEdgeContextMenus(/* @__PURE__ */ new Set([...edgeContextMenus, edge.id]));
              onContextMenu == null ? void 0 : onContextMenu(edge);
            }
          });
        }
      }
      if (onPointerOver) {
        const over = intersected.filter((index) => !previous.includes(index));
        over.forEach((edge) => {
          onPointerOver(edge);
        });
      }
      if (onPointerOut) {
        const out = previous.filter((index) => !intersected.includes(index));
        out.forEach((edge) => {
          onPointerOut(edge);
        });
      }
    },
    [
      contextMenu,
      disabled2,
      edgeContextMenus,
      setEdgeContextMenus,
      onClick,
      onContextMenu,
      onPointerOver,
      onPointerOut
    ]
  );
  return {
    handleClick,
    handleContextMenu,
    handleIntersections
  };
}
function useEdgePositionAnimation(geometry, animated) {
  const geometryRef = useRef(geometry);
  useEffect(() => {
    geometryRef.current = geometry;
  }, [geometry]);
  const getAnimationPositions = useCallback(() => {
    const positions = geometryRef.current.getAttribute("position");
    const from = Array.from({
      length: positions.array.length
    }).fill(0);
    const to = Array.from(positions.array);
    return { from, to };
  }, []);
  const updateGeometryPosition = useCallback((positions) => {
    const buffer = new Float32Array(positions);
    const newPosition = new BufferAttribute(buffer, 3, false);
    geometryRef.current.setAttribute("position", newPosition);
    newPosition.needsUpdate = true;
  }, []);
  useSpring(() => {
    if (!animated) {
      return null;
    }
    const animationPositions = getAnimationPositions();
    return {
      from: {
        positions: animationPositions.from
      },
      to: {
        positions: animationPositions.to
      },
      onChange: (event) => {
        updateGeometryPosition(event.value.positions);
      },
      config: {
        ...animationConfig,
        duration: animated ? void 0 : 0
      }
    };
  }, [animated]);
}
function useEdgeOpacityAnimation(animated, hasSelections, theme) {
  const [{ activeOpacity, inactiveOpacity }] = useSpring(() => {
    return {
      from: {
        activeOpacity: 0,
        inactiveOpacity: 0
      },
      to: {
        activeOpacity: hasSelections ? theme.edge.selectedOpacity : theme.edge.opacity,
        inactiveOpacity: hasSelections ? theme.edge.inactiveOpacity : theme.edge.opacity
      },
      config: {
        ...animationConfig,
        duration: animated ? void 0 : 0
      }
    };
  }, [animated, hasSelections, theme]);
  return { activeOpacity, inactiveOpacity };
}
const Edge = ({
  animated,
  color,
  contextMenu,
  edge,
  labelFontUrl,
  labelPlacement,
  opacity
}) => {
  const theme = useStore((state) => state.theme);
  const { target, source, label, labelVisible = false, size = 1 } = edge;
  const nodes = useStore((store) => store.nodes);
  const from = nodes.find((node) => node.id === source);
  const to = nodes.find((node) => node.id === target);
  const draggingId = useStore((state) => state.draggingId);
  const labelOffset = (size + theme.edge.label.fontSize) / 2;
  const midPoint = useMemo(
    () => getMidPoint(
      from.position,
      to.position,
      getLabelOffsetByType(labelOffset, labelPlacement)
    ),
    [from.position, to.position, labelOffset, labelPlacement]
  );
  const edgeContextMenus = useStore((state) => state.edgeContextMenus);
  const setEdgeContextMenus = useStore((state) => state.setEdgeContextMenus);
  const [{ labelPosition }] = useSpring(
    () => ({
      from: {
        labelPosition: [0, 0, 0]
      },
      to: {
        labelPosition: [midPoint.x, midPoint.y, midPoint.z]
      },
      config: {
        ...animationConfig,
        duration: animated && !draggingId ? void 0 : 0
      }
    }),
    [midPoint, animated, draggingId]
  );
  const removeContextMenu = useCallback(
    (edge2) => {
      edgeContextMenus.delete(edge2.id);
      setEdgeContextMenus(new Set(edgeContextMenus.values()));
    },
    [edgeContextMenus, setEdgeContextMenus]
  );
  const labelRotation = useMemo(
    () => new Euler(
      0,
      0,
      labelPlacement === "natural" ? 0 : Math.atan(
        (to.position.y - from.position.y) / (to.position.x - from.position.x)
      )
    ),
    [
      to.position.x,
      to.position.y,
      from.position.x,
      from.position.y,
      labelPlacement
    ]
  );
  return /* @__PURE__ */ jsxs("group", { children: [
    labelVisible && label && /* @__PURE__ */ jsx(a.group, { position: labelPosition, children: /* @__PURE__ */ jsx(
      Label,
      {
        text: label,
        fontUrl: labelFontUrl,
        stroke: theme.edge.label.stroke,
        color,
        opacity,
        fontSize: theme.edge.label.fontSize,
        maxWidth: theme.edge.label.maxWidth,
        ellipsis: theme.edge.label.ellipsis,
        rotation: labelRotation,
        backgroundColor: theme.edge.label.backgroundColor,
        borderRadius: theme.edge.label.borderRadius
      }
    ) }),
    contextMenu && edgeContextMenus.has(edge.id) && /* @__PURE__ */ jsx(Html, { prepend: true, center: true, position: midPoint, children: contextMenu({
      data: edge,
      onClose: () => removeContextMenu(edge)
    }) })
  ] });
};
Edge.defaultProps = {
  labelPlacement: "inline"
};
const Edges = ({
  interpolation = "linear",
  arrowPlacement = "end",
  labelPlacement = "inline",
  animated,
  contextMenu,
  disabled: disabled2,
  edges,
  labelFontUrl,
  onClick,
  onContextMenu,
  onPointerOut,
  onPointerOver
}) => {
  const theme = useStore((state) => state.theme);
  const { getGeometries, getGeometry } = useEdgeGeometry(
    arrowPlacement,
    interpolation
  );
  const draggingId = useStore((state) => state.draggingId);
  const edgeMeshes = useStore((state) => state.edgeMeshes);
  const setEdgeMeshes = useStore((state) => state.setEdgeMeshes);
  const actives = useStore((state) => state.actives || []);
  const selections = useStore((state) => state.selections || []);
  const [active, inactive, draggingActive, draggingInactive] = useMemo(() => {
    const active2 = [];
    const inactive2 = [];
    const draggingActive2 = [];
    const draggingInactive2 = [];
    edges.forEach((edge) => {
      if (draggingId === edge.source || draggingId === edge.target) {
        if (selections.includes(edge.id) || actives.includes(edge.id)) {
          draggingActive2.push(edge);
        } else {
          draggingInactive2.push(edge);
        }
        return;
      }
      if (selections.includes(edge.id) || actives.includes(edge.id)) {
        active2.push(edge);
      } else {
        inactive2.push(edge);
      }
    });
    return [active2, inactive2, draggingActive2, draggingInactive2];
  }, [edges, actives, selections, draggingId]);
  const hasSelections = !!selections.length;
  const staticEdgesGeometry = useMemo(
    () => getGeometry(active, inactive),
    [getGeometry, active, inactive]
  );
  const { activeOpacity, inactiveOpacity } = useEdgeOpacityAnimation(
    animated,
    hasSelections,
    theme
  );
  useEdgePositionAnimation(staticEdgesGeometry, animated);
  useEffect(() => {
    if (draggingId === null) {
      const edgeGeometries = getGeometries(edges);
      const edgeMeshes2 = edgeGeometries.map((edge) => new Mesh(edge));
      setEdgeMeshes(edgeMeshes2);
    }
  }, [getGeometries, setEdgeMeshes, edges, draggingId]);
  const staticEdgesRef = useRef(new Mesh());
  const dynamicEdgesRef = useRef(new Mesh());
  const intersect = useCallback(
    (raycaster) => {
      if (!raycaster.camera) {
        return [];
      }
      const intersections = raycaster.intersectObjects(edgeMeshes);
      if (!intersections.length) {
        return [];
      }
      return intersections.map(
        (intersection) => edges[edgeMeshes.indexOf(intersection.object)]
      );
    },
    [edgeMeshes, edges]
  );
  const { handleClick, handleContextMenu, handleIntersections } = useEdgeEvents(
    {
      onClick,
      onContextMenu,
      onPointerOut,
      onPointerOver
    },
    contextMenu,
    disabled2
  );
  const draggingIdRef = useRef(null);
  const intersectingRef = useRef([]);
  useFrame((state) => {
    staticEdgesRef.current.geometry = staticEdgesGeometry;
    if (disabled2) {
      return;
    }
    const previousDraggingId = draggingIdRef.current;
    if (draggingId || draggingId === null && previousDraggingId !== null) {
      dynamicEdgesRef.current.geometry = getGeometry(
        draggingActive,
        draggingInactive
      );
    }
    draggingIdRef.current = draggingId;
    if (draggingId) {
      return;
    }
    const previousIntersecting = intersectingRef.current;
    const intersecting = intersect(state.raycaster);
    handleIntersections(previousIntersecting, intersecting);
    if (intersecting.join() !== previousIntersecting.join()) {
      dynamicEdgesRef.current.geometry = getGeometry(intersecting, []);
    }
    intersectingRef.current = intersecting;
  });
  return /* @__PURE__ */ jsxs("group", { onClick: handleClick, onContextMenu: handleContextMenu, children: [
    /* @__PURE__ */ jsxs("mesh", { ref: staticEdgesRef, children: [
      /* @__PURE__ */ jsx(
        a.meshBasicMaterial,
        {
          attach: "material-0",
          color: theme.edge.fill,
          depthTest: false,
          fog: true,
          opacity: inactiveOpacity,
          side: DoubleSide,
          transparent: true
        }
      ),
      /* @__PURE__ */ jsx(
        a.meshBasicMaterial,
        {
          attach: "material-1",
          color: theme.edge.activeFill,
          depthTest: false,
          fog: true,
          opacity: activeOpacity,
          side: DoubleSide,
          transparent: true
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("mesh", { ref: dynamicEdgesRef, children: [
      /* @__PURE__ */ jsx(
        a.meshBasicMaterial,
        {
          attach: "material-0",
          color: theme.edge.fill,
          depthTest: false,
          fog: true,
          opacity: inactiveOpacity,
          side: DoubleSide,
          transparent: true
        }
      ),
      /* @__PURE__ */ jsx(
        a.meshBasicMaterial,
        {
          attach: "material-1",
          color: theme.edge.activeFill,
          depthTest: false,
          fog: true,
          opacity: activeOpacity,
          side: DoubleSide,
          transparent: true
        }
      )
    ] }),
    edges.map((edge) => /* @__PURE__ */ jsx(
      Edge,
      {
        animated,
        contextMenu,
        color: theme.edge.label.color,
        disabled: disabled2,
        edge,
        labelFontUrl,
        labelPlacement
      },
      edge.id
    ))
  ] });
};
const Cluster = ({
  animated,
  position,
  padding,
  labelFontUrl,
  disabled: disabled2,
  radius,
  nodes,
  label,
  onClick,
  onPointerOver,
  onPointerOut
}) => {
  var _a2, _b2, _c, _d, _e;
  const theme = useStore((state) => state.theme);
  const rad = Math.max(position.width, position.height) / 2;
  const offset = rad - radius + padding;
  const [active, setActive] = useState(false);
  const center = useStore((state) => state.centerPosition);
  const isActive = useStore(
    (state) => {
      var _a3;
      return (_a3 = state.actives) == null ? void 0 : _a3.some((id) => nodes.some((n) => n.id === id));
    }
  );
  const isSelected = useStore(
    (state) => {
      var _a3;
      return (_a3 = state.selections) == null ? void 0 : _a3.some((id) => nodes.some((n) => n.id === id));
    }
  );
  const hasSelections = useStore((state) => {
    var _a3;
    return ((_a3 = state.selections) == null ? void 0 : _a3.length) > 0;
  });
  const opacity = hasSelections ? isSelected || active || isActive ? (_a2 = theme.cluster) == null ? void 0 : _a2.selectedOpacity : (_b2 = theme.cluster) == null ? void 0 : _b2.inactiveOpacity : (_c = theme.cluster) == null ? void 0 : _c.opacity;
  const { circleOpacity, circlePosition, labelPosition } = useSpring({
    from: {
      circlePosition: [center.x, center.y, -1],
      circleOpacity: 0,
      labelPosition: [0, -offset, 2]
    },
    to: {
      labelPosition: [0, -offset, 2],
      circlePosition: position ? [position.x, position.y, -1] : [0, 0, -1],
      circleOpacity: opacity
    },
    config: {
      ...animationConfig,
      duration: animated ? void 0 : 0
    }
  });
  const normalizedStroke = useMemo(
    () => {
      var _a3;
      return new Color((_a3 = theme.cluster) == null ? void 0 : _a3.stroke);
    },
    [(_d = theme.cluster) == null ? void 0 : _d.stroke]
  );
  const normalizedFill = useMemo(
    () => {
      var _a3;
      return new Color((_a3 = theme.cluster) == null ? void 0 : _a3.fill);
    },
    [(_e = theme.cluster) == null ? void 0 : _e.fill]
  );
  useCursor(active && onClick !== void 0, "pointer");
  const { pointerOver, pointerOut } = useHoverIntent({
    disabled: disabled2,
    onPointerOver: (event) => {
      setActive(true);
      onPointerOver == null ? void 0 : onPointerOver(
        {
          nodes,
          label
        },
        event
      );
    },
    onPointerOut: (event) => {
      setActive(false);
      onPointerOut == null ? void 0 : onPointerOut(
        {
          nodes,
          label
        },
        event
      );
    }
  });
  const cluster = useMemo(
    () => {
      var _a3, _b3, _c2;
      return theme.cluster && /* @__PURE__ */ jsxs(
        a.group,
        {
          position: circlePosition,
          onPointerOver: pointerOver,
          onPointerOut: pointerOut,
          onClick: (event) => {
            if (!disabled2) {
              onClick == null ? void 0 : onClick(
                {
                  nodes,
                  label
                },
                event
              );
            }
          },
          children: [
            /* @__PURE__ */ jsxs("mesh", { children: [
              /* @__PURE__ */ jsx("ringGeometry", { attach: "geometry", args: [offset, 0, 128] }),
              /* @__PURE__ */ jsx(
                a.meshBasicMaterial,
                {
                  attach: "material",
                  color: normalizedFill,
                  transparent: true,
                  depthTest: false,
                  opacity: ((_a3 = theme.cluster) == null ? void 0 : _a3.fill) ? circleOpacity : 0,
                  side: DoubleSide,
                  fog: true
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("mesh", { children: [
              /* @__PURE__ */ jsx(
                "ringGeometry",
                {
                  attach: "geometry",
                  args: [offset, rad + padding, 128]
                }
              ),
              /* @__PURE__ */ jsx(
                a.meshBasicMaterial,
                {
                  attach: "material",
                  color: normalizedStroke,
                  transparent: true,
                  depthTest: false,
                  opacity: circleOpacity,
                  side: DoubleSide,
                  fog: true
                }
              )
            ] }),
            ((_b3 = theme.cluster) == null ? void 0 : _b3.label) && /* @__PURE__ */ jsx(a.group, { position: labelPosition, children: /* @__PURE__ */ jsx(
              Label,
              {
                text: label,
                opacity,
                fontUrl: labelFontUrl,
                stroke: theme.cluster.label.stroke,
                active: false,
                color: (_c2 = theme.cluster) == null ? void 0 : _c2.label.color,
                fontSize: 12,
                ellipsis: theme.cluster.label.ellipsis
              }
            ) })
          ]
        }
      );
    },
    [
      theme.cluster,
      circlePosition,
      pointerOver,
      pointerOut,
      offset,
      normalizedFill,
      circleOpacity,
      rad,
      padding,
      normalizedStroke,
      labelPosition,
      label,
      opacity,
      labelFontUrl,
      disabled2,
      onClick,
      nodes
    ]
  );
  return cluster;
};
Cluster.defaultProps = {
  radius: 2,
  padding: 40
};
const GraphScene = forwardRef(
  ({
    onNodeClick,
    onNodeDoubleClick,
    onNodeContextMenu,
    onEdgeContextMenu,
    onEdgeClick,
    onEdgePointerOver,
    onEdgePointerOut,
    onNodePointerOver,
    onNodePointerOut,
    onClusterClick,
    onNodeDragged,
    onClusterPointerOver,
    onClusterPointerOut,
    contextMenu,
    animated,
    disabled: disabled2,
    draggable,
    edgeLabelPosition,
    edgeArrowPosition,
    edgeInterpolation,
    labelFontUrl,
    renderNode,
    ...rest
  }, ref) => {
    const { layoutType, clusterAttribute } = rest;
    const gl = useThree((state) => state.gl);
    const scene = useThree((state) => state.scene);
    const camera = useThree((state) => state.camera);
    useGraph(rest);
    if (clusterAttribute && !(layoutType === "forceDirected2d" || layoutType === "forceDirected3d")) {
      throw new Error(
        "Clustering is only supported for the force directed layouts."
      );
    }
    const graph = useStore((state) => state.graph);
    const nodes = useStore((state) => state.nodes);
    const edges = useStore((state) => state.edges);
    const clusters = useStore((state) => [...state.clusters.values()]);
    const { centerNodesById, fitNodesInViewById, isCentered } = useCenterGraph({
      animated,
      disabled: disabled2,
      layoutType
    });
    useImperativeHandle(
      ref,
      () => ({
        centerGraph: centerNodesById,
        fitNodesInView: fitNodesInViewById,
        graph,
        renderScene: () => gl.render(scene, camera)
      }),
      [centerNodesById, fitNodesInViewById, graph, gl, scene, camera]
    );
    const nodeComponents = useMemo(
      () => nodes.map((n) => /* @__PURE__ */ jsx(
        Node,
        {
          id: n == null ? void 0 : n.id,
          labelFontUrl,
          draggable,
          disabled: disabled2,
          animated,
          contextMenu,
          renderNode,
          onClick: onNodeClick,
          onDoubleClick: onNodeDoubleClick,
          onContextMenu: onNodeContextMenu,
          onPointerOver: onNodePointerOver,
          onPointerOut: onNodePointerOut,
          onDragged: onNodeDragged
        },
        n == null ? void 0 : n.id
      )),
      [
        animated,
        contextMenu,
        disabled2,
        draggable,
        labelFontUrl,
        nodes,
        onNodeClick,
        onNodeContextMenu,
        onNodeDoubleClick,
        onNodeDragged,
        onNodePointerOut,
        onNodePointerOver,
        renderNode
      ]
    );
    const edgeComponents = useMemo(
      () => animated ? edges.map((e) => /* @__PURE__ */ jsx(
        Edge$1,
        {
          id: e.id,
          disabled: disabled2,
          animated,
          labelFontUrl,
          labelPlacement: edgeLabelPosition,
          arrowPlacement: edgeArrowPosition,
          interpolation: edgeInterpolation,
          contextMenu,
          onClick: onEdgeClick,
          onContextMenu: onEdgeContextMenu,
          onPointerOver: onEdgePointerOver,
          onPointerOut: onEdgePointerOut
        },
        e.id
      )) : /* @__PURE__ */ jsx(
        Edges,
        {
          edges,
          disabled: disabled2,
          animated,
          labelFontUrl,
          labelPlacement: edgeLabelPosition,
          arrowPlacement: edgeArrowPosition,
          interpolation: edgeInterpolation,
          contextMenu,
          onClick: onEdgeClick,
          onContextMenu: onEdgeContextMenu,
          onPointerOver: onEdgePointerOver,
          onPointerOut: onEdgePointerOut
        }
      ),
      [
        animated,
        contextMenu,
        disabled2,
        edgeArrowPosition,
        edgeInterpolation,
        edgeLabelPosition,
        edges,
        labelFontUrl,
        onEdgeClick,
        onEdgeContextMenu,
        onEdgePointerOut,
        onEdgePointerOver
      ]
    );
    const clusterComponents = useMemo(
      () => clusters.map((c) => /* @__PURE__ */ jsx(
        Cluster,
        {
          animated,
          disabled: disabled2,
          labelFontUrl,
          onClick: onClusterClick,
          onPointerOver: onClusterPointerOver,
          onPointerOut: onClusterPointerOut,
          ...c
        },
        c.label
      )),
      [
        animated,
        clusters,
        disabled2,
        labelFontUrl,
        onClusterClick,
        onClusterPointerOut,
        onClusterPointerOver
      ]
    );
    return isCentered && /* @__PURE__ */ jsxs(Fragment$1, { children: [
      edgeComponents,
      nodeComponents,
      clusterComponents
    ] });
  }
);
GraphScene.defaultProps = {
  edgeInterpolation: "linear"
};
const darkTheme = {
  canvas: {
    background: "#1E2026"
  },
  node: {
    fill: "#7A8C9E",
    activeFill: "#1DE9AC",
    opacity: 1,
    selectedOpacity: 1,
    inactiveOpacity: 0.2,
    label: {
      stroke: "#1E2026",
      color: "#ACBAC7",
      activeColor: "#1DE9AC",
      fontSize: 6,
      maxWidth: 100,
      ellipsis: 100,
      backgroundColor: "#1E2026",
      borderRadius: 5
    },
    subLabel: {
      stroke: "#1E2026",
      color: "#ACBAC7",
      activeColor: "#1DE9AC"
    }
  },
  lasso: {
    border: "1px solid #55aaff",
    background: "rgba(75, 160, 255, 0.1)"
  },
  ring: {
    fill: "#54616D",
    activeFill: "#1DE9AC"
  },
  edge: {
    fill: "#474B56",
    activeFill: "#1DE9AC",
    opacity: 1,
    selectedOpacity: 1,
    inactiveOpacity: 0.1,
    label: {
      stroke: "#1E2026",
      color: "#ACBAC7",
      activeColor: "#1DE9AC",
      fontSize: 6,
      maxWidth: 100,
      ellipsis: 100,
      backgroundColor: "#1E2026",
      borderRadius: 5
    }
  },
  arrow: {
    fill: "#474B56",
    activeFill: "#1DE9AC"
  },
  cluster: {
    stroke: "#474B56",
    opacity: 1,
    selectedOpacity: 1,
    inactiveOpacity: 0.1,
    label: {
      stroke: "#1E2026",
      color: "#ACBAC7",
      activeColor: "#1DE9AC",
      fontSize: 6,
      maxWidth: 100,
      ellipsis: 100,
      backgroundColor: "#1E2026",
      borderRadius: 5
    }
  }
};
const lightTheme = {
  canvas: {
    background: "#fff"
  },
  node: {
    fill: "#7CA0AB",
    activeFill: "#1DE9AC",
    opacity: 1,
    selectedOpacity: 1,
    inactiveOpacity: 0.2,
    label: {
      color: "#2A6475",
      stroke: "#fff",
      activeColor: "#1DE9AC",
      fontSize: 6,
      maxWidth: 100,
      ellipsis: 100,
      backgroundColor: "#1E2026",
      borderRadius: 5
    },
    subLabel: {
      color: "#ddd",
      stroke: "transparent",
      activeColor: "#1DE9AC"
    }
  },
  lasso: {
    border: "1px solid #55aaff",
    background: "rgba(75, 160, 255, 0.1)"
  },
  ring: {
    fill: "#D8E6EA",
    activeFill: "#1DE9AC"
  },
  edge: {
    fill: "#D8E6EA",
    activeFill: "#1DE9AC",
    opacity: 1,
    selectedOpacity: 1,
    inactiveOpacity: 0.1,
    label: {
      stroke: "#fff",
      color: "#2A6475",
      activeColor: "#1DE9AC",
      fontSize: 6,
      maxWidth: 100,
      ellipsis: 100,
      backgroundColor: "#1E2026",
      borderRadius: 5
    }
  },
  arrow: {
    fill: "#D8E6EA",
    activeFill: "#1DE9AC"
  },
  cluster: {
    stroke: "#D8E6EA",
    opacity: 1,
    selectedOpacity: 1,
    inactiveOpacity: 0.1,
    label: {
      stroke: "#1E2026",
      color: "#ACBAC7",
      activeColor: "#1DE9AC",
      fontSize: 6,
      maxWidth: 100,
      ellipsis: 100,
      backgroundColor: "#1E2026",
      borderRadius: 5
    }
  }
};
function getAdjacents(graph, nodeIds, type) {
  nodeIds = Array.isArray(nodeIds) ? nodeIds : [nodeIds];
  const nodes = [];
  const edges = [];
  for (const nodeId of nodeIds) {
    const graphLinks = [
      ...graph.inEdgeEntries(nodeId) ?? [],
      ...graph.outEdgeEntries(nodeId) ?? []
    ];
    if (!graphLinks) {
      continue;
    }
    for (const link of graphLinks) {
      const linkId = link.attributes.id;
      if (type === "in") {
        if (link.target === nodeId && !edges.includes(linkId)) {
          edges.push(linkId);
        }
      } else if (type === "out") {
        if (link.source === nodeId && !edges.includes(linkId)) {
          edges.push(linkId);
        }
      } else {
        if (!edges.includes(linkId)) {
          edges.push(linkId);
        }
      }
      if (type === "out" || type === "all") {
        const toId = link.target;
        if (!nodes.includes(toId)) {
          nodes.push(toId);
        }
      }
      if (type === "in" || type === "all") {
        if (!nodes.includes(link.source)) {
          nodes.push(link.source);
        }
      }
    }
  }
  return {
    nodes,
    edges
  };
}
function prepareRay(event, vec, size) {
  const { offsetX, offsetY } = event;
  const { width, height } = size;
  vec.set(offsetX / width * 2 - 1, -(offsetY / height) * 2 + 1);
}
function createElement(theme) {
  const element = document.createElement("div");
  element.style.pointerEvents = "none";
  element.style.border = theme.lasso.border;
  element.style.backgroundColor = theme.lasso.background;
  element.style.position = "fixed";
  return element;
}
const Lasso = ({
  children,
  type = "none",
  onLasso,
  onLassoEnd,
  disabled: disabled2
}) => {
  var _a2;
  const theme = useStore((state) => state.theme);
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);
  const setEvents = useThree((state) => state.setEvents);
  const size = useThree((state) => state.size);
  const get = useThree((state) => state.get);
  const scene = useThree((state) => state.scene);
  const cameraControls = useCameraControls();
  const actives = useStore((state) => state.actives);
  const setActives = useStore((state) => state.setActives);
  const edges = useStore((state) => state.edges);
  const edgeMeshes = useStore((state) => state.edgeMeshes);
  const mountedRef = useRef(false);
  const selectionBoxRef = useRef(null);
  const edgeMeshSelectionBoxRef = useRef(null);
  const elementRef = useRef(createElement(theme));
  const vectorsRef = useRef(null);
  const isDownRef = useRef(false);
  const oldRaycasterEnabledRef = useRef(get().events.enabled);
  const oldControlsEnabledRef = useRef(
    (_a2 = cameraControls.controls) == null ? void 0 : _a2.enabled
  );
  useEffect(() => {
    if (mountedRef.current) {
      onLasso == null ? void 0 : onLasso(actives);
    }
    mountedRef.current = true;
  }, [actives, onLasso]);
  const onPointerMove = useCallback(
    (event) => {
      if (isDownRef.current) {
        const [startPoint, pointTopLeft, pointBottomRight] = vectorsRef.current;
        pointBottomRight.x = Math.max(startPoint.x, event.clientX);
        pointBottomRight.y = Math.max(startPoint.y, event.clientY);
        pointTopLeft.x = Math.min(startPoint.x, event.clientX);
        pointTopLeft.y = Math.min(startPoint.y, event.clientY);
        elementRef.current.style.left = `${pointTopLeft.x}px`;
        elementRef.current.style.top = `${pointTopLeft.y}px`;
        elementRef.current.style.width = `${pointBottomRight.x - pointTopLeft.x}px`;
        elementRef.current.style.height = `${pointBottomRight.y - pointTopLeft.y}px`;
        prepareRay(event, selectionBoxRef.current.endPoint, size);
        prepareRay(event, edgeMeshSelectionBoxRef.current.endPoint, size);
        const allSelected = [];
        const edgesSelected = edgeMeshSelectionBoxRef.current.select().sort((o) => o.uuid).map(
          (edge) => edges[edgeMeshes.indexOf(edge)].id
        );
        allSelected.push(...edgesSelected);
        const selected = selectionBoxRef.current.select().sort((o) => o.uuid).filter(
          (o) => {
            var _a3, _b2;
            return o.isMesh && ((_a3 = o.userData) == null ? void 0 : _a3.id) && (((_b2 = o.userData) == null ? void 0 : _b2.type) === type || type === "all");
          }
        ).map((o) => o.userData.id);
        allSelected.push(...selected);
        requestAnimationFrame(() => {
          setActives(allSelected);
        });
        document.addEventListener("pointermove", onPointerMove, {
          passive: true,
          capture: true,
          once: true
        });
      }
    },
    [edges, edgeMeshes, setActives, size, type]
  );
  const onPointerUp = useCallback(() => {
    var _a3;
    if (isDownRef.current) {
      setEvents({ enabled: oldRaycasterEnabledRef.current });
      isDownRef.current = false;
      (_a3 = elementRef.current.parentElement) == null ? void 0 : _a3.removeChild(elementRef.current);
      cameraControls.controls.enabled = oldControlsEnabledRef.current;
      onLassoEnd == null ? void 0 : onLassoEnd(actives);
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
    }
  }, [setEvents, cameraControls.controls, onLassoEnd, actives, onPointerMove]);
  const onPointerDown = useCallback(
    (event) => {
      var _a3, _b2;
      if (event.shiftKey) {
        oldRaycasterEnabledRef.current = get().events.enabled;
        oldControlsEnabledRef.current = (_a3 = cameraControls.controls) == null ? void 0 : _a3.enabled;
        selectionBoxRef.current = new SelectionBox(camera, scene);
        const edgeScene = new Scene();
        if (edgeMeshes.length) {
          edgeScene.add(...edgeMeshes);
        }
        edgeMeshSelectionBoxRef.current = new SelectionBox(camera, edgeScene);
        vectorsRef.current = [
          // start point
          new Vector2(),
          // point top left
          new Vector2(),
          // point bottom right
          new Vector2()
        ];
        const [startPoint] = vectorsRef.current;
        cameraControls.controls.enabled = false;
        setEvents({ enabled: false });
        isDownRef.current = true;
        (_b2 = gl.domElement.parentElement) == null ? void 0 : _b2.appendChild(elementRef.current);
        elementRef.current.style.left = `${event.clientX}px`;
        elementRef.current.style.top = `${event.clientY}px`;
        elementRef.current.style.width = "0px";
        elementRef.current.style.height = "0px";
        startPoint.x = event.clientX;
        startPoint.y = event.clientY;
        prepareRay(event, selectionBoxRef.current.startPoint, size);
        prepareRay(event, edgeMeshSelectionBoxRef.current.startPoint, size);
        document.addEventListener("pointermove", onPointerMove, {
          passive: true,
          capture: true,
          once: true
        });
        document.addEventListener("pointerup", onPointerUp, { passive: true });
      }
    },
    [
      camera,
      cameraControls.controls,
      edgeMeshes,
      get,
      gl.domElement.parentElement,
      onPointerMove,
      onPointerUp,
      scene,
      setEvents,
      size
    ]
  );
  useEffect(() => {
    if (disabled2 || type === "none") {
      return;
    }
    if (typeof window !== "undefined") {
      document.addEventListener("pointerdown", onPointerDown, {
        passive: true
      });
      document.addEventListener("pointermove", onPointerMove, {
        passive: true
      });
      document.addEventListener("pointerup", onPointerUp, { passive: true });
    }
    return () => {
      if (typeof window !== "undefined") {
        document.removeEventListener("pointerdown", onPointerDown);
        document.removeEventListener("pointermove", onPointerMove);
        document.removeEventListener("pointerup", onPointerUp);
      }
    };
  }, [type, disabled2, onPointerDown, onPointerMove, onPointerUp]);
  return /* @__PURE__ */ jsx("group", { children });
};
const useSelection = ({
  selections = [],
  nodes = [],
  actives = [],
  focusOnSelect = true,
  type = "single",
  pathHoverType = "out",
  pathSelectionType = "direct",
  ref,
  hotkeys = ["selectAll", "deselect", "delete"],
  disabled: disabled2,
  onSelection
}) => {
  const [internalHovers, setInternalHovers] = useState([]);
  const [internalActives, setInternalActives] = useState(actives);
  const [internalSelections, setInternalSelections] = useState(selections);
  const [metaKeyDown, setMetaKeyDown] = useState(false);
  const isMulti = type === "multi" || type === "multiModifier";
  const addSelection = useCallback(
    (items) => {
      if (!disabled2 && items) {
        items = Array.isArray(items) ? items : [items];
        const filtered = items.filter(
          (item) => !internalSelections.includes(item)
        );
        if (filtered.length) {
          const next = [...internalSelections, ...filtered];
          onSelection == null ? void 0 : onSelection(next);
          setInternalSelections(next);
        }
      }
    },
    [disabled2, internalSelections, onSelection]
  );
  const removeSelection = useCallback(
    (items) => {
      if (!disabled2 && items) {
        items = Array.isArray(items) ? items : [items];
        const next = internalSelections.filter((i) => !items.includes(i));
        onSelection == null ? void 0 : onSelection(next);
        setInternalSelections(next);
      }
    },
    [disabled2, internalSelections, onSelection]
  );
  const clearSelections = useCallback(
    (next = []) => {
      if (!disabled2) {
        next = Array.isArray(next) ? next : [next];
        setInternalActives([]);
        setInternalSelections(next);
        onSelection == null ? void 0 : onSelection(next);
      }
    },
    [disabled2, onSelection]
  );
  const toggleSelection = useCallback(
    (item) => {
      const has = internalSelections.includes(item);
      if (has) {
        removeSelection(item);
      } else {
        if (!isMulti) {
          clearSelections(item);
        } else {
          addSelection(item);
        }
      }
    },
    [
      addSelection,
      clearSelections,
      internalSelections,
      isMulti,
      removeSelection
    ]
  );
  const onNodeClick = useCallback(
    (data) => {
      if (isMulti) {
        if (type === "multiModifier") {
          if (metaKeyDown) {
            addSelection(data.id);
          } else {
            clearSelections(data.id);
          }
        } else {
          addSelection(data.id);
        }
      } else {
        clearSelections(data.id);
      }
      if (focusOnSelect === true || focusOnSelect === "singleOnly" && !metaKeyDown) {
        if (!ref.current) {
          throw new Error("No ref found for the graph canvas.");
        }
        const graph = ref.current.getGraph();
        const { nodes: adjacents } = getAdjacents(
          graph,
          [data.id],
          pathSelectionType
        );
        ref.current.fitNodesInView([data.id, ...adjacents], {
          fitOnlyIfNodesNotInView: true
        });
      }
    },
    [
      addSelection,
      clearSelections,
      focusOnSelect,
      isMulti,
      metaKeyDown,
      pathSelectionType,
      ref,
      type
    ]
  );
  const selectNodePaths = useCallback(
    (source, target) => {
      const graph = ref.current.getGraph();
      if (!graph) {
        throw new Error("Graph is not initialized");
      }
      const path = findPath(graph, source, target);
      clearSelections([source, target]);
      const result = [];
      for (let i = 0; i < path.length - 1; i++) {
        const from = path[i];
        const to = path[i + 1];
        const edge = graph.getEdgeAttributes(from, to);
        if (edge) {
          result.push(edge.id);
        }
      }
      setInternalActives([...path.map((p) => p), ...result]);
    },
    [clearSelections, ref]
  );
  const onKeyDown = useCallback((event) => {
    const element = event.target;
    const isSafe = element.tagName !== "INPUT" && element.tagName !== "SELECT" && element.tagName !== "TEXTAREA" && !element.isContentEditable;
    const isMeta = event.metaKey || event.ctrlKey;
    if (isSafe && isMeta) {
      event.preventDefault();
      setMetaKeyDown(true);
    }
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", onKeyDown);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("keydown", onKeyDown);
      }
    };
  }, [onKeyDown]);
  const onCanvasClick = useCallback(
    (event) => {
      if (event.button !== 2 && (internalSelections.length || internalActives.length)) {
        clearSelections();
        setMetaKeyDown(false);
        if (focusOnSelect && internalSelections.length === 1) {
          if (!ref.current) {
            throw new Error("No ref found for the graph canvas.");
          }
          ref.current.fitNodesInView([], { fitOnlyIfNodesNotInView: true });
        }
      }
    },
    [
      clearSelections,
      focusOnSelect,
      internalActives.length,
      internalSelections.length,
      ref
    ]
  );
  const onLasso = useCallback((selections2) => {
    setInternalActives(selections2);
  }, []);
  const onLassoEnd = useCallback(
    (selections2) => {
      clearSelections(selections2);
    },
    [clearSelections]
  );
  const onNodePointerOver = useCallback(
    (data) => {
      if (pathHoverType) {
        const graph = ref.current.getGraph();
        if (!graph) {
          throw new Error("No ref found for the graph canvas.");
        }
        const { nodes: nodes2, edges } = getAdjacents(graph, [data.id], pathHoverType);
        setInternalHovers([...nodes2, ...edges]);
      }
    },
    [pathHoverType, ref]
  );
  const onNodePointerOut = useCallback(() => {
    if (pathHoverType) {
      setInternalHovers([]);
    }
  }, [pathHoverType]);
  useEffect(() => {
    var _a2;
    if (pathSelectionType !== "direct" && internalSelections.length > 0) {
      const graph = (_a2 = ref.current) == null ? void 0 : _a2.getGraph();
      if (graph) {
        const { nodes: nodes2, edges } = getAdjacents(
          graph,
          internalSelections,
          pathSelectionType
        );
        setInternalActives([...nodes2, ...edges]);
      }
    }
  }, [internalSelections, pathSelectionType, ref]);
  useHotkeys([
    {
      name: "Select All",
      keys: "mod+a",
      disabled: !hotkeys.includes("selectAll"),
      category: "Graph",
      description: "Select all nodes and edges",
      callback: (event) => {
        event.preventDefault();
        if (!disabled2 && type !== "single") {
          const next = nodes.map((n) => n.id);
          onSelection == null ? void 0 : onSelection(next);
          setInternalSelections(next);
        }
      }
    },
    {
      name: "Deselect Selections",
      category: "Graph",
      disabled: !hotkeys.includes("deselect"),
      description: "Deselect selected nodes and edges",
      keys: "escape",
      callback: (event) => {
        if (!disabled2) {
          event.preventDefault();
          onSelection == null ? void 0 : onSelection([]);
          setInternalSelections([]);
        }
      }
    }
  ]);
  const joinedActives = useMemo(
    () => [...internalActives, ...internalHovers],
    [internalActives, internalHovers]
  );
  return {
    actives: joinedActives,
    onNodeClick,
    onNodePointerOver,
    onNodePointerOut,
    onLasso,
    onLassoEnd,
    selectNodePaths,
    onCanvasClick,
    selections: internalSelections,
    clearSelections,
    addSelection,
    removeSelection,
    toggleSelection,
    setSelections: setInternalSelections
  };
};
const canvas = "_canvas_670zp_1";
const css$2 = {
  canvas
};
const GL_DEFAULTS = {
  alpha: true,
  antialias: true
};
const CAMERA_DEFAULTS = {
  position: [0, 0, 1e3],
  near: 5,
  far: 5e4,
  fov: 10
};
const GraphCanvas = forwardRef(
  ({
    cameraMode,
    edges,
    children,
    nodes,
    theme,
    minDistance,
    maxDistance,
    onCanvasClick,
    animated,
    disabled: disabled2,
    lassoType,
    onLasso,
    onLassoEnd,
    glOptions,
    ...rest
  }, ref) => {
    var _a2, _b2;
    const rendererRef = useRef(null);
    const controlsRef = useRef(null);
    const canvasRef = useRef(null);
    useImperativeHandle(ref, () => ({
      centerGraph: (nodeIds, opts) => {
        var _a3;
        return (_a3 = rendererRef.current) == null ? void 0 : _a3.centerGraph(nodeIds, opts);
      },
      fitNodesInView: (nodeIds, opts) => {
        var _a3;
        return (_a3 = rendererRef.current) == null ? void 0 : _a3.fitNodesInView(nodeIds, opts);
      },
      zoomIn: () => {
        var _a3;
        return (_a3 = controlsRef.current) == null ? void 0 : _a3.zoomIn();
      },
      zoomOut: () => {
        var _a3;
        return (_a3 = controlsRef.current) == null ? void 0 : _a3.zoomOut();
      },
      dollyIn: (distance) => {
        var _a3;
        return (_a3 = controlsRef.current) == null ? void 0 : _a3.dollyIn(distance);
      },
      dollyOut: (distance) => {
        var _a3;
        return (_a3 = controlsRef.current) == null ? void 0 : _a3.dollyOut(distance);
      },
      panLeft: () => {
        var _a3;
        return (_a3 = controlsRef.current) == null ? void 0 : _a3.panLeft();
      },
      panRight: () => {
        var _a3;
        return (_a3 = controlsRef.current) == null ? void 0 : _a3.panRight();
      },
      panDown: () => {
        var _a3;
        return (_a3 = controlsRef.current) == null ? void 0 : _a3.panDown();
      },
      panUp: () => {
        var _a3;
        return (_a3 = controlsRef.current) == null ? void 0 : _a3.panUp();
      },
      resetControls: (animated2) => {
        var _a3;
        return (_a3 = controlsRef.current) == null ? void 0 : _a3.resetControls(animated2);
      },
      getControls: () => {
        var _a3;
        return (_a3 = controlsRef.current) == null ? void 0 : _a3.controls;
      },
      getGraph: () => {
        var _a3;
        return (_a3 = rendererRef.current) == null ? void 0 : _a3.graph;
      },
      exportCanvas: () => {
        rendererRef.current.renderScene();
        return canvasRef.current.toDataURL();
      }
    }));
    const { selections, actives, collapsedNodeIds } = rest;
    const finalAnimated = edges.length + nodes.length > 400 ? false : animated;
    const gl = useMemo(() => ({ ...glOptions, ...GL_DEFAULTS }), [glOptions]);
    return /* @__PURE__ */ jsx("div", { className: css$2.canvas, children: /* @__PURE__ */ jsx(
      Canvas,
      {
        legacy: true,
        linear: true,
        ref: canvasRef,
        flat: true,
        gl,
        camera: CAMERA_DEFAULTS,
        onPointerMissed: onCanvasClick,
        children: /* @__PURE__ */ jsxs(
          Provider,
          {
            createStore: () => createStore({
              selections,
              actives,
              theme,
              collapsedNodeIds
            }),
            children: [
              ((_a2 = theme.canvas) == null ? void 0 : _a2.background) && /* @__PURE__ */ jsx("color", { attach: "background", args: [theme.canvas.background] }),
              /* @__PURE__ */ jsx("ambientLight", { intensity: 1 }),
              children,
              ((_b2 = theme.canvas) == null ? void 0 : _b2.fog) && /* @__PURE__ */ jsx("fog", { attach: "fog", args: [theme.canvas.fog, 4e3, 9e3] }),
              /* @__PURE__ */ jsx(
                CameraControls,
                {
                  mode: cameraMode,
                  ref: controlsRef,
                  disabled: disabled2,
                  minDistance,
                  maxDistance,
                  animated,
                  children: /* @__PURE__ */ jsx(
                    Lasso,
                    {
                      disabled: disabled2,
                      type: lassoType,
                      onLasso,
                      onLassoEnd,
                      children: /* @__PURE__ */ jsx(Suspense, { children: /* @__PURE__ */ jsx(
                        GraphScene,
                        {
                          ref: rendererRef,
                          disabled: disabled2,
                          animated: finalAnimated,
                          edges,
                          nodes,
                          ...rest
                        }
                      ) })
                    }
                  )
                }
              )
            ]
          }
        )
      }
    ) });
  }
);
GraphCanvas.defaultProps = {
  cameraMode: "pan",
  layoutType: "forceDirected2d",
  sizingType: "default",
  labelType: "auto",
  theme: lightTheme,
  animated: true,
  defaultNodeSize: 7,
  minNodeSize: 5,
  maxNodeSize: 15,
  lassoType: "none",
  glOptions: {}
};
const container$1 = "_container_155l7_1";
const disabled = "_disabled_155l7_7";
const contentContainer = "_contentContainer_155l7_10";
const contentInner = "_contentInner_155l7_35";
const content = "_content_155l7_10";
const css$1 = {
  container: container$1,
  disabled,
  contentContainer,
  contentInner,
  content
};
const RadialSlice = ({
  label,
  centralAngle,
  startAngle,
  endAngle,
  polar,
  radius,
  className,
  icon,
  innerRadius,
  skew,
  disabled: disabled2,
  onClick
}) => /* @__PURE__ */ jsx(
  "div",
  {
    role: "menuitem",
    className: classNames(css$1.container, className, {
      [css$1.disabled]: disabled2
    }),
    style: {
      width: centralAngle > 90 ? "100%" : "50%",
      height: centralAngle > 90 ? "100%" : "50%",
      bottom: centralAngle > 90 ? "50%" : "initial",
      right: centralAngle > 90 ? "50%" : "initial",
      transform: `rotate(${startAngle + endAngle}deg) skew(${skew}deg)`
    },
    onClick: (event) => {
      if (!disabled2) {
        onClick(event);
      }
    },
    children: /* @__PURE__ */ jsx(
      "div",
      {
        className: css$1.contentContainer,
        style: {
          transform: `skew(${-skew}deg) rotate(${(polar ? 90 : centralAngle) / 2 - 90}deg)`
        },
        children: /* @__PURE__ */ jsx(
          "div",
          {
            className: css$1.contentInner,
            style: {
              top: `calc((((${centralAngle > 90 ? "50% + " : ""}${radius}px) - ${innerRadius}px) / 2) - 4em)`
            },
            children: /* @__PURE__ */ jsxs(
              "div",
              {
                className: css$1.content,
                style: {
                  transform: `rotate(${-endAngle}deg)`
                },
                title: label,
                children: [
                  icon,
                  label
                ]
              }
            )
          }
        )
      }
    )
  }
);
function calculateRadius(items, startOffsetAngle) {
  const centralAngle = 360 / items.length || 360;
  const polar = centralAngle % 180 === 0;
  const deltaAngle = 90 - centralAngle;
  const startAngle = polar ? 45 : startOffsetAngle + deltaAngle + centralAngle / 2;
  return { centralAngle, polar, startAngle, deltaAngle };
}
const container = "_container_x9hyx_1";
const css = {
  container
};
const RadialMenu = ({
  items,
  radius,
  className,
  innerRadius,
  startOffsetAngle,
  onClose
}) => {
  const { centralAngle, polar, startAngle, deltaAngle } = useMemo(
    () => calculateRadius(items, startOffsetAngle),
    [items, startOffsetAngle]
  );
  const timeout = useRef(null);
  useLayoutEffect(() => {
    const timer = timeout.current;
    return () => clearTimeout(timer);
  }, []);
  if (items.length === 0) {
    return null;
  }
  return /* @__PURE__ */ jsx(
    "div",
    {
      role: "menu",
      className: classNames(css.container, className),
      onPointerEnter: () => clearTimeout(timeout.current),
      onPointerLeave: (event) => {
        clearTimeout(timeout.current);
        timeout.current = setTimeout(() => onClose == null ? void 0 : onClose(event), 500);
      },
      children: items.map((slice, index) => /* @__PURE__ */ jsx(
        RadialSlice,
        {
          ...slice,
          radius,
          innerRadius,
          startAngle,
          endAngle: centralAngle * index,
          skew: polar ? 0 : deltaAngle,
          polar,
          centralAngle,
          onClick: (event) => {
            slice == null ? void 0 : slice.onClick(event);
            onClose == null ? void 0 : onClose(event);
          }
        },
        index
      ))
    }
  );
};
RadialMenu.defaultProps = {
  radius: 175,
  innerRadius: 25,
  startOffsetAngle: 0
};
export {
  Arrow,
  CameraControls,
  CameraControlsContext,
  Cluster,
  Edge$1 as Edge,
  Edges,
  FORCE_LAYOUTS,
  GraphCanvas,
  GraphScene,
  Icon,
  Label,
  Lasso,
  Line,
  Node,
  RadialMenu,
  RadialSlice,
  Ring,
  Sphere,
  SphereWithIcon,
  SphereWithSvg,
  Svg,
  animationConfig,
  attributeSizing,
  buildClusterGroups,
  buildGraph,
  buildNodeEdges,
  calcLabelVisibility,
  calculateClusters,
  calculateEdgeCurveOffset,
  centralitySizing,
  circular2d,
  createElement,
  custom,
  darkTheme,
  findPath,
  forceAtlas2,
  forceDirected,
  forceRadial,
  getAdjacents,
  getArrowSize,
  getArrowVectors,
  getClosestAxis,
  getCurve,
  getCurvePoints,
  getDegreesToClosest2dAxis,
  getExpandPath,
  getLabelOffsetByType,
  getLayoutCenter,
  getMidPoint,
  getNodeDepth,
  getVector,
  getVisibleEntities,
  isNodeInView,
  layoutProvider,
  lightTheme,
  nodeSizeProvider,
  nooverlap,
  pageRankSizing,
  prepareRay,
  recommendLayout,
  tick,
  transformGraph,
  updateNodePosition,
  useCameraControls,
  useCenterGraph,
  useCollapse,
  useDrag,
  useGraph,
  useHoverIntent,
  useSelection
};
//# sourceMappingURL=index.js.map
