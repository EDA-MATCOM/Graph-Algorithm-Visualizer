import { useExecutionStore } from '../../store/executionStore';
import { usePlayback } from '../../hooks/usePlayback';

const SPEED_LEVELS = [
  { label: '0.25×', ms: 2000 },
  { label: '0.5×', ms: 1000 },
  { label: '1×', ms: 500 },
  { label: '2×', ms: 250 },
  { label: '4×', ms: 125 },
];

export function PlaybackControls() {
  usePlayback();

  const execution = useExecutionStore(s => s.execution);
  const currentStepIndex = useExecutionStore(s => s.currentStepIndex);
  const isPlaying = useExecutionStore(s => s.isPlaying);
  const playbackSpeed = useExecutionStore(s => s.playbackSpeed);
  const totalSteps = useExecutionStore(s => s.totalSteps());

  const setStep = useExecutionStore(s => s.setStep);
  const nextStep = useExecutionStore(s => s.nextStep);
  const prevStep = useExecutionStore(s => s.prevStep);
  const setPlaying = useExecutionStore(s => s.setPlaying);
  const setSpeed = useExecutionStore(s => s.setSpeed);

  const disabled = !execution;

  const currentSpeedLabel =
    SPEED_LEVELS.find(s => s.ms === playbackSpeed)?.label ?? '1×';

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-slate-900 border-t border-slate-700 select-none">
      {/* Navigation buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setStep(0)}
          disabled={disabled || currentStepIndex === 0}
          className="px-2 py-1 text-base disabled:opacity-30 hover:text-blue-400 text-slate-300 transition-colors"
          aria-label="First step"
          title="First step (Home)"
        >⏮</button>
        <button
          onClick={() => prevStep()}
          disabled={disabled || currentStepIndex === 0}
          className="px-2 py-1 text-base disabled:opacity-30 hover:text-blue-400 text-slate-300 transition-colors"
          aria-label="Previous step"
          title="Previous step (←)"
        >◀</button>
        <button
          onClick={() => setPlaying(!isPlaying)}
          disabled={disabled}
          className="px-3 py-1 text-base disabled:opacity-30 hover:text-blue-400 text-slate-300 transition-colors"
          aria-label={isPlaying ? 'Pause' : 'Play'}
          title="Play/Pause (Space)"
        >{isPlaying ? '⏸' : '▶'}</button>
        <button
          onClick={() => nextStep()}
          disabled={disabled || currentStepIndex >= totalSteps - 1}
          className="px-2 py-1 text-base disabled:opacity-30 hover:text-blue-400 text-slate-300 transition-colors"
          aria-label="Next step"
          title="Next step (→)"
        >▶</button>
        <button
          onClick={() => setStep(totalSteps - 1)}
          disabled={disabled || currentStepIndex >= totalSteps - 1}
          className="px-2 py-1 text-base disabled:opacity-30 hover:text-blue-400 text-slate-300 transition-colors"
          aria-label="Last step"
          title="Last step (End)"
        >⏭</button>
      </div>

      {/* Timeline slider */}
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <input
          type="range"
          min={0}
          max={Math.max(0, totalSteps - 1)}
          value={currentStepIndex}
          onChange={e => setStep(Number(e.target.value))}
          disabled={disabled}
          className="flex-1 accent-blue-500 disabled:opacity-30"
          aria-label="Step timeline"
        />
        <span className="text-slate-400 text-xs whitespace-nowrap">
          {disabled ? '—' : `Step ${currentStepIndex + 1} / ${totalSteps}`}
        </span>
      </div>

      {/* Speed control */}
      <div className="flex items-center gap-1.5">
        <span className="text-slate-400 text-xs">Speed:</span>
        <div className="flex gap-0.5">
          {SPEED_LEVELS.map(level => (
            <button
              key={level.ms}
              onClick={() => setSpeed(level.ms)}
              className={`px-1.5 py-0.5 text-xs rounded transition-colors ${
                playbackSpeed === level.ms
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {level.label}
            </button>
          ))}
        </div>
        <span className="text-slate-500 text-xs ml-1">{currentSpeedLabel}</span>
      </div>
    </div>
  );
}
