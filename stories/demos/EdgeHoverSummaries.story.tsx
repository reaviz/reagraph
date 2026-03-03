import React, { useCallback, useRef, useState } from 'react';

import type {
  GraphCanvasRef,
  GraphEdge,
  GraphNode,
  InternalGraphEdge
} from '../../src';
import { darkTheme, GraphCanvas, useSelection } from '../../src';

export default {
  title: 'Demos/Edge Hover Summaries',
  component: GraphCanvas
};

// --- Precomputed edge facet data ---
// Simulates analyst-ready metadata you'd normally compute server-side or
// during data-ingest: relationship type, interaction count, last-seen
// timestamp, top entities involved, and a one-sentence LLM summary.

interface EdgeFacets {
  relationshipType: string;
  lastSeen: string;
  interactionCount: number;
  topEntities: string[];
  summary: string;
  eventBreakdown: Record<string, number>;
}

const edgeFacets: Record<string, EdgeFacets> = {
  'alice->bob': {
    relationshipType: 'Financial Transfer',
    lastSeen: '2026-03-02T14:32:00Z',
    interactionCount: 47,
    topEntities: ['ACH-8812', 'Wire-4401', 'Acct-991'],
    summary:
      'Frequent wire transfers between personal accounts, mostly sub-$10k.',
    eventBreakdown: { Wire: 28, ACH: 14, Check: 5 }
  },
  'alice->server1': {
    relationshipType: 'SSH Session',
    lastSeen: '2026-03-03T08:15:00Z',
    interactionCount: 312,
    topEntities: ['root', 'deploy-key-7', 'cron-backup'],
    summary:
      'Daily automated deploys plus occasional manual root sessions from Alice.',
    eventBreakdown: { Automated: 280, Interactive: 32 }
  },
  'bob->charlie': {
    relationshipType: 'Email Thread',
    lastSeen: '2026-02-28T19:44:00Z',
    interactionCount: 18,
    topEntities: ['RE: Q4 Report', 'Fwd: Credentials', 'Meeting Notes'],
    summary:
      'Low-volume email thread; one message contained forwarded credentials.',
    eventBreakdown: { Sent: 9, Received: 9 }
  },
  'charlie->db': {
    relationshipType: 'DB Query',
    lastSeen: '2026-03-03T02:00:00Z',
    interactionCount: 4_521,
    topEntities: ['SELECT *', 'users_pii', 'export_csv'],
    summary:
      'Bulk PII exports spiked last week — possible exfiltration vector.',
    eventBreakdown: { SELECT: 4200, INSERT: 150, DELETE: 171 }
  },
  'server1->db': {
    relationshipType: 'API Call',
    lastSeen: '2026-03-03T09:01:00Z',
    interactionCount: 89_230,
    topEntities: ['/api/v2/users', '/healthz', '/api/v2/export'],
    summary:
      'High-throughput read traffic dominated by health checks and user lookups.',
    eventBreakdown: { GET: 85000, POST: 3200, DELETE: 1030 }
  },
  'charlie->alice': {
    relationshipType: 'Slack DM',
    lastSeen: '2026-03-01T11:22:00Z',
    interactionCount: 63,
    topEntities: ['#incident-resp', 'file:ssh-key.pem', '@alice'],
    summary:
      'Charlie shared an SSH private key with Alice over DM during an incident.',
    eventBreakdown: { Message: 58, FileShare: 5 }
  },
  'bob->server1': {
    relationshipType: 'VPN Login',
    lastSeen: '2026-03-02T23:58:00Z',
    interactionCount: 8,
    topEntities: ['vpn-gateway-us', 'MFA-bypass-token', '10.0.0.44'],
    summary:
      'Sporadic late-night VPN logins from an unusual IP range; MFA bypass used twice.',
    eventBreakdown: { Login: 6, 'MFA Bypass': 2 }
  }
};

// --- Graph data ---

const nodes: GraphNode[] = [
  { id: 'alice', label: 'Alice (Analyst)', fill: '#6366f1' },
  { id: 'bob', label: 'Bob (Finance)', fill: '#f59e0b' },
  { id: 'charlie', label: 'Charlie (Eng)', fill: '#10b981' },
  { id: 'server1', label: 'Prod Server', fill: '#ef4444' },
  { id: 'db', label: 'PII Database', fill: '#8b5cf6' }
];

