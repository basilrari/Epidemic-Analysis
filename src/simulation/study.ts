/**
 * Multi-trial study runner for batch experiments.
 */
import type { StudyConfig, StudyResult, SimulationMetrics } from './types';
import { generateNetwork } from './networks';
import { runSimulation } from './sir';

export function runStudy(config: StudyConfig): StudyResult {
  const trials: SimulationMetrics[] = [];
  const { simulation, intervention } = config;

  // For reduction calculation, run one baseline (no intervention) trial
  const baselineNetwork = generateNetwork(
    simulation.networkType,
    simulation.nodeCount,
    simulation.avgDegree,
    simulation.seed
  );
  const baselineResult = runSimulation(baselineNetwork, simulation, { strategy: 'none', budget: 0 });
  const baselineMetrics = baselineResult.metrics;

  for (let t = 0; t < config.trials; t++) {
    const network = generateNetwork(
      simulation.networkType,
      simulation.nodeCount,
      simulation.avgDegree,
      simulation.seed + t + 1
    );
    const result = runSimulation(network, simulation, intervention, baselineMetrics);
    trials.push(result.metrics);
  }

  const average = computeAverage(trials);
  const stdDev = computeStdDev(trials, average);

  return { config, metrics: trials, average, stdDev };
}

function computeAverage(metrics: SimulationMetrics[]): SimulationMetrics {
  const n = metrics.length;
  if (n === 0) return {} as SimulationMetrics;

  const sum = (key: keyof SimulationMetrics) =>
    metrics.reduce((a, m) => a + (m[key] as number), 0) / n;

  return {
    peakInfected: sum('peakInfected'),
    timeToPeak: sum('timeToPeak'),
    finalInfected: sum('finalInfected'),
    finalSusceptible: sum('finalSusceptible'),
    attackRate: sum('attackRate'),
    epidemicDuration: sum('epidemicDuration'),
    reductionPercent: sum('reductionPercent'),
  };
}

function computeStdDev(
  metrics: SimulationMetrics[],
  avg: SimulationMetrics
): Partial<SimulationMetrics> {
  const n = metrics.length;
  if (n === 0) return {};

  const std = (key: keyof SimulationMetrics) => {
    const mean = avg[key] as number;
    return Math.sqrt(
      metrics.reduce((a, m) => a + Math.pow((m[key] as number) - mean, 2), 0) / n
    );
  };

  return {
    peakInfected: std('peakInfected'),
    timeToPeak: std('timeToPeak'),
    finalInfected: std('finalInfected'),
    attackRate: std('attackRate'),
    reductionPercent: std('reductionPercent'),
  };
}
