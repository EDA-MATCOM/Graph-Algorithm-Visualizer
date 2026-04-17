import { bfs, bfsPseudocode } from './bfs';
import { dfs, dfsPseudocode } from './dfs';
import { dijkstra, dijkstraPseudocode } from './dijkstra';
import { prim, primPseudocode } from './prim';
import { kruskal, kruskalPseudocode } from './kruskal';
import type { AlgorithmGenerator } from './types';

export interface AlgorithmDefinition {
  name: string;
  description: string;
  requiresWeights: boolean;
  requiresUndirected?: boolean;
  generator: AlgorithmGenerator;
  pseudocode: string[];
  auxiliaryStateType: string;
}

export const ALGORITHMS: Record<string, AlgorithmDefinition> = {
  bfs: {
    name: 'BFS',
    description: 'Breadth-First Search',
    requiresWeights: false,
    generator: bfs,
    pseudocode: bfsPseudocode,
    auxiliaryStateType: 'bfs',
  },
  dfs: {
    name: 'DFS',
    description: 'Depth-First Search',
    requiresWeights: false,
    generator: dfs,
    pseudocode: dfsPseudocode,
    auxiliaryStateType: 'dfs',
  },
  dijkstra: {
    name: 'Dijkstra',
    description: "Dijkstra's Shortest Path",
    requiresWeights: true,
    generator: dijkstra,
    pseudocode: dijkstraPseudocode,
    auxiliaryStateType: 'dijkstra',
  },
  prim: {
    name: 'Prim',
    description: "Prim's MST",
    requiresWeights: true,
    requiresUndirected: true,
    generator: prim,
    pseudocode: primPseudocode,
    auxiliaryStateType: 'prim',
  },
  kruskal: {
    name: 'Kruskal',
    description: "Kruskal's MST",
    requiresWeights: true,
    requiresUndirected: true,
    generator: kruskal,
    pseudocode: kruskalPseudocode,
    auxiliaryStateType: 'kruskal',
  },
};
