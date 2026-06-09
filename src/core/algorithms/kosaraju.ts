import type { GraphModel, NodeId } from '../graph/types';
import type { AlgorithmStep, AlgorithmGenerator, ElementStatus } from './types';

function getOutNeighbors(graph: GraphModel, nodeId: NodeId) {
  return graph.edges
    .filter(e => e.source === nodeId)
    .map(e => ({ neighbor: e.target, edgeId: e.id }));
}

function getTransposeNeighbors(graph: GraphModel, nodeId: NodeId) {
  return graph.edges
    .filter(e => e.target === nodeId)
    .map(e => ({ neighbor: e.source, edgeId: e.id }));
}

export const kosarajuPseudocode = [
  /* 0  */ 'STRONGLY-CONNECTED-COMPONENTS(G):',
  /* 1  */ '  S ← DFS_SCC_1(G)',
  /* 2  */ '  Compute Gᵀ (transpose all edges)',
  /* 3  */ '  DFS_SCC_2(Gᵀ, S)',
  /* 4  */ '',
  /* 5  */ 'DFS_SCC_1(G):',
  /* 6  */ '  for each u: color[u] ← WHITE',
  /* 7  */ '  S ← new Stack()',
  /* 8  */ '  for each u:',
  /* 9  */ '    if color[u] = WHITE: DFS-VISIT-1(G, u, S)',
  /* 10 */ '  return S',
  /* 11 */ '',
  /* 12 */ 'DFS-VISIT-1(G, u, S):',
  /* 13 */ '  color[u] ← GRAY; time++; u.d ← time',
  /* 14 */ '  for each v ∈ Adj[u]:',
  /* 15 */ '    if color[v] = WHITE: DFS-VISIT-1(G, v, S)',
  /* 16 */ '  color[u] ← BLACK; time++; u.f ← time',
  /* 17 */ '  S.Push(u)',
  /* 18 */ '',
  /* 19 */ 'DFS_SCC_2(Gᵀ, S):',
  /* 20 */ '  for each u: color[u] ← WHITE; c ← 0',
  /* 21 */ '  while S.Count > 0:',
  /* 22 */ '    u ← S.Pop()',
  /* 23 */ '    if color[u] = WHITE:',
  /* 24 */ '      DFS-VISIT-2(Gᵀ, u, c); c ← c + 1',
  /* 25 */ '',
  /* 26 */ 'DFS-VISIT-2(Gᵀ, u, c):',
  /* 27 */ '  color[u] ← GRAY',
  /* 28 */ '  for each v ∈ Adj[u]:',
  /* 29 */ '    if color[v] = WHITE: DFS-VISIT-2(Gᵀ, v, c)',
  /* 30 */ '  color[u] ← BLACK; u.CC ← c',
];

const VISIT1_BASE = 12;
const VISIT2_BASE = 26;

function snap1(
  phase: 1 | 2,
  finishStack: NodeId[],
  callStack: NodeId[],
  d: Record<NodeId, number>,
  f: Record<NodeId, number>,
  time: { value: number },
) {
  return {
    type: 'kosaraju' as const,
    phase,
    finishStack: [...finishStack],
    callStack: [...callStack],
    currentSCC: [],
    sccs: [],
    d: { ...d },
    f: { ...f },
    time: time.value,
  };
}

function snap2(
  finishStack: NodeId[],
  callStack: NodeId[],
  currentSCC: NodeId[],
  sccs: NodeId[][],
  d: Record<NodeId, number>,
  f: Record<NodeId, number>,
) {
  return {
    type: 'kosaraju' as const,
    phase: 2 as const,
    finishStack: [...finishStack],
    callStack: [...callStack],
    currentSCC: [...currentSCC],
    sccs: sccs.map(s => [...s]),
    d: { ...d },
    f: { ...f },
    time: 0,
  };
}

