import { useEffect } from 'react';
import { useExecutionStore } from '../store/executionStore';

export function useKeyboardShortcuts() {
  const nextStep = useExecutionStore(s => s.nextStep);
  const prevStep = useExecutionStore(s => s.prevStep);
  const setPlaying = useExecutionStore(s => s.setPlaying);
  const isPlaying = useExecutionStore(s => s.isPlaying);
  const setStep = useExecutionStore(s => s.setStep);
  const totalSteps = useExecutionStore(s => s.totalSteps());
  const execution = useExecutionStore(s => s.execution);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore when typing in inputs
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;
      if (!execution) return;

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          nextStep();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevStep();
          break;
        case ' ':
          e.preventDefault();
          setPlaying(!isPlaying);
          break;
        case 'Home':
          e.preventDefault();
          setStep(0);
          break;
        case 'End':
          e.preventDefault();
          setStep(totalSteps - 1);
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [nextStep, prevStep, setPlaying, isPlaying, setStep, totalSteps, execution]);
}
