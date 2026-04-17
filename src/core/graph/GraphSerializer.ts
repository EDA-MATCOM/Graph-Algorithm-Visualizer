import type { GraphModel, GraphNode, GraphEdge } from './types';

let nodeCounter = 0;
let edgeCounter = 0;

function nextNodeId(): string { return `n${++nodeCounter}`; }
function nextEdgeId(): string { return `e${++edgeCounter}`; }

export function parseAdjacencyList(text: string): GraphModel {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
  const nodeMap = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];

  let directed = false;
  let weighted = false;

  for (const line of lines) {
    const isDirected = line.includes('->');
    if (isDirected) directed = true;

    const [edgePart, weightStr] = isDirected
      ? [line.replace('->', ' '), null]
      : [line, null];

    const parts = edgePart.trim().split(/\s+/);
    if (parts.length < 2) continue;

    let src: string, tgt: string, w: number | undefined;

    if (isDirected) {
      // Already replaced '->' with space
      const rawParts = line.split('->');
      src = rawParts[0].trim();
      const rest = rawParts[1].trim().split(/\s+/);
      tgt = rest[0];
      if (rest[1]) { w = parseFloat(rest[1]); weighted = true; }
    } else {
      src = parts[0];
      tgt = parts[1];
      if (parts[2]) { w = parseFloat(parts[2]); weighted = true; }
    }

    void edgePart; void weightStr;

    if (!nodeMap.has(src)) {
      nodeMap.set(src, { id: src, label: src });
    }
    if (!nodeMap.has(tgt)) {
      nodeMap.set(tgt, { id: tgt, label: tgt });
    }

    edges.push({
      id: nextEdgeId(),
      source: src,
      target: tgt,
      weight: w,
      directed,
    });
  }

  return {
    nodes: [...nodeMap.values()],
    edges,
    directed,
    weighted,
  };
}

export function serializeToJSON(graph: GraphModel): string {
  return JSON.stringify(graph, null, 2);
}

export function deserializeFromJSON(json: string): GraphModel {
  return JSON.parse(json) as GraphModel;
}

export function createEmptyGraph(): GraphModel {
  return { nodes: [], edges: [], directed: false, weighted: false };
}

export function generateNodeId(): string { return nextNodeId(); }
export function generateEdgeId(): string { return nextEdgeId(); }

export function resetCounters() { nodeCounter = 0; edgeCounter = 0; }