function* kosarajuVisit1(
  graph: GraphModel,
  node: NodeId,
  visited1: Set<NodeId>,
  callStack: NodeId[],
  finishStack: NodeId[],
  nodeStatuses: Record<NodeId, ElementStatus>,
  edgeStatuses: Record<string, ElementStatus>,
  stepCounter: { value: number },
  time: { value: number },
  d: Record<NodeId, number>,
  f: Record<NodeId, number>,
): Generator<AlgorithmStep> {
  visited1.add(node);
  callStack.push(node);
  nodeStatuses[node] = 'considering';
  time.value++;
  d[node] = time.value;

  yield {
    stepIndex: stepCounter.value++,
    description: `Phase 1 — visit "${node}": GRAY, d[${node}]=${d[node]}. Stack: [${callStack.join(' → ')}]`,
    pseudocodeLine: VISIT1_BASE + 1,
    nodeStatuses: { ...nodeStatuses },
    edgeStatuses: { ...edgeStatuses },
    auxiliaryState: snap1(1, finishStack, callStack, d, f, time),
  } satisfies AlgorithmStep;

  for (const { neighbor, edgeId } of getOutNeighbors(graph, node)) {
    if (!visited1.has(neighbor)) {
      edgeStatuses[edgeId] = 'considering';
      nodeStatuses[neighbor] = 'active';

      yield {
        stepIndex: stepCounter.value++,
        description: `"${neighbor}" is WHITE → recurse DFS-VISIT-1`,
        pseudocodeLine: VISIT1_BASE + 3,
        nodeStatuses: { ...nodeStatuses },
        edgeStatuses: { ...edgeStatuses },
        auxiliaryState: snap1(1, finishStack, callStack, d, f, time),
      };

      yield* kosarajuVisit1(graph, neighbor, visited1, callStack, finishStack, nodeStatuses, edgeStatuses, stepCounter, time, d, f);
      edgeStatuses[edgeId] = 'path';
    } else {
      edgeStatuses[edgeId] = 'rejected';

      yield {
        stepIndex: stepCounter.value++,
        description: `"${neighbor}" already visited → skip (back/cross edge)`,
        pseudocodeLine: VISIT1_BASE + 3,
        nodeStatuses: { ...nodeStatuses },
        edgeStatuses: { ...edgeStatuses },
        auxiliaryState: snap1(1, finishStack, callStack, d, f, time),
      };
    }
  }

  time.value++;
  f[node] = time.value;
  nodeStatuses[node] = 'visited';
  callStack.pop();
  finishStack.push(node);

  yield {
    stepIndex: stepCounter.value++,
    description: `Finish "${node}": BLACK, f[${node}]=${f[node]}, push to S. S (top): ${finishStack[finishStack.length - 1]}`,
    pseudocodeLine: VISIT1_BASE + 5,
    nodeStatuses: { ...nodeStatuses },
    edgeStatuses: { ...edgeStatuses },
    auxiliaryState: snap1(1, finishStack, callStack, d, f, time),
  };
}

