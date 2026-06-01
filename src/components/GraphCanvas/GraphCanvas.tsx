import { useRef, useEffect, useState } from 'react';
import { useCytoscape } from './useCytoscape';
import { useGraphStore } from '../../store/graphStore';

export function GraphCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { fit, weightPrompt, confirmWeight, cancelWeight } = useCytoscape(containerRef);
  const editMode = useGraphStore(s => s.editMode);
  const graph = useGraphStore(s => s.graph);

  const [weightInput, setWeightInput] = useState('');

  useEffect(() => {
    if (!weightPrompt) return;
    if (weightPrompt.type === 'edit') {
      const edge = graph.edges.find(e => e.id === weightPrompt.edgeId);
      setWeightInput(edge?.weight !== undefined ? String(edge.weight) : '1');
    } else {
      setWeightInput('1');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weightPrompt]);

  useEffect(() => {
    if (graph.nodes.length > 0) {
      setTimeout(() => fit(), 100);
    }
  }, [graph.nodes.length, fit]);

  const handleConfirm = () => {
    const w = parseFloat(weightInput);
    if (!isNaN(w)) confirmWeight(w);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleConfirm();
    if (e.key === 'Escape') cancelWeight();
  };

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

      {weightPrompt && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-slate-800 border border-slate-600 rounded-lg shadow-xl p-4 flex flex-col gap-3 min-w-[200px]">
            <span className="text-slate-200 text-sm font-medium">
              {weightPrompt.type === 'create' ? 'Edge weight' : 'Edit edge weight'}
            </span>
            <input
              type="number"
              value={weightInput}
              onChange={e => setWeightInput(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="bg-slate-700 text-white text-sm border border-slate-500 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={cancelWeight}
                className="px-3 py-1 text-xs rounded bg-slate-700 text-slate-300 hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-3 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-500"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {!weightPrompt && editMode === 'addEdge' && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-blue-900/80 text-blue-200 text-xs px-3 py-1 rounded-full pointer-events-none">
          {graph.weighted
            ? 'Click source node, then target — you\'ll be prompted for weight'
            : 'Click source node, then target node'}
        </div>
      )}
      {!weightPrompt && editMode === 'addNode' && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-blue-900/80 text-blue-200 text-xs px-3 py-1 rounded-full pointer-events-none">
          Click on canvas to add a node
        </div>
      )}
      {!weightPrompt && editMode === 'delete' && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-red-900/80 text-red-200 text-xs px-3 py-1 rounded-full pointer-events-none">
          Click node or edge to delete
        </div>
      )}
      {!weightPrompt && editMode === 'select' && graph.weighted && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-800/80 text-slate-400 text-xs px-3 py-1 rounded-full pointer-events-none">
          Double-click an edge to edit its weight
        </div>
      )}
    </div>
  );
}
