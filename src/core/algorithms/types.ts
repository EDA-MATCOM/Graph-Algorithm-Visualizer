import type { GraphModel, NodeId } from '../graph/types';

export type ElementStatus =
  | 'default'
  | 'considering'
  | 'active'
  | 'visited'
  | 'path'
  | 'rejected';

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
