import { useExecutionStore } from '../../store/executionStore';
import { useGraphStore } from '../../store/graphStore';
import { ALGORITHMS } from '../../core/algorithms/index';

export function AlgorithmSelector() {
  const selectedAlgorithm = useExecutionStore(s => s.selectedAlgorithm);
  const setAlgorithm = useExecutionStore(s => s.setAlgorithm);
  const graph = useGraphStore(s => s.graph);

  return (
    <select
      value={selectedAlgorithm ?? ''}
      onChange={e => setAlgorithm(e.target.value)}
      className="bg-slate-800 text-slate-200 text-sm border border-slate-600 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
      aria-label="Select algorithm"
    >
      <option value="">— Algorithm —</option>
      {Object.entries(ALGORITHMS).map(([id, algo]) => {
        const disabled =
          (algo.requiresWeights && !graph.weighted) ||
          (algo.requiresUndirected && graph.directed);
        return (
          <option key={id} value={id} disabled={disabled}>
            {algo.name}{disabled ? ' (incompatible)' : ''}
          </option>
        );
      })}
    </select>
  );
}
