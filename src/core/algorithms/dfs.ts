import type { GraphModel, NodeId } from '../graph/types';
import type { AlgorithmStep, AlgorithmGenerator, ElementStatus } from './types';

function getNeighbors(graph: GraphModel, nodeId: NodeId) {
  return graph.edges
    .filter(e => e.source === nodeId || (!graph.directed && e.target === nodeId))
    .map(e => ({
      neighbor: e.source === nodeId ? e.target : e.source,
      edgeId: e.id,
    }));
}

export const dfsPseudocode = [
  'DFS(G):',
  '  visited ← {}',
  '  for each node u in G:',
  '    if u not visited:',
  '      DFS-Visit(G, u, visited)',
  '',
  'DFS-Visit(G, u, visited):',
  '  mark u as visited',
  '  for each neighbor v of u:',
  '    if v not visited:',
  '      DFS-Visit(G, v, visited)',
  '  return',
];

// visitBase = index of 'DFS-Visit(G, u, visited):' line in the relevant pseudocode array
// Offsets from visitBase:  +1 mark, +2 for-loop, +3 if-check, +4 recurse-call, +5 return
// entryEdgeId = edge used to reach this node from its parent (undefined for component roots)
function* dfsVisit(
  graph: GraphModel,
  node: NodeId,
  visited: Set<NodeId>,
  callStack: NodeId[],
  nodeStatuses: Record<NodeId, ElementStatus>,
  edgeStatuses: Record<string, ElementStatus>,
  stepCounter: { value: number },
  visitBase: number,
  entryEdgeId?: string,
): Generator<AlgorithmStep> {
  visited.add(node);
  callStack.push(node);
  nodeStatuses[node] = 'considering';

  yield {
    stepIndex: stepCounter.value++,
    description: `Visit "${node}" — mark visited. Call stack: [${callStack.join(' → ')}]`,
    pseudocodeLine: visitBase + 1,
    nodeStatuses: { ...nodeStatuses },
    edgeStatuses: { ...edgeStatuses },
    auxiliaryState: { type: 'dfs', stack: [...callStack], visited: [...visited] },
  } satisfies AlgorithmStep;

  for (const { neighbor, edgeId } of getNeighbors(graph, node)) {
    if (!visited.has(neighbor)) {
      edgeStatuses[edgeId] = 'considering';  // amber: edge currently being traversed
      nodeStatuses[neighbor] = 'active';

      yield {
        stepIndex: stepCounter.value++,
        description: `"${neighbor}" not visited → recurse into it.`,
        pseudocodeLine: visitBase + 4,
        nodeStatuses: { ...nodeStatuses },
        edgeStatuses: { ...edgeStatuses },
        auxiliaryState: { type: 'dfs', stack: [...callStack], visited: [...visited] },
      };

      yield* dfsVisit(graph, neighbor, visited, callStack, nodeStatuses, edgeStatuses, stepCounter, visitBase, edgeId);
    } else if (edgeId !== entryEdgeId) {
      // Skip the edge we came in through — it's a tree edge, not a back edge
      edgeStatuses[edgeId] = 'rejected';

      yield {
        stepIndex: stepCounter.value++,
        description: `"${neighbor}" already visited → skip.`,
        pseudocodeLine: visitBase + 3,
        nodeStatuses: { ...nodeStatuses },
        edgeStatuses: { ...edgeStatuses },
        auxiliaryState: { type: 'dfs', stack: [...callStack], visited: [...visited] },
      };
    }
  }

  nodeStatuses[node] = 'visited';
  callStack.pop();

  // Confirm the tree edge as path before yielding return, so it shows green in this step
  if (entryEdgeId !== undefined) {
    edgeStatuses[entryEdgeId] = 'path';
  }

  yield {
    stepIndex: stepCounter.value++,
    description: `Return from "${node}". Call stack: [${callStack.length ? callStack.join(' → ') : 'empty'}]`,
    pseudocodeLine: visitBase + 5,
    nodeStatuses: { ...nodeStatuses },
    edgeStatuses: { ...edgeStatuses },
    auxiliaryState: { type: 'dfs', stack: [...callStack], visited: [...visited] },
  };
}

// DFS covering all connected components; startNode only sets the first node visited
export const dfs: AlgorithmGenerator = function* (graph, startNode) {
  const visited = new Set<NodeId>();
  const callStack: NodeId[] = [];
  const nodeStatuses: Record<NodeId, ElementStatus> = {};
  const edgeStatuses: Record<string, ElementStatus> = {};
  const stepCounter = { value: 0 };

  graph.nodes.forEach(n => { nodeStatuses[n.id] = 'default'; });
  graph.edges.forEach(e => { edgeStatuses[e.id] = 'default'; });

  const first = startNode ?? graph.nodes[0]?.id;
  if (!first) return;

  yield {
    stepIndex: stepCounter.value++,
    description: `DFS: initialize visited set. Will cover all ${graph.nodes.length} nodes.`,
    pseudocodeLine: 1,
    nodeStatuses: { ...nodeStatuses },
    edgeStatuses: { ...edgeStatuses },
    auxiliaryState: { type: 'dfs', stack: [], visited: [] },
  } satisfies AlgorithmStep;

  // 'DFS-Visit(G, u, visited):' is at index 6 in dfsPseudocode
  const nodeOrder = [first, ...graph.nodes.map(n => n.id).filter(id => id !== first)];

  for (const nodeId of nodeOrder) {
    if (visited.has(nodeId)) continue;

    yield {
      stepIndex: stepCounter.value++,
      description: `"${nodeId}" unvisited — starting new component from it.`,
      pseudocodeLine: 3,
      nodeStatuses: { ...nodeStatuses },
      edgeStatuses: { ...edgeStatuses },
      auxiliaryState: { type: 'dfs', stack: [], visited: [...visited] },
    };

    yield* dfsVisit(graph, nodeId, visited, callStack, nodeStatuses, edgeStatuses, stepCounter, 6);
  }

  yield {
    stepIndex: stepCounter.value,
    description: `DFS complete. All ${visited.size} nodes visited.`,
    pseudocodeLine: 4,
    nodeStatuses: { ...nodeStatuses },
    edgeStatuses: { ...edgeStatuses },
    auxiliaryState: { type: 'dfs', stack: [], visited: [...visited] },
  };
};
