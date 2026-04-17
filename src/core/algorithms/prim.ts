import type { GraphModel, NodeId } from '../graph/types';
import type { AlgorithmStep, AlgorithmGenerator, ElementStatus } from './types';

export const primPseudocode = [
  'Prim(G, s):',
  '  inMST ← {s}',
  '  candidates ← edges adjacent to s',
  '  while candidates not empty:',
  '    (u, v, w) ← min weight candidate',
  '    if v already in MST: remove and continue',
  '    add v to MST',
  '    add edge (u,v) to MST',
  '    add edges adjacent to v to candidates',
  '  return MST',
];

export const prim: AlgorithmGenerator = function* (graph, startNode) {
  const inMST = new Set<NodeId>([startNode]);
  const mstEdges = new Set<string>();
  const nodeStatuses: Record<NodeId, ElementStatus> = {};
  const edgeStatuses: Record<string, ElementStatus> = {};

  graph.nodes.forEach(n => { nodeStatuses[n.id] = 'default'; });
  graph.edges.forEach(e => { edgeStatuses[e.id] = 'default'; });

  nodeStatuses[startNode] = 'path';

  type Candidate = { from: NodeId; to: NodeId; weight: number; edgeId: string };

  const getCandidates = (): Candidate[] => {
    const cands: Candidate[] = [];
    for (const nodeId of inMST) {
      for (const edge of graph.edges) {
        const isAdj =
          (edge.source === nodeId && !inMST.has(edge.target)) ||
          (edge.target === nodeId && !inMST.has(edge.source));
        if (isAdj) {
          const to = edge.source === nodeId ? edge.target : edge.source;
          cands.push({ from: nodeId, to, weight: edge.weight ?? 1, edgeId: edge.id });
        }
      }
    }
    // Deduplicate by target, keep min weight
    const best: Record<NodeId, Candidate> = {};
    for (const c of cands) {
      if (!best[c.to] || c.weight < best[c.to].weight) best[c.to] = c;
    }
    return Object.values(best).sort((a, b) => a.weight - b.weight);
  };

  let candidates = getCandidates();

  yield {
    stepIndex: 0,
    description: `Start MST at "${startNode}". ${candidates.length} candidate edge(s).`,
    pseudocodeLine: 1,
    nodeStatuses: { ...nodeStatuses },
    edgeStatuses: { ...edgeStatuses },
    auxiliaryState: {
      type: 'prim',
      inMST: [...inMST],
      candidates: candidates.map(c => ({ from: c.from, to: c.to, weight: c.weight })),
    },
  } satisfies AlgorithmStep;

  let stepIndex = 1;

  while (candidates.length > 0) {
    // Highlight all candidates
    candidates.forEach(c => { edgeStatuses[c.edgeId] = 'considering'; });

    const best = candidates[0];
    edgeStatuses[best.edgeId] = 'considering';
    nodeStatuses[best.to] = 'considering';

    yield {
      stepIndex: stepIndex++,
      description: `Min edge: ${best.from}→${best.to} (w=${best.weight}). Considering.`,
      pseudocodeLine: 4,
      nodeStatuses: { ...nodeStatuses },
      edgeStatuses: { ...edgeStatuses },
      auxiliaryState: {
        type: 'prim',
        inMST: [...inMST],
        candidates: candidates.map(c => ({ from: c.from, to: c.to, weight: c.weight })),
      },
    };

    if (inMST.has(best.to)) {
      edgeStatuses[best.edgeId] = 'rejected';
      candidates = getCandidates();
      yield {
        stepIndex: stepIndex++,
        description: `"${best.to}" already in MST — skip.`,
        pseudocodeLine: 5,
        nodeStatuses: { ...nodeStatuses },
        edgeStatuses: { ...edgeStatuses },
        auxiliaryState: {
          type: 'prim',
          inMST: [...inMST],
          candidates: candidates.map(c => ({ from: c.from, to: c.to, weight: c.weight })),
        },
      };
      continue;
    }

    inMST.add(best.to);
    mstEdges.add(best.edgeId);
    nodeStatuses[best.to] = 'path';
    edgeStatuses[best.edgeId] = 'path';

    // Reset other candidate edges that are no longer candidates
    candidates.forEach(c => {
      if (c.edgeId !== best.edgeId && edgeStatuses[c.edgeId] === 'considering') {
        edgeStatuses[c.edgeId] = 'default';
      }
    });

    candidates = getCandidates();

    yield {
      stepIndex: stepIndex++,
      description: `Add "${best.to}" to MST via edge ${best.from}→${best.to} (w=${best.weight}). MST size: ${inMST.size}.`,
      pseudocodeLine: 6,
      nodeStatuses: { ...nodeStatuses },
      edgeStatuses: { ...edgeStatuses },
      auxiliaryState: {
        type: 'prim',
        inMST: [...inMST],
        candidates: candidates.map(c => ({ from: c.from, to: c.to, weight: c.weight })),
      },
    };
  }

  yield {
    stepIndex: stepIndex,
    description: `Prim complete. MST contains ${mstEdges.size} edges, ${inMST.size} nodes.`,
    pseudocodeLine: 9,
    nodeStatuses: { ...nodeStatuses },
    edgeStatuses: { ...edgeStatuses },
    auxiliaryState: {
      type: 'prim',
      inMST: [...inMST],
      candidates: [],
    },
  };
};
