import type { GraphModel, NodeId } from '../graph/types';
import type { AlgorithmExecution, AlgorithmGenerator, AlgorithmStep } from './types';

export class AlgorithmRunner {
  run(generator: AlgorithmGenerator, graph: GraphModel, startNode: NodeId): AlgorithmExecution {
    const gen = generator(graph, startNode);
    const steps: AlgorithmStep[] = [];

    for (const step of gen) {
      steps.push(step);
    }

    return {
      algorithmId: generator.name || 'unknown',
      graphSnapshot: structuredClone(graph),
      startNode,
      steps,
    };
  }
}
