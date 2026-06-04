import type { GraphModel, NodeId } from '../graph/types';
import type { AlgorithmStep, AlgorithmGenerator, ElementStatus } from './types';

function getOutNeighbors(graph: GraphModel, nodeId: NodeId) {
  return graph.edges
    .filter(e => e.source === nodeId)
    .map(e => ({ neighbor: e.target, edgeId: e.id }));
}

export const topologicalSortPseudocode = [
  'TopologicalSort(G):',
  '  visited ← {}; time ← 0',
  '  for each u in G:',
  '    if u not visited:',
  '      DFS-VISIT-TS(G, u)',
  '  return stack',
  '',
  'DFS-VISIT-TS(G, u):',
  '  u ← visited',
  '  time++; d[u] = time',
  '  for each v ∈ Adj[u]:',
  '    if v not visited:',
  '      π[v] ← u',
  '      DFS-VISIT-TS(G, v)',
  '  time++; f[u] = time',
  '  stack.Push(u)',
  '  return',
];

// 'DFS-VISIT-TS(G, u):' is at index 7
const VISIT_BASE = 7;

function* tsVisit(
  graph: GraphModel,
  node: NodeId,
  visited: Set<NodeId>,
  callStack: NodeId[],
  outputStack: NodeId[],
  nodeStatuses: Record<NodeId, ElementStatus>,
  edgeStatuses: Record<string, ElementStatus>,
  stepCounter: { value: number },
  time: { value: number },
  d: Record<NodeId, number>,
  f: Record<NodeId, number>,
  entryEdgeId?: string,
): Generator<AlgorithmStep> {
  visited.add(node);
  callStack.push(node);
  nodeStatuses[node] = 'considering';

  yield {
    stepIndex: stepCounter.value++,
    description: `Visit "${node}" — mark as visited. Call stack: [${callStack.join(' → ')}]`,
    pseudocodeLine: VISIT_BASE + 1,
    nodeStatuses: { ...nodeStatuses },
    edgeStatuses: { ...edgeStatuses },
    auxiliaryState: {
      type: 'topological-sort',
      callStack: [...callStack],
      outputStack: [...outputStack],
      visited: [...visited],
      d: { ...d },
      f: { ...f },
      time: time.value,
    },
  } satisfies AlgorithmStep;

  time.value++;
  d[node] = time.value;

  yield {
    stepIndex: stepCounter.value++,
    description: `Discovery: d["${node}"] = ${time.value}.`,
    pseudocodeLine: VISIT_BASE + 2,
    nodeStatuses: { ...nodeStatuses },
    edgeStatuses: { ...edgeStatuses },
    auxiliaryState: {
      type: 'topological-sort',
      callStack: [...callStack],
      outputStack: [...outputStack],
      visited: [...visited],
      d: { ...d },
      f: { ...f },
      time: time.value,
    },
  };

  for (const { neighbor, edgeId } of getOutNeighbors(graph, node)) {
    if (!visited.has(neighbor)) {
      edgeStatuses[edgeId] = 'considering';
      nodeStatuses[neighbor] = 'active';

      yield {
        stepIndex: stepCounter.value++,
        description: `"${neighbor}" not visited → π["${neighbor}"] = "${node}", recurse.`,
        pseudocodeLine: VISIT_BASE + 5,
        nodeStatuses: { ...nodeStatuses },
        edgeStatuses: { ...edgeStatuses },
        auxiliaryState: {
          type: 'topological-sort',
          callStack: [...callStack],
          outputStack: [...outputStack],
          visited: [...visited],
          d: { ...d },
          f: { ...f },
          time: time.value,
        },
      };

      yield* tsVisit(graph, neighbor, visited, callStack, outputStack, nodeStatuses, edgeStatuses, stepCounter, time, d, f, edgeId);

      edgeStatuses[edgeId] = 'path';
    } else {
      edgeStatuses[edgeId] = 'rejected';

      yield {
        stepIndex: stepCounter.value++,
        description: `"${neighbor}" already visited → skip (cross/back edge).`,
        pseudocodeLine: VISIT_BASE + 4,
        nodeStatuses: { ...nodeStatuses },
        edgeStatuses: { ...edgeStatuses },
        auxiliaryState: {
          type: 'topological-sort',
          callStack: [...callStack],
          outputStack: [...outputStack],
          visited: [...visited],
          d: { ...d },
          f: { ...f },
          time: time.value,
        },
      };
    }
  }

  time.value++;
  f[node] = time.value;
  outputStack.push(node);
  nodeStatuses[node] = 'visited';
  callStack.pop();

  if (entryEdgeId !== undefined) {
    edgeStatuses[entryEdgeId] = 'path';
  }

  yield {
    stepIndex: stepCounter.value++,
    description: `Finish "${node}": f["${node}"] = ${time.value}. Push to topological stack. Stack: [${[...outputStack].reverse().join(', ')}]`,
    pseudocodeLine: VISIT_BASE + 8,
    nodeStatuses: { ...nodeStatuses },
    edgeStatuses: { ...edgeStatuses },
    auxiliaryState: {
      type: 'topological-sort',
      callStack: [...callStack],
      outputStack: [...outputStack],
      visited: [...visited],
      d: { ...d },
      f: { ...f },
      time: time.value,
    },
  };
}

