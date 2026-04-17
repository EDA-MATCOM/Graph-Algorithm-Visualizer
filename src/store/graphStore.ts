import { create } from 'zustand';
import type { GraphModel, GraphNode, GraphEdge, NodeId } from '../core/graph/types';
import { createEmptyGraph, generateNodeId, generateEdgeId } from '../core/graph/GraphSerializer';

type EditMode = 'select' | 'addNode' | 'addEdge' | 'delete';

interface GraphStore {
  graph: GraphModel;
  selectedNodes: NodeId[];
  selectedEdges: string[];
  editMode: EditMode;

  setGraph: (g: GraphModel) => void;
  addNode: (x: number, y: number, label?: string) => GraphNode;
  addEdge: (source: NodeId, target: NodeId, weight?: number) => GraphEdge;
  removeNode: (id: NodeId) => void;
  removeEdge: (id: string) => void;
  updateNodeLabel: (id: NodeId, label: string) => void;
  updateEdgeWeight: (id: string, weight: number) => void;
  setEditMode: (mode: EditMode) => void;
  setDirected: (directed: boolean) => void;
  setWeighted: (weighted: boolean) => void;
  resetGraph: () => void;
  setSelectedNodes: (ids: NodeId[]) => void;
  setSelectedEdges: (ids: string[]) => void;
}

export const useGraphStore = create<GraphStore>((set, get) => ({
  graph: createEmptyGraph(),
  selectedNodes: [],
  selectedEdges: [],
  editMode: 'select',

  setGraph: (g) => set({ graph: g }),

  addNode: (x, y, label?) => {
    const id = generateNodeId();
    const node: GraphNode = { id, label: label ?? id, x, y };
    set(state => ({ graph: { ...state.graph, nodes: [...state.graph.nodes, node] } }));
    return node;
  },

  addEdge: (source, target, weight?) => {
    const id = generateEdgeId();
    const { graph } = get();
    const edge: GraphEdge = { id, source, target, weight, directed: graph.directed };
    set(state => ({ graph: { ...state.graph, edges: [...state.graph.edges, edge] } }));
    return edge;
  },

  removeNode: (id) => set(state => ({
    graph: {
      ...state.graph,
      nodes: state.graph.nodes.filter(n => n.id !== id),
      edges: state.graph.edges.filter(e => e.source !== id && e.target !== id),
    },
  })),

  removeEdge: (id) => set(state => ({
    graph: { ...state.graph, edges: state.graph.edges.filter(e => e.id !== id) },
  })),

  updateNodeLabel: (id, label) => set(state => ({
    graph: {
      ...state.graph,
      nodes: state.graph.nodes.map(n => n.id === id ? { ...n, label } : n),
    },
  })),

  updateEdgeWeight: (id, weight) => set(state => ({
    graph: {
      ...state.graph,
      edges: state.graph.edges.map(e => e.id === id ? { ...e, weight } : e),
    },
  })),

  setEditMode: (mode) => set({ editMode: mode }),

  setDirected: (directed) => set(state => ({
    graph: {
      ...state.graph,
      directed,
      edges: state.graph.edges.map(e => ({ ...e, directed })),
    },
  })),

  setWeighted: (weighted) => set(state => ({ graph: { ...state.graph, weighted } })),

  resetGraph: () => set({ graph: createEmptyGraph(), selectedNodes: [], selectedEdges: [] }),

  setSelectedNodes: (ids) => set({ selectedNodes: ids }),
  setSelectedEdges: (ids) => set({ selectedEdges: ids }),
}));
