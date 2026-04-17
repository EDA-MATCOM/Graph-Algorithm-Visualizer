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
  'DFS(G, s):',
  '  S ← empty stack',
  '  push(S, s)',
  '  while S not empty:',
  '    u ← pop(S)',
  '    if u not visited:',
  '      mark u visited',
  '      for each neighbor v of u:',
  '        if v not visited:',
  '          push(S, v)',
  '  return',
];

export const dfs: AlgorithmGenerator = function* (graph, startNode) {
  const visited = new Set<NodeId>();
  const stack: NodeId[] = [startNode];
  const nodeStatuses: Record<NodeId, ElementStatus> = {};
  const edgeStatuses: Record<string, ElementStatus> = {};

  graph.nodes.forEach(n => { nodeStatuses[n.id] = 'default'; });
  graph.edges.forEach(e => { edgeStatuses[e.id] = 'default'; });

  nodeStatuses[startNode] = 'active';

  yield {
    stepIndex: 0,
    description: `Start: push node "${startNode}". Stack: [${startNode}]`,
    pseudocodeLine: 2,
    nodeStatuses: { ...nodeStatuses },
    edgeStatuses: { ...edgeStatuses },
    auxiliaryState: { type: 'dfs', stack: [...stack], visited: [] },
  } satisfies AlgorithmStep;

  let stepIndex = 1;

  while (stack.length > 0) {
    const current = stack.pop()!;

    if (visited.has(current)) {
      yield {
        stepIndex: stepIndex++,
        description: `Pop "${current}" — already visited, skip.`,
        pseudocodeLine: 5,
        nodeStatuses: { ...nodeStatuses },
        edgeStatuses: { ...edgeStatuses },
        auxiliaryState: { type: 'dfs', stack: [...stack], visited: [...visited] },
      };
      continue;
    }

    visited.add(current);
    nodeStatuses[current] = 'considering';

    yield {
      stepIndex: stepIndex++,
      description: `Pop and visit "${current}".`,
      pseudocodeLine: 6,
      nodeStatuses: { ...nodeStatuses },
      edgeStatuses: { ...edgeStatuses },
      auxiliaryState: { type: 'dfs', stack: [...stack], visited: [...visited] },
    };

    const neighbors = getNeighbors(graph, current);

    for (const { neighbor, edgeId } of neighbors) {
      if (!visited.has(neighbor)) {
        stack.push(neighbor);
        nodeStatuses[neighbor] = 'active';
        edgeStatuses[edgeId] = 'path';

        yield {
          stepIndex: stepIndex++,
          description: `Push neighbor "${neighbor}". Stack: [${stack.join(', ')}]`,
          pseudocodeLine: 8,
          nodeStatuses: { ...nodeStatuses },
          edgeStatuses: { ...edgeStatuses },
          auxiliaryState: { type: 'dfs', stack: [...stack], visited: [...visited] },
        };
      } else {
        edgeStatuses[edgeId] = 'rejected';
        yield {
          stepIndex: stepIndex++,
          description: `Neighbor "${neighbor}" already visited → skip.`,
          pseudocodeLine: 9,
          nodeStatuses: { ...nodeStatuses },
          edgeStatuses: { ...edgeStatuses },
          auxiliaryState: { type: 'dfs', stack: [...stack], visited: [...visited] },
        };
      }
    }

    nodeStatuses[current] = 'visited';
  }

  yield {
    stepIndex: stepIndex,
    description: `DFS complete. Visited: [${[...visited].join(', ')}]`,
    pseudocodeLine: 10,
    nodeStatuses: { ...nodeStatuses },
    edgeStatuses: { ...edgeStatuses },
    auxiliaryState: { type: 'dfs', stack: [], visited: [...visited] },
  };
};