function* kosarajuVisit2(
  graph: GraphModel,
  node: NodeId,
  sccIndex: number,
  visited2: Set<NodeId>,
  callStack: NodeId[],
  currentSCC: NodeId[],
  sccs: NodeId[][],
  nodeStatuses: Record<NodeId, ElementStatus>,
  edgeStatuses: Record<string, ElementStatus>,
  stepCounter: { value: number },
  d: Record<NodeId, number>,
  f: Record<NodeId, number>,
  finishStack: NodeId[],
): Generator<AlgorithmStep> {
  visited2.add(node);
  callStack.push(node);
  currentSCC.push(node);
  const sccStatus = `scc-${sccIndex % 6}` as ElementStatus;
  nodeStatuses[node] = sccStatus;

  yield {
    stepIndex: stepCounter.value++,
    description: `Phase 2 — visit "${node}" in Gᵀ: assign to SCC #${sccIndex}`,
    pseudocodeLine: VISIT2_BASE + 1,
    nodeStatuses: { ...nodeStatuses },
    edgeStatuses: { ...edgeStatuses },
    auxiliaryState: snap2(finishStack, callStack, currentSCC, sccs, d, f),
  };

  for (const { neighbor, edgeId } of getTransposeNeighbors(graph, node)) {
    if (!visited2.has(neighbor)) {
      edgeStatuses[edgeId] = 'considering';

      yield {
        stepIndex: stepCounter.value++,
        description: `Gᵀ neighbor "${neighbor}" is WHITE → recurse DFS-VISIT-2`,
        pseudocodeLine: VISIT2_BASE + 3,
        nodeStatuses: { ...nodeStatuses },
        edgeStatuses: { ...edgeStatuses },
        auxiliaryState: snap2(finishStack, callStack, currentSCC, sccs, d, f),
      };

      yield* kosarajuVisit2(graph, neighbor, sccIndex, visited2, callStack, currentSCC, sccs, nodeStatuses, edgeStatuses, stepCounter, d, f, finishStack);
      edgeStatuses[edgeId] = sccStatus;
    } else {
      edgeStatuses[edgeId] = 'rejected';

      yield {
        stepIndex: stepCounter.value++,
        description: `"${neighbor}" already visited in phase 2 → skip`,
        pseudocodeLine: VISIT2_BASE + 3,
        nodeStatuses: { ...nodeStatuses },
        edgeStatuses: { ...edgeStatuses },
        auxiliaryState: snap2(finishStack, callStack, currentSCC, sccs, d, f),
      };
    }
  }

  callStack.pop();

  yield {
    stepIndex: stepCounter.value++,
    description: `"${node}" → BLACK, confirmed in SCC #${sccIndex}`,
    pseudocodeLine: VISIT2_BASE + 4,
    nodeStatuses: { ...nodeStatuses },
    edgeStatuses: { ...edgeStatuses },
    auxiliaryState: snap2(finishStack, callStack, currentSCC, sccs, d, f),
  };
}