const edges: GraphEdge[] = [
  {
    id: 'alice->bob',
    source: 'alice',
    target: 'bob',
    label: 'Financial Transfer'
  },
  {
    id: 'alice->server1',
    source: 'alice',
    target: 'server1',
    label: 'SSH Session'
  },
  {
    id: 'bob->charlie',
    source: 'bob',
    target: 'charlie',
    label: 'Email Thread'
  },
  {
    id: 'charlie->db',
    source: 'charlie',
    target: 'db',
    label: 'DB Query',
    size: 3
  },
  {
    id: 'server1->db',
    source: 'server1',
    target: 'db',
    label: 'API Call',
    size: 4
  },
  {
    id: 'charlie->alice',
    source: 'charlie',
    target: 'alice',
    label: 'Slack DM',
    interpolation: 'curved'
  },
  {
    id: 'bob->server1',
    source: 'bob',
    target: 'server1',
    label: 'VPN Login',
    dashed: true
  }
];

// --- Helpers ---

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const now = new Date('2026-03-03T10:00:00Z');
  const diffMs = now.getTime() - d.getTime();
  const diffH = Math.floor(diffMs / 3_600_000);
  if (diffH < 1) return 'just now';
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}d ago`;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

// --- Styles ---

const cardStyle: React.CSSProperties = {
  position: 'absolute',
  top: 12,
  right: 12,
  width: 320,
  background: 'rgba(15, 23, 42, 0.95)',
  border: '1px solid rgba(99, 102, 241, 0.4)',
  borderRadius: 8,
  padding: '14px 16px',
  color: '#e2e8f0',
  fontSize: 13,
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  zIndex: 100,
  pointerEvents: 'none',
  lineHeight: 1.5
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 10,
  paddingBottom: 8,
  borderBottom: '1px solid rgba(99, 102, 241, 0.2)'
};

const typeTagStyle: React.CSSProperties = {
  background: 'rgba(99, 102, 241, 0.25)',
  color: '#a5b4fc',
  padding: '2px 8px',
  borderRadius: 4,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: 0.3,
  textTransform: 'uppercase'
};

const statRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 16,
  marginBottom: 10
};

const statBoxStyle: React.CSSProperties = {
  flex: 1,
  background: 'rgba(30, 41, 59, 0.7)',
  borderRadius: 6,
  padding: '6px 10px',
  textAlign: 'center'
};

const statValueStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: '#f1f5f9'
};

const statLabelStyle: React.CSSProperties = {
  fontSize: 10,
  color: '#94a3b8',
  textTransform: 'uppercase',
  letterSpacing: 0.5
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 10,
  color: '#94a3b8',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  marginBottom: 4
};

const entityPillStyle: React.CSSProperties = {
  display: 'inline-block',
  background: 'rgba(30, 41, 59, 0.8)',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  borderRadius: 4,
  padding: '2px 6px',
  fontSize: 11,
  marginRight: 4,
  marginBottom: 4,
  color: '#cbd5e1'
};

const barContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: 4,
  alignItems: 'flex-end',
  height: 32,
  marginBottom: 10
};

const summaryStyle: React.CSSProperties = {
  fontStyle: 'italic',
  color: '#94a3b8',
  fontSize: 12,
  borderLeft: '2px solid rgba(99, 102, 241, 0.4)',
  paddingLeft: 8
};

// --- Summary Card Component ---

function EdgeSummaryCard({ facets }: { facets: EdgeFacets }) {
  const maxEvent = Math.max(...Object.values(facets.eventBreakdown));

  return (
    <div style={cardStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <span style={typeTagStyle}>{facets.relationshipType}</span>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>
          {formatTimestamp(facets.lastSeen)}
        </span>
      </div>

      {/* Stats row */}
      <div style={statRowStyle}>
        <div style={statBoxStyle}>
          <div style={statValueStyle}>
            {formatCount(facets.interactionCount)}
          </div>
          <div style={statLabelStyle}>Interactions</div>
        </div>
        <div style={statBoxStyle}>
          <div style={statValueStyle}>
            {Object.keys(facets.eventBreakdown).length}
          </div>
          <div style={statLabelStyle}>Event Types</div>
        </div>
        <div style={statBoxStyle}>
          <div style={statValueStyle}>{facets.topEntities.length}</div>
          <div style={statLabelStyle}>Key Entities</div>
        </div>
      </div>

      {/* Event breakdown mini-bar */}
      <div style={sectionTitleStyle}>Event Breakdown</div>
      <div style={barContainerStyle}>
        {Object.entries(facets.eventBreakdown).map(([type, count]) => (
          <div
            key={type}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2
            }}
          >
            <div
              style={{
                width: '100%',
                height: Math.max(4, (count / maxEvent) * 28),
                background: 'rgba(99, 102, 241, 0.6)',
                borderRadius: 2
              }}
            />
            <span style={{ fontSize: 9, color: '#94a3b8' }}>{type}</span>
          </div>
        ))}
      </div>

      {/* Top entities */}
      <div style={sectionTitleStyle}>Top Entities</div>
      <div style={{ marginBottom: 10 }}>
        {facets.topEntities.map(entity => (
          <span key={entity} style={entityPillStyle}>
            {entity}
          </span>
        ))}
      </div>

      {/* LLM Summary */}
      <div style={sectionTitleStyle}>AI Summary</div>
      <div style={summaryStyle}>{facets.summary}</div>
    </div>
  );
}

// --- Hint banner ---

const hintStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 12,
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(15, 23, 42, 0.85)',
  color: '#94a3b8',
  padding: '6px 14px',
  borderRadius: 6,
  fontSize: 12,
  zIndex: 100,
  pointerEvents: 'none',
  whiteSpace: 'nowrap'
};

// --- Story: Basic ---

export const Basic = () => {
  const [hoveredEdge, setHoveredEdge] = useState<InternalGraphEdge | null>(
    null
  );

  const handleEdgePointerOver = useCallback(
    (edge: InternalGraphEdge) => setHoveredEdge(edge),
    []
  );

  const handleEdgePointerOut = useCallback(() => setHoveredEdge(null), []);

  const facets = hoveredEdge ? edgeFacets[hoveredEdge.id] : null;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <GraphCanvas
        nodes={nodes}
        edges={edges}
        theme={darkTheme}
        labelType="all"
        edgeInterpolation="curved"
        edgeArrowPosition="end"
        draggable
        onEdgePointerOver={handleEdgePointerOver}
        onEdgePointerOut={handleEdgePointerOut}
      />
      {facets && <EdgeSummaryCard facets={facets} />}
      {!hoveredEdge && (
        <div style={hintStyle}>Hover over an edge to see its summary</div>
      )}
    </div>
  );
};

// --- Story: With Selection Highlighting ---

export const WithSelectionHighlighting = () => {
  const graphRef = useRef<GraphCanvasRef | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<InternalGraphEdge | null>(
    null
  );

  const {
    selections,
    actives,
    onNodeClick,
    onCanvasClick,
    onNodePointerOver,
    onNodePointerOut
  } = useSelection({
    ref: graphRef,
    nodes,
    edges,
    pathHoverType: 'direct'
  });

  const handleEdgePointerOver = useCallback(
    (edge: InternalGraphEdge) => setHoveredEdge(edge),
    []
  );

  const handleEdgePointerOut = useCallback(() => setHoveredEdge(null), []);

  const facets = hoveredEdge ? edgeFacets[hoveredEdge.id] : null;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <GraphCanvas
        ref={graphRef}
        nodes={nodes}
        edges={edges}
        theme={darkTheme}
        labelType="all"
        edgeInterpolation="curved"
        edgeArrowPosition="end"
        draggable
        selections={selections}
        actives={actives}
        onNodeClick={onNodeClick}
        onCanvasClick={onCanvasClick}
        onNodePointerOver={onNodePointerOver}
        onNodePointerOut={onNodePointerOut}
        onEdgePointerOver={handleEdgePointerOver}
        onEdgePointerOut={handleEdgePointerOut}
      />
      {facets && <EdgeSummaryCard facets={facets} />}
      {!hoveredEdge && (
        <div style={hintStyle}>
          Hover edges for summaries &middot; Click nodes to highlight paths
        </div>
      )}
    </div>
  );
};
