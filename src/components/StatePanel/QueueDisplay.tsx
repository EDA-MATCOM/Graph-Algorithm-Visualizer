import type { AuxiliaryState } from '../../core/algorithms/types';

interface Props {
  state: AuxiliaryState;
}

function Chip({ label, color }: { label: string; color: string }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono font-medium ${color}`}>
      {label}
    </span>
  );
}

export function QueueDisplay({ state }: Props) {
  if (state.type === 'bfs') {
    return (
      <div className="space-y-1.5 text-xs">
        <div>
          <span className="text-slate-400 mr-1">Queue:</span>
          <span className="flex flex-wrap gap-1 inline-flex">
            {state.queue.length === 0
              ? <span className="text-slate-600">empty</span>
              : state.queue.map((n, i) => <Chip key={i} label={n} color="bg-blue-900 text-blue-200" />)}
          </span>
        </div>
        <div>
          <span className="text-slate-400 mr-1">Visited:</span>
          <span className="flex flex-wrap gap-1 inline-flex">
            {state.visited.length === 0
              ? <span className="text-slate-600">none</span>
              : state.visited.map((n, i) => <Chip key={i} label={n} color="bg-slate-700 text-slate-300" />)}
          </span>
        </div>
      </div>
    );
  }

  if (state.type === 'dfs') {
    return (
      <div className="space-y-1.5 text-xs">
        <div>
          <span className="text-slate-400 mr-1">Stack:</span>
          <span className="flex flex-wrap gap-1 inline-flex">
            {state.stack.length === 0
              ? <span className="text-slate-600">empty</span>
              : [...state.stack].reverse().map((n, i) => <Chip key={i} label={n} color="bg-blue-900 text-blue-200" />)}
          </span>
        </div>
        <div>
          <span className="text-slate-400 mr-1">Visited:</span>
          <span className="flex flex-wrap gap-1 inline-flex">
            {state.visited.length === 0
              ? <span className="text-slate-600">none</span>
              : state.visited.map((n, i) => <Chip key={i} label={n} color="bg-slate-700 text-slate-300" />)}
          </span>
        </div>
      </div>
    );
  }

  if (state.type === 'dijkstra') {
    return (
      <div className="space-y-2 text-xs">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700">
                <th className="text-left py-1 px-1.5">Node</th>
                <th className="text-right py-1 px-1.5">Dist</th>
                <th className="text-right py-1 px-1.5">Prev</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(state.distances).map(([node, dist]) => (
                <tr key={node} className="border-b border-slate-800">
                  <td className="py-0.5 px-1.5 font-mono text-slate-200">{node}</td>
                  <td className="py-0.5 px-1.5 text-right font-mono text-emerald-400">
                    {dist === Infinity ? '∞' : dist}
                  </td>
                  <td className="py-0.5 px-1.5 text-right font-mono text-slate-400">
                    {state.previous[node] ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <span className="text-slate-400">Heap: </span>
          <span className="flex flex-wrap gap-1 inline-flex">
            {state.heap.length === 0
              ? <span className="text-slate-600">empty</span>
              : state.heap.map(([d, n], i) => (
                  <Chip key={i} label={`(${d},${n})`} color="bg-amber-900 text-amber-200" />
                ))}
          </span>
        </div>
      </div>
    );
  }

  if (state.type === 'prim') {
    return (
      <div className="space-y-1.5 text-xs">
        <div>
          <span className="text-slate-400 mr-1">In MST:</span>
          <span className="flex flex-wrap gap-1 inline-flex">
            {state.inMST.map((n, i) => <Chip key={i} label={n} color="bg-emerald-900 text-emerald-200" />)}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block mb-1">Candidates:</span>
          {state.candidates.length === 0
            ? <span className="text-slate-600">none</span>
            : state.candidates.map((c, i) => (
                <div key={i} className="text-slate-300 font-mono">
                  {c.from}→{c.to} <span className="text-amber-400">w={c.weight}</span>
                </div>
              ))}
        </div>
      </div>
    );
  }

  if (state.type === 'kruskal') {
    const componentMap: Record<string, string[]> = {};
    for (const [node, root] of Object.entries(state.components)) {
      if (!componentMap[root]) componentMap[root] = [];
      componentMap[root].push(node);
    }

    return (
      <div className="space-y-1.5 text-xs">
        <div>
          <span className="text-slate-400 block mb-1">Components:</span>
          {Object.values(componentMap).map((comp, i) => (
            <div key={i} className="flex gap-1 mb-0.5">
              {comp.map((n, j) => <Chip key={j} label={n} color="bg-violet-900 text-violet-200" />)}
            </div>
          ))}
        </div>
        <div>
          <span className="text-slate-400 mr-1">MST edges:</span>
          <span className="text-emerald-400 font-mono">{state.mstEdges.length}</span>
        </div>
      </div>
    );
  }

  return null;
}
