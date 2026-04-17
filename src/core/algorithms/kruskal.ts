import type { GraphModel, NodeId } from '../graph/types';
import type { AlgorithmStep, AlgorithmGenerator, ElementStatus } from './types';

export const kruskalPseudocode = [
  'Kruskal(G):',
  '  sort edges by weight ascending',
  '  for each node v: makeSet(v)',
  '  MST ← empty',
  '  for each edge (u, v, w) in sorted order:',
  '    if find(u) ≠ find(v):',
  '      union(u, v)',
  '      add (u,v) to MST',
  '    else:',
  '      discard (u,v) — would create cycle',
  '  return MST',
];

class UnionFind {
  private parent: Record<NodeId, NodeId> = {};
  private rank: Record<NodeId, number> = {};

  constructor(nodes: NodeId[]) {
    nodes.forEach(n => { this.parent[n] = n; this.rank[n] = 0; });
  }

  find(x: NodeId): NodeId {
    if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]);
    return this.parent[x];
  }

  union(x: NodeId, y: NodeId) {
    const rx = this.find(x), ry = this.find(y);
    if (rx === ry) return false;
    if (this.rank[rx] < this.rank[ry]) this.parent[rx] = ry;
    else if (this.rank[rx] > this.rank[ry]) this.parent[ry] = rx;
    else { this.parent[ry] = rx; this.rank[rx]++; }
    return true;
  }

  snapshot(): Record<NodeId, NodeId> {
    const result: Record<NodeId, NodeId> = {};
    for (const n of Object.keys(this.parent)) result[n] = this.find(n);
    return result;
  }
}

export const kruskal: AlgorithmGenerator = function* (graph, startNode) {
  const nodeStatuses: Record<NodeId, ElementStatus> = {};
  const edgeStatuses: Record<string, ElementStatus> = {};

  graph.nodes.forEach(n => { nodeStatuses[n.id] = 'default'; });
  graph.edges.forEach(e => { edgeStatuses[e.id] = 'default'; });

  const sortedEdges = [...graph.edges].sort((a, b) => (a.weight ?? 1) - (b.weight ?? 1));
  const uf = new UnionFind(graph.nodes.map(n => n.id));
  const mstEdges: string[] = [];

  yield {
    stepIndex: 0,
    description: `Edges sorted by weight: [${sortedEdges.map(e => `${e.source}-${e.target}(${e.weight ?? 1})`).join(', ')}]`,
    pseudocodeLine: 1,
    nodeStatuses: { ...nodeStatuses },
    edgeStatuses: { ...edgeStatuses },
    auxiliaryState: {
      type: 'kruskal',
      components: uf.snapshot(),
      sortedEdges: sortedEdges.map(e => e.id),
      mstEdges: [...mstEdges],
    },
  } satisfies AlgorithmStep;

  let stepIndex = 1;

  for (const edge of sortedEdges) {
    const { source: u, target: v, id } = edge;
    edgeStatuses[id] = 'considering';
    nodeStatuses[u] = 'considering';
    nodeStatuses[v] = 'considering';

    yield {
      stepIndex: stepIndex++,
      description: `Consider edge ${u}—${v} (w=${edge.weight ?? 1}). find(${u})=${uf.find(u)}, find(${v})=${uf.find(v)}.`,
      pseudocodeLine: 4,
      nodeStatuses: { ...nodeStatuses },
      edgeStatuses: { ...edgeStatuses },
      auxiliaryState: {
        type: 'kruskal',
        components: uf.snapshot(),
        sortedEdges: sortedEdges.map(e => e.id),
        mstEdges: [...mstEdges],
      },
    };

    if (uf.find(u) !== uf.find(v)) {
      uf.union(u, v);
      mstEdges.push(id);
      edgeStatuses[id] = 'path';
      nodeStatuses[u] = 'path';
      nodeStatuses[v] = 'path';

      yield {
        stepIndex: stepIndex++,
        description: `Different components → add edge ${u}—${v} to MST. Union sets. MST edges: ${mstEdges.length}.`,
        pseudocodeLine: 6,
        nodeStatuses: { ...nodeStatuses },
        edgeStatuses: { ...edgeStatuses },
        auxiliaryState: {
          type: 'kruskal',
          components: uf.snapshot(),
          sortedEdges: sortedEdges.map(e => e.id),
          mstEdges: [...mstEdges],
        },
      };
    } else {
      edgeStatuses[id] = 'rejected';
      const uStatus = nodeStatuses[u] as string;
      const vStatus = nodeStatuses[v] as string;
      nodeStatuses[u] = uStatus === 'path' ? 'path' : 'visited';
      nodeStatuses[v] = vStatus === 'path' ? 'path' : 'visited';

      yield {
        stepIndex: stepIndex++,
        description: `Same component → skip edge ${u}—${v} (would create cycle).`,
        pseudocodeLine: 8,
        nodeStatuses: { ...nodeStatuses },
        edgeStatuses: { ...edgeStatuses },
        auxiliaryState: {
          type: 'kruskal',
          components: uf.snapshot(),
          sortedEdges: sortedEdges.map(e => e.id),
          mstEdges: [...mstEdges],
        },
      };
    }
  }

  yield {
    stepIndex: stepIndex,
    description: `Kruskal complete. MST has ${mstEdges.length} edges.`,
    pseudocodeLine: 10,
    nodeStatuses: { ...nodeStatuses },
    edgeStatuses: { ...edgeStatuses },
    auxiliaryState: {
      type: 'kruskal',
      components: uf.snapshot(),
      sortedEdges: sortedEdges.map(e => e.id),
      mstEdges: [...mstEdges],
    },
  };

  // suppress unused warning
  void startNode;
};
