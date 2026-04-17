import { useRef, useEffect } from 'react';
import { useCytoscape } from './useCytoscape';
import { useGraphStore } from '../../store/graphStore';

export function GraphCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { fit } = useCytoscape(containerRef);
  const editMode = useGraphStore(s => s.editMode);
  const graph = useGraphStore(s => s.graph);

  // Fit when graph is loaded externally
  useEffect(() => {
    if (graph.nodes.length > 0) {
      setTimeout(() => fit(), 100);
    }
  }, [graph.nodes.length, fit]);

  const cursorClass =
    editMode === 'addNode' ? 'cursor-crosshair' :
    editMode === 'addEdge' ? 'cursor-cell' :
    editMode === 'delete' ? 'cursor-pointer' :
    'cursor-default';

  return (
    <div className="relative w-full h-full">
      <div
        ref={containerRef}
        className={`w-full h-full bg-slate-950 ${cursorClass}`}
      />
      {editMode === 'addEdge' && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-blue-900/80 text-blue-200 text-xs px-3 py-1 rounded-full pointer-events-none">
          Click source node, then target node
        </div>
      )}
      {editMode === 'addNode' && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-blue-900/80 text-blue-200 text-xs px-3 py-1 rounded-full pointer-events-none">
          Click on canvas to add a node
        </div>
      )}
      {editMode === 'delete' && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-red-900/80 text-red-200 text-xs px-3 py-1 rounded-full pointer-events-none">
          Click node or edge to delete
        </div>
      )}
    </div>
  );
}
