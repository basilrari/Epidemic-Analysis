import { create } from 'zustand';
import type {
  SimulationConfig,
  InterventionConfig,
  SimulationResult,
} from '@/simulation/types';
import { generateNetwork, runSimulation as executeSimulation } from '@/simulation';
import { COMPARE_PRESETS } from '@/lib/education';

export type AppView = 'simulator' | 'compare';

export interface ScenarioConfig {
  label: string;
  config: SimulationConfig;
  intervention: InterventionConfig;
}

interface SimState {
  view: AppView;
  setView: (v: AppView) => void;

  config: SimulationConfig;
  intervention: InterventionConfig;
  setConfig: (partial: Partial<SimulationConfig>) => void;
  setIntervention: (partial: Partial<InterventionConfig>) => void;

  isRunning: boolean;
  simResult: SimulationResult | null;
  baselineResult: SimulationResult | null;
  currentStep: number;
  isAnimating: boolean;
  animationSpeed: number;
  loopAnimation: boolean;
  simulationStatus: 'idle' | 'running' | 'completed';

  runSimulator: () => void;
  setStep: (step: number) => void;
  setIsAnimating: (v: boolean) => void;
  setAnimationSpeed: (v: number) => void;
  setLoopAnimation: (v: boolean) => void;
  resetSimulation: () => void;
  tickAnimation: () => void;

  scenarioA: ScenarioConfig;
  scenarioB: ScenarioConfig;
  resultA: SimulationResult | null;
  resultB: SimulationResult | null;
  isCompareRunning: boolean;
  setScenarioA: (partial: Partial<ScenarioConfig>) => void;
  setScenarioB: (partial: Partial<ScenarioConfig>) => void;
  setScenarioAConfig: (partial: Partial<SimulationConfig>) => void;
  setScenarioBConfig: (partial: Partial<SimulationConfig>) => void;
  setScenarioAIntervention: (partial: Partial<InterventionConfig>) => void;
  setScenarioBIntervention: (partial: Partial<InterventionConfig>) => void;
  applyComparePreset: (presetId: string) => void;
  runComparePair: () => void;
}

export const defaultConfig: SimulationConfig = {
  networkType: 'barabasi-albert',
  nodeCount: 300,
  avgDegree: 4,
  beta: 0.06,
  gamma: 0.04,
  initialInfected: 5,
  maxSteps: 80,
  seed: 42,
};

export const defaultIntervention: InterventionConfig = {
  strategy: 'degree-targeted',
  budget: 0.1,
};

const defaultPreset = COMPARE_PRESETS[0];

export const useSimStore = create<SimState>((set, get) => ({
  view: 'simulator',
  setView: (view) => set({ view }),

  config: { ...defaultConfig },
  intervention: { ...defaultIntervention },
  setConfig: (partial) => set((s) => ({ config: { ...s.config, ...partial } })),
  setIntervention: (partial) => set((s) => ({ intervention: { ...s.intervention, ...partial } })),

  isRunning: false,
  simResult: null,
  baselineResult: null,
  currentStep: 0,
  isAnimating: false,
  animationSpeed: 2,
  loopAnimation: true,
  simulationStatus: 'idle',

  runSimulator: () => {
    const { config, intervention } = get();
    set({ isRunning: true, simResult: null, baselineResult: null, currentStep: 0, isAnimating: false, simulationStatus: 'running' });

    setTimeout(() => {
      const network = generateNetwork(config.networkType, config.nodeCount, config.avgDegree, config.seed);
      const baseline = executeSimulation(network, config, { strategy: 'none', budget: 0 });
      const result = executeSimulation(network, config, intervention, baseline.metrics);

      set({
        isRunning: false,
        simResult: result,
        baselineResult: baseline,
        currentStep: 0,
        isAnimating: true,
        simulationStatus: 'completed',
      });
    }, 50);
  },

  setStep: (step) => {
    const { simResult } = get();
    const max = simResult ? simResult.infectedCurve.length - 1 : 0;
    set({ currentStep: Math.max(0, Math.min(step, max)) });
  },
  setIsAnimating: (v) => set({ isAnimating: v }),
  setAnimationSpeed: (v) => set({ animationSpeed: v }),
  setLoopAnimation: (v) => set({ loopAnimation: v }),
  resetSimulation: () => set({
    simResult: null,
    baselineResult: null,
    currentStep: 0,
    isAnimating: false,
    simulationStatus: 'idle',
  }),
  tickAnimation: () => {
    const { simResult, currentStep, isAnimating, loopAnimation } = get();
    if (!isAnimating || !simResult) return;
    const max = simResult.infectedCurve.length - 1;
    if (currentStep >= max) {
      if (loopAnimation) {
        set({ currentStep: 0 });
      } else {
        set({ isAnimating: false });
      }
      return;
    }
    set({ currentStep: currentStep + 1 });
  },

  scenarioA: { ...defaultPreset.scenarioA },
  scenarioB: { ...defaultPreset.scenarioB },
  resultA: null,
  resultB: null,
  isCompareRunning: false,

  setScenarioA: (partial) => set((s) => ({ scenarioA: { ...s.scenarioA, ...partial } })),
  setScenarioB: (partial) => set((s) => ({ scenarioB: { ...s.scenarioB, ...partial } })),
  setScenarioAConfig: (partial) =>
    set((s) => ({ scenarioA: { ...s.scenarioA, config: { ...s.scenarioA.config, ...partial } } })),
  setScenarioBConfig: (partial) =>
    set((s) => ({ scenarioB: { ...s.scenarioB, config: { ...s.scenarioB.config, ...partial } } })),
  setScenarioAIntervention: (partial) =>
    set((s) => ({ scenarioA: { ...s.scenarioA, intervention: { ...s.scenarioA.intervention, ...partial } } })),
  setScenarioBIntervention: (partial) =>
    set((s) => ({ scenarioB: { ...s.scenarioB, intervention: { ...s.scenarioB.intervention, ...partial } } })),

  applyComparePreset: (presetId) => {
    const preset = COMPARE_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    set({
      scenarioA: { ...preset.scenarioA },
      scenarioB: { ...preset.scenarioB },
      resultA: null,
      resultB: null,
    });
  },

  runComparePair: () => {
    const { scenarioA, scenarioB } = get();
    set({ isCompareRunning: true, resultA: null, resultB: null, simulationStatus: 'running' });

    setTimeout(() => {
      const sharedSeed = scenarioA.config.seed;
      const configA = { ...scenarioA.config, seed: sharedSeed };
      const configB = { ...scenarioB.config, seed: sharedSeed, nodeCount: configA.nodeCount, avgDegree: configA.avgDegree, beta: configA.beta, gamma: configA.gamma, initialInfected: configA.initialInfected, maxSteps: configA.maxSteps };

      const networkA = generateNetwork(configA.networkType, configA.nodeCount, configA.avgDegree, configA.seed);
      const baselineA = executeSimulation(networkA, configA, { strategy: 'none', budget: 0 });
      const resultA = executeSimulation(networkA, configA, scenarioA.intervention, baselineA.metrics);

      const networkB = generateNetwork(configB.networkType, configB.nodeCount, configB.avgDegree, configB.seed);
      const baselineB = executeSimulation(networkB, configB, { strategy: 'none', budget: 0 });
      const resultB = executeSimulation(networkB, configB, scenarioB.intervention, baselineB.metrics);

      set({
        isCompareRunning: false,
        resultA,
        resultB,
        simulationStatus: 'completed',
      });
    }, 50);
  },
}));
