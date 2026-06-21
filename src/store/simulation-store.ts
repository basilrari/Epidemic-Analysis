import { create } from 'zustand';
import type {
  SimulationConfig,
  InterventionConfig,
  SimulationResult,
  StudyConfig,
  StudyResult,
} from '@/simulation/types';
import { generateNetwork, runSimulation, runStudy } from '@/simulation';
import { SIMULATION_PRESETS } from '@/lib/presets';

export type AppView = 'sandbox' | 'compare' | 'study';

interface SimState {
  view: AppView;
  setView: (v: AppView) => void;

  config: SimulationConfig;
  intervention: InterventionConfig;
  activePresetId: string | null;
  setConfig: (partial: Partial<SimulationConfig>) => void;
  setIntervention: (partial: Partial<InterventionConfig>) => void;
  applyPreset: (presetId: string) => void;
  resetConfig: () => void;

  isRunning: boolean;
  simResult: SimulationResult | null;
  baselineResult: SimulationResult | null;
  currentStep: number;
  isAnimating: boolean;
  animationSpeed: number;
  lastRunDuration: number | null;
  simulationStatus: 'idle' | 'running' | 'completed';

  runSandbox: () => void;
  setStep: (step: number) => void;
  setIsAnimating: (v: boolean) => void;
  setAnimationSpeed: (v: number) => void;
  resetSandbox: () => void;
  tickAnimation: () => void;

  compareConfigs: { config: SimulationConfig; intervention: InterventionConfig; label: string }[];
  compareResults: (SimulationResult | null)[];
  setCompareConfigs: (configs: { config: SimulationConfig; intervention: InterventionConfig; label: string }[]) => void;
  runCompare: () => void;
  addCompareConfig: () => void;
  removeCompareConfig: (idx: number) => void;
  updateCompareConfig: (idx: number, field: 'config' | 'intervention', partial: Partial<SimulationConfig> | Partial<InterventionConfig>) => void;

  studyConfig: StudyConfig;
  studyResult: StudyResult | null;
  isStudyRunning: boolean;
  setStudyConfig: (partial: Partial<StudyConfig>) => void;
  setStudySimConfig: (partial: Partial<SimulationConfig>) => void;
  setStudyIntervention: (partial: Partial<InterventionConfig>) => void;
  runStudySim: () => void;
}

const defaultConfig: SimulationConfig = {
  networkType: 'barabasi-albert',
  nodeCount: 300,
  avgDegree: 4,
  beta: 0.04,
  gamma: 0.04,
  initialInfected: 5,
  maxSteps: 80,
  seed: 42,
};

const defaultIntervention: InterventionConfig = {
  strategy: 'degree-targeted',
  budget: 0.1,
};

const defaultStudyConfig: StudyConfig = {
  label: 'Experiment 1',
  simulation: { ...defaultConfig },
  intervention: { ...defaultIntervention, strategy: 'degree-targeted' },
  trials: 20,
};

