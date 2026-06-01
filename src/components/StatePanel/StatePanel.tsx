import { useExecutionStore } from '../../store/executionStore';
import { ALGORITHMS } from '../../core/algorithms/index';
import { QueueDisplay } from './QueueDisplay';
import { StepDescription } from './StepDescription';

export function StatePanel() {
  const step = useExecutionStore(s => s.currentStep());
  const execution = useExecutionStore(s => s.execution);
  const selectedAlgorithm = useExecutionStore(s => s.selectedAlgorithm);

  const algo = selectedAlgorithm ? ALGORITHMS[selectedAlgorithm] : null;
  const pseudocode = algo?.pseudocode ?? [];

  return (
    <div className="h-full overflow-y-auto bg-slate-900 border-l border-slate-700">
      {/* Pseudocode */}
      <div className="border-b border-slate-700 p-3">
        <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-2">Pseudocode</h3>
        {pseudocode.length === 0 ? (
          <div className="text-slate-600 text-xs italic">Select an algorithm</div>
        ) : (
          <div className="font-mono text-xs space-y-0.5">
            {pseudocode.map((line, i) => {
              const indentLevel = Math.floor((line.match(/^ */)?.[0].length ?? 0) / 2);
              return (
                <div
                  key={i}
                  style={{ paddingLeft: `${0.5 + indentLevel * 1}rem` }}
                  className={`pr-2 py-0.5 rounded transition-colors ${
                    step && step.pseudocodeLine === i
                      ? 'bg-amber-500/20 text-amber-300 font-semibold'
                      : 'text-slate-400'
                  }`}
                >
                  {line.trimStart()}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Internal state */}
      <div className="border-b border-slate-700 p-3">
        <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-2">Internal State</h3>
        {step ? (
          <QueueDisplay state={step.auxiliaryState} />
        ) : (
          <div className="text-slate-600 text-xs italic">
            {execution ? 'No step selected' : 'Run an algorithm to see state'}
          </div>
        )}
      </div>

      {/* Step description */}
      <div className="p-3">
        <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-2">Step Description</h3>
        <StepDescription />
      </div>
    </div>
  );
}
