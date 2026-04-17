import type { StylesheetStyle } from 'cytoscape';

export const cytoscapeStylesheet: StylesheetStyle[] = [
  {
    selector: 'node',
    style: {
      'background-color': '#1e293b',
      'border-color': '#64748b',
      'border-width': 2,
      'label': 'data(label)',
      'color': '#f8fafc',
      'font-size': 14,
      'text-valign': 'center',
      'text-halign': 'center',
      'width': 44,
      'height': 44,
      'transition-property': 'background-color, border-color, border-width',
      'transition-duration': 200,
    },
  },
  {
    selector: 'node[status="considering"]',
    style: { 'background-color': '#f59e0b', 'border-color': '#fbbf24', 'border-width': 4 },
  },
  {
    selector: 'node[status="active"]',
    style: { 'background-color': '#3b82f6', 'border-color': '#93c5fd', 'border-width': 3 },
  },
  {
    selector: 'node[status="visited"]',
    style: { 'background-color': '#475569', 'border-color': '#64748b' },
  },
  {
    selector: 'node[status="path"]',
    style: { 'background-color': '#10b981', 'border-color': '#34d399', 'border-width': 4 },
  },
  {
    selector: 'node[status="rejected"]',
    style: { 'background-color': '#7f1d1d', 'border-color': '#ef4444' },
  },
  {
    selector: 'node:selected',
    style: { 'border-color': '#a78bfa', 'border-width': 4 },
  },
  {
    selector: 'edge',
    style: {
      'line-color': '#334155',
      'target-arrow-color': '#475569',
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
      'width': 2,
      'label': 'data(weightLabel)',
      'font-size': 11,
      'color': '#94a3b8',
      'text-background-color': '#0f172a',
      'text-background-opacity': 0.8,
      'text-background-padding': '2px',
      'transition-property': 'line-color, width',
      'transition-duration': 200,
    },
  },
  {
    selector: 'edge[status="considering"]',
    style: { 'line-color': '#f59e0b', 'target-arrow-color': '#f59e0b', 'width': 4 },
  },
  {
    selector: 'edge[status="path"]',
    style: { 'line-color': '#10b981', 'target-arrow-color': '#10b981', 'width': 4 },
  },
  {
    selector: 'edge[status="rejected"]',
    style: { 'line-color': '#ef4444', 'target-arrow-color': '#ef4444', 'line-style': 'dashed' },
  },
  {
    selector: 'edge[status="active"]',
    style: { 'line-color': '#3b82f6', 'target-arrow-color': '#3b82f6', 'width': 3 },
  },
  {
    selector: 'edge:selected',
    style: { 'line-color': '#a78bfa', 'target-arrow-color': '#a78bfa', 'width': 3 },
  },
];
