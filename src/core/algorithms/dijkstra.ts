import type { GraphModel, NodeId } from '../graph/types';
import type { AlgorithmStep, AlgorithmGenerator, ElementStatus } from './types';

export const dijkstraPseudocode = [
  'Dijkstra(G, s):',
  '  dist[s] ← 0; dist[v] ← ∞ for all v ≠ s',
  '  prev[v] ← null for all v',
  '  H ← min-heap with (0, s)',
  '  while H not empty:',
  '    (d, u) ← extract-min(H)',
  '    if d > dist[u]: continue',
  '    for each neighbor v of u with weight w:',
  '      if dist[u] + w < dist[v]:',
  '        dist[v] ← dist[u] + w',
  '        prev[v] ← u',
  '        insert(H, (dist[v], v))',
  '  return dist, prev',
];

class MinHeap {
  private data: Array<[number, NodeId]> = [];

  push(item: [number, NodeId]) {
    this.data.push(item);
    this._bubbleUp(this.data.length - 1);
  }

  pop(): [number, NodeId] | undefined {
    if (this.data.length === 0) return undefined;
    const top = this.data[0];
    const last = this.data.pop()!;
    if (this.data.length > 0) {
      this.data[0] = last;
      this._siftDown(0);
    }
    return top;
  }

  get size() { return this.data.length; }
  snapshot(): Array<[number, NodeId]> { return [...this.data]; }

  private _bubbleUp(i: number) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.data[parent][0] > this.data[i][0]) {
        [this.data[parent], this.data[i]] = [this.data[i], this.data[parent]];
        i = parent;
      } else break;
    }
  }

  private _siftDown(i: number) {
    const n = this.data.length;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && this.data[l][0] < this.data[smallest][0]) smallest = l;
      if (r < n && this.data[r][0] < this.data[smallest][0]) smallest = r;
      if (smallest !== i) {
        [this.data[smallest], this.data[i]] = [this.data[i], this.data[smallest]];
        i = smallest;
      } else break;
    }
  }
}

export const dijkstra: AlgorithmGenerator = function* (graph, startNode) {
  const INF = Infinity;
  const distances: Record<NodeId, number> = {};
  const previous: Record<NodeId, NodeId | null> = {};
  const nodeStatuses: Record<NodeId, ElementStatus> = {};
  const edgeStatuses: Record<string, ElementStatus> = {};

  graph.nodes.forEach(n => {
    distances[n.id] = INF;
    previous[n.id] = null;
    nodeStatuses[n.id] = 'default';
  });
  graph.edges.forEach(e => { edgeStatuses[e.id] = 'default'; });

  distances[startNode] = 0;
  const heap = new MinHeap();
  heap.push([0, startNode]);
  nodeStatuses[startNode] = 'active';

  yield {
    stepIndex: 0,
    description: `Init: dist[${startNode}]=0, all others=∞. Push (0, ${startNode}) to heap.`,
    pseudocodeLine: 3,
    nodeStatuses: { ...nodeStatuses },
    edgeStatuses: { ...edgeStatuses },
    auxiliaryState: {
      type: 'dijkstra',
      distances: { ...distances },
      previous: { ...previous },
      heap: heap.snapshot(),
    },
  } satisfies AlgorithmStep;

  let stepIndex = 1;
  const settled = new Set<NodeId>();

  while (heap.size > 0) {
    const [d, u] = heap.pop()!;

    if (d > distances[u]) {
      yield {
        stepIndex: stepIndex++,
        description: `Extract (${d}, ${u}) — stale entry (dist[${u}]=${distances[u]}), skip.`,
        pseudocodeLine: 6,
        nodeStatuses: { ...nodeStatuses },
        edgeStatuses: { ...edgeStatuses },
        auxiliaryState: {
          type: 'dijkstra',
          distances: { ...distances },
          previous: { ...previous },
          heap: heap.snapshot(),
        },
      };
      continue;
    }

    settled.add(u);
    nodeStatuses[u] = 'considering';

    yield {
      stepIndex: stepIndex++,
      description: `Extract min (${d}, ${u}). Processing neighbors.`,
      pseudocodeLine: 5,
      nodeStatuses: { ...nodeStatuses },
      edgeStatuses: { ...edgeStatuses },
      auxiliaryState: {
        type: 'dijkstra',
        distances: { ...distances },
        previous: { ...previous },
        heap: heap.snapshot(),
      },
    };

    const outEdges = graph.edges.filter(e =>
      e.source === u || (!graph.directed && e.target === u)
    );

    for (const edge of outEdges) {
      const v = edge.source === u ? edge.target : edge.source;
      const w = edge.weight ?? 1;

      if (settled.has(v)) continue;

      const newDist = distances[u] + w;
      edgeStatuses[edge.id] = 'considering';

      if (newDist < distances[v]) {
        distances[v] = newDist;
        previous[v] = u;
        heap.push([newDist, v]);
        nodeStatuses[v] = 'active';
        edgeStatuses[edge.id] = 'path';

        yield {
          stepIndex: stepIndex++,
          description: `Relax edge ${u}→${v}: dist[${v}] updated to ${newDist} (via ${u}).`,
          pseudocodeLine: 9,
          nodeStatuses: { ...nodeStatuses },
          edgeStatuses: { ...edgeStatuses },
          auxiliaryState: {
            type: 'dijkstra',
            distances: { ...distances },
            previous: { ...previous },
            heap: heap.snapshot(),
          },
        };
      } else {
        edgeStatuses[edge.id] = 'rejected';
        yield {
          stepIndex: stepIndex++,
          description: `Edge ${u}→${v}: no improvement (${distances[u]}+${w} ≥ ${distances[v]}).`,
          pseudocodeLine: 8,
          nodeStatuses: { ...nodeStatuses },
          edgeStatuses: { ...edgeStatuses },
          auxiliaryState: {
            type: 'dijkstra',
            distances: { ...distances },
            previous: { ...previous },
            heap: heap.snapshot(),
          },
        };
      }
    }

    nodeStatuses[u] = 'visited';
  }

  // Mark shortest path edges
  for (const node of graph.nodes) {
    const prev = previous[node.id];
    if (prev !== null) {
      const pathEdge = graph.edges.find(e =>
        (e.source === prev && e.target === node.id) ||
        (!graph.directed && e.source === node.id && e.target === prev)
      );
      if (pathEdge && edgeStatuses[pathEdge.id] === 'path') {
        nodeStatuses[node.id] = 'path';
      }
    }
  }
  nodeStatuses[startNode] = 'path';

  yield {
    stepIndex: stepIndex,
    description: `Dijkstra complete. Shortest distances from ${startNode} computed.`,
    pseudocodeLine: 12,
    nodeStatuses: { ...nodeStatuses },
    edgeStatuses: { ...edgeStatuses },
    auxiliaryState: {
      type: 'dijkstra',
      distances: { ...distances },
      previous: { ...previous },
      heap: [],
    },
  };
};
