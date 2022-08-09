import React, { useMemo } from 'react';
import { darkTheme, GraphCanvas, GraphEdge, GraphNode } from '../../src';
import cyberJson from '../assets/cyber.json';
import fireSvg from '../assets/fire.svg';
import flagSvg from '../assets/flag.svg';
import userSvg from '../assets/user.svg';
import twitterSvg from '../assets/twitter.svg';
import keySvg from '../assets/key.svg';
import trumpSvg from '../assets/trump.svg';
import govSvg from '../assets/gov.svg';
import productSvg from '../assets/product.svg';
import missleSvg from '../assets/missle.svg';

export default {
  title: 'Demos/Use Cases',
  component: GraphCanvas
};

const iconMap = {
  'Incident': fireSvg,
  'Country': flagSvg,
  'Province': flagSvg,
  'Place': flagSvg,
  'Continent': flagSvg,
  'Username': userSvg,
  'Person': userSvg,
  'twitter.com': twitterSvg,
  'Keyphrase': keySvg,
  'Donald Trump': trumpSvg,
  'GovernmentBody': govSvg,
  'MilitaryEquipment': missleSvg,
  'Product': productSvg
}

export const CyberSecurity = () => {
  const [nodes, edges] = useMemo(() => {
    const n: GraphNode[] = [];
    const e: GraphEdge[] = [];

    // TODO: Make it work better w/ entire dataset
    const subset = cyberJson.slice(0, 100);
    for (const node of subset) {
      const node1 = {
        id: node.ItemIdA,
        label: node.ItemDescriptionA,
        icon: iconMap[node.ItemTypeA] || iconMap[node.ItemDescriptionA]
      };

      const node2 = {
        id: node.ItemIdB,
        label: node.ItemDescriptionB,
        icon: iconMap[node.ItemTypeB] || iconMap[node.ItemDescriptionB]
      };

      n.push(node1, node2);

      e.push({
        id: `${node1.id}-${node2.id}`,
        source: node1.id,
        target: node2.id
      });
    }

    return [n, e];
  }, []);

  return (
    <GraphCanvas
      labelType="nodes"
      nodes={nodes}
      edges={edges}
      theme={darkTheme}
      draggable
      layoutType="forceDirected2d"
    />
  );
};
