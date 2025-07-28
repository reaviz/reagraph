import React from 'react';
import { GraphCanvas } from '../../src';
import { Badge, Sphere, Label } from '../../src/symbols';

export default {
  title: 'Demos/Edges',
  component: GraphCanvas
};

export const SpecialRequest2 = () => (
  <GraphCanvas
    // edgeArrowPosition="none"
    labelType="none"
    layoutType="hierarchicalTd"
    nodes={[
      {
        id: 'hub',
        label: 'Hub',
        size: 10,
        data: {
          label: 'Hub',
          color: '#6d7482'
        }
      },
      {
        id: 'node1',
        size: 8,
        label: 'Security Review',
        data: {
          label: 'Security Review',
          color: '#e02628',
          badge: {
            badgeSize: 1.1,
            label: '3',
            backgroundColor: '#ffffff',
            textColor: '#000000',
            radius: 0.15,
            strokeWidth: 0.05,
            strokeColor: '#ededef'
          }
        }
      },
      {
        id: 'node2',
        label: 'Daily Sales Meeting',
        size: 6,
        data: {
          label: 'Daily Sales Meeting',
          color: '#ee5a0b',
          badge: {
            badgeSize: 1.1,
            label: '2',
            backgroundColor: '#ffffff',
            textColor: '#000000',
            radius: 0.15,
            strokeWidth: 0.05,
            strokeColor: '#ededef'
          }
        }
      },
      {
        id: 'node3',
        label: 'Critical Incident Response',
        size: 5,
        data: {
          label: 'Critical Incident Response',
          color: '#dd7904',
          badge: {
            badgeSize: 1.1,
            label: '2',
            backgroundColor: '#ffffff',
            textColor: '#000000',
            radius: 0.15,
            strokeWidth: 0.05,
            strokeColor: '#ededef'
          }
        }
      },
      {
        id: 'node4',
        size: 4,
        label: '',
        data: {
          label: '',
          color: '#67a60c',
          badge: {
            badgeSize: 1.1,
            label: '2',
            backgroundColor: '#ffffff',
            textColor: '#000000',
            radius: 0.15,
            strokeWidth: 0.05,
            strokeColor: '#ededef'
          }
        }
      },
      {
        id: 'node5',
        size: 2,
        label: '',
        data: {
          label: '',
          color: '#0d96b7',
          badge: {
            badgeSize: 1.1,
            label: '2',
            backgroundColor: '#ffffff',
            textColor: '#000000',
            radius: 0.15,
            strokeWidth: 0.05,
            strokeColor: '#ededef'
          }
        }
      },
      {
        id: 'node6',
        label: 'Meeting with John Smith',
        size: 5,
        data: {
          label: 'Meeting with John Smith',
          color: '#ee5a0b',
          badge: {
            badgeSize: 1.1,
            label: '3',
            backgroundColor: '#ffffff',
            textColor: '#000000',
            radius: 0.15,
            strokeWidth: 0.05,
            strokeColor: '#ededef'
          }
        }
      },
      {
        id: 'node7',
        label: 'Engineering Huddle',
        size: 5,
        data: {
          label: 'Engineering Huddle',
          color: '#dd7904',
          badge: {
            badgeSize: 1.1,
            label: '2',
            backgroundColor: '#ffffff',
            textColor: '#000000',
            radius: 0.15,
            strokeWidth: 0.05,
            strokeColor: '#ededef'
          }
        }
      },
      {
        id: 'node8',
        label: 'Project Kickoff',
        size: 5,
        data: {
          label: 'Project Kickoff',
          color: '#ee5a0b',
          badge: {
            badgeSize: 1.1,
            label: '2',
            backgroundColor: '#ffffff',
            textColor: '#000000',
            radius: 0.15,
            strokeWidth: 0.05,
            strokeColor: '#ededef'
          }
        }
      },
      {
        id: 'node9',
        label: 'Sales Opportunity',
        size: 5,
        data: {
          label: 'Sales Opportunity',
          color: '#dd7904',
          badge: {
            badgeSize: 1.1,
            label: '2',
            backgroundColor: '#ffffff',
            textColor: '#000000',
            radius: 0.15,
            strokeWidth: 0.05,
            strokeColor: '#ededef'
          }
        }
      },
      {
        id: 'node10',
        size: 8,
        label: 'PM Sync',
        data: {
          label: 'PM Sync',
          color: '#e02628',
          badge: {
            badgeSize: 1.1,
            label: '3',
            backgroundColor: '#ffffff',
            textColor: '#000000',
            radius: 0.15,
            strokeWidth: 0.05,
            strokeColor: '#ededef'
          }
        }
      },
      {
        id: 'node11',
        size: 4,
        label: '',
        data: {
          label: '',
          color: '#67a60c',
          badge: {
            badgeSize: 1.1,
            label: '2',
            backgroundColor: '#ffffff',
            textColor: '#000000',
            radius: 0.15,
            strokeWidth: 0.05,
            strokeColor: '#ededef'
          }
        }
      },
      {
        id: 'node12',
        size: 2,
        label: '',
        data: {
          label: '',
          color: '#0d96b7',
          badge: {
            badgeSize: 1.1,
            label: '2',
            backgroundColor: '#ffffff',
            textColor: '#000000',
            radius: 0.15,
            strokeWidth: 0.05,
            strokeColor: '#ededef'
          }
        }
      }
    ]}
    edges={[
      {
        source: 'hub',
        target: 'node1',
        id: 'hub-node1',
        dashed: true,
        fill: '#6d7482'
      },
      {
        source: 'node1',
        target: 'node2',
        id: 'node1-node2',
        dashed: true,
        fill: '#ee5a0b'
      },
      {
        source: 'node2',
        target: 'node3',
        id: 'node2-node3',
        dashed: true,
        fill: '#dd7904'
      },
      {
        source: 'node3',
        target: 'node4',
        id: 'node3-node4',
        dashed: true,
        fill: '#67a60c'
      },
      {
        source: 'node4',
        target: 'node5',
        id: 'node4-node5',
        dashed: true,
        fill: '#0d96b7'
      },
      {
        source: 'hub',
        target: 'node6',
        id: 'hub-node6',
        dashed: true,
        fill: '#ee5a0b'
      },
      {
        source: 'hub',
        target: 'node7',
        id: 'hub-node7',
        dashed: true,
        fill: '#dd7904'
      },
      {
        source: 'hub',
        target: 'node8',
        id: 'hub-node8',
        dashed: true,
        fill: '#ee5a0b'
      },
      {
        source: 'hub',
        target: 'node9',
        id: 'hub-node9',
        dashed: true,
        fill: '#dd7904'
      },
      {
        source: 'hub',
        target: 'node10',
        id: 'hub-node10',
        dashed: true,
        fill: '#e02628'
      },
      {
        source: 'node10',
        target: 'node11',
        id: 'node10-node11',
        dashed: true,
        fill: '#67a60c'
      },
      {
        source: 'node11',
        target: 'node12',
        id: 'node11-node12',
        dashed: true,
        fill: '#0d96b7'
      }
    ]}
    renderNode={({ node, ...rest }) => (
      <group>
        <Sphere {...rest} node={node} color={node.data.color} />
        {node.data.badge && (
          <Badge {...rest} node={node} {...node.data.badge} />
        )}
        <group position={[0, -(node?.size || 0) * 1.3, 0]}>
          <Label
            text={node?.data?.label ?? ''}
            fontSize={(node?.size || 0) * 0.4}
          />
        </group>
      </group>
    )}
  />
);
