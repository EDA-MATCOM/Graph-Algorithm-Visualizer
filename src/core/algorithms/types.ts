import type { GraphModel, NodeId } from '../graph/types';

export type ElementStatus =
  | 'default'
  | 'considering'
  | 'active'
  | 'visited'
  | 'path'
  | 'rejected'
  | 'scc-0'
  | 'scc-1'
  | 'scc-2'
  | 'scc-3'
  | 'scc-4'
  | 'scc-5';

export interface AlgorithmStep {
  stepIndex: number;
  description: string;
  pseudocodeLine: number;
  nodeStatuses: Record<NodeId, ElementStatus>;
  edgeStatuses: Record<string, ElementStatus>;
  auxiliaryState: AuxiliaryState;
}

export type AuxiliaryState =
  | { type: 'bfs'; queue: NodeId[]; visited: NodeId[]; distances: Record<NodeId, number> }
  | { type: 'dfs'; stack: NodeId[]; visited: NodeId[] }
  | {
      type: 'dijkstra';
      distances: Record<NodeId, number>;
      previous: Record<NodeId, NodeId | null>;
      heap: Array<[number, NodeId]>;
    }
  | {
      type: 'prim';
      inMST: NodeId[];
      candidates: Array<{ from: NodeId; to: NodeId; weight: number }>;
    }
  | {
      type: 'kruskal';
      components: Record<NodeId, NodeId>;
      sortedEdges: string[];
      mstEdges: string[];
    }
  | {
      type: 'ap-bridge';
      stack: NodeId[];
      disc: Record<NodeId, number>;
      low: Record<NodeId, number>;
      articulationPoints: NodeId[];
      bridges: Array<{ from: NodeId; to: NodeId }>;
    }
  | {
      type: 'topological-sort';
      callStack: NodeId[];
      outputStack: NodeId[];
      visited: NodeId[];
      d: Record<NodeId, number>;
      f: Record<NodeId, number>;
      time: number;
    }
  | {
      type: 'kosaraju';
      phase: 1 | 2;
      finishStack: NodeId[];
      callStack: NodeId[];
      currentSCC: NodeId[];
      sccs: NodeId[][];
      d: Record<NodeId, number>;
      f: Record<NodeId, number>;
      time: number;
    }
  | { type: 'generic'; data: Record<string, unknown> };

export interface AlgorithmExecution {
  algorithmId: string;
  graphSnapshot: GraphModel;
  startNode: NodeId | undefined;
  steps: AlgorithmStep[];
}

export type AlgorithmGenerator = (
  graph: GraphModel,
  startNode?: NodeId,
  options?: Record<string, unknown>
) => Generator<AlgorithmStep>;
