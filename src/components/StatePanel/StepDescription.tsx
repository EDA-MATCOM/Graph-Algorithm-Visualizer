import { useExecutionStore } from '../../store/executionStore';

export function StepDescription() {
  const step = useExecutionStore(s => s.currentStep());

  if (!step) {
    return (
      <div className="text-slate-500 text-xs italic">
        Run an algorithm to see step descriptions here.
      </div>
    );
  }

  return (
    <div className="text-slate-200 text-sm leading-relaxed bg-slate-800/60 rounded p-2">
      {step.description}
    </div>
  );
}
