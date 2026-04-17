import { useState } from 'react';
import { parseAdjacencyList, resetCounters } from '../../core/graph/GraphSerializer';
import { useGraphStore } from '../../store/graphStore';
import { useExecutionStore } from '../../store/executionStore';

interface Props {
  onClose: () => void;
}

const PLACEHOLDER = `# Undirected graph (no weights)
A B
A C
B D
C D

# Directed with weights
# A->B 5
# A->C 3`;

export function GraphInputPanel({ onClose }: Props) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const setGraph = useGraphStore(s => s.setGraph);
  const resetExecution = useExecutionStore(s => s.resetExecution);

  const handleImport = () => {
    try {
      resetCounters();
      const g = parseAdjacencyList(text);
      if (g.nodes.length === 0) { setError('No nodes parsed. Check the format.'); return; }
      setGraph(g);
      resetExecution();
      onClose();
    } catch (e) {
      setError(String(e));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-slate-800 rounded-lg p-5 w-96 shadow-xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-slate-100 font-semibold mb-3">Import adjacency list</h2>
        <textarea
          className="w-full h-48 bg-slate-900 text-slate-200 text-sm font-mono p-2 rounded border border-slate-600 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder={PLACEHOLDER}
          value={text}
          onChange={e => { setText(e.target.value); setError(''); }}
        />
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        <div className="flex gap-2 mt-3 justify-end">
          <button onClick={onClose} className="px-3 py-1.5 text-sm text-slate-300 hover:text-slate-100">Cancel</button>
          <button
            onClick={handleImport}
            className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded"
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
}