export const kosaraju: AlgorithmGenerator = function* (graph) {
  const visited1 = new Set<NodeId>();
  const visited2 = new Set<NodeId>();
  const callStack: NodeId[] = [];
  const finishStack: NodeId[] = [];
  const currentSCC: NodeId[] = [];
  const sccs: NodeId[][] = [];
  const nodeStatuses: Record<NodeId, ElementStatus> = {};
  const edgeStatuses: Record<string, ElementStatus> = {};
  const stepCounter = { value: 0 };
  const time = { value: 0 };
  const d: Record<NodeId, number> = {};
  const f: Record<NodeId, number> = {};

  graph.nodes.forEach(n => { nodeStatuses[n.id] = 'default'; d[n.id] = 0; f[n.id] = 0; });
  graph.edges.forEach(e => { edgeStatuses[e.id] = 'default'; });

  yield {
    stepIndex: stepCounter.value++,
    description: `Kosaraju SCC: Phase 1 — DFS on original graph to build finish-order stack S.`,
    pseudocodeLine: 0,
    nodeStatuses: { ...nodeStatuses },
    edgeStatuses: { ...edgeStatuses },
    auxiliaryState: {
      type: 'kosaraju',
      phase: 1,
      finishStack: [],
      callStack: [],
      currentSCC: [],
      sccs: [],
      d: { ...d },
      f: { ...f },
      time: 0,
    },
  } satisfies AlgorithmStep;

  // Phase 1: DFS on G
  for (const node of graph.nodes) {
    if (!visited1.has(node.id)) {
      yield {
        stepIndex: stepCounter.value++,
        description: `"${node.id}" is WHITE → call DFS-VISIT-1`,
        pseudocodeLine: 9,
        nodeStatuses: { ...nodeStatuses },
        edgeStatuses: { ...edgeStatuses },
        auxiliaryState: snap1(1, finishStack, callStack, d, f, time),
      };

      yield* kosarajuVisit1(graph, node.id, visited1, callStack, finishStack, nodeStatuses, edgeStatuses, stepCounter, time, d, f);
    }
  }

  yield {
    stepIndex: stepCounter.value++,
    description: `Phase 1 complete. S (top→bottom): [${[...finishStack].reverse().join(', ')}]`,
    pseudocodeLine: 10,
    nodeStatuses: { ...nodeStatuses },
    edgeStatuses: { ...edgeStatuses },
    auxiliaryState: snap1(1, finishStack, [], d, f, time),
  };

  // Reset edge statuses before phase 2
  graph.edges.forEach(e => { edgeStatuses[e.id] = 'default'; });

  yield {
    stepIndex: stepCounter.value++,
    description: `Computing Gᵀ: all edge directions reversed. Edges reset.`,
    pseudocodeLine: 2,
    nodeStatuses: { ...nodeStatuses },
    edgeStatuses: { ...edgeStatuses },
    auxiliaryState: snap2([...finishStack], [], [], [], d, f),
  };

  yield {
    stepIndex: stepCounter.value++,
    description: `Phase 2: pop from S in reverse-finish order, DFS on Gᵀ to find SCCs.`,
    pseudocodeLine: 20,
    nodeStatuses: { ...nodeStatuses },
    edgeStatuses: { ...edgeStatuses },
    auxiliaryState: snap2([...finishStack], [], [], [], d, f),
  };

  // Phase 2: DFS on transposed graph
  let sccIndex = 0;

  while (finishStack.length > 0) {
    const u = finishStack.pop()!;

    yield {
      stepIndex: stepCounter.value++,
      description: `Pop "${u}" from S (f[${u}]=${f[u]})`,
      pseudocodeLine: 22,
      nodeStatuses: { ...nodeStatuses },
      edgeStatuses: { ...edgeStatuses },
      auxiliaryState: snap2(finishStack, callStack, currentSCC, sccs, d, f),
    };

    if (!visited2.has(u)) {
      currentSCC.length = 0;

      yield {
        stepIndex: stepCounter.value++,
        description: `"${u}" is WHITE → new SCC #${sccIndex}, call DFS-VISIT-2 on Gᵀ`,
        pseudocodeLine: 23,
        nodeStatuses: { ...nodeStatuses },
        edgeStatuses: { ...edgeStatuses },
        auxiliaryState: snap2(finishStack, callStack, currentSCC, sccs, d, f),
      };

      yield* kosarajuVisit2(graph, u, sccIndex, visited2, callStack, currentSCC, sccs, nodeStatuses, edgeStatuses, stepCounter, d, f, finishStack);

      sccs.push([...currentSCC]);
      sccIndex++;

      yield {
        stepIndex: stepCounter.value++,
        description: `SCC #${sccIndex - 1} complete: {${currentSCC.join(', ')}}. Total SCCs: ${sccs.length}`,
        pseudocodeLine: 24,
        nodeStatuses: { ...nodeStatuses },
        edgeStatuses: { ...edgeStatuses },
        auxiliaryState: snap2(finishStack, [], [], sccs, d, f),
      };
    } else {
      yield {
        stepIndex: stepCounter.value++,
        description: `"${u}" already visited — skip`,
        pseudocodeLine: 23,
        nodeStatuses: { ...nodeStatuses },
        edgeStatuses: { ...edgeStatuses },
        auxiliaryState: snap2(finishStack, callStack, currentSCC, sccs, d, f),
      };
    }
  }

  yield {
    stepIndex: stepCounter.value,
    description: `Kosaraju complete. Found ${sccs.length} SCC(s): ${sccs.map((c, i) => `SCC${i}={${c.join(',')}}`).join(' | ')}`,
    pseudocodeLine: 3,
    nodeStatuses: { ...nodeStatuses },
    edgeStatuses: { ...edgeStatuses },
    auxiliaryState: snap2([], [], [], sccs, d, f),
  };
};
