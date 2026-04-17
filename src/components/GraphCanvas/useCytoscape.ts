import { useEffect, useRef, useCallback } from 'react';
import cytoscape from 'cytoscape';
import type { Core, EventObject } from 'cytoscape';
import { cytoscapeStylesheet } from './cytoscapeStyles';
import { useGraphStore } from '../../store/graphStore';
import { useExecutionStore } from '../../store/executionStore';

export function useCytoscape(containerRef: React.RefObject<HTMLDivElement | null>) {
  const cyRef = useRef<Core | null>(null);

  const graph = useGraphStore(s => s.graph);
  const editMode = useGraphStore(s => s.editMode);
  const addNode = useGraphStore(s => s.addNode);
  const addEdge = useGraphStore(s => s.addEdge);
  const removeNode = useGraphStore(s => s.removeNode);
  const removeEdge = useGraphStore(s => s.removeEdge);
  const setSelectedNodes = useGraphStore(s => s.setSelectedNodes);
  const setSelectedEdges = useGraphStore(s => s.setSelectedEdges);
  const resetExecution = useExecutionStore(s => s.resetExecution);

  const currentStep = useExecutionStore(s => s.currentStep());

  const edgeSourceRef = useRef<string | null>(null);

  // Initialize Cytoscape
  useEffect(() => {
    if (!containerRef.current) return;

    const cy = cytoscape({
      container: containerRef.current,
      style: cytoscapeStylesheet,
      layout: { name: 'preset' },
      wheelSensitivity: 0.3,
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, [containerRef]);

  // Sync graph model → Cytoscape elements
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    const existingNodeIds = new Set(cy.nodes().map(n => n.id()));
    const existingEdgeIds = new Set(cy.edges().map(e => e.id()));

    const newNodeIds = new Set(graph.nodes.map(n => n.id));
    const newEdgeIds = new Set(graph.edges.map(e => e.id));

    // Remove deleted elements
    cy.nodes().filter(n => !newNodeIds.has(n.id())).remove();
    cy.edges().filter(e => !newEdgeIds.has(e.id())).remove();

    // Add new nodes
    for (const node of graph.nodes) {
      if (!existingNodeIds.has(node.id)) {
        cy.add({
          group: 'nodes',
          data: { id: node.id, label: node.label, status: 'default' },
          position: node.x !== undefined && node.y !== undefined
            ? { x: node.x, y: node.y }
            : { x: Math.random() * 500 + 50, y: Math.random() * 300 + 50 },
        });
      } else {
        cy.getElementById(node.id).data('label', node.label);
      }
    }

    // Add new edges
    for (const edge of graph.edges) {
      if (!existingEdgeIds.has(edge.id)) {
        cy.add({
          group: 'edges',
          data: {
            id: edge.id,
            source: edge.source,
            target: edge.target,
            weight: edge.weight,
            weightLabel: graph.weighted && edge.weight !== undefined ? String(edge.weight) : '',
            status: 'default',
          },
        });
      } else {
        const el = cy.getElementById(edge.id);
        el.data('weightLabel', graph.weighted && edge.weight !== undefined ? String(edge.weight) : '');
      }
    }

    // Update edge arrow style based on directed
    cy.edges().style({
      'target-arrow-shape': graph.directed ? 'triangle' : 'none',
    });
  }, [graph]);

  // Sync algorithm step → Cytoscape element statuses
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    if (!currentStep) {
      cy.elements().data('status', 'default');
      return;
    }

    Object.entries(currentStep.nodeStatuses).forEach(([id, status]) => {
      cy.getElementById(id).data('status', status);
    });

    Object.entries(currentStep.edgeStatuses).forEach(([id, status]) => {
      cy.getElementById(id).data('status', status);
    });
  }, [currentStep]);

  // Bind interaction events based on editMode
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.removeAllListeners();

    if (editMode === 'select') {
      cy.on('tap', 'node', (e: EventObject) => {
        setSelectedNodes([e.target.id()]);
        setSelectedEdges([]);
      });
      cy.on('tap', 'edge', (e: EventObject) => {
        setSelectedEdges([e.target.id()]);
        setSelectedNodes([]);
      });
      cy.on('tap', (e: EventObject) => {
        if (e.target === cy) { setSelectedNodes([]); setSelectedEdges([]); }
      });
    }

    if (editMode === 'addNode') {
      cy.on('tap', (e: EventObject) => {
        if (e.target !== cy) return;
        const pos = e.position;
        addNode(pos.x, pos.y);
        resetExecution();
      });
    }

    if (editMode === 'addEdge') {
      cy.on('tap', 'node', (e: EventObject) => {
        const nodeId = e.target.id();
        if (!edgeSourceRef.current) {
          edgeSourceRef.current = nodeId;
          cy.getElementById(nodeId).addClass('edge-source');
        } else {
          const src = edgeSourceRef.current;
          edgeSourceRef.current = null;
          cy.nodes().removeClass('edge-source');
          if (src !== nodeId) {
            addEdge(src, nodeId);
            resetExecution();
          }
        }
      });
      cy.on('tap', (e: EventObject) => {
        if (e.target === cy) {
          edgeSourceRef.current = null;
          cy.nodes().removeClass('edge-source');
        }
      });
    }

    if (editMode === 'delete') {
      cy.on('tap', 'node', (e: EventObject) => {
        removeNode(e.target.id());
        resetExecution();
      });
      cy.on('tap', 'edge', (e: EventObject) => {
        removeEdge(e.target.id());
        resetExecution();
      });
    }
  }, [editMode, addNode, addEdge, removeNode, removeEdge, resetExecution, setSelectedNodes, setSelectedEdges]);

  const fit = useCallback(() => { cyRef.current?.fit(undefined, 40); }, []);
  const center = useCallback(() => { cyRef.current?.center(); }, []);

  return { cy: cyRef, fit, center };
}
