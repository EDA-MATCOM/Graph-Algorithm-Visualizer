import type { GraphModel } from '../core/graph/types';
import simpleGraph from './graphs/simple.json';
import weightedGraph from './graphs/weighted.json';
import mstGraph from './graphs/mst.json';
import disconnectedGraph from './graphs/disconnected.json';

export interface ExampleGraph {
  id: string;
  name: string;
  description: string;
  graph: GraphModel;
}

export const EXAMPLE_GRAPHS: ExampleGraph[] = [
  {
    id: 'simple-undirected',
    name: 'Simple undirected graph',
    description: '6 nodes — great for BFS/DFS',
    graph: simpleGraph as GraphModel,
  },
  {
    id: 'weighted-directed',
    name: 'Directed weighted graph',
    description: 'Ideal for Dijkstra',
    graph: weightedGraph as GraphModel,
  },
  {
    id: 'mst-example',
    name: 'MST example',
    description: 'Good for Prim and Kruskal',
    graph: mstGraph as GraphModel,
  },
  {
    id: 'disconnected',
    name: 'Disconnected graph',
    description: 'Shows behavior with separate components',
    graph: disconnectedGraph as GraphModel,
  },
];
