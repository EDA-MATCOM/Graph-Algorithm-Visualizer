import { create } from 'zustand';
import type { AlgorithmExecution, AlgorithmStep } from '../core/algorithms/types';
import type { NodeId } from '../core/graph/types';

interface ExecutionStore {
  execution: AlgorithmExecution | null;
  currentStepIndex: number;
  isPlaying: boolean;
  playbackSpeed: number;
  selectedAlgorithm: string | null;
  startNode: NodeId | null;

  setExecution: (exec: AlgorithmExecution) => void;
  setStep: (index: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setPlaying: (playing: boolean) => void;
  setSpeed: (ms: number) => void;
  setAlgorithm: (id: string) => void;
  setStartNode: (id: NodeId) => void;
  resetExecution: () => void;

  currentStep: () => AlgorithmStep | null;
  totalSteps: () => number;
}

export const useExecutionStore = create<ExecutionStore>((set, get) => ({
  execution: null,
  currentStepIndex: 0,
  isPlaying: false,
  playbackSpeed: 500,
  selectedAlgorithm: null,
  startNode: null,

  setExecution: (exec) => set({ execution: exec, currentStepIndex: 0, isPlaying: false }),

  setStep: (index) => {
    const total = get().totalSteps();
    if (total === 0) return;
    set({ currentStepIndex: Math.max(0, Math.min(index, total - 1)) });
  },

  nextStep: () => {
    const { currentStepIndex, totalSteps } = get();
    const total = totalSteps();
    if (currentStepIndex < total - 1) {
      set({ currentStepIndex: currentStepIndex + 1 });
    } else {
      set({ isPlaying: false });
    }
  },

  prevStep: () => {
    const { currentStepIndex } = get();
    if (currentStepIndex > 0) set({ currentStepIndex: currentStepIndex - 1 });
  },

  setPlaying: (playing) => set({ isPlaying: playing }),

  setSpeed: (ms) => set({ playbackSpeed: ms }),

  setAlgorithm: (id) => set({ selectedAlgorithm: id }),

  setStartNode: (id) => set({ startNode: id }),

  resetExecution: () => set({ execution: null, currentStepIndex: 0, isPlaying: false }),

  currentStep: () => {
    const { execution, currentStepIndex } = get();
    if (!execution || execution.steps.length === 0) return null;
    return execution.steps[currentStepIndex] ?? null;
  },

  totalSteps: () => get().execution?.steps.length ?? 0,
}));
