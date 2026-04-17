import { useEffect } from 'react';
import { useExecutionStore } from '../store/executionStore';

export function usePlayback() {
  const isPlaying = useExecutionStore(s => s.isPlaying);
  const playbackSpeed = useExecutionStore(s => s.playbackSpeed);
  const nextStep = useExecutionStore(s => s.nextStep);
  const currentStepIndex = useExecutionStore(s => s.currentStepIndex);
  const totalSteps = useExecutionStore(s => s.totalSteps());
  const setPlaying = useExecutionStore(s => s.setPlaying);

  useEffect(() => {
    if (!isPlaying) return;

    if (currentStepIndex >= totalSteps - 1) {
      setPlaying(false);
      return;
    }

    const interval = setInterval(() => {
      nextStep();
    }, playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, currentStepIndex, totalSteps, nextStep, setPlaying]);
}
