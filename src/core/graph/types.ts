export type NodeId = string;

export interface GraphNode {
  id: NodeId;
  label: string;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  id: string;
  source: NodeId;
  target: NodeId;
  weight?: number;
  directed: boolean;
}

export interface GraphModel {
  nodes: GraphNode[];
  edges: GraphEdge[];
  directed: boolean;
  weighted: boolean;
}
