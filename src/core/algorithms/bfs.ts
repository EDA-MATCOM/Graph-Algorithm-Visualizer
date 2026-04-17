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
  const visited = new Set<NodeId>();
  const queue: NodeId[] = [startNode];
  const nodeStatuses: Record<NodeId, ElementStatus> = {};
  const edgeStatuses: Record<string, ElementStatus> = {};

  graph.nodes.forEach(n => { nodeStatuses[n.id] = 'default'; });
  graph.edges.forEach(e => { edgeStatuses[e.id] = 'default'; });

  nodeStatuses[startNode] = 'active';
  visited.add(startNode);

  yield {
    stepIndex: 0,
    description: `Start: enqueue node "${startNode}". Queue: [${startNode}]`,
    pseudocodeLine: 2,
    nodeStatuses: { ...nodeStatuses },
    edgeStatuses: { ...edgeStatuses },
    auxiliaryState: { type: 'bfs', queue: [...queue], visited: [...visited] },
  } satisfies AlgorithmStep;

  let stepIndex = 1;

  while (queue.length > 0) {
    const current = queue.shift()!;
    nodeStatuses[current] = 'considering';

    yield {
      stepIndex: stepIndex++,
      description: `Dequeue "${current}". Processing neighbors.`,
      pseudocodeLine: 4,
      nodeStatuses: { ...nodeStatuses },
      edgeStatuses: { ...edgeStatuses },
      auxiliaryState: { type: 'bfs', queue: [...queue], visited: [...visited] },
    };

    const neighbors = getNeighbors(graph, current);

    for (const { neighbor, edgeId } of neighbors) {
      if (!visited.has(neighbor)) {
        queue.push(neighbor);
        visited.add(neighbor);
        nodeStatuses[neighbor] = 'active';
        edgeStatuses[edgeId] = 'path';

        yield {
          stepIndex: stepIndex++,
          description: `Neighbor "${neighbor}" not visited → enqueued. Queue: [${queue.join(', ')}]`,
          pseudocodeLine: 6,
          nodeStatuses: { ...nodeStatuses },
          edgeStatuses: { ...edgeStatuses },
          auxiliaryState: { type: 'bfs', queue: [...queue], visited: [...visited] },
        };
      } else {
        const prevEdgeStatus = edgeStatuses[edgeId];
        edgeStatuses[edgeId] = 'rejected';

        yield {
          stepIndex: stepIndex++,
          description: `Neighbor "${neighbor}" already visited → skip.`,
          pseudocodeLine: 7,
          nodeStatuses: { ...nodeStatuses },
          edgeStatuses: { ...edgeStatuses },
          auxiliaryState: { type: 'bfs', queue: [...queue], visited: [...visited] },
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
    auxiliaryState: { type: 'bfs', queue: [], visited: [...visited] },
  };
};
