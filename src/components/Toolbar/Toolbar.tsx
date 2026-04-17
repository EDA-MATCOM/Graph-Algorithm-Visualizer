import { useState } from 'react';
import { useGraphStore } from '../../store/graphStore';
import { useExecutionStore } from '../../store/executionStore';
import { AlgorithmSelector } from './AlgorithmSelector';
import { GraphInputPanel } from './GraphInputPanel';
import { ExamplesModal } from '../Modals/ExamplesModal';
import { ALGORITHMS } from '../../core/algorithms/index';
import { AlgorithmRunner } from '../../core/algorithms/AlgorithmRunner';

type EditMode = 'select' | 'addNode' | 'addEdge' | 'delete';

const MODES: { id: EditMode; label: string; title: string }[] = [
  { id: 'select', label: 'Select', title: 'Select / move nodes' },
  { id: 'addNode', label: '+ Node', title: 'Click canvas to add node' },
  { id: 'addEdge', label: '+ Edge', title: 'Click two nodes to add edge' },
  { id: 'delete', label: 'Delete', title: 'Click to delete element' },
];

export function Toolbar() {
  const editMode = useGraphStore(s => s.editMode);
  const setEditMode = useGraphStore(s => s.setEditMode);
  const graph = useGraphStore(s => s.graph);
  const setDirected = useGraphStore(s => s.setDirected);
  const setWeighted = useGraphStore(s => s.setWeighted);
  const resetGraph = useGraphStore(s => s.resetGraph);

  const selectedAlgorithm = useExecutionStore(s => s.selectedAlgorithm);
  const startNode = useExecutionStore(s => s.startNode);
  const setStartNode = useExecutionStore(s => s.setStartNode);
  const setExecution = useExecutionStore(s => s.setExecution);
  const resetExecution = useExecutionStore(s => s.resetExecution);

  const [showImport, setShowImport] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [error, setError] = useState('');

  const handleRun = () => {
    setError('');
    if (!selectedAlgorithm) { setError('Select an algorithm'); return; }
    if (graph.nodes.length === 0) { setError('Add at least one node'); return; }

    const algo = ALGORITHMS[selectedAlgorithm];
    if (!algo) return;

    const effectiveStart = startNode ?? graph.nodes[0]?.id;
    if (!effectiveStart) { setError('No start node'); return; }
    if (!graph.nodes.find(n => n.id === effectiveStart)) { setError(`Node "${effectiveStart}" not found`); return; }
    if (algo.requiresWeights && !graph.weighted) { setError(`${algo.name} requires a weighted graph`); return; }
    if (algo.requiresUndirected && graph.directed) { setError(`${algo.name} requires an undirected graph`); return; }

    const runner = new AlgorithmRunner();
    const execution = runner.run(algo.generator, graph, effectiveStart);
    setExecution(execution);
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-slate-900 border-b border-slate-700 text-sm select-none">
        {/* Edit mode buttons */}
        <div className="flex gap-1">
          {MODES.map(m => (
            <button
              key={m.id}
              title={m.title}
              onClick={() => setEditMode(m.id)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                editMode === m.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-slate-600" />

        {/* Graph properties */}
        <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={graph.directed}
            onChange={e => { setDirected(e.target.checked); resetExecution(); }}
            className="accent-blue-500"
          />
          Directed
        </label>
        <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={graph.weighted}
            onChange={e => { setWeighted(e.target.checked); resetExecution(); }}
            className="accent-blue-500"
          />
          Weighted
        </label>

        <div className="w-px h-5 bg-slate-600" />

        {/* Load / Import */}
        <button
          onClick={() => setShowExamples(true)}
          className="px-2.5 py-1 rounded text-xs bg-slate-700 text-slate-300 hover:bg-slate-600"
        >
          Examples
        </button>
        <button
          onClick={() => setShowImport(true)}
          className="px-2.5 py-1 rounded text-xs bg-slate-700 text-slate-300 hover:bg-slate-600"
        >
          Import
        </button>
        <button
          onClick={() => { resetGraph(); resetExecution(); }}
          className="px-2.5 py-1 rounded text-xs bg-slate-700 text-red-400 hover:bg-slate-600"
        >
          Clear
        </button>

        <div className="w-px h-5 bg-slate-600" />

        {/* Algorithm controls */}
        <AlgorithmSelector />

        <select
          value={startNode ?? ''}
          onChange={e => setStartNode(e.target.value)}
          className="bg-slate-800 text-slate-200 text-sm border border-slate-600 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
          aria-label="Start node"
        >
          <option value="">— Start —</option>
          {graph.nodes.map(n => (
            <option key={n.id} value={n.id}>{n.label}</option>
          ))}
        </select>

        <button
          onClick={handleRun}
          className="px-3 py-1 rounded text-xs font-semibold bg-green-600 hover:bg-green-500 text-white transition-colors"
          aria-label="Run algorithm"
        >
          ▶ Run
        </button>

        {error && (
          <span className="text-red-400 text-xs ml-1">{error}</span>
        )}
      </div>

      {showImport && <GraphInputPanel onClose={() => setShowImport(false)} />}
      {showExamples && <ExamplesModal onClose={() => setShowExamples(false)} />}
    </>
  );
}
