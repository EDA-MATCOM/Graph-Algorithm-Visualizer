import type { GraphModel, NodeId } from '../graph/types';
import type { AlgorithmStep, AlgorithmGenerator, ElementStatus } from './types';

function getNeighbors(graph: GraphModel, nodeId: NodeId) {
  return graph.edges
    .filter(e => e.source === nodeId || e.target === nodeId)
    .map(e => ({
      neighbor: e.source === nodeId ? e.target : e.source,
      edgeId: e.id,
    }));
}

export const articulationPointsPseudocode = [
  'DFS-AP(G):',
  '  time ← 0',
  '  for each node u in G:',
  '    if u not visited:',
  '      DFS-VISIT-PA(G, u)',
  '  (root: AP if ≥ 2 DFS children)',
  '',
  'DFS-VISIT-PA(G, u):',
  '  u ← visited',
  '  time ← time + 1',
  '  d[u] ← time;  low[u] ← d[u]',
  '  for each v ∈ Adj[u]:',
  '    if v not visited:',
  '      π[v] ← u',
  '      DFS-VISIT-PA(G, v)',
  '      low[u] ← min(low[u], low[v])',
  '      if low[v] ≥ d[u]:',
  '        u is an articulation point',
  '    else if π[u] ≠ v:',
  '      low[u] ← min(low[u], d[v])',
  '  if π[u] ≠ null ∧ low[u] = d[u]:',
  '    ⟨π[u], u⟩ is a bridge',
  '  return',
];

// Line index constants matching articulationPointsPseudocode
const L = {
  INIT:       1,
  FOR_NODE:   2,
  IF_UNVIS:   3,
  CALL_ROOT:  4,
  ROOT_AP:    5,
  VISIT_FN:   7,
  MARK_VIS:   8,
  TIME_INC:   9,
  SET_DISC:   10,
  FOR_ADJ:    11,
  IF_UNVIS_V: 12,
  SET_PARENT: 13,
  RECURSE:    14,
  UPD_LOW_V:  15,
  CHECK_AP:   16,
  MARK_AP:    17,
  ELSE_BACK:  18,
  UPD_LOW_D:  19,
  CHECK_BRDG: 20,
  MARK_BRDG:  21,
  RETURN:     22,
};

interface APState {
  visited:            Set<NodeId>;
  callStack:          NodeId[];
  disc:               Record<NodeId, number>;
  low:                Record<NodeId, number>;
  timer:              { value: number };
  articulationPoints: NodeId[];
  apSet:              Set<NodeId>;
  bridges:            Array<{ from: NodeId; to: NodeId }>;
  nodeStatuses:       Record<NodeId, ElementStatus>;
  edgeStatuses:       Record<string, ElementStatus>;
  stepCounter:        { value: number };
}

function snap(s: APState) {
  return {
    type: 'ap-bridge' as const,
    stack:              [...s.callStack],
    disc:               { ...s.disc },
    low:                { ...s.low },
    articulationPoints: [...s.articulationPoints],
    bridges:            s.bridges.map(b => ({ from: b.from, to: b.to })),
  };
}

function step(
  s: APState,
  line: number,
  description: string,
): AlgorithmStep {
  return {
    stepIndex:      s.stepCounter.value++,
    description,
    pseudocodeLine: line,
    nodeStatuses:   { ...s.nodeStatuses },
    edgeStatuses:   { ...s.edgeStatuses },
    auxiliaryState: snap(s),
  };
}

