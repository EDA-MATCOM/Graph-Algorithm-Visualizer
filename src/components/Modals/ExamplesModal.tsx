import { EXAMPLE_GRAPHS } from '../../examples/index';
import { useGraphStore } from '../../store/graphStore';
import { useExecutionStore } from '../../store/executionStore';

interface Props {
  onClose: () => void;
}

export function ExamplesModal({ onClose }: Props) {
  const setGraph = useGraphStore(s => s.setGraph);
  const resetExecution = useExecutionStore(s => s.resetExecution);

  const load = (id: string) => {
    const example = EXAMPLE_GRAPHS.find(e => e.id === id);
    if (!example) return;
    setGraph(example.graph);
    resetExecution();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-slate-800 rounded-lg p-5 w-80 shadow-xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-slate-100 font-semibold mb-3">Load example graph</h2>
        <div className="flex flex-col gap-2">
          {EXAMPLE_GRAPHS.map(eg => (
            <button
              key={eg.id}
              onClick={() => load(eg.id)}
              className="text-left px-3 py-2 rounded bg-slate-700 hover:bg-slate-600 transition-colors"
            >
              <div className="text-slate-100 text-sm font-medium">{eg.name}</div>
              <div className="text-slate-400 text-xs">{eg.description}</div>
            </button>
          ))}
        </div>
        <button onClick={onClose} className="mt-3 w-full text-sm text-slate-400 hover:text-slate-200">
          Cancel
        </button>
      </div>
    </div>
  );
}