export const useSimStore = create<SimState>((set, get) => ({
  view: 'sandbox',
  setView: (view) => set({ view }),

  config: { ...defaultConfig },
  intervention: { ...defaultIntervention },
  activePresetId: 'scale-free-superspreader',
  setConfig: (partial) => set((s) => ({ config: { ...s.config, ...partial }, activePresetId: null })),
  setIntervention: (partial) => set((s) => ({ intervention: { ...s.intervention, ...partial }, activePresetId: null })),
  applyPreset: (presetId) => {
    const preset = SIMULATION_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    set((s) => ({
      activePresetId: presetId,
      config: { ...s.config, ...preset.config },
      intervention: { ...s.intervention, ...preset.intervention },
    }));
  },
  resetConfig: () => set({ config: { ...defaultConfig }, intervention: { ...defaultIntervention }, activePresetId: null }),

  isRunning: false,
  simResult: null,
  baselineResult: null,
  currentStep: 0,
  isAnimating: false,
  animationSpeed: 3,
  lastRunDuration: null,
  simulationStatus: 'idle',

  runSandbox: () => {
    const { config, intervention } = get();
    set({ isRunning: true, simResult: null, currentStep: 0, isAnimating: false, simulationStatus: 'running' });

    const start = performance.now();
    setTimeout(() => {
      const network = generateNetwork(config.networkType, config.nodeCount, config.avgDegree, config.seed);
      const baseline = runSimulation(network, config, { strategy: 'none', budget: 0 });
      const result = runSimulation(network, config, intervention, baseline.metrics);
      const duration = (performance.now() - start) / 1000;

      set({
        isRunning: false,
        simResult: result,
        baselineResult: baseline,
        currentStep: result.infectedCurve.length - 1,
        lastRunDuration: duration,
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
  resetSandbox: () => set({
    simResult: null,
    baselineResult: null,
    currentStep: 0,
    isAnimating: false,
    lastRunDuration: null,
    simulationStatus: 'idle',
  }),
  tickAnimation: () => {
    const { simResult, currentStep, isAnimating } = get();
    if (!isAnimating || !simResult) return;
    const max = simResult.infectedCurve.length - 1;
    if (currentStep >= max) {
      set({ isAnimating: false });
      return;
    }
    set({ currentStep: currentStep + 1 });
  },

  compareConfigs: [
    { config: { ...defaultConfig }, intervention: { ...defaultIntervention, strategy: 'none' }, label: 'No Intervention' },
    { config: { ...defaultConfig }, intervention: { ...defaultIntervention, strategy: 'random' }, label: 'Random Vaccination' },
    { config: { ...defaultConfig }, intervention: { ...defaultIntervention, strategy: 'degree-targeted' }, label: 'Degree-Targeted' },
  ],
  compareResults: [null, null, null],
  setCompareConfigs: (configs) => set({ compareConfigs: configs }),
  runCompare: () => {
    const { compareConfigs } = get();
    const results: (SimulationResult | null)[] = [];

    for (const cc of compareConfigs) {
      const network = generateNetwork(cc.config.networkType, cc.config.nodeCount, cc.config.avgDegree, cc.config.seed);
      const baseline = runSimulation(network, cc.config, { strategy: 'none', budget: 0 });
      const result = runSimulation(network, cc.config, cc.intervention, baseline.metrics);
      results.push(result);
    }

    set({ compareResults: results, simulationStatus: 'completed' });
  },
  addCompareConfig: () => {
    const { compareConfigs } = get();
    set({
      compareConfigs: [
        ...compareConfigs,
        {
          config: { ...defaultConfig },
          intervention: { strategy: 'degree-targeted', budget: 0.1 },
          label: `Config ${compareConfigs.length + 1}`,
        },
      ],
      compareResults: [...Array(compareConfigs.length + 1)].fill(null),
    });
  },
  removeCompareConfig: (idx) => {
    const { compareConfigs, compareResults } = get();
    set({
      compareConfigs: compareConfigs.filter((_, i) => i !== idx),
      compareResults: compareResults.filter((_, i) => i !== idx),
    });
  },
  updateCompareConfig: (idx, field, partial) => {
    const { compareConfigs } = get();
    const updated = [...compareConfigs];
    updated[idx] = {
      ...updated[idx],
      [field]: { ...(updated[idx] as Record<string, unknown>)[field] as object, ...partial },
    };
    set({ compareConfigs: updated });
  },

  studyConfig: { ...defaultStudyConfig },
  studyResult: null,
  isStudyRunning: false,
  setStudyConfig: (partial) => set((s) => ({ studyConfig: { ...s.studyConfig, ...partial } })),
  setStudySimConfig: (partial) =>
    set((s) => ({ studyConfig: { ...s.studyConfig, simulation: { ...s.studyConfig.simulation, ...partial } } })),
  setStudyIntervention: (partial) =>
    set((s) => ({ studyConfig: { ...s.studyConfig, intervention: { ...s.studyConfig.intervention, ...partial } } })),
  runStudySim: () => {
    const { studyConfig } = get();
    set({ isStudyRunning: true, studyResult: null, simulationStatus: 'running' });

    setTimeout(() => {
      const result = runStudy(studyConfig);
      set({ isStudyRunning: false, studyResult: result, simulationStatus: 'completed' });
    }, 50);
  },
}));