export const topologicalSort: AlgorithmGenerator = function* (graph) {
  const visited = new Set<NodeId>();
  const callStack: NodeId[] = [];
  const outputStack: NodeId[] = [];
  const nodeStatuses: Record<NodeId, ElementStatus> = {};
  const edgeStatuses: Record<string, ElementStatus> = {};
  const stepCounter = { value: 0 };
  const time = { value: 0 };
  const d: Record<NodeId, number> = {};
  const f: Record<NodeId, number> = {};

  graph.nodes.forEach(n => { nodeStatuses[n.id] = 'default'; });
  graph.edges.forEach(e => { edgeStatuses[e.id] = 'default'; });

  yield {
    stepIndex: stepCounter.value++,
    description: `Topological Sort (DFS-based): initialize. ${graph.nodes.length} nodes to process.`,
    pseudocodeLine: 1,
    nodeStatuses: { ...nodeStatuses },
    edgeStatuses: { ...edgeStatuses },
    auxiliaryState: {
      type: 'topological-sort',
      callStack: [],
      outputStack: [],
      visited: [],
      d: {},
      f: {},
      time: 0,
    },
  } satisfies AlgorithmStep;

  for (const node of graph.nodes) {
    if (visited.has(node.id)) continue;

    yield {
      stepIndex: stepCounter.value++,
      description: `"${node.id}" not yet visited → call DFS-VISIT-TS.`,
      pseudocodeLine: 3,
      nodeStatuses: { ...nodeStatuses },
      edgeStatuses: { ...edgeStatuses },
      auxiliaryState: {
        type: 'topological-sort',
        callStack: [...callStack],
        outputStack: [...outputStack],
        visited: [...visited],
        d: { ...d },
        f: { ...f },
        time: time.value,
      },
    };

    yield* tsVisit(graph, node.id, visited, callStack, outputStack, nodeStatuses, edgeStatuses, stepCounter, time, d, f);
  }

  const topologicalOrder = [...outputStack].reverse();

  yield {
    stepIndex: stepCounter.value,
    description: `Done! Topological order: ${topologicalOrder.join(' → ')}`,
    pseudocodeLine: 5,
    nodeStatuses: { ...nodeStatuses },
    edgeStatuses: { ...edgeStatuses },
    auxiliaryState: {
      type: 'topological-sort',
      callStack: [],
      outputStack: [...outputStack],
      visited: [...visited],
      d: { ...d },
      f: { ...f },
      time: time.value,
    },
  };
};
