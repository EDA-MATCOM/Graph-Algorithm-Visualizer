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

export const bfsPseudocode = [
  'BFS(G, s):',
  '  Q ← empty queue',
  '  enqueue(Q, s); mark s visited',
  '  while Q not empty:',
  '    u ← dequeue(Q)',
  '    for each neighbor v of u:',
  '      if v not visited:',
  '        enqueue(Q, v); mark v visited',
  '  return',
];

export const bfs: AlgorithmGenerator = function* (graph, startNode) {
  if (!startNode) throw new Error('BFS requires a start node');
  const visited = new Set<NodeId>();
  const queue: NodeId[] = [startNode];
  const nodeStatuses: Record<NodeId, ElementStatus> = {};
  const edgeStatuses: Record<string, ElementStatus> = {};
  const distances: Record<NodeId, number> = {};

  graph.nodes.forEach(n => { nodeStatuses[n.id] = 'default'; });
  graph.edges.forEach(e => { edgeStatuses[e.id] = 'default'; });

  nodeStatuses[startNode] = 'active';
  visited.add(startNode);
  distances[startNode] = 0;

  yield {
    stepIndex: 0,
    description: `Start: enqueue "${startNode}" at distance 0. Queue: [${startNode}]`,
    pseudocodeLine: 2,
    nodeStatuses: { ...nodeStatuses },
    edgeStatuses: { ...edgeStatuses },
    auxiliaryState: { type: 'bfs', queue: [...queue], visited: [...visited], distances: { ...distances } },
  } satisfies AlgorithmStep;

  let stepIndex = 1;

  while (queue.length > 0) {
    const current = queue.shift()!;
    nodeStatuses[current] = 'considering';

    yield {
      stepIndex: stepIndex++,
      description: `Dequeue "${current}" (dist=${distances[current]}). Processing neighbors.`,
      pseudocodeLine: 4,
      nodeStatuses: { ...nodeStatuses },
      edgeStatuses: { ...edgeStatuses },
      auxiliaryState: { type: 'bfs', queue: [...queue], visited: [...visited], distances: { ...distances } },
    };

    const neighbors = getNeighbors(graph, current);

    for (const { neighbor, edgeId } of neighbors) {
      if (!visited.has(neighbor)) {
        queue.push(neighbor);
        visited.add(neighbor);
        distances[neighbor] = distances[current] + 1;
        nodeStatuses[neighbor] = 'active';
        edgeStatuses[edgeId] = 'path';

        yield {
          stepIndex: stepIndex++,
          description: `"${neighbor}" not visited → enqueued at distance ${distances[neighbor]}. Queue: [${queue.join(', ')}]`,
          pseudocodeLine: 6,
          nodeStatuses: { ...nodeStatuses },
          edgeStatuses: { ...edgeStatuses },
          auxiliaryState: { type: 'bfs', queue: [...queue], visited: [...visited], distances: { ...distances } },
        };
      } else {
        const prevEdgeStatus = edgeStatuses[edgeId];
        edgeStatuses[edgeId] = 'rejected';

        yield {
          stepIndex: stepIndex++,
          description: `"${neighbor}" already visited (dist=${distances[neighbor]}) → skip.`,
          pseudocodeLine: 7,
          nodeStatuses: { ...nodeStatuses },
          edgeStatuses: { ...edgeStatuses },
          auxiliaryState: { type: 'bfs', queue: [...queue], visited: [...visited], distances: { ...distances } },
        };

        edgeStatuses[edgeId] = prevEdgeStatus;
      }
    }

    nodeStatuses[current] = 'visited';
  }

  yield {
    stepIndex: stepIndex,
    description: `BFS complete. Visited: [${[...visited].join(', ')}]`,
    pseudocodeLine: 8,
    nodeStatuses: { ...nodeStatuses },
    edgeStatuses: { ...edgeStatuses },
    auxiliaryState: { type: 'bfs', queue: [], visited: [...visited], distances: { ...distances } },
  };
};
