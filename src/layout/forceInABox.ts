import {
  forceSimulation,
  forceX,
  forceY,
  forceLink,
  forceManyBody,
  forceCollide
} from 'd3-force-3d';
import { treemap, hierarchy } from 'd3-hierarchy';
import { ClusterGroup } from '../utils/cluster';

/**
 * Used for calculating clusterings of nodes.
 *
 * Modified version of: https://github.com/john-guerra/forceInABox
 *
 * Changes:
 *  - Improved d3 import for tree shaking
 *  - Fixed node lookup for edges using array
 *  - Updated d3-force to use d3-force-3d
 *  - Removed template logic
 */
export function forceInABox() {
  // d3 style
  const constant = (_: any) => () => _;
  const index = (d: any) => d.index;

  // Default values
  let id = index;
  let nodes = [];
  let links = []; // needed for the force version
  let clusters: Map<string, ClusterGroup>;
  let tree;
  let size = [100, 100];
  let forceNodeSize = constant(1); // The expected node size used for computing the cluster node
  let forceCharge = constant(-1);
  let forceLinkDistance = constant(100);
  let forceLinkStrength = constant(0.1);
  let foci = {};
  let linkStrengthIntraCluster = 0.1;
  let linkStrengthInterCluster = 0.001;
  let templateNodes = [];
  let offset = [0, 0];
  let templateForce;
  let groupBy = d => d.cluster;
  let template = 'treemap';
  let enableGrouping = true;
  let strength = 0.1;

  function force(alpha) {
    if (!enableGrouping) {
      return force;
    }

    if (template === 'force') {
      // Do the tick of the template force and get the new focis
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

    if (template === 'treemap') {
      initializeWithTreemap();
    } else {
      initializeWithForce();
    }
  }

  force.initialize = function (_) {
    nodes = _;
    initialize();
  };

  function getLinkKey(l) {
    let sourceID = groupBy(l.source),
      targetID = groupBy(l.target);

    return sourceID <= targetID
      ? sourceID + '~' + targetID
      : targetID + '~' + sourceID;
  }

  function computeClustersNodeCounts(nodes) {
    let clustersCounts = new Map(),
      tmpCount: any = {};

    nodes.forEach(function (d) {
      if (!clustersCounts.has(groupBy(d))) {
        clustersCounts.set(groupBy(d), { count: 0, sumforceNodeSize: 0 });
      }
    });

    nodes.forEach(function (d) {
      tmpCount = clustersCounts.get(groupBy(d));
      tmpCount.count = tmpCount.count + 1;
      tmpCount.sumforceNodeSize =
        tmpCount.sumforceNodeSize +
        // @ts-ignore
        Math.PI * (forceNodeSize(d) * forceNodeSize(d)) * 1.3;
      clustersCounts.set(groupBy(d), tmpCount);
    });

    return clustersCounts;
  }

  //Returns
  function computeClustersLinkCounts(links) {
    let dClusterLinks = new Map(),
      clusterLinks = [];

    links.forEach(function (l) {
      let key = getLinkKey(l),
        count;
      if (dClusterLinks.has(key)) {
        count = dClusterLinks.get(key);
      } else {
        count = 0;
      }
      count += 1;
      dClusterLinks.set(key, count);
    });

    dClusterLinks.forEach(function (value, key) {
      let source, target;
      source = key.split('~')[0];
      target = key.split('~')[1];
      if (source !== undefined && target !== undefined) {
        clusterLinks.push({
          source: source,
          target: target,
          count: value
        });
      }
    });

    return clusterLinks;
  }

  //Returns the metagraph of the clusters
  function getGroupsGraph() {
    let gnodes = [];
    let glinks = [];
    let dNodes = new Map();
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
      }); // Uses approx meta-node size
      dNodes.set(c, i);
    }

    clustersLinks.forEach(function (l) {
      let source = dNodes.get(l.source),
        target = dNodes.get(l.target);
      if (source !== undefined && target !== undefined) {
        glinks.push({
          source: source,
          target: target,
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

    // @ts-ignore
    clustersCounts = computeClustersNodeCounts(force.nodes());

    for (c of clustersCounts.keys()) {
      cc = clustersCounts.get(c);
      children.push({ id: c, size: cc.count });
    }
    return { id: 'clustersTree', children: children };
  }

  function getFocisFromTemplate() {
    //compute foci
    // @ts-ignore
    foci.none = { x: 0, y: 0 };
    templateNodes.forEach(function (d) {
      if (template === 'treemap') {
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
    // @ts-ignore
    let sim = treemap().size(force.size());

    tree = hierarchy(getGroupsTree())
      .sum((d: any) => d.radius)
      .sort(function (a, b) {
        return b.height - a.height || b.value - a.value;
      });

    templateNodes = sim(tree).leaves();
    getFocisFromTemplate();
  }

  function checkLinksAsObjects() {
    // Check if links come in the format of indexes instead of objects
    let linkCount = 0;
    if (nodes.length === 0) return;

    links.forEach(function (link) {
      let source, target;
      if (!nodes) {
        return;
      }

      source = link.source;
      target = link.target;

      if (typeof link.source !== 'object') {
        source = nodes.find(n => n.id === link.source);
      }

      if (typeof link.target !== 'object') {
        target = nodes.find(n => n.id === link.target);
      }

      if (source === undefined || target === undefined) {
        throw Error(
          'Error setting links, couldnt find nodes for a link (see it on the console)'
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

    // Use dragged clusters position if available
    if (clusters.size > 0) {
      net.nodes.forEach(n => {
        // Set fixed X position for cluster
        n.fx = clusters.get(n.id)?.position?.x;
        // Set fixed Y position for cluster
        n.fy = clusters.get(n.id)?.position?.y;
      });
    }

    templateForce = forceSimulation(net.nodes)
      .force('x', forceX(size[0] / 2).strength(0.1))
      .force('y', forceY(size[1] / 2).strength(0.1))
      .force('collide', forceCollide(d => d.r).iterations(4))
      .force('charge', forceManyBody().strength(forceCharge))
      .force(
        'links',
        forceLink(net.nodes.length ? net.links : [])
          .distance(forceLinkDistance)
          .strength(forceLinkStrength)
      );

    templateNodes = templateForce.nodes();

    getFocisFromTemplate();
  }

  force.template = function (x) {
    if (!arguments.length) {
      return template;
    }

    template = x;
    initialize();
    return force;
  };

  force.groupBy = function (x) {
    if (!arguments.length) {
      return groupBy;
    }

    if (typeof x === 'string') {
      groupBy = function (d) {
        return d[x];
      };

      return force;
    }

    groupBy = x;

    return force;
  };

  force.enableGrouping = function (x) {
    if (!arguments.length) {
      return enableGrouping;
    }

    enableGrouping = x;

    return force;
  };

  force.strength = function (x) {
    if (!arguments.length) {
      return strength;
    }

    strength = x;

    return force as any;
  };

  force.getLinkStrength = function (e) {
    if (enableGrouping) {
      if (groupBy(e.source) === groupBy(e.target)) {
        if (typeof linkStrengthIntraCluster === 'function') {
          // @ts-ignore
          return linkStrengthIntraCluster(e);
        } else {
          return linkStrengthIntraCluster;
        }
      } else {
        if (typeof linkStrengthInterCluster === 'function') {
          // @ts-ignore
          return linkStrengthInterCluster(e);
        } else {
          return linkStrengthInterCluster;
        }
      }
    } else {
      // Not grouping return the intracluster
      if (typeof linkStrengthIntraCluster === 'function') {
        // @ts-ignore
        return linkStrengthIntraCluster(e);
      } else {
        return linkStrengthIntraCluster;
      }
    }
  };

  force.id = function (_) {
    return arguments.length ? ((id = _), force) : id;
  };

  force.size = function (_) {
    return arguments.length ? ((size = _), force) : size;
  };

  force.linkStrengthInterCluster = function (_) {
    return arguments.length
      ? ((linkStrengthInterCluster = _), force)
      : linkStrengthInterCluster;
  };

  force.linkStrengthIntraCluster = function (_) {
    return arguments.length
      ? ((linkStrengthIntraCluster = _), force)
      : linkStrengthIntraCluster;
  };

  force.nodes = function (_) {
    return arguments.length ? ((nodes = _), force) : nodes;
  };

  force.links = function (_) {
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

  force.template = function (x) {
    if (!arguments.length) {
      return template;
    }

    template = x;
    initialize();
    return force;
  };

  force.forceNodeSize = function (_) {
    return arguments.length
      ? ((forceNodeSize = typeof _ === 'function' ? _ : constant(+_)),
      initialize(),
      force)
      : forceNodeSize;
  };

  // Legacy support
  force.nodeSize = force.forceNodeSize;

  force.forceCharge = function (_) {
    return arguments.length
      ? ((forceCharge = typeof _ === 'function' ? _ : constant(+_)),
      initialize(),
      force)
      : forceCharge;
  };

  force.forceLinkDistance = function (_) {
    return arguments.length
      ? ((forceLinkDistance = typeof _ === 'function' ? _ : constant(+_)),
      initialize(),
      force)
      : forceLinkDistance;
  };

  force.forceLinkStrength = function (_) {
    return arguments.length
      ? ((forceLinkStrength = typeof _ === 'function' ? _ : constant(+_)),
      initialize(),
      force)
      : forceLinkStrength;
  };

  force.offset = function (_) {
    return arguments.length
      ? ((offset = typeof _ === 'function' ? _ : constant(+_)), force)
      : offset;
  };

  force.getFocis = getFocisFromTemplate;

  // Define the clusters to reuse positions from
  force.setClusters = function (value: any) {
    clusters = value;

    return force;
  };

  return force;
}