function* dfsVisitPA(
  graph:       GraphModel,
  node:        NodeId,
  parent:      NodeId | null,
  entryEdgeId: string | undefined,
  s:           APState,
): Generator<AlgorithmStep> {
  s.visited.add(node);
  s.callStack.push(node);
  s.nodeStatuses[node] = 'considering';
  s.timer.value++;
  s.disc[node] = s.timer.value;
  s.low[node]  = s.timer.value;

  yield step(s, L.SET_DISC,
    `Visit "${node}" — d[${node}]=${s.disc[node]}, low[${node}]=${s.low[node]}. Stack: [${s.callStack.join(' → ')}]`);

  let dfsChildren = 0;

  for (const { neighbor, edgeId } of getNeighbors(graph, node)) {
    if (!s.visited.has(neighbor)) {
      // Tree edge
      dfsChildren++;
      s.nodeStatuses[neighbor] = 'active';
      s.edgeStatuses[edgeId]   = 'considering';

      yield step(s, L.SET_PARENT,
        `"${neighbor}" unvisited → set π[${neighbor}]="${node}", recurse.`);

      yield* dfsVisitPA(graph, neighbor, node, edgeId, s);

      // low[u] ← min(low[u], low[v])
      const prevLow = s.low[node];
      s.low[node] = Math.min(s.low[node], s.low[neighbor]);

      yield step(s, L.UPD_LOW_V,
        `Back from "${neighbor}": low[${node}] ← min(${prevLow}, low[${neighbor}]=${s.low[neighbor]}) = ${s.low[node]}`);

      // Articulation point check (non-root)
      if (parent !== null) {
        if (s.low[neighbor] >= s.disc[node] && !s.apSet.has(node)) {
          s.apSet.add(node);
          s.articulationPoints.push(node);
          s.nodeStatuses[node] = 'path';

          yield step(s, L.MARK_AP,
            `low[${neighbor}]=${s.low[neighbor]} ≥ d[${node}]=${s.disc[node]} → "${node}" is an ARTICULATION POINT`);
        } else {
          yield step(s, L.CHECK_AP,
            `low[${neighbor}]=${s.low[neighbor]} vs d[${node}]=${s.disc[node]}: ${s.low[neighbor] >= s.disc[node] ? 'already marked AP' : 'no AP here'}`);
        }
      }

      // Mark tree edge; bridge detection below may promote it to 'path'
      s.edgeStatuses[edgeId] = 'visited';

    } else if (entryEdgeId === undefined || edgeId !== entryEdgeId) {
      // Back edge: visited neighbor that is not the parent edge
      const prevLow = s.low[node];
      s.low[node] = Math.min(s.low[node], s.disc[neighbor]);
      s.edgeStatuses[edgeId] = 'rejected';

      yield step(s, L.UPD_LOW_D,
        `"${neighbor}" visited, π[${node}]≠"${neighbor}" → back edge, low[${node}] ← min(${prevLow}, d[${neighbor}]=${s.disc[neighbor]}) = ${s.low[node]}`);
    }
  }

  // Root AP check: root is AP iff it has ≥ 2 DFS children
  if (parent === null && dfsChildren >= 2 && !s.apSet.has(node)) {
    s.apSet.add(node);
    s.articulationPoints.push(node);
    s.nodeStatuses[node] = 'path';

    yield step(s, L.ROOT_AP,
      `Root "${node}" has ${dfsChildren} DFS children ≥ 2 → ARTICULATION POINT`);
  }

  // Bridge check: π[u] ≠ null ∧ low[u] = d[u]
  if (parent !== null && s.low[node] === s.disc[node]) {
    s.bridges.push({ from: parent, to: node });
    if (entryEdgeId !== undefined) {
      s.edgeStatuses[entryEdgeId] = 'path';
    }

    yield step(s, L.MARK_BRDG,
      `low[${node}]=${s.low[node]} = d[${node}] → ⟨${parent}, ${node}⟩ is a BRIDGE`);
  }

  if (!s.apSet.has(node)) {
    s.nodeStatuses[node] = 'visited';
  }
  s.callStack.pop();

  yield step(s, L.RETURN,
    `Return from "${node}". d=${s.disc[node]}, low=${s.low[node]}. Stack: [${s.callStack.length ? s.callStack.join(' → ') : 'empty'}]`);
}

export const articulationPoints: AlgorithmGenerator = function* (graph, startNode) {
  const s: APState = {
    visited:            new Set(),
    callStack:          [],
    disc:               {},
    low:                {},
    timer:              { value: 0 },
    articulationPoints: [],
    apSet:              new Set(),
    bridges:            [],
    nodeStatuses:       {},
    edgeStatuses:       {},
    stepCounter:        { value: 0 },
  };

  graph.nodes.forEach(n => {
    s.nodeStatuses[n.id] = 'default';
    s.disc[n.id] = 0;
    s.low[n.id]  = 0;
  });
  graph.edges.forEach(e => { s.edgeStatuses[e.id] = 'default'; });

  yield step(s, L.INIT,
    `DFS-AP: initialize. Finding articulation points and bridge edges in ${graph.nodes.length} nodes.`);

  const first = startNode ?? graph.nodes[0]?.id;
  if (!first) return;

  const nodeOrder = [first, ...graph.nodes.map(n => n.id).filter(id => id !== first)];

  for (const nodeId of nodeOrder) {
    if (s.visited.has(nodeId)) continue;

    yield step(s, L.IF_UNVIS,
      `"${nodeId}" unvisited — DFS component root.`);

    yield* dfsVisitPA(graph, nodeId, null, undefined, s);
  }

  yield step(s, L.RETURN,
    `DFS-AP complete. Found ${s.articulationPoints.length} articulation point(s): [${s.articulationPoints.join(', ') || 'none'}]. Bridges: ${s.bridges.length}.`);
};
